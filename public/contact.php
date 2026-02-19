<?php

declare(strict_types=1);

const DB_HOST = 'localhost';
const DB_NAME = 'your_database';
const DB_USER = 'your_user';
const DB_PASS = 'your_password';

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

function send_json(array $payload, int $statusCode = 200): never
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

$name = trim(strip_tags((string)($body['name'] ?? '')));
$email = trim((string)($body['email'] ?? ''));
$phone = trim(strip_tags((string)($body['phone'] ?? '')));
$subject = trim(strip_tags((string)($body['subject'] ?? '')));
$message = trim((string)($body['message'] ?? ''));
$website = trim((string)($body['website'] ?? ''));

if ($website !== '') {
    send_json(['success' => true, 'message' => 'Message saved']);
}

if ($name === '' || $email === '' || $message === '') {
    send_json(['success' => false, 'error' => 'Name, email, and message are required'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_json(['success' => false, 'error' => 'Invalid email format'], 400);
}

if (mb_strlen($name) > 100) {
    send_json(['success' => false, 'error' => 'Name is too long'], 400);
}

if (mb_strlen($email) > 150) {
    send_json(['success' => false, 'error' => 'Email is too long'], 400);
}

if (mb_strlen($phone) > 30) {
    send_json(['success' => false, 'error' => 'Phone number is too long'], 400);
}

if (mb_strlen($subject) > 200) {
    send_json(['success' => false, 'error' => 'Subject is too long'], 400);
}

$phone = $phone === '' ? null : $phone;
$subject = $subject === '' ? null : $subject;

try {
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    $stmt = $pdo->prepare(
        'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (:name, :email, :phone, :subject, :message)'
    );

    $stmt->bindValue(':name', $name, PDO::PARAM_STR);
    $stmt->bindValue(':email', $email, PDO::PARAM_STR);
    $stmt->bindValue(':phone', $phone, $phone === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
    $stmt->bindValue(':subject', $subject, $subject === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
    $stmt->bindValue(':message', $message, PDO::PARAM_STR);
    $stmt->execute();

    send_json(['success' => true, 'message' => 'Message saved']);
} catch (Throwable $exception) {
    error_log('contact.php database insert failed: ' . $exception->getMessage());
    send_json(['success' => false, 'error' => 'Unable to save message right now'], 500);
}
