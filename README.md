# Claryx ERP System - MERN Stack

A comprehensive Enterprise Resource Planning (ERP) system built with the MERN stack, featuring real-time updates, advanced security, and production-ready modules.

## 🚀 Features

### Core Modules
- **Human Resource Management (HRM)** - Employee management, leave tracking, performance reviews, training
- **Inventory Management** - Multi-warehouse, stock tracking, categories, alerts
- **Sales Management** - Lead pipeline, quotes, orders, analytics
- **Customer Relationship Management (CRM)** - Customer profiles, contact management
- **Project Management** - Project tracking, milestones, team assignments
- **Financial Management** - Invoicing, expense tracking, payroll

### Advanced Features
- **Real-time Updates** - WebSocket integration for live notifications
- **CSRF Protection** - Enterprise-level security
- **Role-based Access Control** - Admin, Manager, Employee permissions
- **Advanced Analytics** - Comprehensive reporting and dashboards
- **Multi-location Support** - Warehouse and inventory management
- **Audit Trails** - Complete change tracking

## 🛠️ Tech Stack

**Frontend:**
- React.js with Hooks
- React Router for navigation
- Socket.io-client for real-time updates
- Axios for API calls
- CSS3 for styling

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- Socket.io for WebSocket connections
- JWT authentication
- CSRF protection
- Express sessions

**Security:**
- JWT token authentication
- CSRF token validation
- Role-based authorization
- Secure session management
- Input validation and sanitization

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/claryx-erp
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret-key
PORT=5000
```

Start backend:
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000
```

Start frontend:
```bash
npm start
```

## 🔐 Default Login
- **Email:** admin@test.com
- **Password:** admin123
- **Role:** Admin

## 📱 Usage

1. **Login** with admin credentials
2. **Navigate** through different modules using the sidebar
3. **Add data** using the "Add" buttons in each module
4. **View real-time updates** in the notification panel
5. **Manage permissions** based on user roles

## 🏗️ Project Structure

```
claryx-erp-system/
├── backend/
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, CSRF, validation
│   ├── socket/          # WebSocket handlers
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React contexts
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/csrf-token` - Get CSRF token

### Dashboard
- `GET /api/dashboard/analytics` - Get comprehensive dashboard analytics

### HRM
- `GET /api/hrm/employees` - Get employees
- `POST /api/hrm/employees` - Create employee
- `GET /api/hrm/leaves` - Get leave requests
- `POST /api/hrm/leaves` - Apply for leave
- `GET /api/hrm/analytics` - Get HRM analytics

### Inventory
- `GET /api/inventory/products` - Get products
- `POST /api/inventory/products` - Create product
- `GET /api/inventory/warehouses` - Get warehouses
- `POST /api/inventory/stock-movements` - Record stock movement
- `GET /api/inventory/analytics` - Get inventory analytics
- `GET /api/inventory/alerts` - Get stock alerts

### Sales
- `GET /api/sales/leads` - Get leads
- `POST /api/sales/leads` - Create lead
- `GET /api/sales/quotes` - Get quotes
- `POST /api/sales/quotes` - Create quote
- `GET /api/sales/analytics` - Get sales analytics
- `GET /api/sales/pipeline` - Get sales pipeline

### CRM
- `GET /api/customers` - Get customers
- `POST /api/customers` - Create customer
- `GET /api/customers/analytics` - Get customer analytics

### Projects
- `GET /api/projects` - Get projects
- `POST /api/projects` - Create project
- `GET /api/projects/analytics` - Get project analytics

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/analytics` - Get attendance analytics

### Events
- `GET /api/events` - Get events
- `POST /api/events` - Create event
- `GET /api/events/analytics` - Get event analytics

## 📊 Analytics & Reporting

- **Dynamic Dashboard** - Real-time overview with interactive charts
- **Module Analytics** - Comprehensive analytics for each module
- **Interactive Charts** - Line, Bar, and Pie charts using Recharts
- **Performance Metrics** - KPIs and trend analysis
- **Real-time Data** - Live updates from database

## 🔄 Real-time Events

- **Inventory Updates** - Stock changes, low stock alerts
- **Sales Activity** - New orders, lead updates
- **Employee Activity** - Check-ins, leave approvals
- **System Notifications** - Important alerts

## 🛡️ Security Features

- JWT token authentication
- CSRF protection on all forms
- Role-based access control
- Session management
- Input validation
- SQL injection prevention
- XSS protection

## 🚀 Deployment

### Backend Deployment
1. Set environment variables:
   ```env
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-production-jwt-secret
   SESSION_SECRET=your-production-session-secret
   PORT=5000
   ```
2. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Update `.env` for production:
   ```env
   REACT_APP_API_URL=https://your-backend-domain.com
   ```
2. Build the project: `npm run build`
3. Deploy build folder to static hosting (Netlify, Vercel, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

## 🎯 Key Features Implemented

- ✅ **Dynamic Analytics** - All data fetched from database in real-time
- ✅ **Interactive Charts** - Recharts integration with live data
- ✅ **Performance Optimized** - Consolidated API calls and efficient queries
- ✅ **Modern UI/UX** - Enhanced with icons, gradients, and responsive design
- ✅ **Error Handling** - Comprehensive error handling and fallbacks
- ✅ **Environment Configuration** - Configurable API endpoints
- ✅ **Real-time Updates** - WebSocket integration for live notifications
- ✅ **Role-based Access** - Admin, Manager, Employee permissions
- ✅ **CSRF Protection** - Enterprise-level security
- ✅ **Comprehensive Modules** - HRM, Inventory, Sales, CRM, Projects, Calendar, Attendance

**Built with ❤️ using the MERN Stack + Recharts**