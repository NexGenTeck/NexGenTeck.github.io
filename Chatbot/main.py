import multiprocessing
import os

os.environ["TOKENIZERS_PARALLELISM"] = "false"

if __name__ == "__main__":
    multiprocessing.freeze_support()

"""
NexGenTeck AI Chatbot Backend
FastAPI application with RAG-based intelligent responses grounded in website content.
"""

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from contextlib import asynccontextmanager
import logging
import asyncio
from typing import Optional

from config import config
from vector_store import vector_store
from rag_pipeline import process_message
from reranker import reranker
from knowledge_manager import knowledge_manager
from auth_utils import authorize_reindex

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

_reindex_lock = asyncio.Lock()
_is_reindexing = False


class ChatRequest(BaseModel):
    message: str

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Message cannot be empty")
        v = v.strip()
        if len(v) > 2000:
            raise ValueError("Message too long (max 2000 characters)")
        if len(v) < 1:
            raise ValueError("Message must contain at least 1 character")
        return v


class ChatResponse(BaseModel):
    response: str
    status: str = "success"


class HealthResponse(BaseModel):
    status: str
    message: str
    documents_count: int
    reranker: dict = {}
    content_version: str = ""
    active_collection: str = ""


def _authorize_reindex(
    authorization: Optional[str],
    x_reindex_secret: Optional[str],
    request: Request,
) -> None:
    """
    Protect mutating reindex endpoints.
    - If REINDEX_SECRET / ADMIN_TOKEN is set, require Bearer token or X-Reindex-Secret.
    - If unset, allow only loopback requests (local development).
    """
    client_host = request.client.host if request.client else ""
    allowed, status_code, detail = authorize_reindex(
        expected_secret=config.REINDEX_SECRET,
        authorization=authorization,
        x_reindex_secret=x_reindex_secret,
        client_host=client_host,
    )
    if not allowed:
        raise HTTPException(status_code=status_code, detail=detail)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting NexGenTeck AI Chatbot")

    try:
        config.validate()
    except ValueError as e:
        logger.error("Configuration error: %s", e)
        raise

    if config.AUTO_REFRESH_ON_STARTUP:
        try:
            result = knowledge_manager.ensure_fresh_on_startup()
            logger.info("Startup knowledge result: %s", result.get("message"))
        except Exception as e:
            logger.error("Startup knowledge refresh failed: %s", e)
            if not vector_store.is_initialized():
                logger.warning("Knowledge base unavailable after startup failure")
    elif not vector_store.is_initialized():
        logger.info("Knowledge base empty and AUTO_REFRESH_ON_STARTUP=false")
    else:
        logger.info(
            "Knowledge base ready with %s documents", vector_store.count()
        )

    yield
    logger.info("Shutting down NexGenTeck AI Chatbot")


app = FastAPI(
    title="NexGenTeck AI Chatbot",
    description="Intelligent chatbot with RAG-based responses",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_model=HealthResponse)
async def root():
    return HealthResponse(
        status="online",
        message="NexGenTeck AI Chatbot is running",
        documents_count=vector_store.count(),
        content_version=vector_store.get_content_version() or "",
        active_collection=vector_store.get_active_collection_name(),
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        message="All systems operational",
        documents_count=vector_store.count(),
        reranker=reranker.status(),
        content_version=vector_store.get_content_version() or "",
        active_collection=vector_store.get_active_collection_name(),
    )


@app.get("/knowledge/status")
async def knowledge_status():
    meta = vector_store.get_index_metadata()
    return {
        "status": "ready" if vector_store.count() > 0 else "empty",
        "documents_count": vector_store.count(),
        "content_version": vector_store.get_content_version() or "",
        "active_collection": vector_store.get_active_collection_name(),
        "index_metadata": meta,
        "reindexing": _is_reindexing,
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    global _is_reindexing

    if _is_reindexing:
        logger.warning("Chat request received while reindexing is in progress")

    logger.info("Received message: %s...", request.message[:100])

    try:
        response = await process_message(request.message)
        return ChatResponse(response=response)
    except Exception as e:
        logger.error("Error processing message: %s", e)
        raise HTTPException(
            status_code=500,
            detail="I'm having trouble processing your request. Please try again.",
        )


@app.post("/reindex")
async def reindex_knowledge_base(
    request: Request,
    authorization: Optional[str] = Header(default=None),
    x_reindex_secret: Optional[str] = Header(default=None, alias="X-Reindex-Secret"),
    force: bool = True,
):
    """
    Safely rebuild the knowledge base from authoritative website sources.
    Requires REINDEX_SECRET / ADMIN_TOKEN when configured.
    Never clears the active collection before the replacement dataset is validated.
    """
    global _is_reindexing

    _authorize_reindex(authorization, x_reindex_secret, request)

    if _is_reindexing:
        return {
            "status": "busy",
            "message": "Reindexing is already in progress. Please wait.",
        }

    logger.info("Re-indexing knowledge base (force=%s)", force)

    async with _reindex_lock:
        _is_reindexing = True
        try:
            result = await asyncio.to_thread(
                knowledge_manager.safe_reindex,
                force=force,
            )
            if result.get("status") == "failed":
                raise HTTPException(status_code=500, detail=result)
            return result
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Re-indexing failed: %s", e)
            raise HTTPException(
                status_code=500,
                detail={
                    "status": "failed",
                    "message": "Reindex failed; previous knowledge base retained",
                    "error": str(e),
                },
            )
        finally:
            _is_reindexing = False


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
