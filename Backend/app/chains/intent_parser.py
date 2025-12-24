import os 
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate 
from langchain_core.output_parsers import PydanticOutputParser, StrOutputParser
from langchain_core.runnables import RunnableLambda, Runnable
from langchain_core.runnables.config import RunnableConfig
from typing import Any, Optional


import os 
import json
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate 
from langchain_core.output_parsers import PydanticOutputParser 
from langchain_core.runnables import RunnableLambda, Runnable
from langchain_core.runnables.config import RunnableConfig

from ..models.pydantic_models import Intent, IntentType  
from ..core.config import llm as GROQLLM

load_dotenv() 

GROQ_API_KEY=os.getenv("GROQ_API_KEY") 

def get_intent_parser_chain():
    """
    Creates an LCEL chain for intent parsing using Groq inference.
    Falls back to a simpler model if the primary model fails (using a different Groq model).
    """
    llm = GROQLLM

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

    # --- MINOR MODIFICATION: Adding a strict instruction for raw JSON output ---
    prompt = ChatPromptTemplate.from_messages([
        ("system", (f"""
            You are an intent classification engine. Analyze the context and determine the precise goal. {intent_description}
            You MUST only respond with a valid JSON object matching the schema:\n{{format_instructions}}
            IMPORTANT: Your entire response must be ONLY the raw JSON object, do not wrap it in '```json' or any other text.
        """)),
        ("human", "Summarized Context: {context_summary}")      
    ]).partial(format_instructions=parser.get_format_instructions()) 

    def extract_json_from_response(response: str) -> str:
        """
        Extract JSON from model response, handling various formats.
        (Kept for compatibility with original logic)
        """
        # Handle code blocks with ```json
        if "```json" in response:
            return response.split("```json")[1].split("```")[0].strip()
        # Handle code blocks with just ```
        elif "```" in response:
            return response.split("```")[1].split("```")[0].strip()
        # Try to find JSON object directly
        elif "{" in response and "}" in response:
            start = response.find("{")
            end = response.rfind("}") + 1
            return response[start:end].strip()
        # Return as-is if no formatting detected
        return response.strip()

    chain = (
        prompt 
        | llm 
        | StrOutputParser() 
        | RunnableLambda(extract_json_from_response)
        | parser 
    )

    return chain


# Optional: Test function
def test_intent_parser():
    """
    Test the intent parser chain with sample inputs.
    """
    if not GROQ_API_KEY:
        print("\n❌ Cannot run tests: GROQ_API_KEY is not set.")
        return

    chain = get_intent_parser_chain()
    
    test_cases = [
        "I want to watch a thrilling sci-fi movie",
        "I love action movies",
        "Hello, how are you?"
    ]
    
    print("\n🧪 Testing Intent Parser:")
    for test_input in test_cases:
        try:
            result = chain.invoke({"context_summary": test_input})
            print(f"\nInput: {test_input}")
            print(f"Intent: {result.intent_type}")
            print(f"Search Query: {result.search_query if result.intent_type == IntentType.RECOMMENDATION else 'N/A'}")
        except Exception as e:
            print(f"❌ Error parsing '{test_input}': {e}")


if __name__ == "__main__":
    test_intent_parser()