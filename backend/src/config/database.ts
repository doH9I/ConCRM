import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ticket_aggregator',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Test database connection
export const testConnection = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection test successful');
    client.release();
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    throw error;
  }
};

// Connect to database
export const connectDatabase = async (): Promise<void> => {
  try {
    await testConnection();
    
    // Initialize database tables
    await initializeTables();
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    throw error;
  }
};

// Initialize database tables
const initializeTables = async (): Promise<void> => {
  const client = await pool.connect();
  
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Search history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS search_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        from_location VARCHAR(255) NOT NULL,
        to_location VARCHAR(255) NOT NULL,
        departure_date DATE NOT NULL,
        return_date DATE,
        passengers_count INTEGER DEFAULT 1,
        transport_type VARCHAR(50) NOT NULL,
        trip_type VARCHAR(20) DEFAULT 'one_way',
        search_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bookings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        provider_name VARCHAR(100) NOT NULL,
        provider_booking_id VARCHAR(255),
        from_location VARCHAR(255) NOT NULL,
        to_location VARCHAR(255) NOT NULL,
        departure_date TIMESTAMP NOT NULL,
        return_date TIMESTAMP,
        passengers_count INTEGER DEFAULT 1,
        transport_type VARCHAR(50) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        status VARCHAR(50) DEFAULT 'pending',
        payment_status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Passenger details table
    await client.query(`
      CREATE TABLE IF NOT EXISTS passenger_details (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        birth_date DATE NOT NULL,
        passport_number VARCHAR(100),
        nationality VARCHAR(100),
        seat_number VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payment transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id),
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        payment_method VARCHAR(50) NOT NULL,
        transaction_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
      CREATE INDEX IF NOT EXISTS idx_passenger_details_booking_id ON passenger_details(booking_id);
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking_id ON payment_transactions(booking_id);
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Close database connection
export const closeDatabase = async (): Promise<void> => {
  await pool.end();
  console.log('✅ Database connection closed');
};