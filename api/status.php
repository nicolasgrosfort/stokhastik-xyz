<?php
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}

$file = __DIR__ . '/data/status.json';

if (!file_exists($file)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'status.json not found']);
    exit;
}

echo json_encode(['success' => true, 'data' => json_decode(file_get_contents($file), true)]);
