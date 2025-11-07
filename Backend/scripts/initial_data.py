# For initial user/testing data 
from typing import List, Dict, Any 
from datetime import datetime 

DATE_FORMAT = "%Y-%m-%d %H:%M:%S" 

MOCK_MOVIE_DATA: List[Dict[str, Any]] = [
    {
        "title": "Dune (2021)",
        "genre": "Sci-fi, Epic",
        "cast": "Timothee Chalamet, Rebecca Ferguson",
        "description": "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.",
        "api_source": "TMDB", 
        "score": 8.1,
        "last_updated": datetime(2023, 11, 15, 10, 0, 0).strftime(DATE_FORMAT),
    },
    {
        "title": "Oppenheimer (2023)",
        "genre": "Biography, Drama, History",
        "cast": "Cillian Murphy, Emily Blunt",
        "description": "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb. Directed by Christopher Nolan.",
        "api_source": "TMDB",
        "score": 8.6,
        "last_updated": datetime(2024, 5, 20, 14, 30, 0).strftime(DATE_FORMAT),
    },
    {
        "title": "Blade Runner 2049 (2017)",
        "genre": "Sci-fi, Neo-noir",
        "cast": "Ryan Gosling, Harrison Ford",
        "description": "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years.",
        "api_source": "TMDB",
        "score": 8.0,
        "last_updated": datetime(2023, 10, 10, 9, 0, 0).strftime(DATE_FORMAT),       
    },
    {
        "title": "The Mandalorian (Season 3)",
        "genre": "Space Western, Action",
        "cast": "Pedro Pascal",
        "description": "The journeys of Din Djarin, a lone gunfighter and bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.",
        "api_source": "Serper/Search",
        "score": 7.5,
        "last_updated": datetime(2024, 1, 1, 8, 0, 0).strftime(DATE_FORMAT),        
    }
]