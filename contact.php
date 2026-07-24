<?php

declare(strict_types=1);

const ERROR_RESPONSE = [
    'success' => false,
    'error' => 'Unable to send message right now. Please try again later.',
];

const ALLOWED_ORIGINS = [
    'https://nexgenteck.com',
    'https://www.nexgenteck.com',
    'https://nexgenteck.vercel.app',
];

function respond(array $payload, int $statusCode = 200): never
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload);
    exit;
}

function applyCorsHeaders(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, ALLOWED_ORIGINS, true)) {
        header("Access-Control-Allow-Origin: {$origin}");
        header('Vary: Origin');
    }

    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept');
    header('Access-Control-Max-Age: 86400');
}

function cleanInput(mixed $value): string
{
    if (!is_string($value)) {
        return '';
    }

    return trim(strip_tags($value));
}

function optionalString(string $value): ?string
{
    return $value === '' ? null : $value;
}

function requiredConfigDefined(): bool
{
    return defined('DB_HOST')
        && defined('DB_NAME')
        && defined('DB_USER')
        && defined('DB_PASSWORD');
}

function smtpEnabled(): bool
{
    return defined('SMTP_ENABLED') && filter_var(SMTP_ENABLED, FILTER_VALIDATE_BOOLEAN);
}

function sendOptionalEmail(array $contact): void
{
    if (!smtpEnabled()) {
        return;
    }

    try {
        $phpMailerBase = __DIR__ . '/PHPMailer/src';

        if (
            is_file($phpMailerBase . '/Exception.php')
            && is_file($phpMailerBase . '/PHPMailer.php')
            && is_file($phpMailerBase . '/SMTP.php')
        ) {
            require_once $phpMailerBase . '/Exception.php';
            require_once $phpMailerBase . '/PHPMailer.php';
            require_once $phpMailerBase . '/SMTP.php';

            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = defined('SMTP_HOST') ? SMTP_HOST : '';
            $mail->SMTPAuth = true;
            $mail->Username = defined('SMTP_USERNAME') ? SMTP_USERNAME : '';
            $mail->Password = defined('SMTP_PASSWORD') ? SMTP_PASSWORD : '';
            $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port = defined('SMTP_PORT') ? (int) SMTP_PORT : 465;

            $fromEmail = defined('SMTP_FROM_EMAIL') ? SMTP_FROM_EMAIL : '';
            $fromName = defined('SMTP_FROM_NAME') ? SMTP_FROM_NAME : 'NexGenTeck Website';
            $toEmail = defined('SMTP_TO_EMAIL') ? SMTP_TO_EMAIL : $fromEmail;

            if ($fromEmail === '' || $toEmail === '') {
                return;
            }

            $mail->setFrom($fromEmail, $fromName);
            $mail->addAddress($toEmail);
            $mail->addReplyTo($contact['email'], $contact['name']);
            $mail->Subject = 'New website contact';
            $mail->Body = sprintf(
                "Name: %s\nEmail: %s\nPhone: %s\nSubject: %s\n\nMessage:\n%s",
                $contact['name'],
                $contact['email'],
                $contact['phone'] ?? '',
                $contact['subject'] ?? '',
                $contact['message']
            );
            $mail->send();
        }
    } catch (Throwable) {
        // Email is optional. Database insertion must remain the source of truth.
    }
}

applyCorsHeaders();

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(ERROR_RESPONSE, 405);
}

$configPath = __DIR__ . '/contact-config.php';

if (!is_file($configPath)) {
    respond(ERROR_RESPONSE, 500);
}

require_once $configPath;

if (!requiredConfigDefined()) {
    respond(ERROR_RESPONSE, 500);
}

$rawInput = file_get_contents('php://input');
$decoded = json_decode($rawInput === false ? '' : $rawInput, true);

if (!is_array($decoded)) {
    respond(ERROR_RESPONSE, 400);
}

$name = cleanInput($decoded['name'] ?? '');
$email = cleanInput($decoded['email'] ?? '');
$phone = cleanInput($decoded['phone'] ?? '');
$subject = cleanInput($decoded['subject'] ?? '');
$message = cleanInput($decoded['message'] ?? '');

if ($name === '' || $email === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(ERROR_RESPONSE, 422);
}

$contact = [
    'name' => $name,
    'email' => $email,
    'phone' => optionalString($phone),
    'subject' => optionalString($subject),
    'message' => $message,
];

try {
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=utf8mb4',
        DB_HOST,
        DB_NAME
    );

    $pdo = new PDO($dsn, DB_USER, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    $statement = $pdo->prepare(
        'INSERT INTO contacts (name, email, phone, subject, message) VALUES (:name, :email, :phone, :subject, :message)'
    );

    $statement->execute($contact);
} catch (Throwable) {
    respond(ERROR_RESPONSE, 500);
}

sendOptionalEmail($contact);

respond([
    'success' => true,
    'message' => 'Message sent successfully',
]);
