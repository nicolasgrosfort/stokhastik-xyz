<?php

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/lib/utils.php';

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
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

$firstname = $sanitize($data["firstname"] ?? "");
$lastname = $sanitize($data["lastname"] ?? "");
$email = filter_var($data["email"] ?? "", FILTER_VALIDATE_EMAIL);
$message = $sanitize($data["message"] ?? "");
$honeypot = $sanitize($data["honeypot"] ?? "");

$item = [
    "id" => $sanitize($data['item']['id'] ?? ''),
    "name" => $sanitize($data['item']['name'] ?? '')
];

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

if (!updateStatus($statusFile, $item['id'] ?? '', 'sold')) {
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

    $mail->setFrom($_ENV['EMAIL'], 'Nicolas Grosfort');
    $mail->addAddress($_ENV['EMAIL']);
    $mail->addBCC($email);
    $mail->addReplyTo($email, "$firstname $lastname");

    $mail->Subject = "Thank you $firstname for your support : \"$item[name]\"";
    $mail->Body = implode("\n", [
        "Hey $firstname,",
        "",
        "I just put \"$item[name]\" in my bag. I'll bring it to you as soon as I get back.",
        "If you missed the payment information, you can find it here : https://stokhastik.xyz/store/$item[id]/?process=qr-code",
        "",
        "If you've changed your mind, you can ignore this message.",
        "If payment is not received within 5 days, \"$item[name]\" will automatically be made available to everyone.",
        "",
        "Finally, this email address is the only place where the data you entered in the form is stored. ",
        "I receive a copy of this message, which allows me to know who is supporting me.",
        "",
        "Here is the information you provided:",
        "Firstname: $firstname",
        "Lastname: $lastname",
        "Email: $email",
        "Message: $message",
        "",
        "If you have any questions, feel free to reply to this email.",
        "Thanks again for your support!",
        "Nicolas. "
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
