# Handles user profile CRUD 
from fastapi import HTTPException
from sqlalchemy.orm import Session  
from typing import Optional, List 
from datetime import datetime 

from ..models.database_models import User, UserPreference 
from ..models.pydantic_models import UserInDB, UserRegistrationRequest, UserProfileResponse, UserPreferenceInDB 
from ..core.auth import get_password_hash, verify_password 

def convert_db_user_to_userindb(db_user: User) -> UserInDB:
    return UserInDB(
        id = str(db_user.id),
        user_name = str(db_user.user_name), 
        user_email = str(db_user.user_email),  
        hashed_password = str(db_user.hashed_password),  
        created_at = str(db_user.created_at),  
        is_active = bool(db_user.is_active) 
    )


def get_user_by_username(db:Session, user_name: str) -> Optional[User]:
    db_user = db.query(User).filter_by(user_name=user_name).one_or_none() 
    return db_user

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    db_user = db.query(User).filter(User.id==user_id).one_or_none()
    return db_user

def create_user(db: Session, user_data: UserRegistrationRequest) -> Optional[UserInDB]:
    user_name_check = get_user_by_username(db=db, user_name=user_data.user_name)
    if user_name_check != None:
        raise HTTPException(status_code=400, detail="The username already exists!")
    
    hashed_password = get_password_hash(user_data.password) 
    user = User(
        user_name=user_data.user_name,
        user_email=user_data.user_email,
        hashed_password=hashed_password,
    )
    
    db.add(user)
    db.commit() 
    db.refresh(user)

    return user  

def authenticate_user(db: Session, user_name: str, password: str) -> Optional[User]:
    db_user = get_user_by_username(db, user_name=user_name)

    if db_user and verify_password(password, db_user.hashed_password): 
        return db_user
    
    return None 

def get_user_profile(db: Session, user_id: int) -> Optional[User]:
    db_user = db.query(User).filter(User.id == user_id).one_or_none()

    return db_user 

def get_user_preferences(db: Session, user_id: int) -> List[UserPreferenceInDB]:
    db_preferences=db.query(UserPreference).filter(UserPreference.user_id==user_id).all()

    def convert_user_preference_to_db_preference(preference_record: UserPreference) -> UserPreferenceInDB:
        return UserPreferenceInDB(
            id = str(preference_record.id),
            user_id = str(preference_record.user_id),
            preference_type = preference_record.preference_type,
            preference_value = preference_record.preference_value,
            score = preference_record.score
            )
    
    return [
        convert_user_preference_to_db_preference(pref)
        for pref in db_preferences
    ]

def update_user_preference_score(db: Session, user_id: int, preference_type: str, preference_value: str, score_delta: float) -> UserPreference:
    preference_record = db.query(UserPreference).filter(
        UserPreference.user_id==user_id, 
        UserPreference.preference_type==preference_type, 
        UserPreference.preference_value==preference_value
        ).one_or_none() 
    if preference_record:
        preference_record.score += score_delta
        preference_record.last_updated = datetime.utcnow() 
    else:
        preference_record = UserPreference(
            user_id=user_id,
            preference_type=preference_type, 
            preference_value=preference_value,
            score=score_delta,
            last_updated=datetime.utcnow() 
        )
        db.add(preference_record) 

    db.commit() 
    db.refresh(preference_record) 

    return preference_record
    
