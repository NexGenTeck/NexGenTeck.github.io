<?php

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

function send_error(int $statusCode = 500): never
{
    send_json(
        [
            'success' => false,
            'error' => 'Unable to send message right now. Please try again later.',
        ],
        $statusCode
    );
}

function exceeds_length(string $value, int $maximum): bool
{
    $length = function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);

    return $length > $maximum;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($method !== 'POST') {
    send_error(405);
}

$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody ?: '', true);

if (!is_array($data)) {
    send_error(400);
}

$name = trim(strip_tags((string) ($data['name'] ?? '')));
$email = trim((string) ($data['email'] ?? ''));
$phone = trim(strip_tags((string) ($data['phone'] ?? '')));
$subject = trim(strip_tags((string) ($data['subject'] ?? '')));
$message = trim(strip_tags((string) ($data['message'] ?? '')));

if (
    $name === '' ||
    $email === '' ||
    $message === '' ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    exceeds_length($name, 150) ||
    exceeds_length($email, 255) ||
    exceeds_length($phone, 50) ||
    exceeds_length($subject, 100) ||
    exceeds_length($message, 10000)
) {
    send_error(400);
}

$phone = $phone === '' ? null : $phone;
$subject = $subject === '' ? null : $subject;

$configPath = dirname(__DIR__) . '/contact-config.php';

if (!is_file($configPath)) {
    error_log('Contact configuration file was not found.');
    send_error();
}

$config = require $configPath;

if (
    !is_array($config) ||
    empty($config['db_host']) ||
    empty($config['db_name']) ||
    empty($config['db_user']) ||
    empty($config['db_pass'])
) {
    error_log('Contact configuration file is incomplete.');
    send_error();
}

try {
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=utf8mb4',
        $config['db_host'],
        $config['db_name']
    );

    $pdo = new PDO(
        $dsn,
        $config['db_user'],
        $config['db_pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    $statement = $pdo->prepare(
        'INSERT INTO contacts (name, email, phone, subject, message)
         VALUES (:name, :email, :phone, :subject, :message)'
    );
    $statement->execute([
        ':name' => $name,
        ':email' => $email,
        ':phone' => $phone,
        ':subject' => $subject,
        ':message' => $message,
    ]);
} catch (Throwable $exception) {
    error_log('Contact database submission failed: ' . $exception->getMessage());
    send_error();
}

$phpMailerFiles = [
    __DIR__ . '/PHPMailer/src/Exception.php',
    __DIR__ . '/PHPMailer/src/PHPMailer.php',
    __DIR__ . '/PHPMailer/src/SMTP.php',
];

if (
    !empty($config['smtp_user']) &&
    !empty($config['smtp_pass']) &&
    !array_filter($phpMailerFiles, static fn (string $path): bool => !is_file($path))
) {
    try {
        require_once $phpMailerFiles[0];
        require_once $phpMailerFiles[1];
        require_once $phpMailerFiles[2];

        $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = 'smtp.hostinger.com';
        $mail->SMTPAuth = true;
        $mail->Username = $config['smtp_user'];
        $mail->Password = $config['smtp_pass'];
        $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = 465;
        $mail->CharSet = 'UTF-8';

        $mail->setFrom($config['smtp_user'], 'NexGenTeck Website');
        $mail->addAddress('info@nexgenteck.com');
        $mail->addReplyTo($email, $name);
        $mail->Subject = 'New Contact: ' . ($subject ?? 'No Subject');
        $mail->Body = "New lead received:\n\nName: {$name}\nEmail: {$email}\nPhone: {$phone}\nSubject: {$subject}\nMessage:\n{$message}";
        $mail->send();

        $mail->clearAllRecipients();
        $mail->clearReplyTos();
        $mail->addAddress($email, $name);
        $mail->Subject = 'Thank you for contacting NexGenTeck';
        $mail->Body = "Hi {$name},\n\nThank you for reaching out to NexGenTeck. We have received your message and our team will get back to you within 24 hours.\n\nBest regards,\nNexGenTeck Team";
        $mail->send();
    } catch (Throwable $exception) {
        error_log('Contact email notification failed: ' . $exception->getMessage());
    }
} else {
    error_log('Contact email notification skipped because PHPMailer or SMTP configuration is unavailable.');
}

send_json([
    'success' => true,
    'message' => 'Message received successfully.',
]);
