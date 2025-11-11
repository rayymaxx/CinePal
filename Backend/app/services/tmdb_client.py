import os
import requests
import logging
from typing import Dict, List, Optional, Any 
from dotenv import load_dotenv 
from datetime import datetime
from ..models.pydantic_models import ShowData

load_dotenv() 

logging.basicConfig(
    level=logging.INFO
)

api_key = os.getenv("TMDB_API_KEY") 

if not api_key:
    logging.warning("❌ TMDB API key not configured")
else:
    logging.info("✅ TMDB Api key loaded!")

base_url = "https://api.themoviedb.org/3"

def map_tmdb_to_showdata(data: Dict[str, Any], media_type: str) -> Optional[ShowData]:
    """Maps raw TMDB response data to the internal ShowData Pydantic model."""
    show_id = str(data.get('id')) 

    if media_type == 'movie':
        title = data.get('title')
        release_date = data.get('release_date')
    elif media_type == 'tv':
        title = data.get('name')
        release_date = data.get('first_air_date')
    else:
        return None

    if not title or not show_id:
        return None 
    
    # Calculate Runtime
    runtime = 'N/A'
    if media_type == 'movie':
        if data.get('runtime'):
            runtime = f"{data['runtime']} min"

    elif media_type == 'tv':
        episode_runtimes = data.get('episode_run_time', []) 
        if episode_runtimes:
            runtime = f"{episode_runtimes[0]} min (avg)"
    
    # Parse Genres
    genres_list: List[str] = [] 
    if data.get('genres') and isinstance(data['genres'], list) and data['genres'] and isinstance(data['genres'][0], dict):
        genres_list = [g['name'] for g in data['genres']]


    cast = [c['name'] for c in data.get('cast', [])] 
    directors = [d['name'] for d in data.get('crew', []) if d.get('job') == 'Director'] 

    poster_path = data.get('poster_path') 
    poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else 'N/A'

    try: 
        release_date_str = datetime.strptime(release_date, '%Y-%m-%d').strftime('%Y-%m-%d') 
    except (ValueError, TypeError):
        release_date_str = 'N/A' 

    return ShowData(
        show_id=show_id,
        title=title,
        type=media_type,
        genres=genres_list,
        plot=data.get('overview', 'No plot summary available'),
        release_date=release_date_str,
        runtime=runtime,
        cast=cast[:8],
        directors=directors[:4],
        poster_url=poster_url,
        tmdb_rating=data.get('vote_average', 0.0)
    )


def search_shows(query: str, media_type: str = 'multi') -> List[ShowData]:
    """Searches TMDB for movies or TV shows based on a query."""
    if not api_key:
        logging.warning("TMDB API key not configured")
        return [] 
    
    endpoint = f"{base_url}/search/{media_type}" 
    params = {
        'api_key' : api_key,
        'query' : query,
        'language' : 'en-US'
    }

    try: 
        response = requests.get(endpoint, params=params) 
        response.raise_for_status() 
        data = response.json() 

        results: List[ShowData] = [] 
        for item in data.get('results', []):
            item_type = item.get('media_type') 
            map_type = media_type
            if media_type == 'multi':
                map_type = item_type

            if map_type in ['movie', 'tv']:
                show_data = map_tmdb_to_showdata(item, media_type=map_type) 
                if show_data:
                    results.append(show_data) 

        return results
    except requests.exceptions.RequestException as e:
        logging.error(f"Error during TMDB search: {e}") 
        return [] 
    

def get_show_details(tmdb_id: int, media_type: str) -> Optional[ShowData]: 
    if not api_key:
        logging.warning("❌ TMDB api key not configured")
        return None
    
    if media_type not in ["movie", 'tv']:
        logging.error("❌ media_type must be 'movie' or 'tv'.")
        return None
    
    details_endpoint = f"{base_url}/{media_type}/{tmdb_id}" 
    params = {'api_key': api_key, 'language' : 'en-US'} 

    credits_endpoint = f"{base_url}/{media_type}/{tmdb_id}/credits"

    try: 
        details_response = requests.get(details_endpoint, params=params) 
        details_response.raise_for_status() 
        details_data = details_response.json() 

        credits_response = requests.get(credits_endpoint, params=params) 
        credits_response.raise_for_status() 
        credits_data = credits_response.json() 

        details_data['cast'] = credits_data.get('cast', []) 
        details_data['crew'] = credits_data.get('crew', []) 

        return map_tmdb_to_showdata(details_data, media_type) 
    
    except requests.exceptions.RequestException as e:
        logging.error(f"Error during TMDB fetch: {e}") 
        return None 
    
# ----Example block for running locally----
# if __name__ == '__main__':
#     # NOTE: You must set the TMDB_API_KEY environment variable for this to run.
    
#     # 1. Search Example
#     search_term = "Stranger Things"
#     found_shows = search_shows(search_term, media_type='multi')
    
#     print(f"\n--- Search Results for '{search_term}' ---")
#     if found_shows:
#         for show in found_shows[:3]:
#             print(f"- {show.title} ({show.release_date}, Rating: {show.tmdb_rating}) [Type: {show.type}]")
                        
#             print(f"\n--- Fetching Details for {show.title} (ID: {show.show_id}) ---")
#             detailed_show = get_show_details(int(show.show_id), show.type)
            
#             if detailed_show:
#                 print(f"Plot: {detailed_show.plot}...")
#                 print(f"Runtime: {detailed_show.runtime}")
#                 print(f"Genres: {', '.join(detailed_show.genres)}")
#                 print(f"Directors: {', '.join(detailed_show.directors)}")
#                 print(f"Cast: {', '.join(detailed_show.cast[:5])}...")
#             else:
#                 print("Failed to fetch details.")
#     else:
#         print("No shows found")