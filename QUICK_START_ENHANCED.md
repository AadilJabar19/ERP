# Quick Start Guide - Enhanced Version

## 🚀 Installation

### 1. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

### 2. Environment Setup

**Backend `.env`:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/claryx-erp
JWT_SECRET=your-jwt-secret-key-here
SESSION_SECRET=your-session-secret-key-here
PORT=5000
NODE_ENV=development

# Redis (optional but recommended)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
CACHE_TTL=3600

# Sentry (optional)
SENTRY_DSN=

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

**Frontend `.env`:**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SENTRY_DSN=
REACT_APP_ENVIRONMENT=development
```

### 3. Database Setup

```bash
cd backend

# Add database indexes (recommended)
node scripts/addIndexes.js

# Create admin user
npm run create-admin

# (Optional) Seed sample data
npm run seed
```

### 4. Start Redis (Optional but Recommended)

```bash
# Windows
redis-server

# macOS/Linux
redis-server
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 6. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

**Default Login:**
- Email: admin@test.com
- Password: admin123

---

## 🐳 Docker Quick Start (Alternative)

### 1. Start with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

---

## 🧪 Testing

### Frontend Tests
```bash
cd frontend

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in UI mode
npm test -- --ui

# Run tests in watch mode
npm test -- --watch
```

### Backend Tests
```bash
cd backend

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

---

## 📊 Development Tools

### React Query Devtools
- Automatically available in development
- Press the React Query icon in bottom-right corner
- View queries, mutations, and cache

### Sentry Dashboard
- Sign up at https://sentry.io
- Add your DSN to environment variables
- View errors and performance in Sentry dashboard

### Redis CLI
```bash
# Connect to Redis
redis-cli

# View all keys
KEYS *

# Get cached data
GET cache:key-name

# Clear all cache
FLUSHDB
```

---

## 🔍 Verify Installation

### 1. Check Backend Health
```bash
curl http://localhost:5000/api/health
```

### 2. Check Database Connection
```bash
cd backend
npm run verify
```

### 3. Check Redis Connection
```bash
redis-cli ping
# Should return: PONG
```

### 4. Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

---

## 📝 Common Commands

### Backend
```bash
npm run dev              # Start development server
npm run verify           # Verify setup
npm run create-admin     # Create admin user
npm run seed             # Seed sample data
npm run add-indexes      # Add database indexes
npm test                 # Run tests
```

### Frontend
```bash
npm start                # Start development server
npm run build            # Build for production
npm test                 # Run tests
npm test -- --ui         # Run tests with UI
```

### Docker
```bash
docker-compose up        # Start all services
docker-compose up -d     # Start in background
docker-compose down      # Stop all services
docker-compose logs -f   # View logs
docker-compose ps        # View running services
```

---

## 🎯 Next Steps

1. ✅ **Login** to the application
2. ✅ **Explore** different modules
3. ✅ **Create** some test data
4. ✅ **Check** React Query Devtools
5. ✅ **Review** the ENHANCEMENTS_GUIDE.md
6. ✅ **Start** migrating components to use new features

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### MongoDB Not Running
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Redis Not Running
```bash
# Windows
redis-server

# macOS
brew services start redis

# Linux
sudo systemctl start redis
```

### Clear Cache and Restart
```bash
# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Documentation

- **ENHANCEMENTS_GUIDE.md** - Detailed guide for all enhancements
- **ENHANCEMENT_INSTALLATION.md** - Installation instructions
- **API_DOCUMENTATION.md** - API reference
- **SETUP_GUIDE.md** - Original setup guide
- **TESTING_GUIDE.md** - Testing documentation

---

## 🎉 You're Ready!

Your enhanced Claryx ERP system is now running with:
- ✅ React Query for data fetching
- ✅ React Hook Form + Zod for validation
- ✅ Sentry for error tracking
- ✅ Redis for caching
- ✅ File upload handling
- ✅ Database indexing
- ✅ Testing infrastructure
- ✅ Docker support
- ✅ Logging system

Happy coding! 🚀
