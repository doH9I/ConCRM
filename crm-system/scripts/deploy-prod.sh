#!/bin/bash

# CRM System Production Deployment Script
set -e

echo "🚀 Starting CRM System Production Deployment..."

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

# Check if .env.prod exists
if [ ! -f "../docker/.env.prod" ]; then
    echo "❌ Production environment file (.env.prod) not found!"
    echo "Please copy .env.prod.example to .env.prod and configure it properly."
    exit 1
fi

# Load production environment variables
echo "📝 Loading production environment variables..."
set -a
source ../docker/.env.prod
set +a

# Validate required environment variables
required_vars=("DB_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET" "GRAFANA_ADMIN_PASSWORD")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ] || [[ "${!var}" == *"your-"* ]]; then
        echo "❌ Required environment variable $var is not set or contains placeholder value."
        exit 1
    fi
done

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p ../docker/logs
mkdir -p ../docker/backups
mkdir -p ../docker/uploads
mkdir -p ../docker/nginx/ssl

# Check if SSL certificates exist
if [ ! -f "../docker/nginx/ssl/cert.pem" ] || [ ! -f "../docker/nginx/nginx.conf" ]; then
    echo "⚠️  SSL certificates or Nginx configuration not found."
    echo "Please ensure you have:"
    echo "  - ../docker/nginx/ssl/cert.pem (SSL certificate)"
    echo "  - ../docker/nginx/nginx/ssl/key.pem (SSL private key)"
    echo "  - ../docker/nginx/nginx.conf (Nginx configuration)"
    echo ""
    echo "You can create self-signed certificates for testing with:"
    echo "  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\"
    echo "    -keyout ../docker/nginx/ssl/key.pem \\"
    echo "    -out ../docker/nginx/nginx/ssl/cert.pem"
    echo ""
    read -p "Continue without SSL? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build production images
echo "🔨 Building production Docker images..."
cd ../docker
docker-compose -f docker-compose.prod.yml build --no-cache

# Stop existing services if running
echo "🛑 Stopping existing services..."
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Start production services
echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 60

# Check service health
echo "🔍 Checking service health..."
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "✅ All production services are running!"
    echo ""
    echo "🌐 Production Service URLs:"
    echo "   - CRM Backend API: http://localhost:3001"
    echo "   - Swagger Docs: http://localhost:3001/docs"
    echo "   - Grafana: http://localhost:3000"
    echo "   - Prometheus: http://localhost:9090"
    echo ""
    echo "📊 Database:"
    echo "   - PostgreSQL: localhost:5432"
    echo "   - Redis: localhost:6379"
    echo ""
    echo "🔒 Security Notes:"
    echo "   - Change default passwords immediately"
    echo "   - Configure firewall rules"
    echo "   - Set up SSL certificates"
    echo "   - Configure backup schedules"
    echo ""
    echo "🚀 Production deployment complete!"
    
    # Show running containers
    echo ""
    echo "📋 Running containers:"
    docker-compose -f docker-compose.prod.yml ps
    
    # Show resource usage
    echo ""
    echo "📊 Resource usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    
else
    echo "❌ Some services failed to start. Check logs with:"
    echo "   docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi

# Create backup script
echo "💾 Creating backup script..."
cat > ../docker/backup.sh << 'EOF'
#!/bin/bash
# Backup script for CRM system

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup PostgreSQL database
echo "Backing up PostgreSQL database..."
docker exec crm_postgres_prod pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/crm_db_$DATE.sql

# Backup Redis data
echo "Backing up Redis data..."
docker exec crm_redis_prod redis-cli -a $REDIS_PASSWORD BGSAVE
sleep 5
docker cp crm_redis_prod:/data/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# Backup uploads
echo "Backing up uploads..."
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz uploads/

# Backup logs
echo "Backing up logs..."
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz logs/

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR"
EOF

chmod +x ../docker/backup.sh

echo ""
echo "💾 Backup script created: ../docker/backup.sh"
echo "   Run it manually or set up a cron job for automated backups."
echo ""
echo "📋 Next steps:"
echo "   1. Configure your domain and SSL certificates"
echo "   2. Set up monitoring alerts"
echo "   3. Configure automated backups"
echo "   4. Set up CI/CD pipeline"
echo "   5. Test all functionality"
echo ""
echo "🎉 Production deployment completed successfully!"