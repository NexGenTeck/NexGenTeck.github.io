# NexGenTeck - Multi-Page Business Website

[![Deploy to GitHub Pages](https://github.com/NexGenTeck/NexGenTeck.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/NexGenTeck/NexGenTeck.github.io/actions/workflows/deploy.yml)

Production-ready website built with React, TypeScript, and Vite.

## Features

- Multi-page marketing website with service detail pages
- Multi-language content support
- Contact form backed by PHP + MySQL
- AI chatbot backend routed through Cloudflare Worker
- GitHub Pages deployment workflow

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React + TypeScript + Vite |
| Contact Backend | Plain PHP (shared hosting compatible) |
| Contact Database | MySQL / MariaDB |
| Chatbot Backend | FastAPI + Qdrant + Groq |
| Proxy | Cloudflare Workers |
| CI/CD | GitHub Actions |

## Project Structure

```text
NGT/
|-- Chatbot/                     # Python chatbot backend
|-- cloudflare/
|   `-- chatbot-proxy-worker.js  # Worker proxy for chatbot endpoint
|-- Database/
|   |-- contact_messages.sql     # Contact table schema
|   `-- README.md                # DB setup guide
|-- public/
|   |-- contact.php              # Contact form API endpoint
|   `-- ...                      # Static assets
|-- src/
|   |-- pages/Contact.tsx        # Contact form UI + fetch integration
|   `-- ...                      # React app source
|-- wrangler.toml                # Cloudflare Worker config
`-- README.md
```

## Contact Backend (PHP + MySQL)

### Endpoint

- Path: `/contact.php`
- Method: `POST` only (`OPTIONS` supported for preflight)
- Payload (JSON):

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 555 1234",
  "subject": "Website",
  "message": "I need a quote",
  "website": ""
}
```

- Success:

```json
{ "success": true, "message": "Message saved" }
```

- Failure:

```json
{ "success": false, "error": "Reason" }
```

### Database Table

Use `Database/contact_messages.sql`:

```sql
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  subject VARCHAR(200) DEFAULT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Hostinger Deployment

1. Build frontend:

```bash
npm install
npm run build
```

2. In Hostinger hPanel, create a MySQL database and user.
3. Import `Database/contact_messages.sql` in phpMyAdmin.
4. Update DB constants in `public/contact.php`:

```php
const DB_HOST = 'localhost';
const DB_NAME = 'your_database';
const DB_USER = 'your_user';
const DB_PASS = 'your_password';
```

5. Upload all files from `build/` to `public_html/`.
   Vite copies `public/contact.php` into `build/contact.php` automatically.
6. Test the Contact form from the live site.
7. Verify inserts in phpMyAdmin:

```sql
SELECT id, name, email, phone, subject, message, created_at
FROM contact_messages
ORDER BY id DESC
LIMIT 10;
```

## Cloudflare Worker (Chatbot)

This project keeps Worker proxy support for chatbot requests.

- Environment vars in `wrangler.toml`:
  - `BACKEND_IP`
  - `CHATBOT_PORT`

Deploy worker:

```bash
npm install wrangler --save-dev
npx wrangler deploy
```

## Environment Variables

Create `.env.production`:

```bash
VITE_CHATBOT_API_URL=https://ngt-chatbot-proxy.muhammadhasaan82.workers.dev/chatbot
```

## Development

```bash
npm install
npm run dev
npm run build
```

## License

Based on the original Figma design referenced in this project.
