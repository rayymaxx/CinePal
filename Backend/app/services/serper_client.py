# Wrapper for serper api
from dotenv import load_dotenv 
import os, logging, requests, json
from typing import Optional, List, Dict


load_dotenv() 

logging.basicConfig(
   level=logging.INFO
)

api_key=os.getenv("SERPER_API_KEY")

if not api_key:
    logging.error("❌ Serper API key not configured")
else:
    logging.info("✅SERPER key loaded!")

url = "https://google.serper.dev/search"

def search_news_talking_points(query: str, num_results: int = 7):
    payload = json.dumps({
        "q": query,
        "num": num_results,
    })
    headers = {
        'X-API-KEY': api_key,
        'Content-Type': 'application/json'
    }

    try:
        response = requests.request("POST", url, headers=headers, data=payload)
        response.raise_for_status()

        data = response.json

        organic_results: Optional[List[Dict]] = data.get('organic')

        if not organic_results:
            return f"No relevant search results found for query: '{query}'"
        
        talking_points = []

        for i, result in enumerate(organic_results):
            title = result.get('title', 'N/A')
            snippet = result.get('snippet', 'No detailed snippet available.')

            talking_points.append(
                f"Source {i + 1} Title: {title}\n"
                f"Source {i + 1} Snippet: {snippet}\n"
            )

        compiled_points = "SEARCH RESULTS (Talking Points):\n"
        compiled_points += "\n".join(talking_points)
        compiled_points += "\nEND OF SEARCH RESULTS"

        return compiled_points

    except requests.exceptions.HTTPError as e:
        return f"HTTP Error connecting to Serper API: {e}. Check your API key or endpoint."
    except requests.exceptions.RequestException as e:
        return f"Request Error connecting to Serper API: {e}"
    except Exception as e:
        return f"An unexpected error occurred during search: {e}"


    

       
       

