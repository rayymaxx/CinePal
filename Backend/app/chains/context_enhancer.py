import os 
from langchain_core.prompts import ChatPromptTemplate 
from langchain_core.runnables import RunnablePassthrough, RunnableLambda 
from langchain_huggingface.llms import HuggingFaceEndpoint
from langchain_core.output_parsers import PydanticOutputParser 

from ..models.pydantic_models import UserContext 

LLM_MODEL = "mistralai/Mistral-7B-Instruct-v0.2" 

def get_context_enhancer_chain():
    llm = HuggingFaceEndpoint(
        repo_id=LLM_MODEL,
        task="text-generation",
        model_kwargs={"temperature": 0.1, "max_length": 512}
    ) 

    parser = PydanticOutputParser(pydantic_object=UserContext) 

    prompt = ChatPromptTemplate.from_messages([
        ("system", ("""
            You are a context analysis expert for a movie recommendation system.
                                
            Your task is to analyze the conversation history and current user message to create 
            a concise, focused summary that captures:
            1. What the user is currently asking for or discussing
            2. Relevant context from previous messages
            3. Key preferences or constraints mentioned

            Be concise but preserve important details. Focus on information that would help 
            understand the user's current intent and needs.
                                
            You MUST output a valid JSON object matching the schema:\n{format_instructions}
            """)),
        ("human", """
         Conversation History:\n{chat_history}\n
         \nLatest User Message: {user_input}
         Analyze and summarize the context""")        
    ]).partial(format_instructions=parser.get_format_instructions()) 

    context_enhancer_chain = (
        prompt 
        | llm 
        | RunnableLambda(lambda x: x.split("```json")[1].split("```")[0].strip() if "```json" in x else x) 
        | parser
    )
    return context_enhancer_chain