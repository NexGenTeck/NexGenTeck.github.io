# Windows multiprocessing compatibility - MUST be at the very start
import multiprocessing
import os

# Set environment variables BEFORE any other imports
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Enable freeze_support for Windows
if __name__ == "__main__":
    multiprocessing.freeze_support()

"""
NexGenTeck AI Chatbot Backend
FastAPI application with fully softcoded RAG-based intelligent responses.

FULLY SOFTCODED APPROACH:
- NO hardcoded regex patterns or keyword matching
- LLM interprets ALL user messages dynamically
- Website content is the ONLY source of information
- LLM decides intent, sentiment, and context needs
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from contextlib import asynccontextmanager
import logging
import asyncio

from config import config
from scraper import WebsiteScraper
from vector_store import vector_store
from rag_pipeline import process_message

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global reindex lock to prevent concurrent reindex operations
_reindex_lock = asyncio.Lock()
_is_reindexing = False


class ChatRequest(BaseModel):
    """Request model for chat endpoint with input validation."""
    message: str
    
    @field_validator('message')
    @classmethod
    def validate_message(cls, v: str) -> str:
        """Validate and sanitize the message input."""
        if not v or not v.strip():
            raise ValueError('Message cannot be empty')
        
        # Strip whitespace
        v = v.strip()
        
        # Check max length (2000 characters)
        if len(v) > 2000:
            raise ValueError('Message too long (max 2000 characters)')
        
        # Check min length (at least 1 meaningful character)
        if len(v) < 1:
            raise ValueError('Message must contain at least 1 character')
        
        return v


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    response: str
    status: str = "success"


class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str
    message: str
    documents_count: int


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Initializes the knowledge base on startup by scraping the ENTIRE website.
    """
    logger.info("Starting NexGenTeck AI Chatbot (Fully Softcoded)")
    
    # Validate configuration
    try:
        config.validate()
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        raise
    
    # Initialize knowledge base if empty - scrape entire website
    if not vector_store.is_initialized():
        logger.info("Knowledge base is empty, scraping ENTIRE website...")
        await initialize_knowledge_base()
    else:
        logger.info(f"Knowledge base already has {vector_store.count()} documents")
    
    yield
    
    logger.info("Shutting down NexGenTeck AI Chatbot")


async def initialize_knowledge_base() -> int:
    """
    Scrape the ENTIRE website and populate the vector store.
    This is the ONLY source of information for the chatbot.
    """
    try:
        scraper = WebsiteScraper()
        # Scrape up to 100 pages for comprehensive coverage
        documents = scraper.scrape(max_pages=100)

        if documents:
            count = vector_store.add_documents(documents)
            logger.info(f"Indexed {count} documents from website")
            return count
        
        logger.warning("No documents scraped, using fallback content")
        return 0
            
    except Exception as e:
        logger.error(f"Failed to initialize knowledge base: {e}")
        # The fallback content will be used automatically
        return 0


# Create FastAPI app
app = FastAPI(
    title="NexGenTeck AI Chatbot",
    description="Intelligent chatbot with RAG-based responses",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint with basic info."""
    return HealthResponse(
        status="online",
        message="NexGenTeck AI Chatbot is running",
        documents_count=vector_store.count()
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for monitoring."""
    return HealthResponse(
        status="healthy",
        message="All systems operational",
        documents_count=vector_store.count()
    )


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process a chat message and return a response.
    
    The chatbot uses RAG to:
    1. Analyze sentiment and intent
    2. Retrieve relevant context from knowledge base
    3. Generate a contextual response using Llama 3.3
    
    Input validation is handled by Pydantic ChatRequest model.
    """
    global _is_reindexing
    
    # Warn if reindexing is in progress (but still allow chat)
    if _is_reindexing:
        logger.warning("Chat request received while reindexing is in progress")
    
    logger.info(f"Received message: {request.message[:100]}...")
    
    try:
        response = await process_message(request.message)
        return ChatResponse(response=response)
        
    except Exception as e:
        logger.error(f"Error processing message: {e}")
        raise HTTPException(
            status_code=500,
            detail="I'm having trouble processing your request. Please try again."
        )


@app.post("/reindex")
async def reindex_knowledge_base():
    """
    Re-scrape website and update knowledge base.
    Useful for updating content after website changes.
    Uses a lock to prevent concurrent reindex operations.
    """
    global _is_reindexing
    
    # Check if already reindexing
    if _is_reindexing:
        return {
            "status": "busy",
            "message": "Reindexing is already in progress. Please wait."
        }
    
    logger.info("Re-indexing knowledge base")
    
    async with _reindex_lock:
        _is_reindexing = True
        try:
            # Scrape first to avoid downtime if scraping fails
            scraper = WebsiteScraper()
            documents = scraper.scrape(max_pages=100)

            if not documents:
                raise HTTPException(
                    status_code=500,
                    detail="Scraping failed; keeping existing knowledge base"
                )

            # Clear existing data only after successful scrape
            vector_store.clear()
            count = vector_store.add_documents(documents)

            return {
                "status": "success",
                "message": f"Re-indexed {count} documents"
            }
            
        except Exception as e:
            logger.error(f"Re-indexing failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            _is_reindexing = False


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
