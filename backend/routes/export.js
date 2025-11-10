const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const excelService = require('../services/excelService');
const Employee = require('../models/Employee');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');

// Export employees to Excel
router.get('/employees', auth, async (req, res) => {
  try {
    const employees = await Employee.find().populate('department');
    const data = employees.map(emp => ({
      Name: emp.name,
      Email: emp.email,
      Department: emp.department?.name || 'N/A',
      Position: emp.position,
      Salary: emp.salary,
      'Hire Date': emp.hireDate?.toISOString().split('T')[0],
      Status: emp.status
    }));

    const buffer = excelService.exportToExcel(data, 'employees.xlsx');
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
});

// Export products to Excel
router.get('/products', auth, async (req, res) => {
  try {
    const products = await Product.find().populate('category');
    const data = products.map(product => ({
      Name: product.name,
      SKU: product.sku,
      Category: product.category?.name || 'N/A',
      Price: product.price,
      Stock: product.stock,
      'Min Stock': product.minStock,
      Status: product.status
    }));

    const buffer = excelService.exportToExcel(data, 'products.xlsx');
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
});

// Export comprehensive report
router.get('/comprehensive', auth, async (req, res) => {
  try {
    const [employees, products, sales, customers] = await Promise.all([
      Employee.find().populate('department'),
      Product.find().populate('category'),
      Sale.find().populate('customer'),
      Customer.find()
    ]);

    const sheets = {
      Employees: employees.map(emp => ({
        Name: emp.name,
        Email: emp.email,
        Department: emp.department?.name || 'N/A',
        Position: emp.position,
        Status: emp.status
      })),
      Products: products.map(product => ({
        Name: product.name,
        SKU: product.sku,
        Category: product.category?.name || 'N/A',
        Price: product.price,
        Stock: product.stock
      })),
      Sales: sales.map(sale => ({
        'Sale Date': sale.saleDate?.toISOString().split('T')[0],
        Customer: sale.customer?.companyName || 'N/A',
        Amount: sale.totalAmount,
        Status: sale.status
      })),
      Customers: customers.map(customer => ({
        Company: customer.companyName,
        Contact: customer.contactPerson,
        Email: customer.email,
        Phone: customer.phone,
        Status: customer.status
      }))
    };

    const buffer = excelService.exportMultipleSheets(sheets, 'comprehensive-report.xlsx');
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=comprehensive-report.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
});

module.exports = router;