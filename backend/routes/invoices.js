const express = require('express');
const Invoice = require('../models/Invoice');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// Get all invoices
router.get('/', auth, async (req, res) => {
  try {
    const { status, customer } = req.query;
    let query = {};
    if (status) query.status = status;
    if (customer) query['customer.name'] = new RegExp(customer, 'i');
    
    const invoices = await Invoice.find(query).populate('createdBy', 'name');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create invoice
router.post('/', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const invoiceNumber = `INV-${Date.now()}`;
    const invoice = new Invoice({
      ...req.body,
      invoiceNumber,
      createdBy: req.user._id
    });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update invoice status
router.patch('/:id/status', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get invoice analytics
router.get('/analytics', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const totalInvoices = await Invoice.countDocuments();
    const paidInvoices = await Invoice.countDocuments({ status: 'paid' });
    const overdueInvoices = await Invoice.countDocuments({ status: 'overdue' });
    const totalRevenue = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    res.json({
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;