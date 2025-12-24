from dotenv import load_dotenv 
from langchain_groq import ChatGroq 
import os 

load_dotenv() 

GROQ_API_KEY=os.getenv("GROQ_API_KEY") 

if not GROQ_API_KEY: 
    raise EnvironmentError("❌ Missing or invalid GROQ_API_KEY in environment variables.") 
else: 
    print("✅ GROQ_API_KEY loaded!") 

LLM_MODEL = "moonshotai/kimi-k2-instruct-0905"  

FALLBACK_MODEL = "meta-llama/llama-3.1-8b-instant"

try: 
    print(f"✅ Using {LLM_MODEL}") 
    llm = ChatGroq(
        model=LLM_MODEL, 
        temperature=0.75, 
        max_tokens=None, 
        timeout=None, 
        max_retries=2, 
        streaming=True, 
        api_key=GROQ_API_KEY
    ) 
except Exception as e: 
    print(f"❌ Groq model {LLM_MODEL} failed, falling back to {FALLBACK_MODEL}") 
    llm = ChatGroq(
        model=FALLBACK_MODEL, 
        temperature=0.75, 
        max_tokens=None, 
        timeout=None, 
        max_retries=2, 
        streaming=True, 
        api_key=GROQ_API_KEY
    ) 
    print(f"✅ Using fallback model: {FALLBACK_MODEL}")

