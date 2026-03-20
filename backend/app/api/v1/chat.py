from fastapi import APIRouter, HTTPException
import re
from typing import List

from models.schema import ChatRequest, ChatResponse, ScreeningResults
from engine.behavior_agent import get_behavior_agent_response, extract_traits_from_chat
from engine.scoring_logic import calculate_autism_score

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    try:

        user_text = request.messages[-1].content
        current_age = request.age
        
        age_match = re.search(r"(\d+)\s*(?:years?|yrs?|yo|years? old)", user_text, re.IGNORECASE)
        if age_match:
            current_age = int(age_match.group(1))

        history_dicts = [m.model_dump() for m in request.messages]

        agent_data = get_behavior_agent_response(
            history_dicts, 
            current_age, 
            request.user_type
        )
        
        detected_points = extract_traits_from_chat(history_dicts)
        
        scoring_data = calculate_autism_score(detected_points, current_age or 0)

        live_results = ScreeningResults(
            percentage=scoring_data.get("percentage", 0.0),
            category=scoring_data.get("category", "Low"),
            scale_used=scoring_data.get("scale_used", "AQ-10 Child"),
            score_raw=f"{detected_points}/10",
            clinical_cutoff_met=scoring_data.get("clinical_cutoff_met", False)
        )

        return ChatResponse(
            content=agent_data["content"],
            is_complete=agent_data["is_complete"],
            detected_age=current_age,
            screening_results=live_results
        )

    except Exception as e:
        print(f"Chat Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Neural Engine Error")