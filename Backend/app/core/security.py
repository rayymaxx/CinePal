from typing import Optional 
from fastapi import Depends, HTTPException, status 
from fastapi.security import OAuth2PasswordBearer 
from sqlalchemy.orm import Session 
from jose import JWTError 

from ..core import auth 
from ..services import user_manager
from ..services.database import get_db  
from ..models.pydantic_models import UserInDB


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login/token")

def get_current_active_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> UserInDB:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, 
        detail="Could not validate credentials", 
        headers={"WWW-Authenticate": "Bearer"}
    )

    payload: Optional[dict] = auth.decode_access_token(token) 

    if payload is None:
        raise credentials_exception 
    
    user_id_str: Optional[str] = payload.get("sub") 

    if user_id_str is None:
        raise credentials_exception
    
    try:
        user_id = int(user_id_str) 
    except ValueError:
        raise credentials_exception 
    
    db_user = user_manager.get_user_by_id(db, user_id=user_id)  

    if db_user is None:
        raise credentials_exception 
    
    return user_manager.convert_db_user_to_userindb(db_user)  

