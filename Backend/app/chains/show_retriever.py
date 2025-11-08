import os 
from langchain_core.runnables import RunnablePassthrough, RunnableLambda 
from langchain_pinecone import PineconeVectorStore 
from langchain_google_genai import GoogleGenerativeAIEmbeddings 
from langchain_core.documents import Document 
from typing import List, Any 
from pinecone import Pinecone 

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
        return RunnablePassthrough.assign(retrieved_docs=RunnableLambda(lambda x: "RAG UNAVAILABLE")) 
    
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
        return RunnablePassthrough.assign(retrieved_docs=RunnableLambda(lambda x: "RAG UNAVAILABLE")) 
    
    def format_docs(docs: List[Document]) -> str:
        if not docs:
            return "No relevant cached data found."
        
        formatted_list = [] 
        for doc in docs:
            score = doc.metadata.get("score", "N/A")
            formatted_list.append(f"[Title: {doc.metadata.get('title', 'N/A')}, Score: {score}] {doc.page_content}") 

        return "\n\n---\n\n".join(formatted_list) 
    
    chain = (
        RunnablePassthrough.assign(
            retrieved_docs=(lambda x: x["search_query"]) | retriever | format_docs
        ).with_types(input_type=dict)
    )
    return chain 