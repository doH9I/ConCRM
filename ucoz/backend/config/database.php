<?php
// Database configuration for uCoz
class Database {
    private $host = 'localhost';
    private $db_name = 'your_ucoz_db_name';
    private $username = 'your_ucoz_username';
    private $password = 'your_ucoz_password';
    private $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }

    public function closeConnection() {
        $this->conn = null;
    }
}
?>