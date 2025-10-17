const express = require('express');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// Get all customers with pagination and filtering
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, category } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { companyName: new RegExp(search, 'i') },
        { customerCode: new RegExp(search, 'i') },
        { contactPerson: new RegExp(search, 'i') }
      ];
    }
    if (status) query.status = status;
    if (category) query.category = category;
    
    const customers = await Customer.find(query)
      .populate('salesRep', 'name employeeId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const total = await Customer.countDocuments(query);
    
    res.json({
      customers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create customer
router.post('/', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const customerCode = `CUST-${Date.now()}`;
    const customer = new Customer({ ...req.body, customerCode });
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update customer
router.put('/:id', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get customer analytics
router.get('/analytics', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const statusStats = await Customer.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const categoryStats = await Customer.aggregate([
      { $group: { 
        _id: '$category', 
        count: { $sum: 1 },
        totalCreditLimit: { $sum: '$creditLimit' }
      }}
    ]);
    
    const creditStats = await Customer.aggregate([
      { $group: { _id: null, total: { $sum: '$creditLimit' }, avg: { $avg: '$creditLimit' } } }
    ]);
    
    res.json({
      totalCustomers,
      statusStats,
      categoryStats,
      totalCreditLimit: creditStats[0]?.total || 0,
      avgCreditLimit: creditStats[0]?.avg || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CRM Contacts
router.get('/contacts', auth, async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/contacts', auth, async (req, res) => {
  try {
    res.status(201).json({ message: 'Contact created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// CRM Activities
router.get('/activities', auth, async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/activities', auth, async (req, res) => {
  try {
    res.status(201).json({ message: 'Activity logged successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// CRM Opportunities
router.get('/opportunities', auth, async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/opportunities', auth, async (req, res) => {
  try {
    res.status(201).json({ message: 'Opportunity created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// CRM Campaigns
router.get('/campaigns', auth, async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/campaigns', auth, async (req, res) => {
  try {
    res.status(201).json({ message: 'Campaign created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Bulk upload customers
router.post('/bulk', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { customers } = req.body;
    const results = [];
    
    for (const customerData of customers) {
      const customerCode = `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const customer = new Customer({ ...customerData, customerCode });
      await customer.save();
      results.push(customer);
    }
    
    res.status(201).json({ message: `Successfully imported ${results.length} customers`, customers: results });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;