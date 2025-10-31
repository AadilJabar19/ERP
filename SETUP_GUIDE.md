# Claryx ERP System - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js v14+ installed
- MongoDB installed and running
- Git (optional)

### Installation Steps

#### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/claryx-erp
JWT_SECRET=your_jwt_secret_key_here_change_in_production
SESSION_SECRET=your_session_secret_key_here_change_in_production
PORT=5000
NODE_ENV=development
```

**Important:** Change the secret keys in production!

#### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000
```

#### 3. Database Setup

Start MongoDB:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

Create admin user:
```bash
cd backend
node scripts/createAdmin.js
```

Verify setup:
```bash
node scripts/verifySetup.js
```

#### 4. Start the Application

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

#### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Default Login:
  - Email: admin@test.com
  - Password: admin123

## 📋 Verification Checklist

Run the verification script to check your setup:
```bash
cd backend
node scripts/verifySetup.js
```

This will check:
- ✅ MongoDB connection
- ✅ Environment variables
- ✅ Database collections
- ✅ Admin user existence
- ✅ Data counts
- ✅ Database indexes

## 🔧 Common Issues & Solutions

### Issue 1: MongoDB Connection Failed
**Error:** `MongoNetworkError: connect ECONNREFUSED`

**Solution:**
1. Ensure MongoDB is running:
   ```bash
   # Check if MongoDB is running
   # Windows
   tasklist | findstr mongod
   
   # macOS/Linux
   ps aux | grep mongod
   ```
2. Start MongoDB if not running
3. Check MONGODB_URI in .env file

### Issue 2: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
1. Change PORT in backend/.env
2. Update REACT_APP_API_URL in frontend/.env
3. Or kill the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:5000 | xargs kill -9
   ```

### Issue 3: CORS Errors
**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Ensure backend is running on port 5000
2. Check REACT_APP_API_URL in frontend/.env
3. Verify CORS settings in backend/server.js

### Issue 4: JWT Token Errors
**Error:** `JsonWebTokenError: invalid token`

**Solution:**
1. Clear browser localStorage
2. Login again
3. Check JWT_SECRET in backend/.env

### Issue 5: Missing Dependencies
**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

## 🗃️ Database Management

### Seed Sample Data
```bash
cd backend
node scripts/seedData.js
```

### Reset Database
```bash
cd backend
node scripts/dropDB.js
node scripts/createAdmin.js
node scripts/seedData.js
```

### Backup Database
```bash
mongodump --db claryx-erp --out ./backup
```

### Restore Database
```bash
mongorestore --db claryx-erp ./backup/claryx-erp
```

## 🔐 Security Best Practices

1. **Change Default Credentials**
   - Update admin password after first login
   - Use strong passwords (12+ characters)

2. **Update Secret Keys**
   - Generate strong JWT_SECRET and SESSION_SECRET
   - Never commit .env files to version control

3. **Enable HTTPS in Production**
   - Use SSL certificates
   - Update CORS settings

4. **Environment Variables**
   - Use different secrets for dev/prod
   - Store production secrets securely

## 📊 Module Overview

### Core Modules
- **Dashboard** - Overview and analytics
- **HRM** - Employee management, leaves, training, performance, payroll
- **Inventory** - Products, categories, warehouses, stock movements
- **Sales** - Leads, quotes, orders, invoices
- **CRM** - Customer management
- **Projects** - Project tracking and management
- **Finance** - Invoicing and financial management
- **Attendance** - Employee check-in/out system
- **Calendar** - Events and scheduling

### Advanced Features
- **Real-time Updates** - WebSocket notifications
- **Role-based Access** - Admin, Manager, Employee roles
- **Bulk Import** - CSV upload for mass data entry
- **Analytics** - Comprehensive reporting and charts
- **Multi-warehouse** - Inventory across locations

## 🧪 Testing

### Test Backend API
```bash
cd backend
node scripts/testLogin.js
```

### Test Database Connection
```bash
cd backend
node scripts/checkUsers.js
```

## 📦 Production Deployment

### Backend (Heroku Example)
```bash
# Install Heroku CLI
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_production_mongodb_uri
heroku config:set JWT_SECRET=your_production_jwt_secret
heroku config:set SESSION_SECRET=your_production_session_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Frontend (Netlify Example)
```bash
# Build
cd frontend
npm run build

# Deploy build folder to Netlify
# Or use Netlify CLI
netlify deploy --prod --dir=build
```

### Environment Variables for Production
Update frontend/.env:
```env
REACT_APP_API_URL=https://your-backend-domain.com
```

## 🔄 Update & Maintenance

### Update Dependencies
```bash
# Backend
cd backend
npm update

# Frontend
cd frontend
npm update
```

### Check for Vulnerabilities
```bash
npm audit
npm audit fix
```

## 📞 Support & Troubleshooting

### Logs Location
- Backend logs: Console output
- MongoDB logs: Check MongoDB log directory
- Browser console: F12 in browser

### Debug Mode
Enable detailed logging:
```env
NODE_ENV=development
DEBUG=*
```

### Health Check Endpoints
- Backend: http://localhost:5000/
- CSRF Token: http://localhost:5000/api/csrf-token

## 🎯 Next Steps

1. ✅ Complete setup verification
2. ✅ Login with admin credentials
3. ✅ Change default password
4. ✅ Create departments
5. ✅ Add employees
6. ✅ Configure warehouses
7. ✅ Add products
8. ✅ Create customers
9. ✅ Start using the system!

## 📚 Additional Resources

- MongoDB Documentation: https://docs.mongodb.com/
- React Documentation: https://reactjs.org/docs/
- Express Documentation: https://expressjs.com/
- Node.js Documentation: https://nodejs.org/docs/

---

**Need Help?** Open an issue on GitHub or check the troubleshooting section above.
