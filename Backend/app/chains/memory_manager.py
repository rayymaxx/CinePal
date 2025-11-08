from langchain_core.runnables import RunnableLambda 
from sqlalchemy.orm import Session 
from ..models.pydantic_models import IntentType, Intent 
from ..services import user_manager 
from typing import Dict , Any 

def handle_side_effects(input_data: Dict[str, Any]) -> Dict[str, Any]:
    db: Session = input_data["db"] 
    user_id: int = input_data["user_id"] 
    intent: Intent = input_data["parsed_intent"] 

    if intent.intent_type == IntentType.PROFILE_UPDATE and intent.preference_type and intent.preference_value:
        try: 
            score_delta = 1.0 

            user_manager.update_user_preference_score(
                db=db,
                user_id=user_id,
                preference_type=intent.preference_type,
                preference_value=intent.preference_value,
                score_delta=score_delta
            )
            print(f"✅ user {user_id} preferenceupdated: Type='{intent.preference_type}', Value='{intent.preference_value}' (Delta: {score_delta})")

        except Exception as e:
            print(f"⚠️ Error updating preference for user {user_id}: {e}") 
        
    return input_data

def get_memory_manager_chain():
    return RunnableLambda(handle_side_effects).with_types(input_type=dict, output_type=dict)