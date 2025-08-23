<?php
// Main configuration file for uCoz
session_start();

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS headers for uCoz
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// JWT Secret (change this in production!)
define('JWT_SECRET', 'your_super_secret_jwt_key_here_change_in_production');

// API Keys for ticket providers
define('AVIASALES_API_KEY', 'your_aviasales_api_key');
define('OMIO_API_KEY', 'your_omio_api_key');
define('KIWI_API_KEY', 'your_kiwi_api_key');
define('BUSFOR_API_KEY', 'your_busfor_api_key');

// External API URLs
define('AVIASALES_BASE_URL', 'https://api.aviasales.com');
define('OMIO_BASE_URL', 'https://api.omio.com');
define('KIWI_BASE_URL', 'https://api.kiwi.com');
define('BUSFOR_BASE_URL', 'https://api.busfor.com');

// Helper functions
function response($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

function error($message, $status = 400) {
    response([
        'success' => false,
        'error' => [
            'message' => $message,
            'status' => $status
        ]
    ], $status);
}

function success($data, $message = 'Success') {
    response([
        'success' => true,
        'data' => $data,
        'message' => $message
    ]);
}

// JWT functions
function generateJWT($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode($payload);
    
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
    if (!$payload) {
        return false;
    }
    
    // Check expiration
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return false;
    }
    
    return $payload;
}

// Authentication middleware
function requireAuth() {
    $headers = getallheaders();
    $token = null;
    
    if (isset($headers['Authorization'])) {
        $token = str_replace('Bearer ', '', $headers['Authorization']);
    }
    
    if (!$token) {
        error('Access token required', 401);
    }
    
    $payload = verifyJWT($token);
    if (!$payload) {
        error('Invalid or expired token', 401);
    }
    
    return $payload;
}
?>