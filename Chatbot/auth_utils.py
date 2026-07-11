"""Authorization helpers for mutating admin endpoints."""

from __future__ import annotations

import secrets as secrets_mod
from typing import Optional


def authorize_reindex(
    *,
    expected_secret: str,
    authorization: Optional[str],
    x_reindex_secret: Optional[str],
    client_host: str,
) -> tuple[bool, int, str]:
    """
    Return (allowed, status_code, detail).
    Never includes the secret value in detail messages.
    """
    provided = None
    if x_reindex_secret:
        provided = x_reindex_secret.strip()
    elif authorization and authorization.lower().startswith("bearer "):
        provided = authorization[7:].strip()

    if expected_secret:
        if not provided or not secrets_mod.compare_digest(provided, expected_secret):
            return False, 401, "Unauthorized"
        return True, 200, "ok"

    if client_host not in {"127.0.0.1", "::1", "localhost", "testclient"}:
        return (
            False,
            403,
            "Reindex is disabled for non-local callers until REINDEX_SECRET is configured",
        )
    return True, 200, "ok"
