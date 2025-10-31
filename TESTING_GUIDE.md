# Claryx ERP System - Testing Guide

## 🧪 Testing Checklist

### Pre-Testing Setup
- [ ] MongoDB is running
- [ ] Backend server is running on port 5000
- [ ] Frontend server is running on port 3000
- [ ] Admin user exists in database
- [ ] Environment variables are configured

---

## 1️⃣ System Health Check

### Backend Health
```bash
# Basic health check
curl http://localhost:5000/api/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "uptime": 123.45,
  "environment": "development",
  "database": {
    "status": "Connected",
    "name": "claryx-erp"
  },
  "memory": {
    "used": "50 MB",
    "total": "100 MB"
  },
  "version": "1.0.0"
}
```

### Database Connection
```bash
cd backend
node scripts/verifySetup.js
```

---

## 2️⃣ Authentication Testing

### Test Login
```bash
# Using cURL
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'

# Expected: JWT token and user object
```

### Test Invalid Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@test.com","password":"wrong"}'

# Expected: 401 Unauthorized
```

### Frontend Login Test
1. Navigate to http://localhost:3000/login
2. Enter credentials:
   - Email: admin@test.com
   - Password: admin123
3. Click Login
4. Should redirect to Dashboard

---

## 3️⃣ HRM Module Testing

### Employee Management

#### Create Employee
1. Navigate to HRM → Employees
2. Click "Add Employee"
3. Fill form:
   - Employee ID: TEST001
   - First Name: Test
   - Last Name: User
   - Email: test@company.com
   - Phone: +1234567890
   - Department: IT
   - Position: Developer
   - Base Salary: 50000
4. Submit
5. Verify employee appears in list

#### Edit Employee
1. Click "Edit" on any employee
2. Modify details
3. Save
4. Verify changes

#### Delete Employee
1. Click "Delete" on test employee
2. Confirm deletion
3. Verify removal from list

#### Bulk Upload
1. Click "Import CSV"
2. Download template
3. Fill with test data
4. Upload
5. Verify import success

### Leave Management

#### Apply Leave
1. Navigate to HRM → Leave Management
2. Click "Apply Leave"
3. Fill form:
   - Leave Type: Annual
   - Start Date: Future date
   - End Date: Future date + 5 days
   - Reason: Test leave
4. Submit
5. Verify leave appears with "pending" status

#### Approve/Reject Leave (Admin/Manager)
1. Find pending leave
2. Click "Approve" or "Reject"
3. Verify status change

### Training Programs

#### Create Training
1. Navigate to HRM → Training
2. Click "Create Training"
3. Fill form:
   - Title: Test Training
   - Category: Technical
   - Type: Online
   - Duration: 10 hours
   - Start Date: Future date
   - End Date: Future date + 7 days
4. Submit
5. Verify training appears

### Performance Reviews

#### Create Review
1. Navigate to HRM → Performance
2. Click "Create Performance Review"
3. Select employee
4. Fill review details
5. Submit
6. Verify review appears

### Payroll

#### Process Payroll
1. Navigate to HRM → Payroll
2. Click "Process Payroll"
3. Select employee
4. Enter pay period
5. Enter earnings and deductions
6. Submit
7. Verify payroll record

---

## 4️⃣ Inventory Module Testing

### Product Management

#### Create Product
1. Navigate to Inventory → Products
2. Click "Add Product"
3. Fill form:
   - Product ID: PROD001
   - Name: Test Product
   - SKU: TEST-001
   - Category: Select or create
   - Cost: 100
   - Selling Price: 150
   - Reorder Point: 10
4. Submit
5. Verify product appears

#### Stock Movement
1. Navigate to Inventory → Stock Movements
2. Click "Add Movement"
3. Select product and warehouse
4. Enter quantity
5. Select movement type (in/out)
6. Submit
7. Verify stock updated

#### Low Stock Alert
1. Create product with low stock
2. Navigate to Inventory → Alerts
3. Verify alert appears

### Category Management

#### Create Category
1. Navigate to Inventory → Categories
2. Click "Add Category"
3. Enter name and description
4. Submit
5. Verify category appears

### Warehouse Management

#### Create Warehouse
1. Navigate to Inventory → Warehouses
2. Click "Add Warehouse"
3. Fill details
4. Submit
5. Verify warehouse appears

---

## 5️⃣ Sales Module Testing

### Lead Management

#### Create Lead
1. Navigate to Sales → Leads
2. Click "Add Lead"
3. Fill form:
   - Company Name: Test Corp
   - Contact Person: John Doe
   - Email: john@test.com
   - Phone: +1234567890
   - Source: Website
   - Priority: High
4. Submit
5. Verify lead appears

#### Update Lead Status
1. Click on lead
2. Change status
3. Save
4. Verify status change

### Quote Management

#### Create Quote
1. Navigate to Sales → Quotes
2. Click "Create Quote"
3. Select customer
4. Add items
5. Submit
6. Verify quote appears

### Sales Order

#### Create Order
1. Navigate to Sales → Orders
2. Click "Create Order"
3. Select customer
4. Add products
5. Submit
6. Verify order appears

---

## 6️⃣ CRM Module Testing

### Customer Management

#### Create Customer
1. Navigate to CRM → Customers
2. Click "Add Customer"
3. Fill form:
   - Company Name: Test Company
   - Email: contact@test.com
   - Phone: +1234567890
   - Address details
4. Submit
5. Verify customer appears

---

## 7️⃣ Project Module Testing

### Project Management

#### Create Project
1. Navigate to Projects
2. Click "Add Project"
3. Fill form:
   - Project Name: Test Project
   - Description: Test description
   - Start Date: Today
   - End Date: Future date
   - Budget: 100000
   - Priority: High
4. Assign team members
5. Submit
6. Verify project appears

---

## 8️⃣ Attendance Module Testing

### Check In/Out

#### Employee Check In
1. Navigate to Attendance
2. Click "Check In"
3. Verify check-in time recorded

#### Employee Check Out
1. Click "Check Out"
2. Verify check-out time recorded
3. Verify total hours calculated

---

## 9️⃣ Calendar/Events Testing

### Event Management

#### Create Event
1. Navigate to Calendar
2. Click "Add Event"
3. Fill form:
   - Title: Team Meeting
   - Description: Monthly sync
   - Start Date/Time: Future date
   - End Date/Time: Future date + 1 hour
   - Type: Meeting
4. Add attendees
5. Submit
6. Verify event appears on calendar

---

## 🔟 Dashboard Testing

### Analytics Verification
1. Navigate to Dashboard
2. Verify all widgets load:
   - [ ] Total Employees
   - [ ] Total Products
   - [ ] Total Customers
   - [ ] Total Revenue
   - [ ] Recent Sales
   - [ ] Recent Leads
   - [ ] Charts render correctly
   - [ ] Low stock alerts
   - [ ] Upcoming events

---

## 1️⃣1️⃣ Real-time Features Testing

### WebSocket Notifications

#### Test Inventory Update
1. Open two browser windows
2. In window 1: Create stock movement
3. In window 2: Verify notification appears

#### Test Low Stock Alert
1. Create product with stock below reorder point
2. Verify alert notification appears

---

## 1️⃣2️⃣ Role-Based Access Testing

### Admin Role
- [ ] Can access all modules
- [ ] Can create/edit/delete all records
- [ ] Can manage users
- [ ] Can view all analytics

### Manager Role
- [ ] Can access most modules
- [ ] Can create/edit records
- [ ] Cannot delete critical records
- [ ] Can view analytics

### Employee Role
- [ ] Limited module access
- [ ] Can view own records
- [ ] Cannot access admin functions
- [ ] Limited analytics access

---

## 1️⃣3️⃣ Error Handling Testing

### Network Error
1. Stop backend server
2. Try any operation
3. Verify error message displays

### Validation Error
1. Submit form with missing required fields
2. Verify validation messages

### Unauthorized Access
1. Logout
2. Try to access protected route
3. Verify redirect to login

---

## 1️⃣4️⃣ Performance Testing

### Load Testing
```bash
# Install Apache Bench
# Test login endpoint
ab -n 100 -c 10 -p login.json -T application/json http://localhost:5000/api/auth/login

# Test get employees endpoint
ab -n 100 -c 10 -H "Authorization: Bearer TOKEN" http://localhost:5000/api/hrm/employees
```

### Response Time
- [ ] Dashboard loads < 2 seconds
- [ ] List pages load < 1 second
- [ ] Form submissions < 500ms
- [ ] API responses < 200ms

---

## 1️⃣5️⃣ Security Testing

### Authentication
- [ ] Cannot access protected routes without token
- [ ] Token expires after timeout
- [ ] Invalid tokens rejected

### Authorization
- [ ] Role restrictions enforced
- [ ] Cannot access other users' data
- [ ] Admin functions protected

### Input Validation
- [ ] SQL injection prevented
- [ ] XSS attacks prevented
- [ ] CSRF protection enabled

---

## 1️⃣6️⃣ Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## 1️⃣7️⃣ Mobile Responsiveness

Test on:
- [ ] Mobile (< 768px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (> 1024px)

---

## 🐛 Bug Reporting Template

When you find a bug, report it with:

```markdown
**Bug Title:** Brief description

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Backend Version: 1.0.0
- Frontend Version: 1.0.0

**Screenshots:**
Attach if applicable

**Console Errors:**
Paste any error messages
```

---

## ✅ Testing Completion Checklist

- [ ] All authentication tests passed
- [ ] All HRM module tests passed
- [ ] All inventory module tests passed
- [ ] All sales module tests passed
- [ ] All CRM module tests passed
- [ ] All project module tests passed
- [ ] All attendance tests passed
- [ ] All calendar tests passed
- [ ] Dashboard analytics working
- [ ] Real-time notifications working
- [ ] Role-based access working
- [ ] Error handling working
- [ ] Performance acceptable
- [ ] Security measures in place
- [ ] Browser compatibility verified
- [ ] Mobile responsiveness verified

---

## 📊 Test Results Template

```markdown
# Test Results - [Date]

## Summary
- Total Tests: X
- Passed: X
- Failed: X
- Skipped: X

## Module Results
- Authentication: ✅ PASS
- HRM: ✅ PASS
- Inventory: ⚠️ PARTIAL (1 issue)
- Sales: ✅ PASS
- CRM: ✅ PASS
- Projects: ✅ PASS
- Attendance: ✅ PASS
- Calendar: ✅ PASS

## Issues Found
1. [Issue description]
2. [Issue description]

## Recommendations
1. [Recommendation]
2. [Recommendation]
```

---

**Happy Testing! 🎉**
