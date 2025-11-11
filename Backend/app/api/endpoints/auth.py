from fastapi import APIRouter, Depends, HTTPException, status 
from sqlalchemy.orm import Session 
from datetime import timedelta 
from typing import Dict, Any 

from ...services.database import get_db 
from ...models.pydantic_models import (
    UserRegistrationRequest,
    UserLoginRequest,
    Token,
    UserProfileResponse,
    UserInDB
) 
from ...services import user_manager 
from ...core import auth 
from ...core.security import get_current_active_user 

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

router = APIRouter(tags=["Authentication"]) 

@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user"
)
def register(
    user_data: UserRegistrationRequest,
    db: Session = Depends(get_db) 
) -> Dict[str, str]:
    if user_data.password != user_data.password_confirmation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )
    
    try: 
        user_manager.create_user(
            db=db, 
            user_data=user_data
        ) 

        return {"message": "User registered successfully."} 
    
    except HTTPException as e:
        raise e 
    except Exception as e:
        print(f"Server Error during registration: {e}") 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed due to a server error."
        )
    

@router.post(
    "/token",
    response_model=Token,
    summary="AUthenticate user and generate JWT token"
) 
def login(user_data: UserLoginRequest, db: Session = Depends(get_db)) -> Token:
    user = user_manager.authenticate_user(
        db=db,
        user_name=user_data.user_name,
        password=user_data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password."
        )
    
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES) 
    access_token = auth.create_access_token(
        data={"sub": str(user.id)},
        expires_delta=expires_delta
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=int(expires_delta.total_seconds())
    )

@router.get(
    "/profile",
    response_model=UserProfileResponse,
    summary="Get the current authenticated user's profile and preferences"
)
def get_profile(
    current_user: UserInDB = Depends(get_current_active_user), 
    db: Session = Depends(get_db)
) -> UserProfileResponse:
    profile_data = user_manager.get_user_profile(db, int(current_user.id))

    if not profile_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found.") 
    
    return UserProfileResponse.from_db_model(profile_data)