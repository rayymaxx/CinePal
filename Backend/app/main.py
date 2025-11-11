import logging 
from fastapi import FastAPI, Request, status 
from fastapi.middleware.cors import CORSMiddleware 
from fastapi.responses import JSONResponse 

from .services.database import create_all_tables 

from .api.endpoints.auth import router as auth_router 
from .api.endpoints.chat import router as chat_router 

logger = logging.getLogger(__name__) 

app = FastAPI(
    title="CinePal AI Movie Recommender",
    description="A conversational AI assistant for personalized movie and show recommendations.",
    version="1.0.0"
)

@app.on_event("startup") 
def on_startup():
    """Ensure all database tables are created before application starts accepting requests.""" 
    try:
        create_all_tables() 
        logger.info("Database tables successfully created/checked.") 
    except Exception as e:
        logger.critical(f"Failed to connect to database or create tables: {e}") 

origins =[
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) 

app.include_router(auth_router, prefix="/auth") 

app.include_router(chat_router, prefix="/api") 

@app.get("/", status_code=status.HTTP_200_OK, tags=["System"]) 
def root():
    """Health checkpoint"""
    return {
        "message": "👍🏽 CinePal API is running and healthy"
    }