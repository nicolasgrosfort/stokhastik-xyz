<?php

require __DIR__ . '/vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

header("Content-Type: application/json");

$client = new Client([
    "base_uri" => "https://api.github.com/",
    "headers" => [
        "Accept" => "application/vnd.github+json",
        "User-Agent" => "head-md-thesis-api"
    ]
]);

try {
    $response = $client->get(
        "repos/nicolasgrosfort/head-md-thesis/contents/fragments"
    );

    http_response_code($response->getStatusCode());

    echo $response->getBody();
} catch (RequestException $e) {

    http_response_code(
        $e->hasResponse()
            ? $e->getResponse()->getStatusCode()
            : 500
    );

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
