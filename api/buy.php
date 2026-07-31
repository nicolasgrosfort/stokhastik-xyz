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
    "name" => $sanitize($data['item']['name'] ?? ''),
    "price" => (float)($data['item']['price'] ?? 0)
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

if (!updateStatus($statusFile, $item['id'] ?? '', 'sold', [
    'buyAt' => date('Y-m-d'),
    'buyBy' => "$firstname",
])) {
    http_response_code(409);
    echo json_encode(["success" => false, "error" => "ID unavailable"]);
    exit;
}


$invoiceMessage = "Stokhastik Store: {$item['name']}";
$invoiceLink = "https://stokhastik.xyz/api/qr-bill.php?" . http_build_query([
    'name' => $item['name'],
    'price' => $item['price'],
    'message' => $invoiceMessage,
]);

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
    $mail->addAddress($email, "$firstname $lastname");
    $mail->addBCC($_ENV['EMAIL']);
    $mail->addReplyTo($email, "$firstname $lastname");

    $paymentLink = "https://stokhastik.xyz/store/$item[id]/?process=qr-code";

    $mail->Subject = "Merci $firstname pour ton soutien ❤️ Ton article \"$item[name]\" est réservé !";
    $mail->isHTML(true);
    $mail->Body = implode("\n", [
        "<p>Salut $firstname,</p>",
        "<p>Merci beaucoup pour ton soutien ❤️</p>",
        "<p>J'ai mis \"$item[name]\" de côté pour toi. Je te l'apporterai dès mon retour, à partir du 1er octobre 2026.</p>",
        "<p>Tu trouveras ici <a href=\"$paymentLink\">les informations nécessaires pour effectuer le paiement</a></p>",
        "<p>Tu peux aussi <a href=\"$invoiceLink\">télécharger directement ta facture QR ici</a></p>",
        "<p>\"$item[name]\" te sera réservé pendant 5 jours. Si le paiement n'est pas reçu dans ce délai, il deviendra automatiquement à nouveau disponible.</p>",
        "<p>Si tu as changé d'avis, tu peux simplement ignorer cet email.<br>",
        "Voici les informations que tu as transmises :</p>",
        "<p>Prénom : $firstname<br>",
        "Nom : $lastname<br>",
        "Email : $email<br>",
        "Message : $message</p>",
        "<p>Ces informations me sont uniquement envoyées par email afin de traiter ta réservation.</p>",
        "<p>Si tu as des questions, n'hésite pas à répondre à cet email.<br>",
        "Merci encore pour ton soutien !<br>",
        "Nicolas.</p>"
    ]);
    $mail->AltBody = implode("\n", [
        "Salut $firstname,",
        "",
        'Merci beaucoup pour ton soutien ❤️',
        "",
        "J'ai mis \"$item[name]\" de côté pour toi. Je te l'apporterai dès mon retour, à partir du 1er octobre 2026.",
        "",
        "Tu trouveras ici les informations nécessaires pour effectuer le paiement :",
        $paymentLink,
        "",
        "Tu peux aussi télécharger directement ta facture QR ici :",
        $invoiceLink,
        "",
        "\"$item[name]\" te sera réservé pendant 5 jours. Si le paiement n'est pas reçu dans ce délai, il deviendra automatiquement à nouveau disponible.",
        "",
        "Si tu as changé d'avis, tu peux simplement ignorer cet email.",
        "",
        "Voici les informations que tu as transmises :",
        "",
        "Prénom : $firstname",
        "Nom : $lastname",
        "Email : $email",
        "Message : $message",
        "",
        "Ces informations me sont uniquement envoyées par email afin de traiter ta réservation.",
        "",
        "Si tu as des questions, n'hésite pas à répondre à cet email.",
        "Merci encore pour ton soutien !",
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
