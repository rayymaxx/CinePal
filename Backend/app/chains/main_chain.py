import json 
import re 
from typing import  Dict, Any, List, Tuple 

from langchain_core.runnables import RunnablePassthrough, RunnableBranch, RunnableLambda 

from .context_enhancer import get_context_enhancer_chain 
from .intent_parser import get_intent_parser_chain 
from .memory_manager import get_memory_manager_chain 
from .show_retriever import get_show_retirever_chain 
from .response_generator import get_response_generator_chain 

from ..models.pydantic_models import UserProfileResponse, IntentType 
from ..services import user_manager, history_manager 
from sqlalchemy.orm import Session 

def format_user_profile_for_llm(db: Session, user_id: int) -> str: 
    try: 
        db_user = user_manager.get_user_profile(db=db, user_id=user_id) 
        if not db_user:
            return "No user profile found."
        
        profile_response = UserProfileResponse.from_db_model(db_user=db_user) 
        preferences_str = ", ".join(profile_response.preferences) 

        return json.dumps({
            "username": profile_response.user_name,
            "preferences": preferences_str,
            "created_at": profile_response.created_at
        })
    except Exception as e:
        print(f"Error formatting user profile: {e}") 
        return "Profile data temporarily unavailable."
    
def get_profile_data(input_data: Dict[str, Any]) -> str:
    db: Session = input_data["db"] 
    user_id: int = input_data["user_id"] 
    return format_user_profile_for_llm(db, user_id) 

def get_session_history(input_data: Dict[Any, str]) -> str:
    db: Session = input_data["db"] 
    user_id: int = input_data["user_id"] 
    session_id: str = input_data["session_id"] 

    return history_manager.get_chat_history(db, user_id,session_id) 

def save_final_interaction(input_data: Dict[str, Any]) -> Dict[str, Any]:
    db: Session = input_data["db"] 
    user_id: int = input_data["user_id"] 
    session_id: str = input_data["session_id"] 

    user_message = input_data.get("user_input", "") 
    ai_response = input_data.get("response", "") 
    retrieved_docs_raw: str = input_data.get("retrieved_docs", "") 

    # REGEX to extract show ID and Title from the retrieved_docs string 
    # This uses the format defined in show_manager.py: [Title: <Title>, Score: <Score>, Show ID: <ID>]
    pattern = re.compile(r"\[Title: (.*?), Score: .*?, Show ID: (\d+)\]") 

    recommended_shows: List[Tuple[str, str]] = [] 

    if "Title:" in retrieved_docs_raw:
        for match in pattern.finditer(retrieved_docs_raw):
            title = match.group(1).strip() 
            show_id = match.group(2).strip() 
            if title and show_id:
                recommended_shows.append((show_id, title)) 

    history_manager.save_interaction(
        db=db,
        user_id=user_id,
        session_id=session_id,
        user_message=user_message,
        ai_response=ai_response,
        recommended_shows=recommended_shows
    )

    return input_data 

def is_recommendation_intent(input_data: Dict[str, Any]) -> bool:
    intent = input_data.get("parsed_intent") 
    return intent and intent.intent_type == IntentType.RECOMMENDATION 

def get_movie_assistant_chain():
    context_chain = get_context_enhancer_chain() 
    intent_chain = get_intent_parser_chain() 
    memory_chain = get_memory_manager_chain() 
    retriever_chain = get_show_retirever_chain() 
    response_chain = get_response_generator_chain() 

    initial_context_passthrough = RunnablePassthrough.assign(
        user_profile_data=RunnableLambda(get_profile_data),
        chat_history=RunnableLambda(get_session_history)
    )

    conditional_retrieval_branch = RunnableBranch(
        (RunnableLambda(is_recommendation_intent), retriever_chain),
        RunnablePassthrough.assign(retrieved_docs=RunnableLambda(lambda x: "No RAG needed for this intent.")) 
    ) 

    full_chain = (
        # Step 0: Inject profile and history data
        initial_context_passthrough

        # Step 1: Summarize context (now uses fetched chat_history)
        | RunnablePassthrough.assign(
            context_summary=context_chain
        )

        # Step 2: Determine user intent and extract details
        | RunnablePassthrough.assign(
            parsed_intent=(lambda x: x["context_summary"]) | intent_chain
        )

        # Step 3: Handle side effects (like updating preferences in DB)
        | memory_chain 

        # Step 4: Conditionally run RAG for recommendations
        | conditional_retrieval_branch 

        # Step 5: Generate the final conversational response
        | RunnablePassthrough.assign(
            response=response_chain
        )

        # Step 6: Save the complete interaction history using the service
        | RunnableLambda(save_final_interaction).with_types(input_type=dict, output_type=dict) 
    )

    return full_chain.with_types(
        input_type=dict, 
        output_type=dict
    )
