import os 
from dotenv import load_dotenv 
from typing import List 

from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma 
from langchain_core.documents import Document 

from .initial_data import MOCK_MOVIE_DATA 

load_dotenv() 

EMBEDDING_MODEL_NAME = "text-embedding-004" 

CHROMA_DB_PATH = "Backend\data\chroma_db"
COLLECTION_NAME = "movie_recommendations" 

def populate_chroma() -> None:
    print("\n--- Starting VhromaDB Population ---\n") 
    print(f"Loading Google Embeddings via API (Model: {EMBEDDING_MODEL_NAME})...")
    try:
        embeddings = GoogleGenerativeAIEmbeddings(model=EMBEDDING_MODEL_NAME) 
        print("✅ Google Embeddings client loaded successfully.") 
    except Exception as e:
        print(f"❌ Error loading Google Embeddings client: {e}\n")
        print("Please ensure GEMINI_API_KEY environment variable is set.") 
        return 
    
    documents: List[Document] = [] 
    for data in MOCK_MOVIE_DATA:
        content = (
            f"Title: {data['title']}. Genre: {data['genre']}. Cast: {data['cast']}. "
            f"Summary: {data['description']}" 
        )

        metadata = {
            "title": data["title"],
            "genre": data["genre"],
            "source": data["api_source"], 
            "score": data["score"], 
            "last_updated": data["last_updated"] 
        }

        documents.append(Document(page_content=content, metadata=metadata)) 

    print(f"Initializing ChromaDB at path: {CHROMA_DB_PATH}") 

    vector_store = Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        persist_directory=CHROMA_DB_PATH,
        collection_name=COLLECTION_NAME
    ) 

    print(f"\n--- Success! ---")
    print(f"🔍 ChromaDB populated with {len(documents)} documents using the Google API.") 
    print(f"✅ Vector store is ready for the RAG pipeline.") 

if __name__ == "__main__":
    populate_chroma() 
