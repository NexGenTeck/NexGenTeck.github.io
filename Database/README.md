# Contact database (Hostinger MySQL)

The existing Hostinger MySQL `contacts` table remains the only persistent store for
website contact submissions. The Hostinger-hosted `public/contact.php` endpoint writes
to it using credentials from an uncommitted `contact-config.php` file.

Do not create a Render database, SQLite file, local submission store, Supabase table,
or serverless replacement for contact submissions.

Upload `public/contact.php` and a real `contact-config.php` manually to Hostinger
`public_html/`. Keep database credentials out of git.
