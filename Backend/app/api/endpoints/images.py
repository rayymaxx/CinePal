import logging
import os
import requests
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(tags=["Images"], prefix="/images")
logger = logging.getLogger(__name__)

# TMDB Image Base URL
TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

# Cache headers to reduce repeated requests
CACHE_HEADERS = {
    "Cache-Control": "public, max-age=86400",  # 24 hours
    "Expires": "max-age=86400",
}

@router.get("/poster/{size}/{path}")
async def get_poster(size: str, path: str):
    """
    Proxy endpoint for TMDB poster images.
    
    Args:
        size: Image size (w92, w154, w185, w342, w500, w780, original)
        path: The image path from TMDB (without leading slash)
    
    Example: /images/poster/w500/abc123def.jpg
    """
    # Validate size to prevent abuse
    valid_sizes = ["w92", "w154", "w185", "w342", "w500", "w780", "original"]
    if size not in valid_sizes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image size. Must be one of: {valid_sizes}"
        )
    
    # Sanitize path - ensure it doesn't contain path traversal attempts
    if ".." in path or path.startswith("/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image path"
        )
    
    # Construct full TMDB URL
    image_url = f"{TMDB_IMAGE_BASE_URL}/{size}/{path}"
    
    try:
        logger.info(f"Fetching image from TMDB: {image_url}")
        
        # Fetch the image from TMDB
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()
        
        # Determine content type
        content_type = response.headers.get("content-type", "image/jpeg")
        
        # Return the image with caching headers
        return StreamingResponse(
            iter([response.content]),
            media_type=content_type,
            headers=CACHE_HEADERS
        )
    
    except requests.exceptions.Timeout:
        logger.error(f"Timeout fetching image: {image_url}")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Image server timeout"
        )
    
    except requests.exceptions.HTTPError as e:
        logger.error(f"HTTP error fetching image: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to fetch image from image server"
        )
    
    except Exception as e:
        logger.error(f"Unexpected error fetching image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch image"
        )
