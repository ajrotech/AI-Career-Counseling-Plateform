# 🎯 Career Counseling Platform

> **A comprehensive web platform that provides students and job seekers with career assessments, personalized roadmaps, mentorship sessions, and access to job market insights.**

## 🌟 Features

### 🎯 Career Assessment Module
- **Interactive Questionnaires**: Comprehensive personality, skills, and interest assessments
- **AI-Powered Analysis**: Advanced algorithms to match users with suitable career paths
- **Progress Tracking**: Visual progress indicators and completion metrics
- **Detailed Results**: Comprehensive reports with career recommendations

### 👥 Mentorship Marketplace
- **Expert Network**: Connect with industry professionals across various fields
- **Advanced Search**: Filter mentors by expertise, experience, location, and availability
- **Booking System**: Seamless scheduling and session management
- **Profile Management**: Detailed mentor profiles with reviews and ratings

### 📊 Market Insights Dashboard
- **Real-time Data**: Live job market trends and salary information
- **Skills Demand**: Analytics on in-demand skills and technologies
- **Industry Analysis**: Growth projections and career opportunities
- **Visualization**: Interactive charts and graphs for data representation

### 🔐 Authentication & Security
- **Multi-factor Authentication**: Email and social login options (Google, LinkedIn)
- **Password Security**: Advanced password strength validation
- **Session Management**: Secure JWT-based authentication
- **Privacy Protection**: GDPR-compliant data handling

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS for responsive design
- **Language**: TypeScript for type safety
- **State Management**: React hooks and context
- **UI Components**: Custom responsive components

### Backend Stack
- **Framework**: NestJS with TypeScript
- **Database**: SQLite for development, PostgreSQL for production
- **ORM**: TypeORM with entity relationships
- **Authentication**: JWT + Passport.js
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Class-validator and DTOs

### Database Schema
- **16 Entity Tables**: Users, Assessments, Mentors, Sessions, etc.
- **Relationship Mapping**: Complete foreign key relationships
- **Data Integrity**: Constraints and validation rules
- **Migration Support**: Automatic schema updates

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 18+ 
npm or yarn
Git
```

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/career-counseling-platform.git
cd career-counseling-platform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application
```bash
# Start backend (Terminal 1)
cd backend
npm start

# Start frontend (Terminal 2)
cd frontend
npm run dev
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api

## 📱 Platform Screenshots

### Homepage
Professional landing page with hero section, feature overview, and platform status

### Career Assessment
Interactive multi-step assessment with progress tracking and detailed results

### Mentorship Marketplace
Advanced mentor search with filters, profiles, and booking system

### User Dashboard
Comprehensive dashboard with analytics, session history, and quick actions

### Market Insights
Data visualization dashboard with job trends and salary information

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#3B82F6 to #8B5CF6)
- **Secondary**: Green (#10B981), Gray (#6B7280)
- **Accent**: Purple (#8B5CF6), Orange (#F59E0B)

### Typography
- **Headers**: Inter font family, bold weights
- **Body**: Inter font family, regular weights
- **Code**: Monospace for technical content

### Components
- **Responsive Grid**: Mobile-first design approach
- **Interactive Elements**: Hover states and smooth transitions
- **Form Controls**: Custom styled inputs with validation
- **Navigation**: Sticky header with mobile hamburger menu

## 🔧 Development

### Project Structure
```
career-counseling-platform/
├── backend/
│   ├── src/
│   │   ├── entities/          # Database entities
│   │   ├── modules/           # Feature modules
│   │   ├── auth/              # Authentication logic
│   │   ├── assessment/        # Assessment service
│   │   └── mentorship/        # Mentorship service
│   ├── dist/                  # Compiled output
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js app router
│   │   ├── components/        # React components
│   │   └── styles/            # CSS and styling
│   └── package.json
├── docs/                      # Documentation
├── scripts/                   # Utility scripts
└── README.md
```

### Available Scripts

#### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server
npm run build      # Build for production
npm run test       # Run tests
```

#### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## 🌐 Deployment

### Frontend (Vercel)
```bash
# Deploy to Vercel
npm run build
vercel --prod
```

### Backend (Railway/Heroku)
```bash
# Build and deploy
npm run build
git push heroku main
```

### Database
- **Development**: SQLite (included)
- **Production**: PostgreSQL on Railway/Heroku

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Information

**Event**: PEC Hackathon 2025  
**Team**: Career Counseling Platform  
**Date**: September 2025  
**Category**: Web Development / Career Tech

### Judges & Demo
- **Live Demo**: http://localhost:3000
- **API Documentation**: http://localhost:3001/api
- **GitHub Repository**: [View Source Code](https://github.com/yourusername/career-counseling-platform)

## 📞 Contact

- **Developer**: Your Name
- **Email**: your.email@example.com
- **LinkedIn**: [Your LinkedIn Profile](https://linkedin.com/in/yourprofile)
- **GitHub**: [Your GitHub Profile](https://github.com/yourusername)

---

⭐ **Star this repository if you found it helpful!**
   cd career-counseling-platform
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm run start:dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local
   # Configure your environment variables
   npm run dev
   ```

4. **Database Setup**
   ```bash
   # Run PostgreSQL locally or use Docker
   docker-compose up -d postgres
   
   # Run migrations
   cd backend
   npm run migration:run
   ```

## 📋 Features

### Core Features
- [x] User Authentication (JWT + OAuth)
- [x] Career Assessments (Aptitude, Personality, Interest)
- [x] Personalized Career Roadmaps
- [x] Mentor Booking System
- [x] Video/Chat Communication
- [x] Learning Resources Management
- [x] Job Market Insights
- [x] Admin Dashboard
- [x] Multi-language Support (English/Urdu)

### Business Model
- **Freemium**: Free basic assessments, premium features for mentorship
- **Subscription**: Monthly/yearly access to premium features
- **Pay-per-session**: Individual mentoring sessions
- **Institutional**: Bulk licenses for educational institutions

## 🔧 Development

### API Documentation
- Swagger UI available at: `http://localhost:3001/api/docs`
- Postman collection: `/docs/api/postman-collection.json`

### Database
- Schema documentation: `/docs/database/schema.md`
- ER diagrams: `/docs/database/er-diagram.png`

### Testing
```bash
# Backend tests
cd backend
npm run test
npm run test:e2e

# Frontend tests
cd frontend
npm run test
npm run test:e2e
```

## 🚀 Deployment

### Production Setup
- Frontend: Deployed on Vercel
- Backend: AWS ECS or Azure Container Instances
- Database: AWS RDS or Azure Database for PostgreSQL
- File Storage: AWS S3 or Azure Blob Storage

### CI/CD Pipeline
- GitHub Actions for automated testing and deployment
- Environment-specific configurations
- Database migration automation

## 📚 Documentation

- [API Documentation](./docs/api/README.md)
- [Database Schema](./docs/database/schema.md)
- [Frontend Components](./docs/frontend/components.md)
- [Deployment Guide](./docs/deployment/README.md)
- [Developer Onboarding](./docs/onboarding/developers.md)
- [Counselor Guide](./docs/onboarding/counselors.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation in `/docs`