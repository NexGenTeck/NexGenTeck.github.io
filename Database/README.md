# Database (PostgreSQL)

This folder runs PostgreSQL on the VM using Docker.

## Setup (VM)

```bash
cd ~/nexgenteck/NGT/Database
cp .env.example .env
# edit .env with strong credentials

docker compose up -d
```

Postgres will bind to `127.0.0.1:${POSTGRES_PORT:-5432}` on the VM.

The `init/01-schema.sql` script will automatically create the `contact_submissions` table on first startup.
