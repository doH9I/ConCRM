#!/bin/bash

# Database initialization script for CRM system

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Database configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-crm_prod}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

# Wait for PostgreSQL to be ready
wait_for_postgres() {
    log "Waiting for PostgreSQL to be ready..."
    until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
        sleep 2
    done
    log "PostgreSQL is ready"
}

# Create database and user
create_database() {
    log "Creating database and user..."
    
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres <<-EOSQL
        CREATE DATABASE $DB_NAME;
        CREATE USER crm_user WITH PASSWORD 'crm_password_2024';
        GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO crm_user;
        ALTER USER crm_user CREATEDB;
EOSQL
    
    log "Database and user created successfully"
}

# Create initial tables
create_tables() {
    log "Creating initial tables..."
    
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<-EOSQL
        -- Users table
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Companies table
        CREATE TABLE companies (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            address TEXT,
            phone VARCHAR(50),
            email VARCHAR(255),
            website VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Projects table
        CREATE TABLE projects (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            company_id INTEGER REFERENCES companies(id),
            status VARCHAR(50) DEFAULT 'active',
            start_date DATE,
            end_date DATE,
            budget DECIMAL(15,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Leads table
        CREATE TABLE leads (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(50),
            company VARCHAR(255),
            source VARCHAR(100),
            status VARCHAR(50) DEFAULT 'new',
            notes TEXT,
            assigned_to INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Tasks table
        CREATE TABLE tasks (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            project_id INTEGER REFERENCES projects(id),
            assigned_to INTEGER REFERENCES users(id),
            status VARCHAR(50) DEFAULT 'pending',
            priority VARCHAR(20) DEFAULT 'medium',
            due_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes
        CREATE INDEX idx_users_email ON users(email);
        CREATE INDEX idx_projects_company ON projects(company_id);
        CREATE INDEX idx_leads_status ON leads(status);
        CREATE INDEX idx_tasks_project ON tasks(project_id);
        CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
EOSQL
    
    log "Initial tables created successfully"
}

# Insert sample data
insert_sample_data() {
    log "Inserting sample data..."
    
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<-EOSQL
        -- Insert admin user
        INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
        ('admin@company.com', '\$2b\$10\$rQZ8K9vX8K9vX8K9vX8K9O', 'Admin', 'User', 'admin');

        -- Insert sample company
        INSERT INTO companies (name, address, phone, email) VALUES
        ('Sample Construction Co.', '123 Main St, City, State', '+1-555-0123', 'info@sampleco.com');

        -- Insert sample project
        INSERT INTO projects (name, description, company_id, status, start_date, budget) VALUES
        ('Office Building Project', 'Construction of a 5-story office building', 1, 'active', '2024-01-01', 2500000.00);

        -- Insert sample lead
        INSERT INTO leads (first_name, last_name, email, company, source, status) VALUES
        ('John', 'Doe', 'john.doe@example.com', 'New Client Inc.', 'website', 'new');
EOSQL
    
    log "Sample data inserted successfully"
}

# Main execution
main() {
    log "Starting database initialization..."
    
    wait_for_postgres
    create_database
    create_tables
    insert_sample_data
    
    log "Database initialization completed successfully!"
    log "Database: $DB_NAME"
    log "User: crm_user"
    log "Password: crm_password_2024"
}

main "$@"