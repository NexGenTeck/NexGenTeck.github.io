<?php 
header('Content-Type: application/json; charset=utf-8');
$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody ?: '', true);

ini_set('display_errors', 0);
error_reporting(E_ALL);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

// TUMHARA HOSTINGER DB - Isko change mat karna
const DB_HOST = 'localhost';
const DB_NAME = 'u864361634_NGTWEB';
const DB_USER = 'u864361634_NGTWEB';
const DB_PASS = 'DIDwho123456';

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

function send_json(array $payload, int $statusCode = 200): never {
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') { http_response_code(204); exit; }
if ($method !== 'POST') { send_json(['success' => false, 'error' => 'Method not allowed'], 405); }

if (!is_array($data)) { send_json(['success' => false, 'error' => 'Invalid JSON payload'], 400); }

$name = trim(strip_tags((string)($data['name'] ?? '')));
$email = trim((string)($data['email'] ?? ''));
$phone = trim(strip_tags((string)($data['phone'] ?? '')));
$subject = trim(strip_tags((string)($data['subject'] ?? '')));
$message = trim((string)($data['message'] ?? ''));
$website = trim((string)($data['website'] ?? ''));

if ($website !== '') { send_json(['success' => true, 'message' => 'Message saved']); }
if ($name === '' || $email === '' || $message === '') { send_json(['success' => false, 'error' => 'Name, email, and message are required'], 400); }
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { send_json(['success' => false, 'error' => 'Invalid email format'], 400); }

$phone = $phone === '' ? null : $phone;
$subject = $subject === '' ? null : $subject;

try {
    // 1. DB ME SAVE
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $stmt = $pdo->prepare('INSERT INTO contacts (name, email, phone, subject, message) VALUES (:name, :email, :phone, :subject, :message)');
    $stmt->execute([':name'=>$name, ':email'=>$email, ':phone'=>$phone, ':subject'=>$subject, ':message'=>$message]);

    // 2. EMAIL BHEJNA - SIRF YE 2 LINE CHANGE KARNA
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = 'smtp.hostinger.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'info@nexgenteck.com'; // 1. COMPANY EMAIL
    $mail->Password   = 'YOUR_EMAIL_PASSWORD'; // 2. USKA PASSWORD YAHAN DALO
    $mail->SMTPSecure = 'ssl';
    $mail->Port       = 465;
    $mail->CharSet    = 'UTF-8';

    // A. Admin ko email
    $mail->setFrom('info@nexgenteck.com', 'NexGenTeck Website');
    $mail->addAddress('info@nexgenteck.com');
    $mail->addReplyTo($email, $name);
    $mail->Subject = "New Contact: " . ($subject ?? 'No Subject');
    $mail->Body    = "New Lead Received:\n\nName: $name\nEmail: $email\nPhone: $phone\nSubject: $subject\nMessage:\n$message";
    $mail->send();

    // B. User ko Auto Reply
    $mail->clearAddresses();
    $mail->addAddress($email, $name);
    $mail->Subject = 'Thank you for contacting NexGenTeck';
    $mail->Body    = "Hi $name,\n\nThank you for reaching out to NexGenTeck. We have received your message and our team will get back to you within 24 hours.\n\nBest Regards,\nNexGenTeck Team";
    $mail->send();

    send_json(['success' => true, 'message' => 'Message sent successfully']);

} catch (Throwable $exception) {
    send_json(['success' => false, 'error' => 'Error: ' . $exception->getMessage()], 500);
}
