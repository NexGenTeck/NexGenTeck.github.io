# Contact Form & Database Integration

**Date**: February 2, 2026  
**Type**: Feature Addition - Backend Services

## Overview
Added full-stack contact form functionality with TypeScript API backend and PostgreSQL database storage, plus comprehensive project documentation updates.

## Changes Made

### 1. Contact API (TypeScript/Express)
Created a new TypeScript Express API service for handling contact form submissions:

**New Files:**
- `ContactApi/src/index.ts` - Express server with CORS, validation, and database integration
- `ContactApi/src/db.ts` - PostgreSQL connection pool configuration
- `ContactApi/package.json` - Dependencies (express, pg, cors, typescript)
- `ContactApi/tsconfig.json` - TypeScript configuration
- `ContactApi/Dockerfile` - Production Docker image
- `ContactApi/docker-compose.yml` - Service orchestration (API + Postgres)
- `ContactApi/.env.example` - Environment template
- `ContactApi/README.md` - API documentation

**Features:**
- `POST /api/contact` - Accepts name, email, phone, subject, message
- `GET /health` - Database connectivity check
- Input validation (required fields, email format, length limits)
- PostgreSQL prepared statements for security
- CORS configured for GitHub Pages origin
- IP address and user agent logging
- Docker deployment support

### 2. PostgreSQL Database
Set up PostgreSQL with automatic schema initialization:

**New Files:**
- `Database/docker-compose.yml` - Postgres 16 Alpine container
- `Database/.env.example` - Database credentials template
- `Database/init/01-schema.sql` - Contact submissions table schema
- `Database/README.md` - Setup instructions

**Schema:**
```sql
contact_submissions (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(200),
  message TEXT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'new',
  notes TEXT
)
```

**Indexes:** created_at (DESC), status, email for query performance

### 3. Contact Page (Frontend)
Created a fully functional Contact page with form submission:

**New Files:**
- `src/pages/Contact.tsx` - Contact form component with validation and API integration

**Features:**
- Form fields: name, email, phone, subject (dropdown), message
- Real-time form state management
- Loading states during submission
- Success/error message display with animations
- Environment variable for API URL (`VITE_CONTACT_API_URL`)
- Contact info cards (email, phone, address, hours)
- FAQ section
- Responsive design with Tailwind/Framer Motion

### 4. Documentation Updates

**README.md:**
- Added "Contact Form with Database" and "AI Chatbot Backend" to features list
- Updated tech stack table to include Express, PostgreSQL, FastAPI
- Expanded project structure to show Chatbot/, ContactApi/, Database/ folders
- Added "Backend Services" section with feature lists and setup links
- Added backend deployment section with Docker Compose commands
- Updated environment variables section
- Added "Scalable backend architecture" to design philosophy

**New Section Structure:**
- 🤖 Backend Services (Contact API + Chatbot Backend)
- Backend Deployment instructions for DigitalOcean VM
- Environment variable configuration for VITE_CONTACT_API_URL

## Technical Details

### API Architecture
- **Runtime**: Node.js 20
- **Framework**: Express 4.19
- **Database Driver**: pg (node-postgres) 8.12
- **Type Safety**: Full TypeScript coverage
- **Security**: Parameterized queries, input validation, length limits
- **CORS**: Restricted to GitHub Pages origin
- **Deployment**: Docker + Docker Compose

### Database Setup
- **Image**: postgres:16-alpine
- **Port**: Bound to 127.0.0.1:5432 (not publicly exposed)
- **Initialization**: SQL script auto-runs on first startup via Docker init volume mount
- **Persistence**: Named volume `postgres_data`

### Frontend Integration
- Contact form POSTs JSON to `${VITE_CONTACT_API_URL}/api/contact`
- Handles 201 (success), 400 (validation error), 500 (server error)
- Success clears form and shows confirmation message
- Error displays retry message

## Deployment Instructions

### On DigitalOcean VM:

1. **Pull latest code:**
   ```bash
   cd ~/nexgenteck/NGT
   git pull origin chatbot-backend
   ```

2. **Start PostgreSQL:**
   ```bash
   cd Database
   cp .env.example .env
   # Edit .env with strong POSTGRES_PASSWORD
   docker compose up -d
   ```

3. **Start Contact API:**
   ```bash
   cd ../ContactApi
   cp .env.example .env
   # Match PGPASSWORD with Database/.env
   # Set ALLOWED_ORIGINS=https://nexgenteck.github.io
   docker compose up -d
   ```

4. **Verify:**
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"ok","db":true}
   ```

### Production Recommendations:
- Set up Nginx reverse proxy with HTTPS (Let's Encrypt)
- Use strong passwords for PostgreSQL
- Keep port 3001 closed in firewall (access via Nginx only)
- Regular database backups
- Monitor logs for errors

## Testing

### Health Check:
```bash
curl http://localhost:3001/health
```

### Submit Test Form:
```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Test message"}'
```

### Verify in Database:
```bash
docker exec -it <postgres_container> psql -U nexgenteck_user -d nexgenteck \
  -c "SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 5;"
```

## Files Changed

### Created:
- `ContactApi/` (9 files)
- `Database/init/01-schema.sql`
- `Database/README.md` (updated)
- `src/pages/Contact.tsx`

### Modified:
- `README.md` - Added features, tech stack, backend services, deployment instructions
- `Database/docker-compose.yml` - Added init script mount
- `Database/.env.example` - Kept existing

## Related PRs
- NGT: PR #2 (chatbot-backend branch)
- Startup: PR #1 (chatbot-backend branch)

## Next Steps
- Merge chatbot-backend branch into main
- Set up production API domain with HTTPS
- Configure `VITE_CONTACT_API_URL` for production builds
- Add email notifications for new submissions (optional)
- Create admin panel to view submissions (optional)

## Notes
- ContactApi and Database are independent of Chatbot (can run separately)
- Both use Docker Compose for easy deployment
- Frontend works with or without backend (graceful error handling)
- CORS restricts API access to GitHub Pages origin only
