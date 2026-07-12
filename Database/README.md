# Contact database (Hostinger MySQL)

The existing Hostinger MySQL `contacts` table remains the only persistent store for
website contact submissions. The Render-hosted FastAPI service in `backend/` connects
to it using environment variables; this repository contains no database credentials.

Use `backend/sql/contacts.sql` only to document or verify the expected table shape.
Do not execute it automatically and do not create a Render database, SQLite file, or
local submission store.

Configure Hostinger Remote MySQL to allow the Render service, using the Hostinger remote
hostname and port 3306—not `localhost`. See `backend/README.md` for the complete Render,
Hostinger, verification, credential-rotation, and legacy-file cleanup procedure.
