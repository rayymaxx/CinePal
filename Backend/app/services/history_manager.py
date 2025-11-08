from sqlalchemy.orm import Session 
from typing import List, Optional 
from datetime import datetime 

from ..models.database_models import InteractionHistory as InteractionHistoryORM 

def save_interaction(
        db: Session,
        user_id: int, 
        session_id: str, 
        user_message: str, 
        ai_response: str, 
        recommended_show_ids: List[str] 
) -> None:
    new_interaction = InteractionHistoryORM(
        user_id-user_id,
        user_message=user_message,
        ai_response=ai_response,
        recommended_show_ids=recommended_show_ids,
        session_id=session_id,
        timestamp=datetime.utcnow()
    )

    db.add(new_interaction) 
    db.commit()