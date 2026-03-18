import os
import re
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

load_dotenv()

class ScoreExtraction(BaseModel):
    points: int = Field(description="Integer 0-10")
    reasoning: str = Field(description="Why points were given")

AGE_CONTEXTS = {
    "child": {
        "domains": ["Play/Social", "Sensory", "Communication", "Motor"],
        "tone": "Warm, simple, school/play analogies."
    },
    "teen": {
        "domains": ["Social sarcasm", "Sensory noise", "Hyperfocus", "Routine"],
        "tone": "Relatable, respectful, validates transitions."
    },
    "adult": {
        "domains": ["Workplace", "Social Masking", "Executive Function", "Sensory"],
        "tone": "Professional, empathetic, partner-based."
    }
}

def get_behavior_agent_response(history: list, age: int, user_type: str):
    # Standardizing to 3.5 Turbo as requested
    llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7)
    
    group = "child" if age < 13 else "teen" if age < 18 else "adult"
    context = AGE_CONTEXTS[group]

    # GPT-3.5 needs very clear "END" instructions to avoid looping
    prompt = ChatPromptTemplate.from_messages([
        ("system", f"""You are Aria, a clinical AI. User is a {user_type} discussing a {age}-year-old.
        
        STYLE: {context['tone']}
        
        GOAL: Briefly explore {', '.join(context['domains'])}.
        
        STRICT RULES:
        1. Ask ONLY ONE question. 
        2. Keep it under 2 sentences.
        3. EXIT CONDITION: If you have asked about 3 different domains, or the user has provided enough detail, you MUST end the chat.
        4. MANDATORY: Your very last message MUST end with the exact string: [COMPLETE]"""),
        ("placeholder", "{messages}")
    ])
    
    chain = prompt | llm
    ai_msg = chain.invoke({"messages": history})
    
    content = ai_msg.content
    is_complete = "[COMPLETE]" in content
    
    # Clean the tag for the UI but keep the logic
    clean_content = content.replace("[COMPLETE]", "").strip()
    
    return {"content": clean_content, "is_complete": is_complete}

def extract_traits_from_chat(history: list) -> int:
    
    llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
    parser = JsonOutputParser(pydantic_object=ScoreExtraction)
    
    # Convert history objects to a flat string transcript
    transcript = ""
    for m in history:
        role = "Parent" if m.get("role") == "user" else "Aria"
        transcript += f"{role}: {m.get('content')}\n"

    prompt = ChatPromptTemplate.from_messages([
        ("system", """Analyze this transcript for ASD traits (Sensory, Social, Routine).
        
        SCORING RULE:
        - 1 point for every clear behavior described by the Parent.
        - Ignore Aria's questions. Only score Parent's answers.
        - Max score is 10.
        
        Return ONLY JSON.
        {format_instructions}
        
        TRANSCRIPT:
        {transcript}"""),
    ])
    
    input_data = {
        "transcript": transcript,
        "format_instructions": parser.get_format_instructions()
    }
    
    chain = prompt | llm | parser
    
    try:
        result = chain.invoke(input_data)
        return int(result.get("points", 0))
    except Exception as e:
        print(f"Extraction Error: {e}")
        return 0