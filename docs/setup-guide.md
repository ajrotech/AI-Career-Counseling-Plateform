# Career Counseling Platform - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- PostgreSQL 14+
- Git
- (Optional) Docker and Docker Compose

### Development Setup

#### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd career-counseling-platform
   ```

2. **Start with Docker Compose**
   ```bash
   # Start all services (PostgreSQL, Redis, Backend, Frontend)
   docker-compose up -d
   
   # Check if services are running
   docker-compose ps
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api/docs

#### Option 2: Manual Setup

1. **Database Setup**
   ```bash
   # Install PostgreSQL locally
   # Create database
   createdb career_counseling
   
   # Run database setup
   cd database
   
   # For Windows PowerShell:
   .\init.ps1
   
   # For Linux/Mac:
   ./init.sh
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment variables
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Start development server
   npm run start:dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Copy environment variables
   cp .env.local.example .env.local
   # Edit .env.local with your API URL
   
   # Start development server
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/career_counseling
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=career_counseling

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

#### Frontend (.env.local)
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### OAuth Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback` (Backend)
   - `http://localhost:3000/api/auth/callback/google` (Frontend)

#### LinkedIn OAuth
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create a new app
3. Add OAuth 2.0 redirect URLs:
   - `http://localhost:3001/auth/linkedin/callback`

### Stripe Setup
1. Create account at [Stripe](https://stripe.com)
2. Get test API keys from dashboard
3. Set up webhooks for subscription events

## 📊 Database Management

### Migrations
```bash
cd backend

# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert

# Sync schema (development only)
npm run schema:sync
```

### Seeding Data
```bash
# Run seed script
npm run seed
```

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests
```bash
cd frontend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 📝 API Documentation

### Swagger UI
- **URL**: http://localhost:3001/api/docs
- **Features**: Interactive API testing, request/response examples
- **Authentication**: Click "Authorize" and enter JWT token

### API Endpoints Overview

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/google` - Google OAuth
- `GET /auth/linkedin` - LinkedIn OAuth
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset
- `GET /auth/verify-email` - Email verification

#### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update profile
- `GET /users/mentors` - List mentors

#### Assessments
- `GET /assessments` - List assessments
- `POST /assessments/:id/take` - Take assessment
- `GET /assessments/results` - Get user results

#### Bookings
- `GET /bookings` - List user bookings
- `POST /bookings` - Create booking
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (AWS/Azure)
1. Build Docker image
2. Push to container registry
3. Deploy to ECS/Container Instances
4. Set up RDS/Database for PostgreSQL

### Database Migration
```bash
# Production migration
npm run migration:run -- --env=production
```

## 🔍 Monitoring & Debugging

### Logs
```bash
# View backend logs
docker-compose logs backend -f

# View frontend logs
docker-compose logs frontend -f

# View database logs
docker-compose logs postgres -f
```

### Health Checks
- Backend health: `GET http://localhost:3001/`
- Database connection: Check backend logs for "Database connected"

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Check database exists
psql -h localhost -U postgres -l | grep career_counseling
```

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5432  # PostgreSQL

# Kill process
kill -9 <PID>
```

#### Docker Issues
```bash
# Reset Docker environment
docker-compose down -v
docker-compose up --build
```

#### OAuth Errors
- Check redirect URLs match exactly
- Verify client ID/secret are correct
- Ensure APIs are enabled in provider console

### Getting Help
1. Check logs first: `docker-compose logs <service>`
2. Verify environment variables are set correctly
3. Check API documentation at `/api/docs`
4. Review database schema in `/database/schema.sql`

## 📚 Development Workflow

### Adding New Features
1. Create feature branch: `git checkout -b feature/new-feature`
2. Add backend API endpoints in `/backend/src/modules/`
3. Create database migrations if needed
4. Add frontend components in `/frontend/src/`
5. Write tests for new functionality
6. Update API documentation
7. Submit pull request

### Code Quality
- Backend: ESLint + Prettier configured
- Frontend: ESLint + Prettier + TypeScript strict mode
- Database: Migration-based schema changes
- Testing: Unit tests required for services/components

This setup guide provides everything needed to get the Career Counseling Platform running locally and prepare it for production deployment.