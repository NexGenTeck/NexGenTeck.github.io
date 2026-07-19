"""
NexGenTeck AI Chatbot — Hugging Face Gradio Space entrypoint.

Knowledge base preference:
1. Structured extraction from bundled website sources
2. Live website scrape (secondary)
3. Minimal emergency fallback
"""

from __future__ import annotations

import inspect
import logging
import os
import secrets
import threading
from typing import Any

os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

import gradio as gr
import spaces

from chatbot_core.config import config
from chatbot_core.guardrails import MISSING_KEY_MESSAGE
from chatbot_core.rag import engine


# ---------------------------------------------------------------------------
# ZeroGPU compliance
# ---------------------------------------------------------------------------
# Hugging Face ZeroGPU Spaces require at least one @spaces.GPU-decorated
# function to be present at import time. Without one, the runtime aborts with
# "No @spaces.GPU function detected during startup".
#
# IMPORTANT: This function must NEVER read or mutate the in-memory vector
# index (engine.index).  ZeroGPU runs decorated functions inside an isolated
# worker subprocess; any state changes are discarded when the subprocess
# exits.  The previous implementation decorated admin_refresh() with
# @spaces.GPU, which rebuilt the index inside the worker and then lost it.
#
# The no-op below satisfies the startup check.  It is wired to a hidden
# Gradio component so the runtime registers it, but it performs no work.
# ---------------------------------------------------------------------------

@spaces.GPU(duration=1)
def _gpu_noop() -> str:
    """No-op function required by ZeroGPU. Does not touch the RAG index."""
    return "ok"



logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

_index_thread: threading.Thread | None = None
_index_lock = threading.Lock()


def _normalise_result(result: Any) -> dict:
    """
    Convert different engine return formats into a dictionary.
    """
    if isinstance(result, dict):
        return result

    if result is None:
        return {
            "ok": True,
            "status": "completed",
            "message": "Index operation completed.",
        }

    return {
        "ok": True,
        "status": "completed",
        "message": str(result),
    }


def _build_index_compat(force: bool = True) -> dict:
    """
    Call ChatbotEngine.build_index() compatibly.

    New engine versions support:
        build_index(force=True)

    Older engine versions support:
        build_index()
    """
    build_index = getattr(engine, "build_index", None)

    if not callable(build_index):
        raise AttributeError(
            "ChatbotEngine does not provide a callable build_index() method."
        )

    accepts_force = False

    try:
        signature = inspect.signature(build_index)

        accepts_force = (
            "force" in signature.parameters
            or any(
                parameter.kind is inspect.Parameter.VAR_KEYWORD
                for parameter in signature.parameters.values()
            )
        )

    except (TypeError, ValueError):
        logger.warning(
            "Could not inspect build_index() signature; "
            "using no-argument compatibility mode."
        )

    if accepts_force:
        logger.info(
            "Calling ChatbotEngine.build_index(force=%s)",
            force,
        )
        result = build_index(force=force)

    else:
        logger.warning(
            "ChatbotEngine.build_index() does not support the "
            "'force' parameter; calling build_index() without arguments."
        )
        result = build_index()

    return _normalise_result(result)


def _startup_indexing() -> None:
    """
    Initialize or refresh the knowledge index in the background.

    Uses freshness-aware startup when available and falls back to a
    compatible build_index() invocation for older engine versions.
    """
    try:
        logger.info(
            "Starting background knowledge indexing for %s",
            config.WEBSITE_URL,
        )

        startup_refresh = getattr(
            engine,
            "ensure_fresh_on_startup",
            None,
        )

        if callable(startup_refresh):
            logger.info(
                "Using ChatbotEngine.ensure_fresh_on_startup()."
            )
            result = _normalise_result(startup_refresh())

        else:
            logger.warning(
                "ChatbotEngine does not provide "
                "ensure_fresh_on_startup(); falling back to build_index()."
            )
            result = _build_index_compat(force=True)

        logger.info(
            "Indexing result: %s",
            result.get(
                "message",
                "No indexing message returned.",
            ),
        )

    except Exception:
        logger.exception("Background knowledge indexing failed")


def ensure_indexing_started() -> None:
    """
    Start the startup freshness check once per Space process.

    Chat requests must not launch repeated reindex attempts. Administrative
    refresh remains available as the explicit force-refresh path.
    """
    global _index_thread

    with _index_lock:
        if _index_thread is not None:
            return

        _index_thread = threading.Thread(
            target=_startup_indexing,
            name="nexgenteck-knowledge-indexer",
            daemon=True,
        )

        _index_thread.start()


def respond(message: str, history: list) -> str:
    """
    Handle a chatbot request.
    """
    ensure_indexing_started()
    return engine.chat(message, history)


def refresh_status() -> str:
    """
    Return the current knowledge-base status.
    """
    ensure_indexing_started()

    try:
        status = engine.status_text()
    except Exception:
        logger.exception("Unable to retrieve knowledge-base status")
        status = "Unable to retrieve knowledge-base status."

    if not config.GROQ_API_KEY:
        status += f"\n\n{MISSING_KEY_MESSAGE}"

    return status


# Removed @spaces.GPU decorator to prevent ZeroGPU subprocess state loss.
# Sentence-transformers runs on CPU in this application, so GPU is not required.
def admin_refresh(admin_token: str) -> str:
    """
    Rebuild the index when the configured admin token is provided.

    The GPU decorator is required by the Hugging Face ZeroGPU Space.
    The compatibility helper supports both old and new engine versions.
    """
    if not config.ADMIN_TOKEN:
        return (
            "Public refresh is disabled. Set ADMIN_TOKEN or "
            "REINDEX_SECRET in the Hugging Face Space Secrets."
        )

    supplied_token = (admin_token or "").strip()

    if not supplied_token or not secrets.compare_digest(
        supplied_token,
        config.ADMIN_TOKEN,
    ):
        return "Invalid admin token. Refresh denied."

    try:
        result = _build_index_compat(force=True)

    except Exception:
        logger.exception(
            "Administrative knowledge-index refresh failed"
        )
        return (
            "Refresh failed because an unexpected indexing "
            "error occurred. Check the container logs."
        )

    prefix = (
        "Refresh complete."
        if result.get("ok", True)
        else "Refresh failed."
    )

    details = (
        f"{result.get('message', '')} "
        f"status={result.get('status', 'unknown')} "
        f"chunks={result.get('chunks', 'unknown')} "
        f"source={result.get('extraction_source', 'unknown')} "
        f"version={str(result.get('content_version') or '')[:12]}"
    )

    return f"{prefix} {details}".strip()


def build_ui() -> gr.Blocks:
    """
    Build the Gradio interface without starting indexing prematurely.
    """
    with gr.Blocks(
        title="NexGenTeck AI Assistant",
        theme=gr.themes.Soft(
            primary_hue="blue",
            secondary_hue="indigo",
        ),
    ) as demo:
        gr.Markdown(
            """
# NexGenTeck AI Assistant

Ask about our services, portfolio projects, team, partners,
pricing, or how to get started.

Answers are grounded in current NexGenTeck website content.
            """
        )

        status_box = gr.Textbox(
            label="Knowledge Base Status",
            value="Index not ready yet.",
            interactive=False,
            lines=4,
        )

        refresh_status_btn = gr.Button(
            "Update Status",
            variant="secondary",
        )

        gr.ChatInterface(
            fn=respond,
            type="messages",
            examples=[
                "What services does NexGenTeck offer?",
                "List the current portfolio projects",
                "Who is the founder and CEO of NexGenTeck?",
                "Who are NexGenTeck’s partners?",
                "Tell me about TrackIT",
                "How can I contact NexGenTeck?",
            ],
            title="Chat",
            cache_examples=False,
        )

        gr.Markdown("### Admin: Refresh Website Index")

        if config.ADMIN_TOKEN:
            admin_token_input = gr.Textbox(
                label="Admin Token",
                placeholder=(
                    "Enter ADMIN_TOKEN to refresh the website index"
                ),
                type="password",
            )

            refresh_btn = gr.Button(
                "Refresh Website Index",
                variant="primary",
            )

            refresh_output = gr.Textbox(
                label="Refresh Result",
                interactive=False,
                lines=3,
            )

            refresh_btn.click(
                fn=admin_refresh,
                inputs=[admin_token_input],
                outputs=[refresh_output],
            ).then(
                fn=refresh_status,
                outputs=[status_box],
            )

        else:
            gr.Markdown(
                "_Index refresh is disabled until `ADMIN_TOKEN` "
                "is set in the Hugging Face Space Secrets._"
            )

        refresh_status_btn.click(
            fn=refresh_status,
            outputs=[status_box],
        )

        demo.load(
            fn=refresh_status,
            outputs=[status_box],
        )

        # Hidden components to register the @spaces.GPU compliance function with Gradio
        dummy_btn = gr.Button("Dummy GPU Trigger", visible=False)
        dummy_output = gr.Textbox(visible=False)
        dummy_btn.click(fn=_gpu_noop, outputs=[dummy_output])

    return demo


# Preload the index synchronously on application startup to avoid race conditions.
# This blocks the app from serving until the knowledge base is fully initialized.
logger.info("Application Startup: preloading knowledge base begins.")
import time
start_time = time.time()
try:
    init_result = engine.ensure_fresh_on_startup()
    duration = time.time() - start_time
    logger.info(
        "Application Startup: knowledge base preloaded successfully. "
        "Duration: %.3f seconds. Result: %s",
        duration,
        init_result,
    )
    if not init_result.get("ok", True):
        raise RuntimeError(
            f"Knowledge base preloading failed to obtain authoritative content: {init_result.get('message')}"
        )
except Exception as e:
    logger.exception("Application Startup: failed to build/load knowledge base.")
    raise RuntimeError(
        "Application Startup aborted: failed to build/load knowledge base."
    ) from e

# Prevent redundant background indexing since it is already preloaded
_index_thread = threading.current_thread()

demo = build_ui()


if __name__ == "__main__":
    logger.info(
        "Launching NexGenTeck AI Assistant with Gradio %s",
        gr.__version__,
    )

    demo.launch(
        server_name="0.0.0.0",
        server_port=int(os.getenv("PORT", "7860")),
        ssr_mode=False,
        show_error=True,
    )
