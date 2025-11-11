from sqlalchemy.orm import Session 
from sqlalchemy import or_  
from typing import Optional, List 
from datetime import datetime 
from langchain_core.documents import Document

import os 
import json 
import logging 
from dotenv import load_dotenv

from ..models.database_models import CachedShow as ShowORM 
from ..models.pydantic_models import ShowData 

from . import tmdb_client 

load_dotenv()

logging.basicConfig(
    level=logging.INFO
)

def format_retrieved_docs(docs: List[Document]) -> str:
    if not docs:
        return "No relevant cached data found."
    
    formatted_list = [] 
    for doc in docs:
        title = doc.metadata.get('title', 'N/A')
        score = doc.metadata.get("score", "N/A")
        show_id = doc.metadata.get('show_id', 'N/A')
        
        formatted_list.append(f"[Title: {title}, Score: {score}, Show ID: {show_id}] {doc.page_content}") 

    return "\n\n---\n\n".join(formatted_list)

def get_show_by_title(db: Session, title: str) -> Optional[ShowData]:
    """
    Attempts to get a show from the local cache first. 
    If not found (Cache MISS), searches TMDB, fetches details, caches, and returns.
    """
    # 1. Cache HIT attempt
    db_show = db.query(ShowORM).filter(
        ShowORM.title.ilike(f"%{title}%")
    ).first() 

    if db_show:
        logging.info(f"Cache HIT: Found '{db_show.title}' in local database.") 
        return ShowData.from_orm_model(db_show) 
    
    logging.info(f"Cache MISS: Title '{title}' not found locally. Searching TMDB..")

    # 2. TMDB Search (using multi to find movies/TV)
    tmdb_results = tmdb_client.search_shows(title, media_type='multi')
    
    if not tmdb_results:
        logging.info(f"TMDB MISS: No search results found for '{title}'.")
        return None
        
    # 3. Fetch Full Details & Cache the best match (first result)
    best_match = tmdb_results[0]
    
    # Use the media_type determined by the search ('movie' or 'tv')
    detailed_show = tmdb_client.get_show_details(int(best_match.show_id), best_match.type)
    
    if detailed_show:
        # 4. Cache the result before returning
        upsert_show(db, detailed_show)
        logging.info(f"TMDB HIT/Cache INSERT: Fetched and cached '{detailed_show.title}'.")
        return detailed_show
        
    logging.info(f"Failed to fetch details for best match: '{best_match.title}'.")
    return None 

def upsert_show(db: Session, show_data: ShowData) -> None:
    """Inserts or updates a show record in the local cache."""
    db_show = db.query(ShowORM).filter(
        ShowORM.show_id == show_data.show_id
    ).one_or_none() 

    # Prepare data for insertion/update
    show_fields = show_data.model_dump(exclude_none=True) 
    show_fields['last_updated'] = datetime.utcnow() 

    # Handle List fields (genres, cast, directors) by JSON dumping them
    list_fields = ['genres', 'cast', 'directors'] 
    for field in list_fields:
        if field in show_fields and isinstance(show_fields[field], list):
            show_fields[field] = json.dumps(show_fields[field]) 

    # Handle Release Date conversion
    if 'release_date' in show_fields and isinstance(show_fields['release_date'], str):
        try: 
            show_fields['release_date'] = datetime.strptime(show_fields['release_date'], '%Y-%m-%d') 
        except ValueError:
            logging.warning(f"Could not convert release_date '{show_fields['release_date']}' to datetime.")
            show_fields['release_date'] = None 

    if db_show:
        for key, value in show_fields.items():
            setattr(db_show, key, value) 

        logging.info(f"Cache UPDATE: Updated '{show_data.title}' (ID: {show_data.show_id}).") 
    else:
        if 'show_id' in show_fields:
            try:
                # Ensure show_id is an integer for the database schema
                show_fields['show_id'] = int(show_fields['show_id'])
            except (ValueError, TypeError):
                logging.error(f"Show ID {show_fields.get('show_id')} is not a valid integer. Skipping upsert.")
                return

        db_show = ShowORM(**show_fields) 
        db.add(db_show) 
        logging.info(f"Cache INSERT: Inserted new show '{show_data.title}' (ID: {show_data.show_id}).") 

    try:
        db.commit() 
    except Exception as e:
        db.rollback() 
        logging.error(f"❌ Failed to commit upsert operation: {e}") 


