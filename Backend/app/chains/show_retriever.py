import os 
from langchain_core.runnables import RunnablePassthrough, RunnableLambda 
from langchain_pinecone import PineconeVectorStore 
from langchain_google_genai import GoogleGenerativeAIEmbeddings 
from langchain_core.documents import Document 
from typing import Dict, Any 
from pinecone import Pinecone 

from ..services import show_manager 
from ..models.pydantic_models import IntentType

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") 

INDEX_NAME = "cinepal-recommendations" 
EMBEDDING_MODEL_NAME = "text-embedding-004" 

def get_show_retirever_chain():
    # Initialize Google Embeddings for API based RAG lookup
    try:
        embeddings = GoogleGenerativeAIEmbeddings(
            model=EMBEDDING_MODEL_NAME,
            google_api_key=GEMINI_API_KEY
        )
    except Exception as e:
        print(f"Error initializing Google Embeddings: {e}") 
        return RunnablePassthrough.assign(retrieved_docs=RunnableLambda(lambda x: "RAG UNAVAILABLE: Embeddings Error")) 
    
    # Connect to pinecone vector store
    try:
        vectorstore = PineconeVectorStore.from_existing_index(
            index_name=INDEX_NAME,
            embedding=embeddings
        )

        retriever = vectorstore.as_retriever(search_kwargs={"k": 3}) 

    except Exception as e:
        print(f"Error connecting to pinecone: {e}") 
        print("Falling back to a non-RAG chain.") 
        return RunnablePassthrough.assign(retrieved_docs=RunnableLambda(lambda x: "RAG UNAVAILABLE: Pinecone Error")) 
    
    def get_search_query(input_data: Dict[str, Any]) -> str:
        parsed_intent = input_data.get("parsed_intent")
        if parsed_intent and parsed_intent.intent_type == IntentType.RECOMMENDATION and parsed_intent.search_query:
            return parsed_intent.search_query
        return "" 

    chain = (
        RunnablePassthrough.assign(
            retrieved_docs=(
                RunnableLambda(get_search_query).with_types(input_type=dict, output_type=str) 
                | RunnableLambda(lambda query: retriever.invoke(query) if query else []) 
                | show_manager.format_retrieved_docs 
            )
        ).with_types(input_type=dict)
    )
    return chain