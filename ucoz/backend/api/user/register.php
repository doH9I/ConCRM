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
$required_fields = ['email', 'password'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        error("Field '$field' is required");
    }
}

$email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
if (!$email) {
    error('Invalid email format');
}

$password = $input['password'];
if (strlen($password) < 8) {
    error('Password must be at least 8 characters long');
}

$first_name = $input['first_name'] ?? '';
$last_name = $input['last_name'] ?? '';
$phone = $input['phone'] ?? '';

// Hash password
$password_hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if user already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        error('User with this email already exists', 409);
    }
    
    // Insert new user
    $stmt = $db->prepare("
        INSERT INTO users (email, password_hash, first_name, last_name, phone) 
        VALUES (?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([$email, $password_hash, $first_name, $last_name, $phone]);
    $user_id = $db->lastInsertId();
    
    // Generate JWT token
    $token = generateJWT([
        'id' => $user_id,
        'email' => $email,
        'first_name' => $first_name,
        'last_name' => $last_name,
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ]);
    
    // Get user data (without password)
    $user = [
        'id' => $user_id,
        'email' => $email,
        'first_name' => $first_name,
        'last_name' => $last_name,
        'phone' => $phone,
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    success([
        'user' => $user,
        'token' => $token
    ], 'User registered successfully');
    
} catch (Exception $e) {
    error('Registration failed: ' . $e->getMessage(), 500);
} finally {
    if (isset($database)) {
        $database->closeConnection();
    }
}
?>