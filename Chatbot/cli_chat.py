
import multiprocessing
import os
import sys
import logging

# Set environment variables BEFORE imports
os.environ["TOKENIZERS_PARALLELISM"] = "false"
# Force single thread for numpy/pytorch to reduce overhead/errors on Windows CLI
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"

if __name__ == "__main__":
    multiprocessing.freeze_support()

import asyncio
from config import config

# Configure logging to show only important info
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger("cli_chat")

# Import chatbot components
try:
    from vector_store import vector_store
    from scraper import WebsiteScraper
    from rag_pipeline import process_message
except ImportError as e:
    print(f"Error importing chatbot components: {e}")
    print("Make sure you are running this from the Chatbot directory or have installed requirements.")
    sys.exit(1)

async def init_chatbot():
    print("\n🚀 Initializing Chatbot for CLI Testing...")
    print("------------------------------------------")
    
    # 2. Scrape and index content
    print("📥 Indexing content (checking local translations)...")
    scraper = WebsiteScraper(base_url="http://localhost:3000") 
    
    # This will use the translation_extractor.py logic I just added
    documents = scraper.scrape(max_pages=100)
    
    if documents:
        # Clear first to avoid duplicates/stale data
        try:
             vector_store.client.recreate_collection(
                collection_name=vector_store.collection_name,
                vectors_config=vector_store.client.get_collection(vector_store.collection_name).config.params.vectors
            )
        except:
             pass 

        count = vector_store.add_documents(documents)
        print(f"✅ Indexed {count} documents correctly from source files!")
    else:
        print("⚠️ No documents indexed! Check scraper logic.")
    
    print("------------------------------------------")
    print("💬 Chatbot Ready! Type 'exit' to quit.")
    print("------------------------------------------\n")

async def chat_loop():
    await init_chatbot()
    
    while True:
        try:
            # Simple non-blocking input handling isn't easy in async console without external libs
            # So we use standard input in a blocking way, which is fine for this test
            user_input = input("\nYou: ").strip()
            
            if user_input.lower() in ('exit', 'quit', 'bye'):
                print("\nGoodbye! 👋")
                break
            
            if not user_input:
                continue
                
            print("Bot: ", end="", flush=True)
            
            # Process message using the RAG pipeline
            response = await process_message(user_input)
            
            print(response)
            
        except KeyboardInterrupt:
            print("\nGoodbye! 👋")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    try:
        # Check for API key
        if not config.GROQ_API_KEY:
            print("❌ Error: GROQ_API_KEY not found in environment variables or .env file.")
            sys.exit(1)
            
        asyncio.run(chat_loop())
    except KeyboardInterrupt:
        pass
