# Database Setup (Hostinger MySQL)

This project stores Contact form submissions in a Hostinger MySQL/MariaDB database.

## 1. Create the database

1. Open Hostinger hPanel.
2. Go to **Databases -> MySQL Databases**.
3. Create a database and user, then assign the user to the database.

## 2. Create the table

1. Open **phpMyAdmin** from hPanel.
2. Select your database.
3. Import `Database/contact_messages.sql`.

## 3. Configure backend credentials

1. Open `public/contact.php`.
2. Update these constants:

```php
const DB_HOST = 'localhost';
const DB_NAME = 'your_database';
const DB_USER = 'your_user';
const DB_PASS = 'your_password';
```

## 4. Verify inserts

Run this query in phpMyAdmin:

```sql
SELECT id, name, email, phone, subject, message, created_at
FROM contact_messages
ORDER BY id DESC
LIMIT 10;
```
