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
$required_fields = ['from_location', 'to_location', 'departure_date', 'passengers_count', 'transport_type', 'trip_type'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        error("Field '$field' is required");
    }
}

$from_location = $input['from_location'];
$to_location = $input['to_location'];
$departure_date = $input['departure_date'];
$return_date = $input['return_date'] ?? null;
$passengers_count = (int)$input['passengers_count'];
$transport_type = $input['transport_type'];
$trip_type = $input['trip_type'];

// Validate data
if ($passengers_count < 1 || $passengers_count > 9) {
    error('Passengers count must be between 1 and 9');
}

if (!in_array($transport_type, ['airplane', 'train', 'bus'])) {
    error('Invalid transport type');
}

if (!in_array($trip_type, ['one_way', 'round_trip'])) {
    error('Invalid trip type');
}

// Mock ticket data (in production, this would call external APIs)
$mockTickets = [
    [
        'id' => 'av_001',
        'provider_name' => 'Aviasales',
        'provider_logo' => 'https://via.placeholder.com/100x50/2563eb/ffffff?text=AV',
        'from_location' => $from_location,
        'to_location' => $to_location,
        'departure_date' => $departure_date,
        'return_date' => $return_date,
        'departure_time' => '10:00',
        'arrival_time' => '11:30',
        'duration' => '1h 30m',
        'stops_count' => 0,
        'price' => 12000,
        'currency' => 'RUB',
        'original_price' => 15000,
        'discount_percentage' => 20,
        'transport_type' => $transport_type,
        'trip_type' => $trip_type,
        'available_seats' => 45,
        'amenities' => ['WiFi', 'Entertainment', 'Refreshments']
    ],
    [
        'id' => 'om_001',
        'provider_name' => 'Omio',
        'provider_logo' => 'https://via.placeholder.com/100x50/059669/ffffff?text=OM',
        'from_location' => $from_location,
        'to_location' => $to_location,
        'departure_date' => $departure_date,
        'return_date' => $return_date,
        'departure_time' => '08:30',
        'arrival_time' => '12:45',
        'duration' => '4h 15m',
        'stops_count' => 1,
        'stops' => ['Tver'],
        'price' => 2500,
        'currency' => 'RUB',
        'transport_type' => $transport_type,
        'trip_type' => $trip_type,
        'available_seats' => 120,
        'amenities' => ['WiFi', 'Restaurant', 'Power Outlets']
    ],
    [
        'id' => 'kw_001',
        'provider_name' => 'Kiwi',
        'provider_logo' => 'https://via.placeholder.com/100x50/dc2626/ffffff?text=KW',
        'from_location' => $from_location,
        'to_location' => $to_location,
        'departure_date' => $departure_date,
        'return_date' => $return_date,
        'departure_time' => '16:00',
        'arrival_time' => '17:30',
        'duration' => '1h 30m',
        'stops_count' => 0,
        'price' => 11800,
        'currency' => 'RUB',
        'transport_type' => $transport_type,
        'trip_type' => $trip_type,
        'available_seats' => 28,
        'amenities' => ['WiFi', 'Entertainment']
    ]
];

// Filter tickets based on search criteria
$filteredTickets = array_filter($mockTickets, function($ticket) use ($transport_type) {
    return $ticket['transport_type'] === $transport_type;
});

// Sort by price
usort($filteredTickets, function($a, $b) {
    return $a['price'] - $b['price'];
});

// Save search to history if user is authenticated
$user_id = null;
$headers = getallheaders();
if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $payload = verifyJWT($token);
    if ($payload) {
        $user_id = $payload['id'];
        
        try {
            $database = new Database();
            $db = $database->getConnection();
            
            $stmt = $db->prepare("
                INSERT INTO search_history 
                (user_id, from_location, to_location, departure_date, return_date, 
                 passengers_count, transport_type, trip_type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $user_id, $from_location, $to_location, $departure_date, 
                $return_date, $passengers_count, $transport_type, $trip_type
            ]);
            
        } catch (Exception $e) {
            // Log error but don't fail the search
            error_log('Failed to save search history: ' . $e->getMessage());
        } finally {
            if (isset($database)) {
                $database->closeConnection();
            }
        }
    }
}

$searchResponse = [
    'results' => array_values($filteredTickets),
    'total_count' => count($filteredTickets),
    'search_id' => 'search_' . time() . '_' . uniqid()
];

success($searchResponse, 'Found ' . count($filteredTickets) . ' tickets');
?>