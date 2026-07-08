"""
Cross-Encoder Re-ranker for the NexGenTeck RAG Pipeline.

Why re-ranking improves answer quality
---------------------------------------
Stage 1  –  Qdrant bi-encoder search
    Query and every document are embedded *independently*.
    Fast (ANN lookup), but the scores are approximate — noisy docs
    can slip in alongside truly relevant ones.

Stage 2  –  Cross-encoder re-ranking  (this module)
    The cross-encoder reads (query + document) *together* in a single
    forward pass, so it captures fine-grained semantic interactions that
    a bi-encoder misses.  Scores are precise relevance judgments.
    We run it only on the small candidate pool (e.g. top-25), so latency
    stays acceptable.

Result:  LLM receives a tight, high-signal context window → better answers.

Flow:
    Qdrant  →  top-K candidates  →  CrossEncoderReranker  →  top-N final docs
                (e.g. 25)                                       (e.g. 5)
"""

from __future__ import annotations

import logging
from typing import Dict, List, Tuple

from sentence_transformers import CrossEncoder

from config import config

logger = logging.getLogger(__name__)


class CrossEncoderReranker:
    """
    Re-ranks bi-encoder retrieval candidates using a cross-encoder model.

    The model chosen by default is `cross-encoder/ms-marco-MiniLM-L-6-v2`:
    - Trained on MS MARCO passage-ranking (question-answering domain)
    - Very fast: ~6 ms / pair on CPU, batch-scored here for efficiency
    - Small footprint: ~23 MB
    - Excellent for short-answer factoid & service queries

    Override via env var:  RERANK_MODEL=cross-encoder/ms-marco-MiniLM-L-12-v2
    (L-12 is slower but slightly more accurate if you have GPU headroom)
    """

    _instance: "CrossEncoderReranker | None" = None
    _model: "CrossEncoder | None" = None

    def __new__(cls) -> "CrossEncoderReranker":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        if CrossEncoderReranker._model is None:
            self._load_model()


    def _load_model(self) -> None:
        """Load the cross-encoder model (lazy, singleton)."""
        if not config.ENABLE_RERANKING:
            logger.info("Re-ranking disabled via ENABLE_RERANKING=false — skipping model load")
            return

        try:
            logger.info(f"Loading cross-encoder re-ranker: {config.RERANK_MODEL}")
            CrossEncoderReranker._model = CrossEncoder(
                config.RERANK_MODEL,
                max_length=512,
            )
            logger.info("Cross-encoder re-ranker ready ✓")
        except Exception as exc:
            logger.error(f"Failed to load re-ranker model: {exc}")
            logger.warning("Re-ranking will be skipped — pipeline falls back to bi-encoder order")
            CrossEncoderReranker._model = None


    def rerank(
        self,
        query: str,
        candidates: List[Tuple[str, float, Dict]],
        top_n: int | None = None,
    ) -> List[Tuple[str, float, Dict]]:
        """
        Re-rank a list of retrieval candidates and return the top-N.

        Args:
            query:       The user's original query string.
            candidates:  List of (content, bi-encoder-distance, metadata)
                         as returned by VectorStore.search().
            top_n:       How many to keep after re-ranking.
                         Defaults to config.MAX_CONTEXT_DOCS.

        Returns:
            List of (content, cross-encoder-score, metadata) sorted by score
            **descending** (higher score = more relevant).

            If re-ranking is disabled or the model failed to load, the
            original candidates are returned trimmed to top_n, preserving
            bi-encoder ordering.
        """
        top_n = top_n or config.MAX_CONTEXT_DOCS

        if not candidates:
            return []

        if not config.ENABLE_RERANKING or CrossEncoderReranker._model is None:
            logger.debug("Re-ranking skipped — returning bi-encoder top-%d", top_n)
            return candidates[:top_n]

        try:
            pairs: List[Tuple[str, str]] = [
                (query, content) for content, _dist, _meta in candidates
            ]

            scores: List[float] = CrossEncoderReranker._model.predict(
                pairs,
                show_progress_bar=False,
            ).tolist()

            scored: List[Tuple[str, float, Dict]] = [
                (content, float(score), metadata)
                for (content, _dist, metadata), score in zip(candidates, scores)
            ]

            scored.sort(key=lambda x: x[1], reverse=True)

            top_results = scored[:top_n]

            logger.info(
                "Re-ranked %d candidates → top %d  |  scores: [%s]",
                len(candidates),
                len(top_results),
                ", ".join(f"{s:.3f}" for _, s, _ in top_results),
            )

            return top_results

        except Exception as exc:
            logger.error("Re-ranking failed (%s) — falling back to bi-encoder order", exc)
            return candidates[:top_n]


    @property
    def is_available(self) -> bool:
        """True if the cross-encoder model is loaded and ready."""
        return CrossEncoderReranker._model is not None

    def status(self) -> Dict[str, object]:
        """Return a dict describing re-ranker state (useful for /health endpoint)."""
        return {
            "enabled": config.ENABLE_RERANKING,
            "model": config.RERANK_MODEL,
            "loaded": self.is_available,
            "candidate_pool": config.RERANK_CANDIDATE_DOCS,
            "final_top_n": config.MAX_CONTEXT_DOCS,
        }


reranker = CrossEncoderReranker()
