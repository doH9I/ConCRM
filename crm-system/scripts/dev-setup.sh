#!/bin/bash

# CRM System Development Setup Script
set -e

echo "🚀 Setting up CRM System Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install it and try again."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f "../src/backend/.env" ]; then
    echo "📝 Creating .env file from template..."
    cp ../src/backend/.env.example ../src/backend/.env
    echo "✅ .env file created. Please review and update the configuration."
else
    echo "✅ .env file already exists."
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p ../monitoring/grafana/provisioning/datasources
mkdir -p ../monitoring/grafana/provisioning/dashboards
mkdir -p ../monitoring/grafana/dashboards

# Create Grafana datasource configuration
echo "📊 Setting up Grafana datasource..."
cat > ../monitoring/grafana/provisioning/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

# Create Grafana dashboard configuration
echo "📈 Setting up Grafana dashboards..."
cat > ../monitoring/grafana/provisioning/dashboards/dashboards.yml << EOF
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
EOF

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd ../src/backend
npm install
cd ../../scripts

# Start services
echo "🐳 Starting Docker services..."
cd ../docker
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ All services are running!"
    echo ""
    echo "🌐 Service URLs:"
    echo "   - CRM Backend API: http://localhost:3001"
    echo "   - Swagger Docs: http://localhost:3001/docs"
    echo "   - Grafana: http://localhost:3000 (admin/admin)"
    echo "   - Prometheus: http://localhost:9090"
    echo ""
    echo "📊 Database:"
    echo "   - PostgreSQL: localhost:5432"
    echo "   - Redis: localhost:6379"
    echo ""
    echo "🚀 Development setup complete!"
else
    echo "❌ Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi