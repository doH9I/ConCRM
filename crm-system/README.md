# 🏗️ Construction Company CRM System

A comprehensive Customer Relationship Management (CRM) system designed specifically for construction companies. This system helps manage leads, projects, tasks, companies, and provides detailed reporting and analytics.

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Manager, User)
- Secure password hashing with bcrypt
- Session management with Redis

### 👥 User Management
- User registration and profile management
- Department-based organization
- Activity tracking and last login monitoring
- User activation/deactivation

### 🏢 Company Management
- Client company profiles
- Industry categorization
- Contact person management
- Company status tracking

### 📋 Project Management
- Project lifecycle management
- Progress tracking
- Budget and timeline management
- Project categorization and tagging

### 🎯 Lead Management
- Lead capture and qualification
- Lead status tracking
- Value estimation
- Assignment to sales representatives

### ✅ Task Management
- Task creation and assignment
- Priority and status management
- Due date tracking
- Progress monitoring

### 📊 Dashboard & Analytics
- Real-time metrics and KPIs
- Project progress visualization
- Lead pipeline analysis
- Performance analytics

### 📈 Reporting
- Sales reports
- Project performance reports
- User productivity reports
- Company analysis reports

### 🔔 Notifications
- Multi-channel notifications (Email, SMS, Telegram, Slack, Discord)
- Automated alerts for important events
- Customizable notification preferences

### 📊 Monitoring & Observability
- Prometheus metrics collection
- Grafana dashboards
- Health checks and monitoring
- Performance monitoring

## 🏗️ Architecture

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis
- **Authentication**: JWT + Passport
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

### Frontend (React)
- **Framework**: React with TypeScript
- **State Management**: Redux Toolkit
- **UI Library**: Material-UI
- **Routing**: React Router
- **HTTP Client**: Axios
- **Testing**: Jest + React Testing Library

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Monitoring**: Prometheus + Grafana
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **CI/CD**: GitHub Actions

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd crm-system
```

### 2. Run Development Setup
```bash
./scripts/dev-setup.sh
```

This script will:
- Create necessary configuration files
- Install dependencies
- Start all services with Docker Compose
- Set up monitoring and dashboards

### 3. Access the System
- **CRM Backend API**: http://localhost:3001
- **Swagger Documentation**: http://localhost:3001/docs
- **Grafana Dashboards**: http://localhost:3000 (admin/admin)
- **Prometheus Metrics**: http://localhost:9090

## 🛠️ Development

### Backend Development
```bash
cd src/backend
npm install
npm run start:dev
```

### Frontend Development
```bash
cd src/frontend
npm install
npm start
```

### Database Migrations
```bash
cd src/backend
npm run typeorm:generate -- -n MigrationName
npm run typeorm:migrate
```

### Running Tests
```bash
# Backend tests
cd src/backend
npm run test
npm run test:e2e

# Frontend tests
cd src/frontend
npm test
```

## 📁 Project Structure

```
crm-system/
├── ansible/                 # Ansible playbooks for deployment
├── docker/                  # Docker configurations
│   ├── docker-compose.yml   # Development environment
│   └── prometheus/          # Monitoring configuration
├── github/                  # GitHub Actions workflows
├── monitoring/              # Monitoring and observability
│   └── grafana/            # Grafana dashboards and provisioning
├── scripts/                 # Utility scripts
├── src/                     # Source code
│   ├── backend/            # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/    # Feature modules
│   │   │   ├── config/     # Configuration files
│   │   │   └── main.ts     # Application entry point
│   │   └── package.json
│   └── frontend/           # React frontend
└── README.md
```

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=crm_prod

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Notifications
TELEGRAM_BOT_TOKEN=your-bot-token
SLACK_WEBHOOK_URL=your-webhook-url
```

## 📊 API Documentation

The API is fully documented with Swagger/OpenAPI. Access the interactive documentation at:
- **Development**: http://localhost:3001/docs
- **Production**: https://your-domain.com/docs

### Key Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/users` - User management
- `GET /api/companies` - Company management
- `GET /api/projects` - Project management
- `GET /api/leads` - Lead management
- `GET /api/tasks` - Task management
- `GET /api/dashboard` - Dashboard data
- `GET /api/reports` - Report generation

## 🧪 Testing

### Backend Testing
- **Unit Tests**: Jest with NestJS testing utilities
- **E2E Tests**: Supertest for API testing
- **Coverage**: Jest coverage reports

### Frontend Testing
- **Unit Tests**: Jest + React Testing Library
- **Component Tests**: Component isolation testing
- **Integration Tests**: User workflow testing

## 🚀 Deployment

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Ansible Deployment
```bash
# Deploy to production servers
ansible-playbook -i inventory/production playbooks/deploy.yml
```

## 📈 Monitoring & Observability

### Metrics Collection
- **Application Metrics**: Custom business metrics
- **System Metrics**: CPU, memory, disk usage
- **Database Metrics**: Query performance, connections
- **API Metrics**: Request rates, response times

### Dashboards
- **Business Overview**: KPIs and business metrics
- **System Health**: Infrastructure monitoring
- **User Activity**: User engagement metrics
- **Performance**: Application performance metrics

### Alerts
- **System Alerts**: Infrastructure issues
- **Business Alerts**: KPI thresholds
- **Security Alerts**: Authentication failures
- **Performance Alerts**: Response time degradation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation and API docs

## 🔮 Roadmap

### Upcoming Features
- [ ] Mobile application (React Native)
- [ ] Advanced reporting with custom dashboards
- [ ] Integration with accounting software
- [ ] Document management system
- [ ] Advanced workflow automation
- [ ] Multi-language support
- [ ] Advanced analytics and AI insights

### Performance Improvements
- [ ] GraphQL API implementation
- [ ] Advanced caching strategies
- [ ] Database query optimization
- [ ] Microservices architecture
- [ ] Event-driven architecture

---

**Built with ❤️ for construction companies worldwide**