<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error('Method not allowed', 405);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    error('Invalid JSON input');
}

// Validate required fields
if (empty($input['email']) || empty($input['password'])) {
    error('Email and password are required');
}

$email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
if (!$email) {
    error('Invalid email format');
}

$password = $input['password'];

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Find user by email
    $stmt = $db->prepare("
        SELECT id, email, password_hash, first_name, last_name, phone, created_at 
        FROM users 
        WHERE email = ?
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        error('Invalid email or password', 401);
    }
    
    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        error('Invalid email or password', 401);
    }
    
    // Generate JWT token
    $token = generateJWT([
        'id' => $user['id'],
        'email' => $user['email'],
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name'],
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ]);
    
    // Remove password hash from response
    unset($user['password_hash']);
    
    success([
        'user' => $user,
        'token' => $token
    ], 'Login successful');
    
} catch (Exception $e) {
    error('Login failed: ' . $e->getMessage(), 500);
} finally {
    if (isset($database)) {
        $database->closeConnection();
    }
}
?>