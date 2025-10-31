# Claryx ERP System - Quick Reference Card

## 🚀 Quick Start Commands

### Backend
```bash
cd backend
npm install                    # Install dependencies
npm run dev                    # Start development server
npm run verify                 # Verify setup
npm run create-admin          # Create admin user
npm run seed                  # Seed sample data
```

### Frontend
```bash
cd frontend
npm install                    # Install dependencies
npm start                     # Start development server
npm run build                 # Build for production
```

---

## 🔑 Default Credentials

```
Email: admin@test.com
Password: admin123
```

**⚠️ Change password after first login!**

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/api/health |
| CSRF Token | http://localhost:5000/api/csrf-token |

---

## 📁 Project Structure

```
claryx-erp-system/
├── backend/
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, CSRF, validation
│   ├── scripts/         # Utility scripts
│   ├── socket/          # WebSocket handlers
│   ├── .env            # Environment variables
│   └── server.js       # Main server file
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React contexts
│   │   ├── utils/       # Utility functions
│   │   └── config/      # Configuration
│   └── .env            # Environment variables
│
└── Documentation files
```

---

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/claryx-erp
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_key_here
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

---

## 📊 Core Modules

| Module | Route | Description |
|--------|-------|-------------|
| Dashboard | `/` | Overview & analytics |
| HRM | `/hrm` | Employee management |
| Inventory | `/inventory` | Product & stock management |
| Sales | `/sales` | Leads, quotes, orders |
| CRM | `/crm` | Customer management |
| Projects | `/projects` | Project tracking |
| Finance | `/finance` | Financial management |
| Attendance | `/attendance` | Check-in/out system |
| Calendar | `/calendar` | Events & scheduling |

---

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all modules |
| **Manager** | Most modules, limited delete |
| **Employee** | View own data, basic operations |

---

## 🛠️ Common Tasks

### Create Admin User
```bash
cd backend
npm run create-admin
```

### Verify System Setup
```bash
cd backend
npm run verify
```

### Reset Database
```bash
cd backend
npm run drop-db
npm run create-admin
npm run seed
```

### Check System Health
```bash
curl http://localhost:5000/api/health
```

### Test Login
```bash
cd backend
npm run test-login
```

---

## 📡 API Quick Reference

### Authentication
```bash
# Login
POST /api/auth/login
Body: { "email": "...", "password": "..." }

# Register
POST /api/auth/register
Body: { "name": "...", "email": "...", "password": "...", "role": "..." }
```

### HRM
```bash
# Get employees
GET /api/hrm/employees

# Create employee
POST /api/hrm/employees
Body: { employeeId, personalInfo, employment, ... }

# Get leaves
GET /api/hrm/leaves

# Apply leave
POST /api/hrm/leaves
Body: { leaveType, startDate, endDate, reason }
```

### Inventory
```bash
# Get products
GET /api/inventory/products

# Create product
POST /api/inventory/products
Body: { productId, name, sku, pricing, ... }

# Stock movement
POST /api/inventory/stock-movements
Body: { product, warehouse, movementType, quantity }
```

### Sales
```bash
# Get leads
GET /api/sales/leads

# Create lead
POST /api/sales/leads
Body: { companyName, contactPerson, contactInfo, ... }

# Get quotes
GET /api/sales/quotes

# Create quote
POST /api/sales/quotes
Body: { customer, items, ... }
```

---

## 🔍 Troubleshooting Quick Fixes

### MongoDB Not Running
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Clear Browser Cache
```
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
```

### Reset Auth Token
```javascript
// In browser console
localStorage.removeItem('token');
window.location.href = '/login';
```

---

## 📦 Useful Utilities

### API Client
```javascript
import apiClient from '../utils/apiClient';

// HRM
await apiClient.hrm.getEmployees();
await apiClient.hrm.createEmployee(data);

// Inventory
await apiClient.inventory.getProducts();
await apiClient.inventory.createProduct(data);

// Sales
await apiClient.sales.getLeads();
await apiClient.sales.createLead(data);
```

### Error Handler
```javascript
import { handleApiError } from '../utils/errorHandler';

try {
  await apiClient.hrm.createEmployee(data);
} catch (error) {
  const { message, type } = handleApiError(error);
  showError(message);
}
```

### Validation
```javascript
import { validateEmployeeForm } from '../utils/validation';

const { isValid, errors } = validateEmployeeForm(formData);
if (!isValid) {
  console.log(errors);
}
```

---

## 🎨 UI Components

### Modal
```javascript
import Modal from '../components/Modal';

<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Title">
  {/* Content */}
</Modal>
```

### Loading Spinner
```javascript
import LoadingSpinner from '../components/LoadingSpinner';

{loading ? <LoadingSpinner /> : <Content />}
```

### Toast Notifications
```javascript
import { useToast } from '../context/ToastContext';

const { success, error, showConfirm } = useToast();

success('Operation successful!');
error('Operation failed!');
showConfirm('Title', 'Message', onConfirm);
```

---

## 🔄 Real-time Events

### WebSocket Connection
```javascript
import { useSocket } from '../context/SocketContext';

const socket = useSocket();

useEffect(() => {
  socket.on('inventory_updated', (data) => {
    console.log('Inventory updated:', data);
  });
  
  return () => socket.off('inventory_updated');
}, [socket]);
```

### Available Events
- `inventory_updated` - Stock changed
- `inventory_alert` - Low stock
- `new_sale` - New sale created
- `new_lead` - New lead added
- `employee_checkin` - Employee checked in
- `employee_checkout` - Employee checked out

---

## 📊 Analytics Endpoints

```bash
GET /api/dashboard/analytics      # Dashboard overview
GET /api/hrm/analytics           # HRM statistics
GET /api/inventory/analytics     # Inventory statistics
GET /api/sales/analytics         # Sales statistics
GET /api/customers/analytics     # Customer statistics
GET /api/projects/analytics      # Project statistics
GET /api/attendance/analytics    # Attendance statistics
GET /api/events/analytics        # Event statistics
GET /api/payroll/analytics       # Payroll statistics
```

---

## 🧪 Testing Commands

```bash
# Verify setup
npm run verify

# Test login
npm run test-login

# Check users
npm run check-users

# Health check
curl http://localhost:5000/api/health

# Test API endpoint
curl -X GET http://localhost:5000/api/hrm/employees \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Git Commands

```bash
# Clone repository
git clone <repository-url>

# Create branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "Description"

# Push changes
git push origin feature/new-feature
```

---

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Update JWT_SECRET in production
- [ ] Update SESSION_SECRET in production
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

## 📞 Support Resources

| Resource | Link |
|----------|------|
| Setup Guide | SETUP_GUIDE.md |
| API Documentation | API_DOCUMENTATION.md |
| Testing Guide | TESTING_GUIDE.md |
| Fixes & Improvements | FIXES_AND_IMPROVEMENTS.md |
| MongoDB Docs | https://docs.mongodb.com/ |
| React Docs | https://reactjs.org/docs/ |
| Express Docs | https://expressjs.com/ |

---

## 💡 Pro Tips

1. **Use npm scripts** - They're shortcuts for common tasks
2. **Check health endpoint** - Quick way to verify system status
3. **Use API client** - Cleaner code, easier maintenance
4. **Validate forms** - Use validation utility before submission
5. **Handle errors** - Use error handler for consistent UX
6. **Monitor console** - Check for errors and warnings
7. **Use DevTools** - Network tab for API debugging
8. **Test thoroughly** - Follow testing guide
9. **Document changes** - Keep README updated
10. **Backup database** - Regular backups prevent data loss

---

## 🎯 Next Steps

1. ✅ Complete setup
2. ✅ Verify system health
3. ✅ Login with admin credentials
4. ✅ Change default password
5. ✅ Explore modules
6. ✅ Create test data
7. ✅ Test all features
8. ✅ Review documentation
9. ✅ Customize as needed
10. ✅ Deploy to production

---

**Keep this card handy for quick reference! 📌**

---

**Version:** 1.0.0
**Last Updated:** 2024
