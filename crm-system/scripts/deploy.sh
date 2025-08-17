#!/bin/bash

# CRM Deployment Script for Timeweb Cloud
# This script automates the deployment of the CRM system

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ANSIBLE_DIR="$PROJECT_DIR/ansible"
INVENTORY_FILE="$ANSIBLE_DIR/inventory.ini"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Ansible is installed
    if ! command -v ansible &> /dev/null; then
        log "Installing Ansible..."
        sudo apt update
        sudo apt install -y software-properties-common
        sudo apt-add-repository --yes --update ppa:ansible/ansible
        sudo apt install -y ansible
    else
        success "Ansible is already installed"
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        warning "Docker installed. Please log out and log back in for group changes to take effect."
    else
        success "Docker is already installed"
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log "Installing Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    else
        success "Docker Compose is already installed"
    fi
}

# Validate inventory file
validate_inventory() {
    log "Validating inventory file..."
    
    if [[ ! -f "$INVENTORY_FILE" ]]; then
        error "Inventory file not found: $INVENTORY_FILE"
        exit 1
    fi
    
    # Check if IP addresses are configured
    if grep -q "YOUR_.*_SERVER_IP" "$INVENTORY_FILE"; then
        error "Please configure your server IP addresses in $INVENTORY_FILE"
        error "Replace YOUR_APP_SERVER_IP, YOUR_DB_SERVER_IP, and YOUR_MONITORING_SERVER_IP with actual IPs"
        exit 1
    fi
    
    success "Inventory file is valid"
}

# Check SSH connectivity
check_ssh_connectivity() {
    log "Checking SSH connectivity to servers..."
    
    # Read server IPs from inventory
    local app_server=$(grep "ansible_host=" "$INVENTORY_FILE" | grep -E "app-server" | awk -F'=' '{print $2}')
    local db_server=$(grep "ansible_host=" "$INVENTORY_FILE" | grep -E "db-server" | awk -F'=' '{print $2}')
    local monitoring_server=$(grep "ansible_host=" "$INVENTORY_FILE" | grep -E "monitoring-server" | awk -F'=' '{print $2}')
    
    # Test SSH connection to each server
    for server in "$app_server" "$db_server" "$monitoring_server"; do
        if [[ -n "$server" ]]; then
            log "Testing SSH connection to $server..."
            if ! ssh -o ConnectTimeout=10 -o BatchMode=yes ubuntu@"$server" exit 2>/dev/null; then
                error "Cannot connect to $server via SSH"
                error "Please ensure:"
                error "1. SSH key is added to the server"
                error "2. Server is accessible from this machine"
                error "3. Firewall allows SSH connections"
                exit 1
            fi
            success "SSH connection to $server successful"
        fi
    done
}

# Create environment file
create_env_file() {
    log "Creating environment file..."
    
    if [[ ! -f "$PROJECT_DIR/.env" ]]; then
        cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
        warning "Environment file created from template. Please edit .env with your actual values."
        warning "Press Enter to continue after editing, or Ctrl+C to abort..."
        read -r
    else
        success "Environment file already exists"
    fi
}

# Run Ansible deployment
run_ansible_deployment() {
    log "Starting Ansible deployment..."
    
    cd "$ANSIBLE_DIR"
    
    # Test Ansible connectivity
    log "Testing Ansible connectivity..."
    ansible all -m ping -i inventory.ini
    
    if [[ $? -eq 0 ]]; then
        success "All servers are reachable via Ansible"
    else
        error "Some servers are not reachable via Ansible"
        exit 1
    fi
    
    # Run the main playbook
    log "Running main deployment playbook..."
    ansible-playbook -i inventory.ini site.yml --verbose
    
    if [[ $? -eq 0 ]]; then
        success "Ansible deployment completed successfully"
    else
        error "Ansible deployment failed"
        exit 1
    fi
}

# Post-deployment verification
verify_deployment() {
    log "Verifying deployment..."
    
    # Read app server IP from inventory
    local app_server=$(grep "ansible_host=" "$INVENTORY_FILE" | grep -E "app-server" | awk -F'=' '{print $2}')
    
    if [[ -n "$app_server" ]]; then
        log "Testing CRM availability on $app_server..."
        
        # Wait for services to start
        sleep 30
        
        # Test health endpoint
        if curl -f "http://$app_server:3000/health" >/dev/null 2>&1; then
            success "CRM is accessible at http://$app_server:3000"
        else
            warning "CRM health check failed. Checking container status..."
            ssh ubuntu@"$app_server" "docker ps -a"
        fi
    fi
}

# Display deployment summary
show_summary() {
    log "Deployment completed!"
    echo
    echo "=== CRM Deployment Summary ==="
    echo
    
    # Read server IPs from inventory
    local app_server=$(grep "ansible_host=" "$INVENTORY_FILE" | grep -E "app-server" | awk -F'=' '{print $2}')
    local db_server=$(grep "ansible_host=" "$INVENTORY_FILE" | grep -E "db-server" | awk -F'=' '{print $2}')
    local monitoring_server=$(grep "ansible_host=" "$INVENTORY_FILE" | grep -E "monitoring-server" | awk -F'=' '{print $2}')
    
    echo "🌐 CRM Application: http://$app_server:3000"
    echo "📊 Grafana Dashboard: http://$monitoring_server:3000"
    echo "📈 Prometheus: http://$monitoring_server:9090"
    echo
    echo "=== Default Credentials ==="
    echo "Grafana Admin: admin / admin123"
    echo "PostgreSQL: postgres / secure_crm_password_2024"
    echo "Redis: (no auth by default)"
    echo
    echo "=== Next Steps ==="
    echo "1. Access Grafana and change default password"
    echo "2. Configure SSL certificates in nginx"
    echo "3. Set up backup automation"
    echo "4. Configure monitoring alerts"
    echo
    echo "=== Useful Commands ==="
    echo "View logs: docker-compose -f docker/docker-compose.prod.yml logs -f"
    echo "Restart services: docker-compose -f docker/docker-compose.prod.yml restart"
    echo "Update system: git pull && docker-compose -f docker/docker-compose.prod.yml up -d --build"
}

# Main deployment function
main() {
    echo "🚀 CRM Deployment Script for Timeweb Cloud"
    echo "=========================================="
    echo
    
    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_DIR/README.md" ]]; then
        error "Please run this script from the crm-system directory"
        exit 1
    fi
    
    # Run deployment steps
    check_root
    check_prerequisites
    validate_inventory
    check_ssh_connectivity
    create_env_file
    run_ansible_deployment
    verify_deployment
    show_summary
}

# Handle script interruption
trap 'error "Deployment interrupted by user"; exit 1' INT TERM

# Run main function
main "$@"