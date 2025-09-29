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
    const activeCustomers = await Customer.countDocuments({ status: 'active' });
    const customersByCategory = await Customer.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalCustomers,
      activeCustomers,
      customersByCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;