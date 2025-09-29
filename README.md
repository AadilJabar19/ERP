# Enterprise ERP System - MERN Stack

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
MONGODB_URI=mongodb://localhost:27017/mini-erp
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
mini-erp-mern/
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

### HRM
- `GET /api/hrm/employees` - Get employees
- `POST /api/hrm/employees` - Create employee
- `GET /api/hrm/leaves` - Get leave requests
- `POST /api/hrm/leaves` - Apply for leave

### Inventory
- `GET /api/inventory/products` - Get products
- `POST /api/inventory/products` - Create product
- `GET /api/inventory/warehouses` - Get warehouses
- `POST /api/inventory/stock-movements` - Record stock movement

### Sales
- `GET /api/sales/leads` - Get leads
- `POST /api/sales/leads` - Create lead
- `GET /api/sales/quotes` - Get quotes
- `POST /api/sales/quotes` - Create quote

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
1. Set environment variables
2. Configure MongoDB connection
3. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy build folder to static hosting (Netlify, Vercel, etc.)
3. Update API endpoints for production

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

**Built with ❤️ using the MERN Stack**