# 🚀 CRM System Quick Start Guide

This guide will help you get the CRM system up and running quickly.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- Git

## 🏃‍♂️ Quick Start (Development)

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd crm-system
```

### 2. Run Development Setup
```bash
./scripts/dev-setup.sh
```

This script will:
- ✅ Create environment files
- ✅ Install dependencies
- ✅ Start all services
- ✅ Set up monitoring

### 3. Access Your System
- **CRM API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/docs
- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090

## 🧪 Testing the System

### 1. Create a Test User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### 3. Test Protected Endpoints
```bash
# Use the JWT token from login response
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🐳 Docker Commands

### Development
```bash
# Start services
cd docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production
```bash
# Deploy to production
./scripts/deploy-prod.sh

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Backup system
cd docker
./backup.sh
```

## 🔧 Configuration

### Environment Variables
- Copy `.env.example` to `.env` for development
- Copy `.env.prod.example` to `.env.prod` for production
- Update values according to your environment

### Key Configuration Files
- `docker/docker-compose.yml` - Development environment
- `docker/docker-compose.prod.yml` - Production environment
- `docker/nginx/nginx.conf` - Nginx configuration
- `docker/prometheus/` - Monitoring configuration

## 📊 Monitoring

### Metrics Available
- **Application**: Request rates, response times, error rates
- **Database**: Connection counts, query performance
- **System**: CPU, memory, disk usage
- **Business**: User activity, lead conversion, project progress

### Dashboards
- **Business Overview**: KPIs and business metrics
- **System Health**: Infrastructure monitoring
- **Performance**: Application performance metrics

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :3001

# Kill the process
kill -9 <PID>
```

#### 2. Database Connection Issues
```bash
# Check PostgreSQL status
docker exec crm_postgres pg_isready -U postgres

# Check logs
docker-compose logs postgres
```

#### 3. Redis Connection Issues
```bash
# Check Redis status
docker exec crm_redis redis-cli ping

# Check logs
docker-compose logs redis
```

#### 4. Backend Issues
```bash
# Check backend logs
docker-compose logs crm_backend

# Restart backend
docker-compose restart crm_backend
```

### Health Checks
```bash
# Check all services
docker-compose ps

# Check service health
curl http://localhost:3001/health
```

## 🔒 Security

### Development
- Default passwords in `.env.example`
- No SSL (HTTP only)
- Open access to monitoring

### Production
- Strong passwords required
- SSL/TLS encryption
- Restricted monitoring access
- Rate limiting enabled
- Security headers configured

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale backend services
docker-compose up -d --scale crm_backend=3

# Scale with load balancer
# Update nginx.conf for multiple backend instances
```

### Vertical Scaling
```bash
# Update resource limits in docker-compose.prod.yml
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '1.0'
```

## 🚀 Next Steps

1. **Customize**: Update branding and business logic
2. **Integrate**: Connect with external systems
3. **Deploy**: Set up production environment
4. **Monitor**: Configure alerts and dashboards
5. **Backup**: Set up automated backup schedules

## 📞 Support

- Check the main README.md for detailed documentation
- Review API documentation at `/docs` endpoint
- Check logs for error details
- Create issues in the repository

---

**Happy CRM-ing! 🎉**