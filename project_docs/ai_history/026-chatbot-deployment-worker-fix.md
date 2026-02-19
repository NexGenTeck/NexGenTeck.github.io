# Chatbot Deployment & Cloudflare Worker Proxy Fix

**Date**: February 9-11, 2026  
**Type**: Critical Bug Fix - Production Deployment

## Overview
Fixed chatbot functionality on the live GitHub Pages site by restoring deleted frontend source code, rebuilding with correct API URLs, and resolving Cloudflare Worker 1003 errors that prevented the chatbot from reaching the backend API.

## Problem Statement

The chatbot on https://nexgenteck.github.io/NGT/ was completely non-functional with multiple blocking issues:

1. **Old Placeholder URL in Live Bundle**: The deployed JavaScript had `https://your_domain_or_droplet/chatbot/chat` baked in, causing `ERR_NAME_NOT_RESOLVED` errors
2. **Frontend Source Code Deleted**: Commit `bcf8463` removed all frontend files (package.json, vite.config.ts, src/) from the repository
3. **No Build Pipeline**: GitHub Actions deploy workflow was also deleted, making rebuilds impossible
4. **Cloudflare Worker 1003 Error**: Worker proxy returned "Direct IP access not allowed" when trying to reach the backend

## Investigation & Root Cause Analysis

### Issue 1: Deployed Bundle Had Wrong URL
- Live site was serving `index-3rjtfLwk.js` with the old placeholder URL
- `.env.production` had been updated to Worker URL `https://ngt-chatbot-proxy.muhammadhasaan82.workers.dev`
- But the site was **never rebuilt** after the env update
- Discovery: The live build was from BEFORE the env file was corrected

### Issue 2: Frontend Source Missing
- Commit `bcf8463` (Jan 29, 2026) titled "refactor: Isolate chatbot backend - remove frontend files"
- Deleted 92 files totaling 14,085 insertions, 3,495 deletions
- Removed: package.json, vite.config.ts, all of src/, .github/workflows/
- Only the Python chatbot backend remained on the `chatbot-backend` branch
- No way to rebuild the frontend without restoring from git history

### Issue 3: Cloudflare Worker 1003 Error
After restoring frontend and rebuilding, new error appeared:
- Browser → Worker: Success (HTTPS)
- Worker → Backend: **403 Forbidden** with Cloudflare error page
- Error message: "Direct IP access not allowed | Cloudflare | Error 1003"
- Root cause: **Cloudflare Workers block outbound fetch() to raw IP addresses**

#### Why the 1003 Error Occurred
1. Worker code was doing: `fetch('http://165.245.177.103:8000/chat')`
2. Cloudflare Workers route all outbound requests through their infrastructure
3. When Cloudflare sees a raw IP in the fetch URL, it blocks with 1003
4. Setting `Host: api.nexgenteck.com` didn't help (that domain doesn't exist in DNS)
5. Even without a custom Host header, raw IP fetch = automatic 1003

## Solutions Implemented

### Fix 1: Restore Frontend Source & Deploy Workflow

**Actions:**
```bash
# Restore all frontend files from commit before deletion
git checkout bcf8463~1 -- package.json package-lock.json vite.config.ts \
  tsconfig.json tsconfig.node.json index.html src/ .github/workflows/deploy.yml
```

**Files Restored:**
- Build tooling: `package.json`, `vite.config.ts`, `tsconfig.json`
- Frontend source: All 60+ files in `src/` (components, pages, contexts, translations)
- Deploy pipeline: `.github/workflows/deploy.yml` (GitHub Actions → GitHub Pages)
- React app entry: `index.html`, `main.tsx`, `App.tsx`

**Commit:** `4d7c51e` - "restore: Frontend source + deploy workflow for chatbot fix"

### Fix 2: Rebuild with Correct API URL

**Verification of `.env.production`:**
```bash
VITE_CHATBOT_API_URL=https://ngt-chatbot-proxy.muhammadhasaan82.workers.dev
```

**Build Process:**
```bash
npm install  # Install dependencies
npm run build  # Build with production env vars
```

**Verification:**
- Old bundle: `index-3rjtfLwk.js` (had placeholder URL)
- New bundle: `index-Br27OcZI.js` (has Worker URL)
- Confirmed new bundle contains: `fetch("https://ngt-chatbot-proxy.muhammadhasaan82.workers.dev/chat"...)`
- No trace of "your_domain" placeholder in new build

**Deployment:**
- Pushed to `main` branch → GitHub Actions auto-triggered
- GitHub Actions workflow ran: `npm ci && npm run build`
- Deployed build artifacts to GitHub Pages
- Live site now serves new bundle with correct URL

**Commit:** Same as Fix 1 (`4d7c51e`)

### Fix 3: Cloudflare Worker 1003 Bypass with nip.io

**Problem:** Cloudflare blocks `fetch('http://165.245.177.103:8000/...')`  
**Solution:** Use wildcard DNS service `nip.io` to convert IP to hostname

**How nip.io Works:**
```
165.245.177.103 → 165-245-177-103.nip.io
```
- `nip.io` is a public wildcard DNS service
- Automatically resolves `165-245-177-103.nip.io` back to `165.245.177.103`
- Gives Cloudflare a "proper" hostname so it doesn't trigger 1003
- Verified with: `Resolve-DnsName "165-245-177-103.nip.io"` → returns `165.245.177.103`

**Worker Code Changes:**

Before (didn't work):
```javascript
const BACKEND_IP = env.BACKEND_IP || '165.245.177.103';
const targetUrl = `http://${BACKEND_IP}:${BACKEND_PORT}${path}`;
// Result: http://165.245.177.103:8000/chat → 1003 error
```

After (works):
```javascript
const BACKEND_IP = env.BACKEND_IP || '165.245.177.103';
const BACKEND_HOST = BACKEND_IP.replace(/\./g, '-') + '.nip.io';
const targetUrl = `http://${BACKEND_HOST}:${BACKEND_PORT}${path}`;
// Result: http://165-245-177-103.nip.io:8000/chat → success!
```

**Deployment:**
- Installed Wrangler CLI locally: `npm install wrangler --save-dev`
- Deployed Worker: `npx wrangler deploy`
- Cloudflare authenticated via OAuth browser flow
- Worker deployed to: `https://ngt-chatbot-proxy.muhammadhasaan82.workers.dev`
- Version ID: `af636ebe-f191-46dd-bb51-c9fa4d638eeb`

**Testing:**
```bash
curl -X POST https://ngt-chatbot-proxy.muhammadhasaan82.workers.dev/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hi"}'

# Response:
{"response":"Hi! Welcome to NexGenTeck. How can I help you today?","status":"success"}
```

**Commits:**
- NGT repo: `4f8aa5c` - "fix: Use nip.io hostname to bypass Cloudflare 1003 on raw IP fetch"
- Startup repo: `68ade34` - Same message
- ngt-chatbot-proxy repo: `3882e28` - Same message

## Technical Details

### Cloudflare Worker Final Implementation

**File:** `cloudflare/chatbot-proxy-worker.js`

**Key Features:**
- HTTPS proxy for GitHub Pages (HTTPS) → Backend (HTTP) communication
- Automatic IP-to-hostname conversion using nip.io
- CORS headers for allowed origins (nexgenteck.github.io, etc.)
- Preflight OPTIONS request handling
- Clean header forwarding (Content-Type, Accept, X-Forwarded-For)
- Error handling with JSON response format
- No custom Host header (let it default to nip.io hostname)

**Environment Variables:**
```toml
[vars]
BACKEND_IP   = "165.245.177.103"
BACKEND_PORT = "8000"
```

### GitHub Actions Deploy Workflow

**File:** `.github/workflows/deploy.yml`

**Process:**
1. **Build Job:**
   - Checkout code
   - Setup Node.js 20
   - `npm ci` (clean install from package-lock.json)
   - `npm run build` with `NODE_ENV=production`
   - Create 404.html for SPA routing
   - Upload build artifacts

2. **Deploy Job:**
   - Download build artifacts
   - Configure GitHub Pages
   - Upload to Pages
   - Deploy with `actions/deploy-pages@v4`

**Trigger:** Push to `main` branch  
**Output:** https://nexgenteck.github.io/NGT/

### Vite Build Configuration

**Key Settings:**
- `base: '/NGT/'` for GitHub Pages subdirectory
- `outDir: 'build'` for output folder
- `target: 'esnext'` for modern JS
- Manual vendor chunking to reduce bundle size
- Environment variables read from `.env.production` via `import.meta.env`

## Verification & Testing

### Pre-Fix Issues
✗ Browser console: `ERR_NAME_NOT_RESOLVED` for `https://your_domain_or_droplet/chatbot/chat`  
✗ No package.json or vite.config.ts in repo  
✗ Worker returned 403 Forbidden with Cloudflare 1003 HTML error page  
✗ Direct backend test worked: `curl http://165.245.177.103:8000/health` → 200 OK  
✗ Worker test failed: `curl https://ngt-chatbot-proxy.muhammadhasaan82.workers.dev/chat` → 1003

### Post-Fix Verification
✓ Live site serves new bundle: `/NGT/assets/index-Br27OcZI.js`  
✓ New bundle contains Worker URL: `fetch("https://ngt-chatbot-proxy.muhammadhasaan82.workers.dev/chat"...)`  
✓ Worker health check: `curl https://ngt-chatbot-proxy.muhammadhasaan82.workers.dev/health` → 200 OK  
✓ Worker chat test: Returns `{"response":"Hi! Welcome to NexGenTeck...","status":"success"}`  
✓ CORS headers present: `Access-Control-Allow-Origin: https://nexgenteck.github.io`  
✓ Backend reports: 140 documents in Qdrant vector store  
✓ No more 1003 errors in Worker logs  

### Live Site Testing
1. Visit https://nexgenteck.github.io/NGT/
2. Click chatbot widget in bottom-right corner
3. Send test message: "hi" or "what services do you offer?"
4. Chatbot responds with context-aware answers
5. Check browser Network tab → POST to Worker URL → 200 OK

## Files Modified

### NGT Repo (NexGenTeck/NGT main)
- Restored: 92 files (package.json, src/, workflows/, etc.)
- Modified: `cloudflare/chatbot-proxy-worker.js` (nip.io fix)
- Modified: `.env.production` (already had correct URL)

### Startup Repo (muhammadhasaan82/Startup chatbot-backend)
- Modified: `cloudflare/chatbot-proxy-worker.js` (synced with NGT)
- Modified: `wrangler.toml` (removed unused BACKEND_HOST var)

### ngt-chatbot-proxy Repo (muhammadhasaan82/ngt-chatbot-proxy main)
- Modified: `cloudflare/chatbot-proxy-worker.js` (nip.io fix)
- Modified: `wrangler.toml` (removed unused BACKEND_HOST var)
- Added: `package.json`, `package-lock.json` (Wrangler CLI deps)

## Lessons Learned

1. **Git History is a Safety Net**: Frontend source was recoverable via `git checkout <commit>~1 -- <files>`
2. **Build Artifacts Don't Auto-Update**: Changing `.env.production` doesn't affect deployed site until rebuild + push
3. **Cloudflare Workers Have Restrictions**: Raw IP fetch triggers 1003; use DNS-resolvable hostnames
4. **nip.io as Production Workaround**: Not ideal long-term (external DNS dependency) but effective for development/testing
5. **Wrangler CLI Needs Node 18.17+**: Droplet had Node 18.19.1 but local machine (Node 22) worked fine
6. **Test End-to-End After Each Fix**: Several iterations needed to find the nip.io solution

## Production Considerations

### Short-Term (Current Setup)
- ✓ Chatbot fully functional via nip.io proxy
- ✓ Frontend rebuilds automatically on push via GitHub Actions
- ✓ Worker deployed and tested end-to-end
- ⚠ Dependency on nip.io public DNS service

### Long-Term Improvements
1. **Setup Custom Domain for Backend**
   - Register domain or subdomain (e.g., `api.nexgenteck.com`)
   - Point A record to DigitalOcean droplet IP
   - Update Worker to use custom domain instead of nip.io
   - Eliminates external DNS dependency

2. **Nginx with SSL on Droplet**
   - Install Let's Encrypt certificate
   - Worker can fetch `https://api.nexgenteck.com` directly
   - No more HTTP in the Worker → Backend connection

3. **Cloudflare Tunnel Alternative**
   - Use Cloudflare Tunnel (cloudflared) on droplet
   - Eliminates need for Worker proxy
   - Direct HTTPS from browser to backend via Cloudflare's network

4. **Monitoring & Logging**
   - Add Worker logging for request tracking
   - Set up backend monitoring (Sentry, LogDNA, etc.)
   - Track chatbot usage and error rates

## Success Metrics

- **Deployment Pipeline**: GitHub Actions workflow restored and functioning
- **Build System**: Vite build completes in ~5.5s, bundle size 1.57 MB
- **Worker Response Time**: ~200-500ms for chatbot queries
- **Backend Health**: 140 documents indexed, all systems operational
- **Zero Errors**: No 1003, no placeholder URLs, no build failures
- **Live Chatbot**: Responds to queries with RAG-enhanced context

## Related Documentation

- Backend Setup: `Chatbot/README.md`
- Worker Config: `wrangler.toml`
- Deploy Workflow: `.github/workflows/deploy.yml`
- API Documentation: `DEPLOYMENT.md`
- Previous Session: N/A (contact backend migration moved to PHP/MySQL docs)

## Deployment URLs

- **Live Site**: https://nexgenteck.github.io/NGT/
- **Cloudflare Worker**: https://ngt-chatbot-proxy.muhammadhasaan82.workers.dev
- **Backend API**: http://165.245.177.103:8000 (via nip.io: http://165-245-177-103.nip.io:8000)
- **GitHub Repos**:
  - Frontend: https://github.com/NexGenTeck/NGT
  - Backend: https://github.com/muhammadhasaan82/Startup (chatbot-backend branch)
  - Worker: https://github.com/muhammadhasaan82/ngt-chatbot-proxy

## Team Notes

- All 3 repos (NGT, Startup, ngt-chatbot-proxy) are now in sync with the working nip.io fix
- Frontend is set up for automatic deployment on every push to main
- Worker can be redeployed via `npx wrangler deploy` from ngt-chatbot-proxy repo
- Backend (Python FastAPI) runs on droplet via PM2 with startup config
- Future chatbot updates only require editing Worker code and running `wrangler deploy`

---

**Status**: ✅ Complete and Deployed  
**Next Steps**: Monitor live chatbot performance, consider custom domain setup for production stability
