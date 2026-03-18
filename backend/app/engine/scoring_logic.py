
def get_feedback(percentage: float, category: str) -> str:
    if category == "Low":
        return "Behavioral patterns are within the typical range. No immediate action is suggested unless specific concerns persist."
    elif category == "Middle":
        return "Some patterns associated with neurodivergence were identified. We recommend monitoring social transitions and sensory comfort."
    elif category == "High" or category == "Extreme":
        return "Strong behavioral indicators detected. We highly recommend discussing these findings with a clinical professional for a formal evaluation."
    return ""

def calculate_autism_score(trait_points: int, age: int) -> dict:
   
    if age < 12:
        cutoff = 6
        scale = "AQ-10 Child"
    elif age < 18:
        cutoff = 6
        scale = "AQ-10 Adolescent"
    else:
        cutoff = 6 # Standard AQ-10 Adult cutoff
        scale = "AQ-10 Adult"

    max_points = 10
    percentage = (trait_points / max_points) * 100
    trait_labels = []
    if trait_points > 0:
        potential_tags = [
            "Sensory Processing", "Social Reciprocity", 
            "Non-verbal Cues", "Repetitive Patterns", 
            "Routine Adherence", "Focused Interests"
        ]
       
        num_tags = 2 if trait_points < 4 else 3 if trait_points < 7 else 4
        trait_labels = potential_tags[:num_tags]
   
    if trait_points < 3:
        category = "Low"
    elif trait_points < cutoff:
        category = "Middle" 
    elif trait_points < 9:
        category = "High"   
    else:
        category = "Extreme" 
        
    return {
        "percentage": round(percentage, 1),
        "category": category,
        "scale_used": scale,
        "traits_found": trait_labels,
        "clinical_cutoff_met": trait_points >= 6,
        "score_raw": f"{trait_points}/10"
    }