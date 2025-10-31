const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import all models
const User = require('../models/User');
const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const Training = require('../models/Training');
const Performance = require('../models/Performance');
const Payroll = require('../models/Payroll');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const StockMovement = require('../models/StockMovement');
const Lead = require('../models/Lead');
const Quote = require('../models/Quote');
const Customer = require('../models/Customer');
const Project = require('../models/Project');
const Event = require('../models/Event');
const Attendance = require('../models/Attendance');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/claryx-erp');
    console.log('Connected to MongoDB');

    // Import Category model
    const Category = require('../models/Category');
    
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      Leave.deleteMany({}),
      Training.deleteMany({}),
      Performance.deleteMany({}),
      Payroll.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Warehouse.deleteMany({}),
      StockMovement.deleteMany({}),
      Lead.deleteMany({}),
      Quote.deleteMany({}),
      Customer.deleteMany({}),
      Project.deleteMany({}),
      Event.deleteMany({}),
      Attendance.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create Users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      },
      {
        name: 'John Manager',
        email: 'manager@test.com',
        password: 'admin123',
        role: 'manager',
        isActive: true
      },
      {
        name: 'Jane Employee',
        email: 'employee@test.com',
        password: 'admin123',
        role: 'employee',
        isActive: true
      }
    ]);
    console.log('Created users');

    // Create Employees
    const employees = await Employee.create([
      {
        employeeId: 'EMP001',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-15'),
          gender: 'male',
          maritalStatus: 'single'
        },
        contactInfo: {
          email: 'john.doe@company.com',
          phone: '+1234567890',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          }
        },
        employment: {
          department: 'Engineering',
          position: 'Senior Developer',
          hireDate: new Date('2022-01-15'),
          employmentType: 'full-time',
          workSchedule: 'standard'
        },
        compensation: {
          baseSalary: 75000,
          currency: 'USD'
        },
        status: 'active'
      },
      {
        employeeId: 'EMP002',
        personalInfo: {
          firstName: 'Sarah',
          lastName: 'Wilson',
          dateOfBirth: new Date('1988-05-20'),
          gender: 'female',
          maritalStatus: 'married'
        },
        contactInfo: {
          email: 'sarah.wilson@company.com',
          phone: '+1234567891',
          address: {
            street: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90001',
            country: 'USA'
          }
        },
        employment: {
          department: 'Marketing',
          position: 'Marketing Manager',
          hireDate: new Date('2021-03-10'),
          employmentType: 'full-time',
          workSchedule: 'standard'
        },
        compensation: {
          baseSalary: 65000,
          currency: 'USD'
        },
        status: 'active'
      },
      {
        employeeId: 'EMP003',
        personalInfo: {
          firstName: 'Mike',
          lastName: 'Johnson',
          dateOfBirth: new Date('1992-08-12'),
          gender: 'male',
          maritalStatus: 'single'
        },
        contactInfo: {
          email: 'mike.johnson@company.com',
          phone: '+1234567892',
          address: {
            street: '789 Pine St',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'USA'
          }
        },
        employment: {
          department: 'Sales',
          position: 'Sales Representative',
          hireDate: new Date('2023-01-05'),
          employmentType: 'full-time',
          workSchedule: 'standard'
        },
        compensation: {
          baseSalary: 55000,
          currency: 'USD'
        },
        status: 'active'
      }
    ]);
    console.log('Created employees');

    // Create Leaves
    await Leave.create([
      {
        employee: employees[0]._id,
        leaveType: 'annual',
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-02-20'),
        totalDays: 5,
        reason: 'Family vacation',
        status: 'approved',
        appliedDate: new Date('2024-01-15'),
        processedBy: users[1]._id
      },
      {
        employee: employees[1]._id,
        leaveType: 'sick',
        startDate: new Date('2024-01-10'),
        endDate: new Date('2024-01-12'),
        totalDays: 2,
        reason: 'Medical appointment',
        status: 'pending',
        appliedDate: new Date('2024-01-08')
      }
    ]);
    console.log('Created leaves');

    // Create Training
    await Training.create([
      {
        title: 'React Advanced Concepts',
        category: 'technical',
        type: 'online',
        duration: 40,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-05'),
        maxParticipants: 20,
        participants: [employees[0]._id, employees[2]._id],
        status: 'active',
        createdBy: users[1]._id
      },
      {
        title: 'Leadership Skills',
        category: 'soft-skills',
        type: 'classroom',
        duration: 16,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-02'),
        maxParticipants: 15,
        participants: [employees[1]._id],
        status: 'planned',
        createdBy: users[0]._id
      }
    ]);
    console.log('Created training');

    // Create Performance Reviews
    await Performance.create([
      {
        employee: employees[0]._id,
        reviewer: users[1]._id,
        reviewType: 'annual',
        reviewPeriod: {
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31')
        },
        overallRating: 4,
        status: 'completed',
        comments: 'Excellent performance throughout the year'
      },
      {
        employee: employees[1]._id,
        reviewer: users[0]._id,
        reviewType: 'quarterly',
        reviewPeriod: {
          startDate: new Date('2023-10-01'),
          endDate: new Date('2023-12-31')
        },
        overallRating: 5,
        status: 'completed',
        comments: 'Outstanding marketing campaigns'
      }
    ]);
    console.log('Created performance reviews');

    // Create Payroll
    await Payroll.create([
      {
        employee: employees[0]._id,
        payPeriod: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        },
        earnings: {
          baseSalary: 6250,
          overtime: 500,
          bonuses: 1000
        },
        totalDeductions: 1200,
        netPay: 6550,
        status: 'paid',
        processedBy: users[1]._id
      },
      {
        employee: employees[1]._id,
        payPeriod: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        },
        earnings: {
          baseSalary: 5417,
          overtime: 0,
          bonuses: 500
        },
        totalDeductions: 1000,
        netPay: 4917,
        status: 'paid',
        processedBy: users[1]._id
      }
    ]);
    console.log('Created payroll');

    // Create Warehouses
    const warehouses = await Warehouse.create([
      {
        name: 'Main Warehouse',
        warehouseCode: 'WH001',
        location: {
          address: '100 Industrial Blvd',
          city: 'Industrial City',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        },
        capacity: 10000,
        manager: employees[1]._id,
        status: 'active'
      },
      {
        name: 'Secondary Warehouse',
        warehouseCode: 'WH002',
        location: {
          address: '200 Storage Ave',
          city: 'Storage City',
          state: 'State',
          zipCode: '12346',
          country: 'USA'
        },
        capacity: 5000,
        manager: employees[2]._id,
        status: 'active'
      }
    ]);
    console.log('Created warehouses');

    // Create Categories first
    const categories = await Category.create([
      { name: 'Electronics', description: 'Electronic devices and accessories' },
      { name: 'Furniture', description: 'Office and home furniture' }
    ]);

    // Create Products
    const products = await Product.create([
      {
        productId: 'PROD001',
        name: 'Laptop Computer',
        sku: 'LAP001',
        category: categories[0]._id,
        description: 'High-performance laptop for business use',
        pricing: {
          cost: 800,
          sellingPrice: 1200
        },
        inventory: {
          stockLevels: {
            reorderPoint: 10,
            maxStock: 100
          },
          locations: [{
            warehouse: warehouses[0]._id,
            quantity: 50,
            available: 50
          }]
        },
        status: 'active'
      },
      {
        productId: 'PROD002',
        name: 'Office Chair',
        sku: 'CHR001',
        category: categories[1]._id,
        description: 'Ergonomic office chair',
        pricing: {
          cost: 150,
          sellingPrice: 300
        },
        inventory: {
          stockLevels: {
            reorderPoint: 5,
            maxStock: 50
          },
          locations: [{
            warehouse: warehouses[0]._id,
            quantity: 25,
            available: 25
          }]
        },
        status: 'active'
      },
      {
        productId: 'PROD003',
        name: 'Wireless Mouse',
        sku: 'MOU001',
        category: categories[0]._id,
        description: 'Wireless optical mouse',
        pricing: {
          cost: 10,
          sellingPrice: 25
        },
        inventory: {
          stockLevels: {
            reorderPoint: 20,
            maxStock: 200
          },
          locations: [{
            warehouse: warehouses[1]._id,
            quantity: 100,
            available: 100
          }]
        },
        status: 'active'
      }
    ]);
    console.log('Created products');

    // Create Stock Movements
    await StockMovement.create([
      {
        product: products[0]._id,
        warehouse: warehouses[0]._id,
        movementType: 'in',
        transactionType: 'purchase',
        quantity: 20,
        unitCost: 800,
        totalValue: 16000,
        reason: 'Purchase order',
        createdBy: users[1]._id,
        status: 'completed'
      },
      {
        product: products[1]._id,
        warehouse: warehouses[0]._id,
        movementType: 'out',
        transactionType: 'sale',
        quantity: 5,
        unitCost: 150,
        totalValue: 750,
        reason: 'Sale',
        createdBy: users[2]._id,
        status: 'completed'
      }
    ]);
    console.log('Created stock movements');

    // Create Customers
    const customers = await Customer.create([
      {
        customerCode: 'CUST001',
        companyName: 'ABC Corporation',
        contactPerson: 'John Manager',
        email: 'contact@abc-corp.com',
        phone: '+1234567800',
        address: '500 Business Ave, Business City, State 12300',
        type: 'business',
        status: 'active',
        assignedTo: employees[2]._id
      },
      {
        customerCode: 'CUST002',
        companyName: 'John Smith Individual',
        contactPerson: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1234567801',
        address: '123 Residential St, Home City, State 12301',
        type: 'individual',
        status: 'active',
        assignedTo: employees[2]._id
      },
      {
        customerCode: 'CUST003',
        companyName: 'XYZ Industries',
        contactPerson: 'Jane Director',
        email: 'info@xyz-industries.com',
        phone: '+1234567802',
        address: '800 Industrial Park, Factory City, State 12302',
        type: 'business',
        status: 'active',
        assignedTo: employees[2]._id
      }
    ]);
    console.log('Created customers');

    // Create Leads
    await Lead.create([
      {
        leadNumber: 'LEAD001',
        contact: {
          firstName: 'Tech',
          lastName: 'Startup',
          email: 'startup@techcompany.com',
          phone: '+1234567810'
        },
        company: 'Tech Startup Inc',
        source: 'website',
        status: 'new',
        estimatedValue: 50000,
        assignedTo: employees[2]._id,
        notes: 'Interested in bulk laptop purchase'
      },
      {
        leadNumber: 'LEAD002',
        contact: {
          firstName: 'Marketing',
          lastName: 'Agency',
          email: 'contact@marketingagency.com',
          phone: '+1234567811'
        },
        company: 'Creative Marketing Agency',
        source: 'referral',
        status: 'qualified',
        estimatedValue: 25000,
        assignedTo: employees[2]._id,
        notes: 'Need office furniture for new location'
      }
    ]);
    console.log('Created leads');

    // Create Quotes
    await Quote.create([
      {
        customer: customers[0]._id,
        quoteNumber: 'QT001',
        items: [
          {
            product: products[0]._id,
            description: 'High-performance laptop for business use',
            quantity: 10,
            unitPrice: 1200,
            total: 12000
          }
        ],
        pricing: {
          subtotal: 12000,
          taxAmount: 960,
          totalAmount: 12960
        },
        status: 'sent',
        validUntil: new Date('2024-03-01'),
        salesRep: employees[2]._id
      },
      {
        customer: customers[1]._id,
        quoteNumber: 'QT002',
        items: [
          {
            product: products[1]._id,
            description: 'Ergonomic office chair',
            quantity: 2,
            unitPrice: 300,
            total: 600
          }
        ],
        pricing: {
          subtotal: 600,
          taxAmount: 48,
          totalAmount: 648
        },
        status: 'accepted',
        validUntil: new Date('2024-02-15'),
        salesRep: employees[2]._id
      }
    ]);
    console.log('Created quotes');

    // Create Projects
    await Project.create([
      {
        name: 'Website Redesign',
        code: 'PRJ001',
        description: 'Complete redesign of company website',
        client: 'ABC Corporation',
        manager: employees[0]._id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        budget: 50000,
        progress: 35,
        status: 'active',
        priority: 'high'
      },
      {
        name: 'Mobile App Development',
        code: 'PRJ002',
        description: 'Native mobile app for iOS and Android',
        client: 'XYZ Industries',
        manager: employees[0]._id,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-06-30'),
        budget: 100000,
        progress: 15,
        status: 'active',
        priority: 'medium'
      },
      {
        name: 'Marketing Campaign',
        code: 'PRJ003',
        description: 'Q1 digital marketing campaign',
        client: 'Tech Startup Inc',
        manager: employees[1]._id,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-04-15'),
        budget: 25000,
        progress: 60,
        status: 'active',
        priority: 'medium'
      }
    ]);
    console.log('Created projects');

    // Create Events
    await Event.create([
      {
        title: 'Team Meeting',
        description: 'Weekly team sync meeting',
        startDate: new Date('2024-02-05T10:00:00'),
        endDate: new Date('2024-02-05T11:00:00'),
        type: 'meeting',
        attendees: [employees[0]._id, employees[1]._id, employees[2]._id],

        createdBy: users[1]._id
      },
      {
        title: 'Product Launch',
        description: 'Launch event for new product line',
        startDate: new Date('2024-03-15T14:00:00'),
        endDate: new Date('2024-03-15T17:00:00'),
        type: 'other',
        attendees: [employees[1]._id, employees[2]._id],

        createdBy: users[0]._id
      },
      {
        title: 'Training Workshop',
        description: 'Customer service training',
        startDate: new Date('2024-02-20T09:00:00'),
        endDate: new Date('2024-02-20T17:00:00'),
        type: 'training',
        attendees: [employees[2]._id],

        createdBy: users[1]._id
      }
    ]);
    console.log('Created events');

    // Create Attendance
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    await Attendance.create([
      {
        employee: employees[0]._id,
        date: yesterday,
        checkIn: new Date(yesterday.setHours(9, 0, 0, 0)),
        checkOut: new Date(yesterday.setHours(17, 30, 0, 0)),
        hoursWorked: 8.5,
        status: 'present'
      },
      {
        employee: employees[1]._id,
        date: yesterday,
        checkIn: new Date(yesterday.setHours(8, 45, 0, 0)),
        checkOut: new Date(yesterday.setHours(17, 15, 0, 0)),
        hoursWorked: 8.5,
        status: 'present'
      },
      {
        employee: employees[2]._id,
        date: yesterday,
        checkIn: new Date(yesterday.setHours(9, 15, 0, 0)),
        checkOut: new Date(yesterday.setHours(18, 0, 0, 0)),
        hoursWorked: 8.75,
        status: 'present'
      },
      {
        employee: employees[0]._id,
        date: today,
        checkIn: new Date(today.setHours(9, 5, 0, 0)),
        status: 'present'
      }
    ]);
    console.log('Created attendance records');

    console.log('\n✅ Seed data created successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@test.com / admin123');
    console.log('Manager: manager@test.com / admin123');
    console.log('Employee: employee@test.com / admin123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedData();