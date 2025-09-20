# Project Quick Start Guide

## 🚀 How to Run Career Counseling Platform

### Prerequisites
- Node.js 18+ installed
- Git installed

### Quick Setup (5 minutes)

1. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend  
   cd ../frontend
   npm install
   ```

2. **Create Environment Files**
   
   **Backend (.env):**
   ```env
   # Simple SQLite setup
   DATABASE_TYPE=sqlite
   DATABASE_PATH=database.sqlite
   
   # JWT secrets (change these!)
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-here
   
   # Basic config
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```
   
   **Frontend (.env.local):**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   NODE_ENV=development
   ```

3. **Start the Applications**
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run start:dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd frontend  
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api (when available)

### What You'll See

- ✅ **Frontend**: Next.js app with modern UI components
- ✅ **Backend**: NestJS API with authentication endpoints
- ✅ **Database**: SQLite (auto-created)
- ✅ **Authentication**: JWT-based auth system
- ✅ **Swagger Docs**: Interactive API documentation

### Features Available

1. **User Registration/Login**
2. **Career Assessments**  
3. **Mentor Booking System**
4. **Career Roadmaps**
5. **Admin Dashboard**
6. **Payment Integration (Stripe)**
7. **Real-time Notifications**

### Troubleshooting

**Port already in use:**
```bash
# Change ports in .env files
# Backend: PORT=3002
# Frontend: PORT=3001
```

**Database issues:**
```bash
# Delete and recreate
rm backend/database.sqlite
# Restart backend server
```

**Module not found:**
```bash
# Reinstall dependencies
npm install
```

### Next Steps

1. **Setup PostgreSQL** (production database)
2. **Configure OAuth** (Google/LinkedIn login)
3. **Setup Email Service** (SMTP)
4. **Deploy to Cloud** (Vercel + Railway/AWS)

---

## 🛠️ Development Workflow

### Backend Development
```bash
cd backend
npm run start:dev    # Development with hot reload
npm run build        # Production build
npm run test         # Run tests
```

### Frontend Development  
```bash
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Code linting
```

### Database Management
```bash
# View database (install DB Browser for SQLite)
# File: backend/database.sqlite

# Reset database
rm backend/database.sqlite
# Restart backend (auto-creates tables)
```

---

## 📚 Architecture Overview

```
career-counseling-platform/
├── backend/                 # NestJS API Server
│   ├── src/
│   │   ├── entities/       # Database models
│   │   ├── modules/        # Feature modules
│   │   ├── config/         # Configuration
│   │   └── main.ts        # Entry point
│   ├── database.sqlite    # SQLite database
│   └── package.json
│
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── components/    # UI Components
│   │   ├── pages/         # App pages
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utilities
│   └── package.json
│
└── README.md              # This file
```

## 🎯 Key Technologies

- **Backend**: NestJS, TypeORM, SQLite/PostgreSQL, JWT, Swagger
- **Frontend**: Next.js 14, React, TailwindCSS, TypeScript
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Authentication**: JWT + OAuth (Google/LinkedIn)
- **Payment**: Stripe integration
- **Deployment**: Vercel (frontend) + Railway/AWS (backend)

Happy coding! 🚀