"""
NexGenTeck AI Chatbot — Hugging Face Gradio Space entrypoint.

Knowledge base preference:
1. Structured extraction from bundled website sources
2. Live website scrape (secondary)
3. Minimal emergency fallback (cannot replace a working index)
"""

from __future__ import annotations

import logging
import os
import secrets
import threading

import gradio as gr

from chatbot_core.config import config
from chatbot_core.guardrails import MISSING_KEY_MESSAGE
from chatbot_core.rag import engine

os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

_index_thread: threading.Thread | None = None


def _startup_indexing() -> None:
    logger.info("Starting background knowledge indexing for %s", config.WEBSITE_URL)
    result = engine.ensure_fresh_on_startup()
    logger.info("Indexing result: %s", result.get("message"))


def ensure_indexing_started() -> None:
    global _index_thread
    if _index_thread is None or not _index_thread.is_alive():
        _index_thread = threading.Thread(target=_startup_indexing, daemon=True)
        _index_thread.start()


def respond(message: str, history: list) -> str:
    ensure_indexing_started()
    return engine.chat(message, history)


def refresh_status() -> str:
    ensure_indexing_started()
    status = engine.status_text()
    if not config.GROQ_API_KEY:
        status += f"\n\n{MISSING_KEY_MESSAGE}"
    return status


def admin_refresh(admin_token: str) -> str:
    """Rebuild index when ADMIN_TOKEN is configured and provided."""
    if not config.ADMIN_TOKEN:
        return (
            "Public refresh is disabled. Set ADMIN_TOKEN (or REINDEX_SECRET) in Space "
            "Secrets to enable authenticated index refresh."
        )

    if not admin_token or not secrets.compare_digest(admin_token.strip(), config.ADMIN_TOKEN):
        return "Invalid admin token. Refresh denied."

    result = engine.build_index(force=True)
    prefix = "Refresh complete." if result.get("ok") else "Refresh failed."
    details = (
        f"{result.get('message', '')} "
        f"status={result.get('status')} "
        f"chunks={result.get('chunks')} "
        f"source={result.get('extraction_source')} "
        f"version={(str(result.get('content_version') or '')[:12])}"
    )
    return f"{prefix} {details}".strip()


def build_ui() -> gr.Blocks:
    ensure_indexing_started()

    with gr.Blocks(
        title="NexGenTeck AI Assistant",
        theme=gr.themes.Soft(primary_hue="blue", secondary_hue="indigo"),
    ) as demo:
        gr.Markdown(
            """
# NexGenTeck AI Assistant
Ask about our services, portfolio projects, team, partners, pricing, or how to get started.
Answers are grounded in current NexGenTeck website content.
            """
        )

        status_box = gr.Textbox(
            label="Knowledge Base Status",
            value=refresh_status(),
            interactive=False,
            lines=4,
        )
        refresh_status_btn = gr.Button("Update Status", variant="secondary")

        gr.ChatInterface(
            fn=respond,
            examples=[
                "What services does NexGenTeck offer?",
                "List the current portfolio projects",
                "Who is the founder and CEO of NexGenTeck?",
                "Who are NexGenTeck’s partners?",
                "Tell me about TrackIT",
                "How can I contact NexGenTeck?",
            ],
            title="Chat",
            retry_btn=None,
            undo_btn=None,
            clear_btn="Clear chat",
        )

        gr.Markdown("### Admin: Refresh Website Index")
        if config.ADMIN_TOKEN:
            admin_token_input = gr.Textbox(
                label="Admin Token",
                placeholder="Enter ADMIN_TOKEN to refresh the website index",
                type="password",
            )
            refresh_btn = gr.Button("Refresh Website Index", variant="primary")
            refresh_output = gr.Textbox(label="Refresh Result", interactive=False, lines=3)

            refresh_btn.click(
                fn=admin_refresh,
                inputs=[admin_token_input],
                outputs=[refresh_output],
            ).then(fn=refresh_status, outputs=[status_box])
        else:
            gr.Markdown(
                "_Index refresh is disabled until `ADMIN_TOKEN` is set in Space Secrets._"
            )

        refresh_status_btn.click(fn=refresh_status, outputs=[status_box])
        demo.load(fn=refresh_status, outputs=[status_box])

    return demo


demo = build_ui()

if __name__ == "__main__":
    demo.launch()
