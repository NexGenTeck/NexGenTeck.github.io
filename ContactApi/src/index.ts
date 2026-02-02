import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './db';

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
  })
);

app.use(express.json({ limit: '1mb' }));

app.get('/health', async (_req, res) => {
  try {
    const result = await pool.query('SELECT 1 as ok');
    return res.json({ status: 'ok', db: result.rows[0]?.ok === 1 });
  } catch (error) {
    return res.status(500).json({ status: 'error', error: 'db_unreachable' });
  }
});

app.post('/api/contact', async (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  const email = String(req.body?.email ?? '').trim();
  const phone = String(req.body?.phone ?? '').trim();
  const subject = String(req.body?.subject ?? '').trim();
  const message = String(req.body?.message ?? '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name_email_message_required' });
  }

  const emailOk = /.+@.+\..+/.test(email);
  if (!emailOk) {
    return res.status(400).json({ error: 'invalid_email' });
  }

  if (name.length > 200 || email.length > 320 || phone.length > 50 || subject.length > 200 || message.length > 4000) {
    return res.status(400).json({ error: 'field_too_long' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO contact_submissions
        (name, email, phone, subject, message, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
      [
        name,
        email,
        phone || null,
        subject || null,
        message,
        req.ip,
        req.headers['user-agent'] ?? null,
      ]
    );

    return res.status(201).json({
      id: result.rows[0]?.id,
      created_at: result.rows[0]?.created_at,
    });
  } catch (error) {
    return res.status(500).json({ error: 'db_insert_failed' });
  }
});

const port = Number(process.env.PORT ?? 3001);

const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Contact API listening on port ${port}`);
});

const shutdown = () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
