# Claryx ERP System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
All responses follow this format:
```json
{
  "data": {},
  "message": "Success message",
  "error": "Error message (if any)"
}
```

---

## 🔐 Authentication Endpoints

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "Admin User",
    "email": "admin@test.com",
    "role": "admin"
  }
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "employee"
}
```

### Get CSRF Token
```http
GET /csrf-token
```

---

## 👥 HRM Endpoints

### Employees

#### Get All Employees
```http
GET /hrm/employees?page=1&limit=10&search=john&department=IT&status=active
Authorization: Bearer <token>
```

#### Create Employee
```http
POST /hrm/employees
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "EMP001",
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@company.com"
  },
  "contactInfo": {
    "phone": "+1234567890"
  },
  "employment": {
    "department": "IT",
    "position": "Developer"
  },
  "compensation": {
    "baseSalary": 75000
  }
}
```

#### Update Employee
```http
PUT /hrm/employees/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Employee
```http
DELETE /hrm/employees/:id
Authorization: Bearer <token>
```

#### Bulk Upload Employees
```http
POST /hrm/employees/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "employees": [
    {
      "employeeId": "EMP001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@company.com",
      "phone": "+1234567890",
      "department": "IT",
      "position": "Developer",
      "baseSalary": "75000"
    }
  ]
}
```

### Leaves

#### Get All Leaves
```http
GET /hrm/leaves?employee=<id>&status=pending&leaveType=annual
Authorization: Bearer <token>
```

#### Apply Leave
```http
POST /hrm/leaves
Authorization: Bearer <token>
Content-Type: application/json

{
  "leaveType": "annual",
  "startDate": "2024-01-15",
  "endDate": "2024-01-20",
  "reason": "Vacation",
  "totalDays": 5
}
```

#### Approve/Reject Leave
```http
PATCH /hrm/leaves/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "approved": true,
  "rejectionReason": "Optional reason if rejected"
}
```

### Training

#### Get All Training Programs
```http
GET /hrm/training?category=technical&type=online&status=active
Authorization: Bearer <token>
```

#### Create Training
```http
POST /hrm/training
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "React Advanced Training",
  "category": "technical",
  "type": "online",
  "duration": 40,
  "startDate": "2024-02-01",
  "endDate": "2024-02-10",
  "maxParticipants": 20
}
```

### Performance Reviews

#### Get Performance Reviews
```http
GET /hrm/performance?employee=<id>&reviewType=annual&year=2024
Authorization: Bearer <token>
```

#### Create Performance Review
```http
POST /hrm/performance
Authorization: Bearer <token>
Content-Type: application/json

{
  "employee": "employee_id",
  "reviewType": "annual",
  "reviewPeriod": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  },
  "overallRating": 4,
  "comments": "Excellent performance"
}
```

### Departments

#### Get All Departments
```http
GET /hrm/departments
Authorization: Bearer <token>
```

#### Create Department
```http
POST /hrm/departments
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Engineering",
  "manager": "employee_id",
  "budget": 500000,
  "description": "Engineering department"
}
```

### HRM Analytics
```http
GET /hrm/analytics
Authorization: Bearer <token>
```

---

## 💰 Payroll Endpoints

### Get All Payrolls
```http
GET /payroll?employee=<id>&month=1&year=2024&status=paid
Authorization: Bearer <token>
```

### Process Payroll
```http
POST /payroll
Authorization: Bearer <token>
Content-Type: application/json

{
  "employee": "employee_id",
  "payPeriod": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "earnings": {
    "baseSalary": 5000,
    "overtime": 500,
    "bonuses": 1000
  },
  "deductions": 500
}
```

### Update Payroll Status
```http
PATCH /payroll/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "paid"
}
```

### Payroll Analytics
```http
GET /payroll/analytics
Authorization: Bearer <token>
```

---

## 📦 Inventory Endpoints

### Products

#### Get All Products
```http
GET /inventory/products?page=1&limit=10&search=laptop&category=<id>&status=active&lowStock=true
Authorization: Bearer <token>
```

#### Create Product
```http
POST /inventory/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "PROD001",
  "name": "Laptop",
  "sku": "LAP-001",
  "category": "category_id",
  "pricing": {
    "cost": 800,
    "sellingPrice": 1200
  },
  "inventory": {
    "stockLevels": {
      "reorderPoint": 10,
      "maxStock": 100
    }
  }
}
```

#### Bulk Upload Products
```http
POST /inventory/products/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "products": [
    {
      "productId": "PROD001",
      "name": "Laptop",
      "sku": "LAP-001",
      "cost": "800",
      "sellingPrice": "1200",
      "reorderPoint": "10",
      "maxStock": "100"
    }
  ]
}
```

### Categories

#### Get All Categories
```http
GET /inventory/categories
Authorization: Bearer <token>
```

#### Create Category
```http
POST /inventory/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic items"
}
```

### Warehouses

#### Get All Warehouses
```http
GET /inventory/warehouses
Authorization: Bearer <token>
```

#### Create Warehouse
```http
POST /inventory/warehouses
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Main Warehouse",
  "location": "New York",
  "capacity": {
    "totalSpace": 10000
  }
}
```

### Stock Movements

#### Get Stock Movements
```http
GET /inventory/stock-movements
Authorization: Bearer <token>
```

#### Create Stock Movement
```http
POST /inventory/stock-movements
Authorization: Bearer <token>
Content-Type: application/json

{
  "product": "product_id",
  "warehouse": "warehouse_id",
  "movementType": "in",
  "quantity": 50,
  "reason": "Purchase order"
}
```

### Inventory Analytics
```http
GET /inventory/analytics
Authorization: Bearer <token>
```

### Stock Alerts
```http
GET /inventory/alerts
Authorization: Bearer <token>
```

---

## 💼 Sales Endpoints

### Leads

#### Get All Leads
```http
GET /sales/leads?page=1&limit=10&status=new&assignedTo=<id>&source=website
Authorization: Bearer <token>
```

#### Create Lead
```http
POST /sales/leads
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyName": "ABC Corp",
  "contactPerson": "John Doe",
  "contactInfo": {
    "email": "john@abc.com",
    "phone": "+1234567890"
  },
  "source": "website",
  "priority": "high",
  "opportunity": {
    "value": 50000,
    "probability": 70
  }
}
```

#### Bulk Upload Leads
```http
POST /sales/leads/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "leads": [
    {
      "companyName": "ABC Corp",
      "contactPerson": "John Doe",
      "email": "john@abc.com",
      "phone": "+1234567890",
      "source": "website",
      "priority": "high",
      "opportunityValue": "50000",
      "probability": "70"
    }
  ]
}
```

### Quotes

#### Get All Quotes
```http
GET /sales/quotes?status=pending&customer=<id>
Authorization: Bearer <token>
```

#### Create Quote
```http
POST /sales/quotes
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer": "customer_id",
  "items": [
    {
      "product": "product_id",
      "quantity": 10,
      "unitPrice": 100
    }
  ]
}
```

### Sales Orders

#### Get All Orders
```http
GET /sales/orders?status=pending&customer=<id>
Authorization: Bearer <token>
```

#### Create Order
```http
POST /sales/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer": "customer_id",
  "items": [
    {
      "product": "product_id",
      "quantity": 5,
      "unitPrice": 100
    }
  ]
}
```

### Sales Analytics
```http
GET /sales/analytics
Authorization: Bearer <token>
```

### Sales Pipeline
```http
GET /sales/pipeline
Authorization: Bearer <token>
```

---

## 👤 Customer Endpoints

### Get All Customers
```http
GET /customers?page=1&limit=10&search=abc&status=active
Authorization: Bearer <token>
```

### Create Customer
```http
POST /customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyName": "ABC Corporation",
  "contactInfo": {
    "email": "contact@abc.com",
    "phone": "+1234567890"
  },
  "billingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "country": "USA"
  }
}
```

### Customer Analytics
```http
GET /customers/analytics
Authorization: Bearer <token>
```

---

## 📊 Project Endpoints

### Get All Projects
```http
GET /projects?status=active&priority=high
Authorization: Bearer <token>
```

### Create Project
```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectName": "Website Redesign",
  "description": "Complete website overhaul",
  "startDate": "2024-01-01",
  "endDate": "2024-06-30",
  "budget": 100000,
  "priority": "high",
  "team": ["employee_id1", "employee_id2"]
}
```

### Project Analytics
```http
GET /projects/analytics
Authorization: Bearer <token>
```

---

## 📅 Attendance Endpoints

### Get Attendance Records
```http
GET /attendance?employee=<id>&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

### Check In
```http
POST /attendance/checkin
Authorization: Bearer <token>
Content-Type: application/json

{
  "employee": "employee_id"
}
```

### Check Out
```http
POST /attendance/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "employee": "employee_id"
}
```

### Attendance Analytics
```http
GET /attendance/analytics
Authorization: Bearer <token>
```

---

## 📆 Event/Calendar Endpoints

### Get All Events
```http
GET /events?startDate=2024-01-01&endDate=2024-12-31&type=meeting
Authorization: Bearer <token>
```

### Create Event
```http
POST /events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Team Meeting",
  "description": "Monthly team sync",
  "startDate": "2024-01-15T10:00:00Z",
  "endDate": "2024-01-15T11:00:00Z",
  "type": "meeting",
  "attendees": ["employee_id1", "employee_id2"]
}
```

### Event Analytics
```http
GET /events/analytics
Authorization: Bearer <token>
```

---

## 📈 Dashboard Endpoints

### Get Dashboard Analytics
```http
GET /dashboard/analytics
Authorization: Bearer <token>
```

**Response includes:**
- Overview statistics
- Recent activity
- Trends and charts
- Alerts
- Upcoming events

---

## 🔒 Role-Based Access Control

### Roles
- **admin**: Full access to all endpoints
- **manager**: Access to most endpoints except admin functions
- **employee**: Limited access to personal data and basic operations

### Protected Endpoints
Endpoints marked with role requirements:
- `[admin]` - Admin only
- `[admin, manager]` - Admin and Manager
- `[admin, manager, employee]` - All authenticated users

---

## 📝 Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

## 🔄 WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:5000');
```

### Events
- `inventory_updated` - Product stock changed
- `inventory_alert` - Low stock alert
- `new_sale` - New sale created
- `new_lead` - New lead added
- `employee_checkin` - Employee checked in
- `employee_checkout` - Employee checked out

---

## 📚 Best Practices

1. **Always include Authorization header** for protected endpoints
2. **Use pagination** for list endpoints (page, limit)
3. **Handle errors gracefully** - Check response status
4. **Validate data** before sending requests
5. **Use HTTPS** in production
6. **Store tokens securely** - Never in localStorage for sensitive apps
7. **Implement rate limiting** on client side
8. **Cache responses** where appropriate

---

## 🧪 Testing with cURL

### Login Example
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

### Get Employees Example
```bash
curl -X GET http://localhost:5000/api/hrm/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

**Last Updated:** 2024
**API Version:** 1.0.0
