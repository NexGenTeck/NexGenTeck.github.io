/**
 * NGT Backend Proxy Worker
 *
 * Proxies ALL HTTPS requests from GitHub Pages to the backend services on a
 * DigitalOcean droplet.  The browser talks HTTPS → Worker → HTTP → backend.
 *
 * Path-prefix routing:
 *   /chatbot/*  → FastAPI chatbot on BACKEND_IP:CHATBOT_PORT  (strips /chatbot)
 *   /contact/*  → Express contact API on BACKEND_IP:CONTACT_PORT (strips /contact)
 *
 * Cloudflare Workers block outbound fetch() to raw IP addresses (error 1003).
 * Workaround: use nip.io wildcard DNS so the Worker fetches a proper hostname
 * (e.g. 165-245-177-103.nip.io) which resolves to the same IP but bypasses
 * Cloudflare's "Direct IP access not allowed" check.
 *
 * Environment variables (set in wrangler.toml [vars] or dashboard):
 *   BACKEND_IP    – DigitalOcean droplet public IPv4, e.g. 165.245.177.103
 *   CHATBOT_PORT  – chatbot backend port, e.g. 8000
 *   CONTACT_PORT  – contact API port, e.g. 3001
 */
export default {
  async fetch(request, env) {
    // ── Configuration ────────────────────────────────────────────────
    const BACKEND_IP   = env.BACKEND_IP   || '165.245.177.103';
    const CHATBOT_PORT = env.CHATBOT_PORT || '8000';
    const CONTACT_PORT = env.CONTACT_PORT || '3001';

    // Convert IP to a nip.io hostname so Cloudflare doesn't block it
    // 165.245.177.103 → 165-245-177-103.nip.io (resolves to same IP)
    const BACKEND_HOST = BACKEND_IP.replace(/\./g, '-') + '.nip.io';

    // Service routing table: path prefix → backend port
    const SERVICES = {
      '/chatbot': CHATBOT_PORT,
      '/contact': CONTACT_PORT,
    };

    const ALLOWED_ORIGINS = [
      'https://nexgenteck.github.io',
      'https://muhammadhasaan82.github.io',
      'https://nex-gen-teck-github-io.vercel.app',
      'https://nexgenteck.com',
      'https://www.nexgenteck.com',
      'http://localhost:5173',
      'http://localhost:4173',
    ];

    // ── CORS helpers ─────────────────────────────────────────────────
    const origin = request.headers.get('Origin') || '';
    const defaultOrigin = 'https://nexgenteck.github.io';
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

    // ── Route to the correct backend service ─────────────────────────
    const incoming = new URL(request.url);
    const path     = incoming.pathname;

    // Find matching service by path prefix
    let targetPort  = null;
    let strippedPath = path;

    for (const [prefix, port] of Object.entries(SERVICES)) {
      if (path === prefix || path.startsWith(prefix + '/')) {
        targetPort   = port;
        strippedPath = path.slice(prefix.length) || '/';
        break;
      }
    }

    // No matching service prefix → return helpful info
    if (!targetPort) {
      return new Response(
        JSON.stringify({
          status: 'ok',
          worker: 'ngt-backend-proxy',
          services: Object.keys(SERVICES),
          usage: 'Prefix your request path with /chatbot or /contact',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        },
      );
    }

    // ── Build target URL ─────────────────────────────────────────────
    const targetUrl = `http://${BACKEND_HOST}:${targetPort}${strippedPath}${incoming.search}`;

    // ── Build clean headers ──────────────────────────────────────────
    //    Only forward the headers the backend actually needs.
    //    Do NOT set a custom Host header – let it default to the IP:port
    //    from the URL so Cloudflare passes the request straight through.
    const headers = new Headers();
    headers.set('Content-Type', request.headers.get('Content-Type') || 'application/json');
    headers.set('Accept', request.headers.get('Accept') || 'application/json');

    // Carry the real client IP for logging
    const clientIp = request.headers.get('cf-connecting-ip');
    if (clientIp) headers.set('X-Forwarded-For', clientIp);

    // ── Proxy the request ────────────────────────────────────────────
    try {
      const backendResponse = await fetch(targetUrl, {
        method:  request.method,
        headers: headers,
        body:    ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
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
