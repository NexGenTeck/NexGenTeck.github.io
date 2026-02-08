/**
 * NGT Chatbot Proxy Worker
 *
 * Proxies HTTPS requests from GitHub Pages to the Python backend on a VM.
 * Fixes the "1003 Direct IP access not allowed" error by:
 *   1. Setting an explicit Host header on every subrequest
 *   2. Stripping Cloudflare-internal headers that confuse origin servers
 *
 * Environment variables (set in wrangler.toml [vars] or dashboard):
 *   BACKEND_URL   – full origin of the backend, e.g. http://165.245.177.103:8000
 *   BACKEND_HOST  – hostname / IP the backend expects in the Host header
 */
export default {
  async fetch(request, env) {
    // ── Configuration ────────────────────────────────────────────────
    const BACKEND_URL  = env.BACKEND_URL || 'http://165.245.177.103:8000';
    const BACKEND_HOST = env.BACKEND_HOST || 'api.nexgenteck.com';

    const ALLOWED_ORIGINS = [
      'https://nexgenteck.github.io',
      'https://muhammadhasaan82.github.io',
      'http://localhost:5173',           // local dev
      'http://localhost:4173',           // local preview
    ];

    // ── CORS helpers ─────────────────────────────────────────────────
    const origin = request.headers.get('Origin') || '';
    const defaultOrigin = 'https://muhammadhasaan82.github.io';
    const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : defaultOrigin;

    const corsHeaders = {
      'Access-Control-Allow-Origin':  corsOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age':       '86400',
    };

    // ── Preflight ────────────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // ── Build target URL ─────────────────────────────────────────────
    const incoming  = new URL(request.url);
    const targetUrl = `${BACKEND_URL}${incoming.pathname}${incoming.search}`;

    // ── Forward headers with explicit Host ───────────────────────────
    //    KEY FIX: *set* the Host header to the backend's address instead
    //    of deleting it.  Without a Host header Cloudflare may intercept
    //    the sub-request and return 1003.
    const headers = new Headers(request.headers);
    headers.set('Host', BACKEND_HOST);

    // Strip Cloudflare-internal headers the origin doesn't need
    for (const h of [
      'cf-connecting-ip', 'cf-ray', 'cf-visitor',
      'cf-worker', 'cf-ew-via', 'cf-ipcountry',
      'cdn-loop',
    ]) {
      headers.delete(h);
    }

    // Carry the real client IP in a standard header
    const clientIp = request.headers.get('cf-connecting-ip');
    if (clientIp) headers.set('X-Forwarded-For', clientIp);

    // ── Proxy the request ────────────────────────────────────────────
    try {
      const backendResponse = await fetch(targetUrl, {
        method:   request.method,
        headers:  headers,
        body:     ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
        redirect: 'manual',
      });

      // Attach CORS headers to the backend's response
      const responseHeaders = new Headers(backendResponse.headers);
      for (const [key, value] of Object.entries(corsHeaders)) {
        responseHeaders.set(key, value);
      }

      return new Response(backendResponse.body, {
        status:     backendResponse.status,
        statusText: backendResponse.statusText,
        headers:    responseHeaders,
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Backend unreachable', detail: err.message }),
        {
          status:  502,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        },
      );
    }
  },
};
