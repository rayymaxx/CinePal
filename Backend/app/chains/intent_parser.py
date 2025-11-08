import os 
from langchain_core.prompts import ChatPromptTemplate 
from langchain_huggingface.llms import HuggingFaceEndpoint 
from langchain_core.output_parsers import PydanticOutputParser 
from langchain_core.runnables import RunnableLambda 
from ..models.pydantic_models import Intent, IntentType 

LLM_MODEL = "mistralai/Mistral-7B-Instruct-v0.2" 

def get_intent_parser_chain():
    llm = HuggingFaceEndpoint(
        repo_id=LLM_MODEL,
        task="text-generation", 
        model_kwargs={"temperature": 0.0, "max_length": 512} 
    )

    parser = PydanticOutputParser(pydantic_object=Intent) 

    intent_description = (f"""
        1. RECOMMENDATION: User is asking for movie/show suggestions, recommendations, or asking "what to watch"
        - Examples: "recommend a movie", "what should I watch", "I want something scary"
        - When this intent is detected, extract a clean search query optimized for vector search
        
        2. PROFILE_UPDATE: User is explicitly updating their preferences or providing feedback
        - Examples: "I love sci-fi movies", "I don't like horror", "add action to my preferences"
        
        3. CHAT: General conversation, questions about the system, or unclear requests
        - Examples: "how are you", "what can you do", "tell me about yourself"

        For RECOMMENDATION intents, create a search_query that:
        - Focuses on genres, moods, themes, actors, or specific requests
        - Is concise (2-8 words typically)
        - Removes conversational filler
        - Example: "I want a thrilling sci-fi movie" → "thrilling sci-fi"
                          
                          
        Determine the primary intent and fill the relevant fields:\n
        1. Recommendation: intent_type='{IntentType.RECOMMENDATION.value}' and populate 'search_query'.\n
        2. Profile Update: intent_type='{IntentType.PROFILE_UPDATE.value}' and populate 'preference_type' and 'preference_value'.\n
        3. Small Talk: intent_type='{IntentType.CHAT.value}'.\n
    """) 

    prompt = ChatPromptTemplate.from_messages([
        ("system", (f"""
            You are an intent classification engine. Analyze the context and determine the precise goal. {intent_description}
            You MUST only respond with a valid JSON object matching the schema:\n{{format_instructions}}
        """)),
        ("human", "Summarized Context: {context_summary}")       
    ]).partial(format_instructions=parser.get_format_instructions()) 

    chain = (
        prompt 
        | llm 
        | RunnableLambda(lambda x: x.split("```json")[1].split("```")[0].strip() if "```json" in x else x) 
        | parser 
    )

    return chain 