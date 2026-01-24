"""
NexGenTeck AI Chatbot Backend
FastAPI application with RAG-based intelligent responses.

This is a "softcoded" chatbot that dynamically understands user intent
and generates contextual responses using website knowledge.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import logging

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


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    message: str


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
    Initializes the knowledge base on startup.
    """
    logger.info("Starting NexGenTeck AI Chatbot")
    
    # Validate configuration
    try:
        config.validate()
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        raise
    
    # Initialize knowledge base if empty
    if not vector_store.is_initialized():
        logger.info("Knowledge base is empty, scraping website...")
        await initialize_knowledge_base()
    else:
        logger.info(f"Knowledge base already has {vector_store.count()} documents")
    
    yield
    
    logger.info("Shutting down NexGenTeck AI Chatbot")


async def initialize_knowledge_base():
    """
    Scrape website and populate the vector store.
    This runs automatically on first startup.
    """
    try:
        scraper = WebsiteScraper()
        documents = scraper.scrape(max_pages=30)
        
        if documents:
            count = vector_store.add_documents(documents)
            logger.info(f"Indexed {count} documents from website")
        else:
            logger.warning("No documents scraped, using fallback content")
            
    except Exception as e:
        logger.error(f"Failed to initialize knowledge base: {e}")
        # The fallback content will be used automatically


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
    
    Greetings are handled specially without RAG.
    """
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
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
    """
    logger.info("Re-indexing knowledge base")
    
    try:
        # Clear existing data
        vector_store.clear()
        
        # Re-scrape and index
        await initialize_knowledge_base()
        
        return {
            "status": "success",
            "message": f"Re-indexed {vector_store.count()} documents"
        }
        
    except Exception as e:
        logger.error(f"Re-indexing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
