from pydantic import BaseModel, EmailStr, Field 
from typing import Optional, List, Literal, TYPE_CHECKING
from datetime import datetime
from enum import Enum 
import json 

if TYPE_CHECKING:
    from models.database_models import User 


# --- CHAIN COMMUNICATION SCHEMAS ---

class IntentType(str, Enum):
    RECOMMENDATION = "recommendation" 
    PROFILE_UPDATE = "profile_update" 
    CHAT = "chat" 
    UNKNOWN = "unknown"


class Intent(BaseModel):
    intent_type: IntentType = Field(
        ...,
        description="The determined intent of the user's last message."
    )
    search_query: Optional[str] = Field(
        None,
        description="If the intent is RECOMMENDATION, this is the optimized, concrete search term (e.g., 'recent 80s sci-fi movies')."
    )
    preference_type: Optional[str] = Field(
        None, 
        description="If the intent is PROFILE_UPDATE, the type of preference (e.g., 'genre', 'actor')."
    ) 
    preference_value: Optional[str] = Field(
        None, 
        description="If the intent is PROFILE_UPDATE, the value of the preference (e.g., 'horror', 'Tom Hanks')."
    )


class UserContext(BaseModel):
    context_summary: str = Field(
        ..., 
        description="A concise summary of the last user turn and conversation history, focused on the current request."
    )


# --- Request/Response Models ---
class UserRegistrationRequest(BaseModel):
    user_name: str = Field(description="The registering user user_name")
    user_email: EmailStr 
    password: str 
    password_confirmation: str 


class UserLoginRequest(BaseModel):
    user_name: str 
    password: str 


class Token(BaseModel):
    access_token: str 
    token_type: str 
    expires_in: int 


class UserProfileResponse(BaseModel):
    user_id: str 
    user_name: str 
    user_email: EmailStr 
    preferences: List[str] = Field(
        ...,
        examples=[
            "Action",
            "Tom Hanks",
            "Sci-fi"
            ]
    )
    created_at: str 

    @classmethod 
    def from_db_model(cls, db_user: 'User'):

        created_at_str = db_user.created_at.isoformat() if isinstance(db_user.created_at, datetime) else str(db_user.created_at)

        return cls(
            user_id=str(db_user.id),
            user_name=str(db_user.user_name),
            user_email=str(db_user.user_email),
            preferences=[pref.preference_value for pref in db_user.preferences],
            created_at=created_at_str
        )


class ChatMessageRequest(BaseModel):
    message: str 
    session_id: Optional[str]


class ChatMessageResponse(BaseModel):
    response: str 
    session_id: Optional[str]
    suggested_shows: List[str]  


# Internal Logic Models 

class UserIntent(BaseModel):
    primary_intent: Literal["mood_based", "similar_to", "get_recommendation", "chit_chat"] 

    target_mood: Optional[str] = Field(
        default=None, 
        examples=["funny", "dark", "uplifting"]
    )

    reference_show: Optional[str] = Field(
        description="The show title the user referenced"
    )

    time_constraint: Optional[int] = Field(
        description="The desired runtime in minutes"
    )

    query_for_search: str = Field(
        description="The cleaned up version of the user query optimized for semantic search"
    )

    @classmethod 
    def from_llm_output(cls, data: dict):
        return cls(
            primary_intent=data.get('primary_intent'),
            target_mood=data.get('target_mood'),
            reference_show=data.get('reference_show'),
            time_constraint=data.get('time_constraint'),
            query_for_search=data.get('query_for_search')
        )


class ShowData(BaseModel):
    show_id: str 
    title: str 
    type: str 
    genres: List[str]   
    plot: str 
    release_date: str 
    runtime: str 
    cast: List[str] 
    directors: List[str]  
    poster_url: str 
    tmdb_rating: float 

    @classmethod
    def from_orm_model(cls, db_show):
        def safe_json_load(data):
            if isinstance(data, str):
                try:
                    loaded = json.loads(data)
                    return loaded if isinstance(loaded, list) else []
                except json.JSONDecodeError:
                    return []
            return data if isinstance(data, list) else []

        release_date_str = 'N/A'
        if isinstance(db_show.release_date, datetime):
            release_date_str = db_show.release_date.strftime('%Y-%m-%d')
        elif db_show.release_date:
            release_date_str = str(db_show.release_date)


        return cls(
            show_id=str(db_show.show_id),
            title=db_show.title,
            type=db_show.type,
            genres=safe_json_load(db_show.genres),
            plot=db_show.plot,
            release_date=release_date_str,
            runtime=db_show.runtime,
            cast=safe_json_load(db_show.cast),
            directors=safe_json_load(db_show.directors),
            poster_url=db_show.poster_url,
            tmdb_rating=db_show.tmdb_rating
        )


class ShowRetrievalResult(BaseModel):
    shows: List[ShowData] 
    retrieval_count: int 
    search_query_used: str 


class EnhancedShowModel(ShowData):
    show_id: str 
    title: str 
    type: str 
    genres: List[str]  
    plot: str 
    release_date: str 
    runtime: str 
    cast: List[str] 
    directors: List[str]  
    poster_url: str 
    tmdb_rating: float 
    talking_points: List[str] = Field(
        examples=["Won 3 Emmys last week", "Trending on Twitter"],
        description="Real-time news or trending topics related to the show."
    )


class UserProfile(BaseModel): 
    user_id: str 
    liked_shows: List[str] 
    disliked_shows: List[str] 
    preferred_genres: List[str] 
    preferred_moods: List[str] 
    watch_history: List[str] 
    recent_searches: List[str] 


#  Data Storage Models 
class UserInDB(BaseModel):
    id: str 
    user_name: str 
    user_email: EmailStr 
    hashed_password: str 
    created_at: str 
    is_active: bool  


class UserPreferenceInDB(BaseModel):
    id: str 
    user_id: str 
    preference_type: str = Field(
        examples=[
            "genre",
            "actor"
        ]
    )
    preference_value: str = Field(
        examples=[
            "sci-fi",
            "Tom Hanks"
        ]
    )
    score: float = Field(
        description="A score based on interactions"
    )


class InteractionHistory(BaseModel):
    id: str 
    user_id: str 
    user_message: str 
    ai_response: str 
    recommended_show_ids: List[str] 
    timestamp: str 
    session_id: str 


