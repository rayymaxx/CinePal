import os 
from dotenv import load_dotenv
from typing import Dict, Any

from langchain_core.prompts import ChatPromptTemplate 
from langchain_core.runnables import RunnablePassthrough, RunnableLambda, Runnable 
from langchain_core.output_parsers import PydanticOutputParser, StrOutputParser  

from ..models.pydantic_models import UserContext
from ..services import serper_client 
from ..core.config import llm as GROQLLM


load_dotenv() 

GROQ_API_KEY=os.getenv("GROQ_API_KEY") 

if not GROQ_API_KEY:
    print("❌ GROQ_API_KEY missing in environment variables.")
else:
    os.environ["GROQ_API_KEY"] = GROQ_API_KEY 
    print("✅ GROQ_API_KEY - intent parser loaded and client configured!")


def get_context_enhancer_chain():
    llm = GROQLLM

    parser = PydanticOutputParser(pydantic_object=UserContext) 

    def get_latest_movie_news(input_data: Dict[str, Any]) -> str:
        search_query = "latest movie news and trends" 
        return serper_client.search_news_talking_points(search_query, num_results=5)

    prompt = ChatPromptTemplate.from_messages([
        ("system", ("""
            You are a context analysis expert for a movie recommendation system.
                                
            Your task is to analyze the conversation history and current user message, 
            and real-time **SEARCH RESULTS** to create 
            a concise, focused summary.

            You are provided wih:
            - Conversation History 
            - Latest User Message 
            - Real-Time Talking Points (recent movie news/trends)  
                    
            Capture:
            1. What the user is currently asking for or discussing
            2. Relevant context from previous messages
            3. Key preferences or constraints mentioned 
            4. If a user asks about general "current movies" or "what's new," integrate key points from the search results into the summary. 
                    

            Be concise but preserve important details. Focus on information that would help 
            understand the user's current intent and needs.
                                
            You MUST output a valid JSON object matching the schema:\n{format_instructions}
            """)),
        ("human", """
         Real-Time Talking Points (Current News/Trends):\n{talking_points}\n
         Conversation History:\n{chat_history}\n
         \nLatest User Message: {user_input}
         Analyze and summarize the context""")        
    ]).partial(format_instructions=parser.get_format_instructions()) 

    def clean_json_output(text: str) -> str: 
        if "```json" in text: 
            return text.split("```json")[1].split("```")[0].strip() 
        elif "```" in text: 
            return text.split("```")[1].split("```")[0].strip()
        return text.strip() 

    context_enhancer_chain = (
        RunnablePassthrough.assign(
            talking_points=RunnableLambda(get_latest_movie_news).with_types(input_type=dict, output_type=str)
        )
        | prompt 
        | llm 
        | StrOutputParser() 
        | RunnableLambda(clean_json_output) 
        | parser
    )
    return context_enhancer_chain


