# 🚀 Career Counseling Platform - Quick Start Guide

## ✅ **Current Status: FULLY WORKING** ✅

Both frontend and backend are successfully running without any errors!

## 🎯 **Quick Start Commands**

### **Option 1: Use the Startup Script (Recommended)**
```bash
# Navigate to project root
cd "C:\Users\hp\Desktop\PEC Hackthon\career-counseling-platform"

# Run the startup script (automatically handles port conflicts)
.\start-project.bat
```

### **Option 2: Manual Start (Two Terminals)**

**Terminal 1 - Backend:**
```bash
cd "C:\Users\hp\Desktop\PEC Hackthon\career-counseling-platform\backend"
npm start
```

**Terminal 2 - Frontend:**
```bash
cd "C:\Users\hp\Desktop\PEC Hackthon\career-counseling-platform\frontend"
npm run dev
```

## 🌐 **Access Your Application**

Once both services are running:

- **🌟 Main Application:** http://localhost:3000
- **🔧 Backend API:** http://localhost:3001
- **📚 API Documentation:** http://localhost:3001/api/docs

## 🛠️ **VS Code Debugging**

The project includes comprehensive VS Code debugging configurations:

1. **Press F5** in VS Code
2. **Select "🚀 Launch Full Stack App"** to start both frontend and backend with debugging
3. **Set breakpoints** in your code for debugging

## 🔧 **Troubleshooting**

### **If you get "Port already in use" errors:**

1. **Kill existing processes:**
   ```bash
   # Find what's using the ports
   netstat -ano | findstr :3001
   netstat -ano | findstr :3000
   
   # Kill the processes (replace PID with actual process ID)
   taskkill /PID <PID> /F
   ```

2. **Or use the startup script** which automatically handles this.

## 📋 **What's Working**

✅ **Backend (NestJS):**
- SQLite database with all entities
- JWT Authentication + OAuth (Google/LinkedIn)
- All API endpoints (15+ routes)
- Swagger documentation
- TypeORM with proper SQLite compatibility

✅ **Frontend (Next.js):**
- React 18 with TypeScript
- TailwindCSS styling
- Responsive design
- API integration ready

✅ **Database:**
- SQLite database created automatically
- All entities properly mapped
- No enum/jsonb compatibility issues

✅ **Development Tools:**
- VS Code debugging configurations
- Hot reload for both frontend and backend
- Comprehensive error handling

## 🚀 **Features Available**

The career counseling platform includes:

1. **User Authentication** (JWT + OAuth)
2. **Career Assessments** (Aptitude, Personality, Interest, Skills)
3. **Mentorship Booking System**
4. **Personalized Career Roadmaps**
5. **Resource Library**
6. **Payment Processing** (Stripe integration)
7. **Admin Dashboard**
8. **Notification System**
9. **Progress Tracking**

## 🎉 **Success!**

Your career counseling platform is **fully operational** and ready for demonstration or further development!

**No errors detected** - all previous SQLite compatibility issues have been resolved.