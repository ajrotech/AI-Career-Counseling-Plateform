# MongoDB Atlas Deployment Guide

This guide will help you deploy your Career Counseling Platform backend to Vercel with MongoDB Atlas.

## 🗄️ MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (choose M0 Sandbox for free tier)

### 2. Configure Database Access
1. In your Atlas dashboard, go to **Database Access**
2. Click **Add New Database User**
3. Choose **Username and Password** authentication
4. Create a username and strong password
5. Set user privileges to **Read and write to any database**

### 3. Configure Network Access
1. Go to **Network Access**
2. Click **Add IP Address**
3. Choose **Allow access from anywhere** (0.0.0.0/0) for Vercel deployment
4. Or add specific IP ranges if you prefer

### 4. Get Connection String
1. Go to **Clusters** and click **Connect**
2. Choose **Connect your application**
3. Copy the connection string (it looks like):
   ```
   mongodb+srv://username:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. Add your database name: `career_counseling`

Final connection string example:
```
mongodb+srv://myuser:mypassword@cluster0.mongodb.net/career_counseling?retryWrites=true&w=majority
```

## 🚀 Vercel Deployment

### 1. Deploy to Vercel
```bash
cd backend
vercel
```

### 2. Set Environment Variables
In your Vercel dashboard, go to your project settings and add:

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/career_counseling?retryWrites=true&w=majority
PORT=3000
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### 3. Alternative: Set via Vercel CLI
```bash
vercel env add MONGODB_URI
vercel env add NODE_ENV
vercel env add JWT_SECRET
```

## 🔧 Database Configuration

The application automatically detects the environment:

- **Development**: Uses SQLite (`database.sqlite`)
- **Production**: Uses MongoDB Atlas (via `MONGODB_URI`)

## 📊 Key Changes for MongoDB

### Entity Changes
- Primary keys use `ObjectId` instead of UUID
- Removed TypeORM relations (using manual queries instead)
- Added helper `id` getters for string IDs

### Service Changes
- Chat sessions and messages use separate queries
- ObjectId handling for MongoDB compatibility
- No more relation loading (relations: ['messages'])

## ✅ Verification

After deployment, test these endpoints:
- `GET /api/health` - Health check
- `POST /api/chat/sessions` - Create chat session
- `POST /api/chat/messages` - Send message

## 🐛 Troubleshooting

### Common Issues:

1. **Connection Error**: Check your MongoDB URI and network access settings
2. **Authentication Failed**: Verify username/password in connection string
3. **Database Not Found**: MongoDB will create the database automatically on first write
4. **Timeout**: Check if IP whitelist includes 0.0.0.0/0 for Vercel

### Debug Environment Variables:
```bash
vercel env ls
```

### View Logs:
```bash
vercel logs your-deployment-url
```

## 🔄 Migration from SQLite

Your existing SQLite data won't automatically transfer. For production:

1. Export important data from SQLite
2. Use MongoDB Compass or scripts to import data
3. Or start fresh (recommended for demo/development)

## 📚 Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [TypeORM MongoDB Guide](https://typeorm.io/mongodb)