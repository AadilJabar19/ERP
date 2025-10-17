const express = require('express');
const Procurement = require('../models/Procurement');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// Get all procurement requests
router.get('/', auth, async (req, res) => {
  try {
    const { status, supplier, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (supplier) query.supplier = supplier;
    
    const procurements = await Procurement.find(query)
      .populate('supplier', 'name email')
      .populate('items.product', 'name sku')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const total = await Procurement.countDocuments(query);
    
    res.json({
      procurements,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create procurement request
router.post('/', auth, async (req, res) => {
  try {
    const procurement = new Procurement({
      ...req.body,
      requestedBy: req.user._id,
      requisitionNumber: `PR-${Date.now()}`
    });
    await procurement.save();
    res.status(201).json(procurement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Approve procurement
router.patch('/:id/approve', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const procurement = await Procurement.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'approved', 
        approvedBy: req.user._id, 
        approvalDate: new Date() 
      },
      { new: true }
    );
    res.json(procurement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Analytics
router.get('/analytics', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const [statusStats, monthlySpend] = await Promise.all([
      Procurement.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }]),
      Procurement.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $month: '$createdAt' }, totalSpend: { $sum: '$totalAmount' } } }
      ])
    ]);
    
    res.json({ statusStats, monthlySpend });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;