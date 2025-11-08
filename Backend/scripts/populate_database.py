import os 
from dotenv import load_dotenv 
from typing import List 

from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document 
from pinecone import Pinecone, ServerlessSpec 

from .initial_data import MOCK_MOVIE_DATA 

load_dotenv() 

GEMINI_API_KEY=os.getenv("GEMINI_API_KEY")
PINECONE_API_KEY=os.getenv("PINECONE_API_KEY") 

EMBEDDING_MODEL_NAME = "text-embedding-004" 
INDEX_NAME = "cinepal-recommendations"
EMBEDDING_DIMENSION = 768

def get_pinecone_index(pinecone_client: Pinecone):
    existing_indexes = [idx.name for idx in pinecone_client.list_indexes()]

    if INDEX_NAME not in existing_indexes:
        print(f"Index '{INDEX_NAME}' not found. Creating it now...")
        pinecone_client.create_index(
            name=INDEX_NAME,
            dimension=EMBEDDING_DIMENSION,
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1"
            )
        )
        print(f"✅ Index '{INDEX_NAME}' created successfully.") 
    else:
        print(f"Index '{INDEX_NAME}' already exists.") 

    return pinecone_client.Index(INDEX_NAME) 

def populate_pinecone() -> None:
    print("\n--- 🚀 Starting Pinecone Population ---\n") 

    if not all([PINECONE_API_KEY, GEMINI_API_KEY]):
        print("❌ ERROR: Missing one or more environment variables (PINECONE_API_KEY, GEMINI_API_KEY).") 
        return 
    
    print(f"Loading Google Embeddings via API (Model: {EMBEDDING_MODEL_NAME})...") 
    try: 
        embeddings = GoogleGenerativeAIEmbeddings(
            model=EMBEDDING_MODEL_NAME,
            google_api_key=GEMINI_API_KEY
        )
        print("✅ Google Embeddings Client loaded successfully.") 

    except Exception as e:
        print(f"❌ Error loading Google Embeddings client: {e}") 
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

    print("Initializing Pinecone client...") 
    pinecone_client = Pinecone(api_key=PINECONE_API_KEY) 

    index = get_pinecone_index(pinecone_client) 

    print(f"Embedding and upserting {len(documents)} documents into Pinecone index '{INDEX_NAME}'...") 

    vectorstore = PineconeVectorStore.from_documents(
        documents=documents,
        embedding=embeddings,
        index_name=INDEX_NAME
    )

    print(f"\n--- Success! ---") 
    print(f"🔍 Pinecone index '{INDEX_NAME}' populated with {len(documents)} documents.") 
    print(f"✅ Vector store is ready for the RAG pipeline.") 

if __name__ == "__main__":
    populate_pinecone() 
