import os 
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate 
from langchain_huggingface.llms import HuggingFaceEndpoint 
from langchain_core.output_parsers import PydanticOutputParser 
from langchain_core.runnables import RunnableLambda 
from ..models.pydantic_models import Intent, IntentType 

load_dotenv() 

HUGGINGFACE_API_KEY=os.getenv("HUGGINGFACE_API_KEY") 

if not HUGGINGFACE_API_KEY:
    print("❌ HUGGINGFACE_API_KEY missing in environment variables.")
else:
    print("✅ HUGGINGFACE_API_KEY - intent parser loaded!")

LLM_MODEL = "mistralai/Mistral-7B-Instruct-v0.3" 

def get_intent_parser_chain():
    try:
        llm = HuggingFaceEndpoint(
            repo_id=LLM_MODEL,
            task="text-generation", 
            temperature=0.0,
            max_new_tokens=512,
            huggingfacehub_api_token=HUGGINGFACE_API_KEY, 
        )
    except Exception as e:
        print(f"❌ HuggingFace model {LLM_MODEL} failed: {e}")
        # Fallback to a simpler model
        llm = HuggingFaceEndpoint(
            repo_id="google/flan-t5-base",
            task="text2text-generation", 
            temperature=0.0,
            max_new_tokens=512,
            huggingfacehub_api_token=HUGGINGFACE_API_KEY, 
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