from sqlalchemy.orm import Session 
from sqlalchemy import desc 
from typing import List, Tuple  
from datetime import datetime 
import logging 

from ..models.database_models import (
    InteractionHistoryInDB as InteractionHistoryORM, 
    InteractionShowJunctionInDB as InteractionShowJunctionORM
)

logging.basicConfig(level=logging.INFO) 

def save_interaction(
        db: Session,
        user_id: int, 
        session_id: str, 
        user_message: str, 
        ai_response: str, 
        recommended_shows: List[Tuple[str, str]] 
) -> None:
    new_interaction = InteractionHistoryORM(
        user_id=user_id,
        user_message=user_message,
        ai_response=ai_response,
        session_id=session_id,
        timestamp=datetime.utcnow()
    )

    for show_id, show_title in recommended_shows:
        try:
            show_id_int = int(show_id)
        except ValueError:
            logging.warning(f"Could not convert show_id '{show_id}' to integer. Skipping junction record.")
            continue

        junction_record = InteractionShowJunctionORM(
            show_id=show_id_int,
            show_title=show_title
        )

        new_interaction.recommended_shows.append(junction_record)

    db.add(new_interaction) 

    try:
        db.commit()
        logging.info(f"💾 Interaction saved for user {user_id} with {len(recommended_shows)} recommendations.")
    except Exception as e:
        db.rollback() 
        logging.error(f"❌ Failed to save interaction: {e}") 


def get_chat_history(db: Session, user_id: int, session_id: str, limit: int = 10) -> str:
    interactions = db.query(InteractionHistoryORM) \
                     .filter(InteractionHistoryORM.user_id == user_id) \
                     .filter(InteractionHistoryORM.session_id == session_id) \
                     .order_by(desc(InteractionHistoryORM.timestamp)) \
                     .limit(limit) \
                     .all()
    
    interactions.reverse() 
    
    formatted_history = []
    for interaction in interactions:
        formatted_history.append(f"User: {interaction.user_message}")
        formatted_history.append(f"AI: {interaction.ai_response}")
        
    return "\n".join(formatted_history)


    