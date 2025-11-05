from ...app.services.tmdb_client import *


search_term = "Stranger Things"
found_shows = search_shows(search_term, media_type='multi')

print(f"\n--- Search Results for '{search_term}' ---")
if found_shows:
    for show in found_shows[:3]:
        print(f"- {show.title} ({show.release_date}, Rating: {show.tmdb_rating}) [Type: {show.type}]")
                    
        print(f"\n--- Fetching Details for {show.title} (ID: {show.show_id}) ---")
        detailed_show = get_show_details(int(show.show_id), show.type)
        
        if detailed_show:
            print(f"Plot: {detailed_show.plot}...")
            print(f"Runtime: {detailed_show.runtime}")
            print(f"Genres: {', '.join(detailed_show.genres)}")
            print(f"Directors: {', '.join(detailed_show.directors)}")
            print(f"Cast: {', '.join(detailed_show.cast[:5])}...")
        else:
            print("Failed to fetch details.")
else:
    print("No shows found")