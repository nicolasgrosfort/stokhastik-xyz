<?php

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/lib/utils.php';

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false]);
    exit;
}

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid JSON"]);
    exit;
}


$sanitize = static fn($value) => htmlspecialchars(trim((string)$value), ENT_QUOTES, 'UTF-8');

$id = $sanitize($data['id'] ?? '');
$firstname = $sanitize($data["firstname"] ?? "");
$lastname = $sanitize($data["lastname"] ?? "");
$email = filter_var($data["email"] ?? "", FILTER_VALIDATE_EMAIL);
$message = $sanitize($data["message"] ?? "");
$honeypot = $sanitize($data["honeypot"] ?? "");

if (!$email || !empty($honeypot)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid input"]);
    exit;
}

$ip = $_SERVER['REMOTE_ADDR'];
$file = sys_get_temp_dir() . "/mail_" . md5($ip);

if (file_exists($file) && time() - filemtime($file) < 10) {
    http_response_code(429);
    echo json_encode(["success" => false, "error" => "Too many requests"]);
    exit;
}

touch($file);

$statusFile = __DIR__ . '/data/status.json';

if (!updateStatus($statusFile, $id, 'sold')) {
    http_response_code(409);
    echo json_encode(["success" => false, "error" => "ID unavailable"]);
    exit;
}


$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = $_ENV['HOST'];
    $mail->SMTPAuth = true;
    $mail->Username = $_ENV['USERNAME'];
    $mail->Password = $_ENV['PASSWORD'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    $mail->CharSet = 'UTF-8';

    $mail->setFrom($_ENV['EMAIL'], 'Parcours PAN');
    $mail->addAddress($_ENV['EMAIL']);
    $mail->addBCC($email);
    $mail->addReplyTo($email, "$firstname $lastname");

    $mail->Subject = "Message de $firstname $lastname";
    $mail->Body = implode("\n", [
        "Prénom: $firstname",
        "Nom: $lastname",
        "Email: $email",
        "",
        "Message:",
        $message,
    ]);

    $mail->send();
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $mail->ErrorInfo
    ]);
}
