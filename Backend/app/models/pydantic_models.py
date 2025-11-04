from pydantic import BaseModel, EmailStr, Field 
from typing import Optional, List, Literal, TYPE_CHECKING
from datetime import datetime
if TYPE_CHECKING:
    from models.database_models import User 


# Request/Response Models 
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


class ShowRetrievalResult(BaseModel):
    shows: List[ShowData] 
    retrieval_count: int 
    search_query_used: str 


class EnhancedShowModel(BaseModel):
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
        examples=["Won 3 Emmys last week", "Trending on Twitter"]
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


