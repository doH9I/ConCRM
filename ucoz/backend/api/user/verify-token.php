<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error('Method not allowed', 405);
}

// Get user data from token
$payload = requireAuth();

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get user data
    $stmt = $db->prepare("
        SELECT id, email, first_name, last_name, phone, created_at 
        FROM users 
        WHERE id = ?
    ");
    $stmt->execute([$payload['id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        error('User not found', 404);
    }
    
    success(['user' => $user], 'Token is valid');
    
} catch (Exception $e) {
    error('Token verification failed: ' . $e->getMessage(), 500);
} finally {
    if (isset($database)) {
        $database->closeConnection();
    }
}
?>