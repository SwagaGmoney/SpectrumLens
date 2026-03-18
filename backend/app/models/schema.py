from pydantic import BaseModel, Field
from typing import List, Literal, Optional


class ChatMessage(BaseModel):
    role: str 
    content: str


class ScreeningResults(BaseModel):
    percentage: float
    category: str
    scale_used: str
    score_raw: str
    clinical_cutoff_met: bool
    traits_found: List[str] = [] 

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    age: Optional[int] = 0
    user_type: Optional[str] = "self"


class ChatResponse(BaseModel):
    content: str
    is_complete: bool
    detected_age: Optional[int]
    screening_results: ScreeningResults 

class BehavioralTraits(BaseModel):
    social_communication: int = Field(default=0, ge=0, le=1)
    attention_switching: int = Field(default=0, ge=0, le=1)
    eye_contact: int = Field(default=0, ge=0, le=1)
    shared_attention: int = Field(default=0, ge=0, le=1)
    routine_distress: int = Field(default=0, ge=0, le=1)
    sensory_sensitivity: int = Field(default=0, ge=0, le=1)
    imagination: int = Field(default=0, ge=0, le=1)