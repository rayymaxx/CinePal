import os 
from langchain_core.runnables import RunnablePassthrough, RunnableLambda 
from langchain_pinecone import PineconeVectorStore 
from langchain_google_genai import GoogleGenerativeAIEmbeddings 
from langchain_core.documents import Document 
from typing import Dict, Any, List
from pinecone import Pinecone 

from ..services import show_manager, tmdb_client, serper_client
from ..models.pydantic_models import IntentType

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") 

INDEX_NAME = "cinepal-recommendations" 
EMBEDDING_MODEL_NAME = "text-embedding-004" 

def get_show_retirever_chain():
    # Initialize Google Embeddings for API based RAG lookup
    embeddings = None
    vectorstore = None
    retriever = None
    
    try:
        embeddings = GoogleGenerativeAIEmbeddings(
            model=EMBEDDING_MODEL_NAME,
            google_api_key=GEMINI_API_KEY
        )
    except Exception as e:
        print(f"⚠️  Error initializing Google Embeddings: {e}") 
    
    # Connect to pinecone vector store
    if embeddings:
        try:
            vectorstore = PineconeVectorStore.from_existing_index(
                index_name=INDEX_NAME,
                embedding=embeddings
            )
            retriever = vectorstore.as_retriever(search_kwargs={"k": 3}) 
        except Exception as e:
            print(f"⚠️  Error connecting to pinecone: {e}") 
            print("Will use TMDB as primary source with RAG as fallback.") 
    
    def get_search_query(input_data: Dict[str, Any]) -> str:
        parsed_intent = input_data.get("parsed_intent")
        if parsed_intent and parsed_intent.intent_type == IntentType.RECOMMENDATION and parsed_intent.search_query:
            return parsed_intent.search_query
        return "" 

    def retrieve_shows(input_data: Dict[str, Any]) -> str:
        """
        First try Serper to find movie titles, then search TMDB for details.
        If Serper fails, fall back to direct TMDB search.
        If both fail, use RAG retrieval.
        """
        search_query = get_search_query(input_data)
        
        if not search_query:
            return ""
        
        # Try Serper first to get movie titles
        print(f"🔍 Searching Serper for movie titles: '{search_query}'")
        try:
            serper_results = serper_client.search_news_talking_points(f"movies {search_query}", num_results=5)
            
            if serper_results and "No relevant search results" not in serper_results:
                print(f"✅ Serper found results for '{search_query}'")
                
                # Extract movie titles from serper results and search TMDB
                movie_titles = extract_movie_titles_from_serper(serper_results)
                if movie_titles:
                    tmdb_documents = []
                    for title in movie_titles[:3]:  # Top 3 titles
                        try:
                            tmdb_results = tmdb_client.search_shows(title, media_type='multi')
                            if tmdb_results:
                                show_data = tmdb_results[0]  # Take first result
                                doc = Document(
                                    page_content=f"Title: {show_data.title}\nGenres: {', '.join(show_data.genres)}\nPlot: {show_data.plot}\nRating: {show_data.tmdb_rating}/10",
                                    metadata={
                                        'title': show_data.title,
                                        'show_id': show_data.show_id,
                                        'score': show_data.tmdb_rating,
                                        'type': show_data.type,
                                        'genres': ', '.join(show_data.genres)
                                    }
                                )
                                tmdb_documents.append(doc)
                        except Exception as e:
                            print(f"⚠️ TMDB search failed for '{title}': {e}")
                    
                    if tmdb_documents:
                        print(f"✅ Found {len(tmdb_documents)} movies via Serper->TMDB")
                        return show_manager.format_retrieved_docs(tmdb_documents)
        except Exception as e:
            print(f"⚠️ Serper search failed: {e}. Falling back to direct TMDB.")
        
        # Fallback: Direct TMDB search
        print(f"🔍 Searching TMDB directly for: '{search_query}'")
        try:
            tmdb_results = tmdb_client.search_shows(search_query, media_type='multi')
            
            if tmdb_results:
                print(f"✅ TMDB Found {len(tmdb_results)} results for '{search_query}'")
                
                documents = []
                for idx, show_data in enumerate(tmdb_results[:5]):
                    doc = Document(
                        page_content=f"Title: {show_data.title}\nGenres: {', '.join(show_data.genres)}\nPlot: {show_data.plot}\nRating: {show_data.tmdb_rating}/10",
                        metadata={
                            'title': show_data.title,
                            'show_id': show_data.show_id,
                            'score': show_data.tmdb_rating,
                            'type': show_data.type,
                            'genres': ', '.join(show_data.genres)
                        }
                    )
                    documents.append(doc)
                
                return show_manager.format_retrieved_docs(documents)
                
        except Exception as e:
            print(f"⚠️ TMDB search failed: {e}. Falling back to RAG retrieval.")
        
        # Final fallback: RAG
        if retriever:
            try:
                rag_results = retriever.invoke(search_query)
                if rag_results:
                    print(f"✅ RAG Retrieved {len(rag_results)} documents for query: '{search_query}'")
                    return show_manager.format_retrieved_docs(rag_results)
            except Exception as e:
                print(f"❌ RAG retrieval also failed: {e}")
        
        return "No results found. Try a different search query."

    def extract_movie_titles_from_serper(serper_results: str) -> List[str]:
        """Extract potential movie titles from Serper search results"""
        import re
        titles = []
        
        # Simple regex to find quoted titles or capitalized phrases
        patterns = [
            r'"([^"]+)"',  # Quoted titles
            r'\b([A-Z][a-zA-Z\s]{2,30})\b(?=\s(?:movie|film|series|show))',  # Capitalized phrases before movie/film
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, serper_results, re.IGNORECASE)
            titles.extend(matches)
        
        # Remove duplicates and filter
        unique_titles = list(set([title.strip() for title in titles if len(title.strip()) > 2]))
        return unique_titles[:5]  # Return top 5

    chain = RunnablePassthrough.assign(
        retrieved_docs=RunnableLambda(retrieve_shows)
    ).with_types(input_type=dict)
    
    return chain