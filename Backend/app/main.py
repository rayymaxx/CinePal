import logging 
import time
from fastapi import FastAPI, Request, status 
from fastapi.middleware.cors import CORSMiddleware 
from fastapi.responses import JSONResponse 

from .services.database import create_all_tables, get_db
from .core.auth import decode_access_token

from .api.endpoints.auth import router as auth_router 
from .api.endpoints.chat import router as chat_router 
from .api.endpoints.images import router as images_router 
from .api.endpoints.admin import router as admin_router
from .services.analytics_service import AnalyticsService

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
    "https://cine-pal.vercel.app/",
    "http://localhost:5173",
    "http://localhost:5174", 
    "https://cine-pal.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Middleware to track API requests
@app.middleware("http")
async def track_api_requests(request: Request, call_next):
    """Middleware to track all API requests for analytics."""
    start_time = time.time()
    response = await call_next(request)
    
    # Calculate response time in milliseconds
    response_time_ms = (time.time() - start_time) * 1000
    
    # Track the request (in background, non-blocking)
    try:
        db = next(get_db())
        endpoint = request.url.path
        method = request.method
        status_code = response.status_code
        
        # Get user_id from token if available
        user_id = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                token = auth_header.split(" ")[1]
                payload = decode_access_token(token)
                if payload and payload.get("type") != "admin":
                    user_id = int(payload.get("sub"))
            except:
                pass
        
        # Only track non-admin endpoints to avoid noise
        if not endpoint.startswith("/admin"):
            AnalyticsService.record_api_request(
                db,
                endpoint=endpoint,
                method=method,
                status_code=status_code,
                response_time_ms=response_time_ms,
                user_id=user_id
            )
        
        db.close()
    except Exception as e:
        logger.debug(f"Error tracking API request: {e}")
    
    return response


app.include_router(auth_router, prefix="/auth") 

app.include_router(chat_router, prefix="/api") 

app.include_router(images_router, prefix="/api")

app.include_router(admin_router)

@app.get("/", status_code=status.HTTP_200_OK, tags=["System"]) 
def root():
    """Health checkpoint"""
    return {
        "message": "👍🏽 CinePal API is running and healthy"
    }