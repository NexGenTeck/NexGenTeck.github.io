# NexGenTeck Contact API

## Architecture

The Vite website sends HTTPS JSON to this FastAPI service on Render. The service writes
to the existing Hostinger MySQL `contacts` table. Render does not create, host, or store
a database; no SQLite, Render PostgreSQL, disk, or local submission file is used.

## Local setup

1. Create a virtual environment: `python -m venv .venv`
2. Activate it (`.venv\\Scripts\\Activate.ps1` on PowerShell, or `source .venv/bin/activate` on macOS/Linux).
3. Install dependencies: `python -m pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and fill in placeholders with a non-production test database only.
5. Run: `uvicorn app.main:app --reload --port 8000`
6. Check process health: `curl http://localhost:8000/health`
7. Submit a local request to `POST http://localhost:8000/contact` with JSON containing `name`, `email`, and `message`.
8. Run tests: `python -m pytest`

`/health` does not query MySQL. `/health/database` verifies `SELECT 1` against the configured Hostinger database.

## Render deployment

1. Create a Python web service from this repository or apply root `render.yaml`.
2. Do **not** create a Render database, disk, PostgreSQL instance, or SQLite file.
3. Add every `sync: false` value in the Render dashboard. They are Hostinger/SMTP secrets and must never be committed.
4. Deploy, then verify `/health`, `/health/database`, and `POST /contact`.
5. Set the final public `https://YOUR-RENDER-SERVICE.onrender.com/contact` endpoint as the website build variable `VITE_CONTACT_API_URL`.
6. Rebuild and redeploy the Vite frontend: Vite embeds `VITE_` values in browser assets.

## Hostinger Remote MySQL

Render is external to Hostinger. Obtain the database hostname from Hostinger's **Remote MySQL** page; `localhost` does not work from Render. Remote MySQL normally uses port 3306. Grant remote access to the selected Hostinger database and user, preferably using Render outbound IP ranges. “Any Host” is acceptable only as a temporary diagnostic step. Confirm the database name, user, current password, hostname, and port exactly—database and user names are not necessarily the same.

After a successful contact test, verify the new row in Hostinger phpMyAdmin's existing `contacts` table.

## Website configuration and cleanup

For local frontend work, put `VITE_CONTACT_API_URL=http://localhost:8000/contact` in root `.env.local`. For production, configure it as a GitHub Actions repository variable and rebuild the frontend.

After production verification, delete these legacy Hostinger files manually if they exist: `contact.php`, `contact-config.php`, `PHPMailer/`, `health.php`, `echo-test.php`, and `db-check.php`. Codex cannot delete files on the Hostinger server. Rotate all database and SMTP passwords that were previously exposed or used by the old PHP system.
