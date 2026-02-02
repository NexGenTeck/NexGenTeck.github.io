# Contact API

TypeScript/Express API for handling Contact Us form submissions from the frontend.

## Features

- REST API endpoint for contact form submissions
- PostgreSQL storage
- CORS-enabled for GitHub Pages
- Input validation
- Request logging (IP, user agent)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Database**: PostgreSQL (via `pg` driver)
- **Language**: TypeScript

## Setup (Local Development)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   ```

3. **Run in development mode**:
   ```bash
   npm run dev
   ```

## Setup (Production - Docker)

1. **Configure environment**:
   ```bash
   cd ~/nexgenteck/NGT/ContactApi
   cp .env.example .env
   # Edit .env with strong password (must match Database/.env)
   ```

2. **Start the API**:
   ```bash
   docker compose up -d
   ```

3. **Verify it's running**:
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"ok","db":true}
   ```

## API Endpoints

### Health Check
```
GET /health
```
Returns: `{ "status": "ok", "db": true }`

### Submit Contact Form
```
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 555-1234",      // optional
  "subject": "Website Dev",    // optional
  "message": "I need a website..."
}
```

Success Response (201):
```json
{
  "id": 123,
  "created_at": "2026-02-02T10:30:00Z"
}
```

Error Responses:
- 400: `{ "error": "name_email_message_required" }`
- 400: `{ "error": "invalid_email" }`
- 400: `{ "error": "field_too_long" }`
- 500: `{ "error": "db_insert_failed" }`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | `3001` |
| `PGHOST` | PostgreSQL host | `127.0.0.1` |
| `PGPORT` | PostgreSQL port | `5432` |
| `PGDATABASE` | Database name | `nexgenteck` |
| `PGUSER` | Database user | `nexgenteck_user` |
| `PGPASSWORD` | Database password | (required) |
| `ALLOWED_ORIGINS` | CORS origins (comma-separated) | GitHub Pages URL |

## Database Schema

See `../Database/init/01-schema.sql` for the `contact_submissions` table definition.

## Production Setup

### Reverse Proxy (Nginx)

Recommended setup with HTTPS:

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Firewall

If using Nginx reverse proxy, keep port 3001 closed:
```bash
# API is only accessible via localhost (no public exposure needed)
```

If exposing directly (not recommended without HTTPS):
```bash
sudo ufw allow 3001/tcp
```

## Frontend Integration

Update your frontend Contact page to POST to the API:

```typescript
const response = await fetch('https://api.yourdomain.com/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    subject: formData.subject,
    message: formData.message,
  }),
});

if (response.ok) {
  const result = await response.json();
  console.log('Submitted with ID:', result.id);
}
```

## License

MIT © NexGenTeck
