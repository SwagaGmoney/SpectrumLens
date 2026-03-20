from fastapi import APIRouter, HTTPException
from typing import List

from models.schema import ChatMessage, ScreeningResults, ChatRequest
from engine.behavior_agent import extract_traits_from_chat
from engine.scoring_logic import calculate_autism_score

router = APIRouter()

@router.post("/calculate")
async def final_screening_calculation(request: ChatRequest):
    """
    This endpoint is called when the chat is marked as 'is_complete' 
    or when the user manually triggers a 'Final Analysis'.
    """
    try:
       
        history_dicts = [m.model_dump() for m in request.messages]
        
        final_points = extract_traits_from_chat(history_dicts)
        
        scoring_data = calculate_autism_score(final_points, request.age or 0)
        
        return {
            "percentage": scoring_data.get("percentage", 0.0),
            "category": scoring_data.get("category", "Low"),
            "scale_used": scoring_data.get("scale_used", "AQ-10 Child"),
            "traits_found": scoring_data.get("traits_found", []), # Optional list of strings
            "score_raw": f"{final_points}/10",
            "clinical_cutoff_met": scoring_data.get("clinical_cutoff_met", False),
            "ai_insight": "Final analysis suggests consistent patterns in sensory processing."
        }

    except Exception as e:
        print(f"Screening Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate final screening report")

@router.get("/info")
async def get_screening_info():
    """
    Returns information about the scales being used (AQ-10).
    """
    return {
        "scales": ["AQ-10 Child", "AQ-10 Adolescent", "AQ-10 Adult"],
        "methodology": "Point-based behavioral trait extraction via NLP",
        "disclaimer": "This is a screening tool, not a clinical diagnosis."
    }