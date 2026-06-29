<?php

declare(strict_types=1);

const DB_HOST = '127.0.0.1';
const DB_NAME = 'u864361634_NGT';
const DB_USER = 'u864361634_NGT123';
const DB_PASS = 'DIDwho123456';

header('Content-Type: application/json; charset=utf-8');

$allowedOrigins = [
    'https://nexgenteck.com',
    'https://www.nexgenteck.com',
    'https://nexgenteck.github.io',
    'https://muhammadhasaan82.github.io',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

function send_json(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($method !== 'POST') {
    send_json(['success' => false, 'error' => 'Method not allowed'], 405);
}

$rawBody = file_get_contents('php://input');
$body = json_decode($rawBody ?: '', true);

if (!is_array($body)) {
    send_json(['success' => false, 'error' => 'Invalid JSON payload'], 400);
}

$email = trim((string)($body['email'] ?? ''));
$website = trim((string)($body['website'] ?? ''));

// Honeypot check
if ($website !== '') {
    send_json(['success' => true, 'message' => 'Subscribed successfully']);
}

if ($email === '') {
    send_json(['success' => false, 'error' => 'Email is required'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_json(['success' => false, 'error' => 'Invalid email format'], 400);
}

if (mb_strlen($email) > 150) {
    send_json(['success' => false, 'error' => 'Email is too long'], 400);
}

try {
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    $stmt = $pdo->prepare(
        'INSERT INTO newsletter_subscribers (email) VALUES (:email) ON DUPLICATE KEY UPDATE id=id'
    );

    $stmt->bindValue(':email', $email, PDO::PARAM_STR);
    $stmt->execute();

    // Send auto-reply email to the user
    $to = $email;
    $mailSubject = "Welcome to NexGenTeck Newsletter!";
    $mailMessage = "Hi there,\n\nThank you for subscribing to the NexGenTeck newsletter! We will keep you updated with our latest articles and insights.\n\nBest Regards,\nNexGenTeck Team";
    $headers = "From: info@nexgenteck.com\r\n";
    $headers .= "Reply-To: info@nexgenteck.com\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    @mail($to, $mailSubject, $mailMessage, $headers);

    // Send notification email to admin
    $adminTo = "info@nexgenteck.com";
    $adminSubject = "New Newsletter Subscriber";
    $adminMessage = "You have a new newsletter subscriber.\n\nEmail: $email";
    $adminHeaders = "From: info@nexgenteck.com\r\n";
    $adminHeaders .= "Reply-To: $email\r\n";
    $adminHeaders .= "X-Mailer: PHP/" . phpversion();

    @mail($adminTo, $adminSubject, $adminMessage, $adminHeaders);

    send_json(['success' => true, 'message' => 'Subscribed successfully']);
} catch (Throwable $exception) {
    error_log('newsletter.php database insert failed: ' . $exception->getMessage());
    send_json(['success' => false, 'error' => 'DB/Mail Error: ' . $exception->getMessage()], 500);
}
