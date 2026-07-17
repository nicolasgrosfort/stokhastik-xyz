<?php

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Psr7\Request;

require __DIR__ . '/vendor/autoload.php';

header('Content-Type: application/json');

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

$input = trim((string)($data["input"] ?? ""));

if ($input === "" || mb_strlen($input) > 2000) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid input"]);
    exit;
}

$ip = $_SERVER['REMOTE_ADDR'];
$file = sys_get_temp_dir() . "/embedding_" . md5($ip);

if (file_exists($file) && time() - filemtime($file) < 10) {
    http_response_code(429);
    echo json_encode(["success" => false, "error" => "Too many requests"]);
    exit;
}

touch($file);

$client = new Client();
$headers = [
    'Authorization' => 'Bearer ' . $_ENV['INFOMANIAK_TOKEN'],
    'Content-Type' => 'application/json'
];

$body = json_encode([
    "input" => $input,
    "model" => "mini_lm_l12_v2"
]);

$request = new Request('POST', 'https://api.infomaniak.com/2/ai/' . $_ENV['INFOMANIAK_PRODUCT_ID'] . '/openai/v1/embeddings', $headers, $body);

try {
    $res = $client->send($request);
    echo $res->getBody();
} catch (RequestException $e) {
    http_response_code($e->getResponse()?->getStatusCode() ?? 500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
