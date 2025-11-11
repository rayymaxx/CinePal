import logging 
import re 
import uuid 
from datetime import datetime 
from typing import Dict, Any, List  

from fastapi import APIRouter, Depends, HTTPException, status 
from sqlalchemy.orm import Session 

from ...services.database import get_db 
from ...chains.main_chain import get_movie_assistant_chain 
from ...core.security import get_current_active_user 
from ...models.database_models import User as UserORM 
from ...models.pydantic_models import ChatMessageRequest, ChatMessageResponse 

router = APIRouter(tags=["Chat"]) 
logger = logging.getLogger(__name__) 


def extract_suggested_titles(retrieved_docs_raw: str) -> List[str]:
    """
    Parses the raw retrieved documents string to extract a list of show titles 
    for the API response.
    
    Expected format (from main_chain.py): [Title: <Title>, Sccore: <Score>, Show ID: <ID>]
    """
    if not retrieved_docs_raw or "Title:" not in retrieved_docs_raw:
        return []

    # REGEX to extract show Title (group 1)
    pattern = re.compile(r"\[Title: (.*?), Score: .*?, Show ID: (\d+)\]") 
    
    suggested_titles: List[str] = []
    
    # Iterate over all matches in the raw string
    for match in pattern.finditer(retrieved_docs_raw):
        title = match.group(1).strip()
        if title:
            suggested_titles.append(title)
            
    return suggested_titles


@router.post("/chat", response_model=ChatMessageResponse, status_code=status.HTTP_200_OK) 
def handle_chat(
    request: ChatMessageRequest,
    current_user: UserORM = Depends(get_current_active_user), 
    db: Session = Depends(get_db)
):
    """
    Handles an authenticated user's chat message, processes it through the 
    LangChain orchestration pipeline, and returns the AI response along with 
    any suggested shows.
    """
    user_id = current_user.id 

    session_id = request.session_id if request.session_id else str(uuid.uuid4()) 
    user_input = request.message 

    logger.info(f"API Call: Processing chat for User ID {user_id}, Session {session_id[:8]}...") 

    try:
        movie_assistant_chain = get_movie_assistant_chain() 

        inputs: Dict[str, Any] = {
            "db": db, 
            "user_id": user_id,
            "session_id": session_id,
            "user_input": user_input
        }

        result = movie_assistant_chain.invoke(inputs) 

        final_response = result.get("response", "An error occured during response generation.") 
        retrieved_docs_raw = result.get("retrieved_docs", "") 

        suggested_shows = extract_suggested_titles(retrieved_docs_raw) 

        return ChatMessageResponse(
            session_id=session_id,
            response=final_response,
            suggested_shows=suggested_shows
        )
    
    except Exception as e:
        logger.error(f"Unexpected Chat Processing Error for User {user_id}: {e}", exc_info=True) 
        db.rollback() 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occured during chat processing."
        )