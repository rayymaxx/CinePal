import os 
from langchain_core.runnables import RunnablePassthrough, RunnableLambda 
from langchain_pinecone import PineconeVectorStore 
from langchain_google_genai import GoogleGenerativeAIEmbeddings 
from langchain_core.documents import Document 
from typing import Dict, Any, List
from pinecone import Pinecone 

from ..services import show_manager, tmdb_client
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
            print("Will fall back to TMDB direct search for recommendations.") 
    
    def get_search_query(input_data: Dict[str, Any]) -> str:
        parsed_intent = input_data.get("parsed_intent")
        if parsed_intent and parsed_intent.intent_type == IntentType.RECOMMENDATION and parsed_intent.search_query:
            return parsed_intent.search_query
        return "" 

    def retrieve_shows(input_data: Dict[str, Any]) -> str:
        """
        First try RAG retrieval if available.
        If RAG fails or returns nothing, fall back to TMDB direct search.
        """
        search_query = get_search_query(input_data)
        
        if not search_query:
            return ""
        
        # Try RAG first if available
        if retriever:
            try:
                rag_results = retriever.invoke(search_query)
                if rag_results:
                    print(f"✅ RAG Retrieved {len(rag_results)} documents for query: '{search_query}'")
                    return show_manager.format_retrieved_docs(rag_results)
            except Exception as e:
                print(f"⚠️  RAG retrieval failed: {e}. Falling back to TMDB direct search.")
        
        # Fallback: Search TMDB directly
        print(f"🔍 Searching TMDB directly for: '{search_query}'")
        db = input_data.get("db")
        
        try:
            # Search TMDB for multiple results
            tmdb_results = tmdb_client.search_shows(search_query, media_type='multi')
            
            if tmdb_results:
                print(f"✅ TMDB Found {len(tmdb_results)} results for '{search_query}'")
                
                # Convert ShowData objects to Document format for consistency
                documents = []
                for idx, show_data in enumerate(tmdb_results[:5]):  # Top 5 results
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
            else:
                return "No results found on TMDB. Try a different search query."
                
        except Exception as e:
            print(f"❌ TMDB search error: {e}")
            return f"Unable to search TMDB: {str(e)}"

    chain = RunnablePassthrough.assign(
        retrieved_docs=RunnableLambda(retrieve_shows)
    ).with_types(input_type=dict)
    
    return chain