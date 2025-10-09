const express = require('express');
const Sale = require('../models/Sale');
const Lead = require('../models/Lead');
const Quote = require('../models/Quote');
const SalesOrder = require('../models/SalesOrder');
const TaxInvoice = require('../models/TaxInvoice');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// Get all sales with advanced filtering
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customer, salesRep, startDate, endDate } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (customer) query.customer = customer;
    if (salesRep) query.salesRep = salesRep;
    if (startDate && endDate) {
      query.saleDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const sales = await Sale.find(query)
      .populate('items.product', 'name sku pricing')
      .populate('customer', 'companyName customerCode')
      .populate('salesRep', 'personalInfo employeeId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ saleDate: -1 });
      
    const total = await Sale.countDocuments(query);
    
    res.json({
      sales,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create sale (backward compatibility)
router.post('/', auth, roleAuth(['admin', 'manager', 'employee']), async (req, res) => {
  try {
    const saleId = `SALE-${Date.now()}`;
    const sale = new Sale({
      ...req.body,
      saleId
    });
    await sale.save();
    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lead Management Routes
router.get('/leads', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, assignedTo, source } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (source) query.source = source;
    
    const leads = await Lead.find(query)
      .populate('assignedTo', 'personalInfo employeeId')
      .populate('customer', 'companyName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const total = await Lead.countDocuments(query);
    
    res.json({
      leads,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/leads', auth, roleAuth(['admin', 'manager', 'employee']), async (req, res) => {
  try {
    const leadNumber = `LEAD-${Date.now()}`;
    const lead = new Lead({
      ...req.body,
      leadNumber,
      assignedTo: req.body.assignedTo || req.user._id
    });
    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/leads/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Quote Management Routes
router.get('/quotes', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customer, salesRep } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (customer) query.customer = customer;
    if (salesRep) query.salesRep = salesRep;
    
    const quotes = await Quote.find(query)
      .populate('customer', 'companyName customerCode')
      .populate('salesRep', 'personalInfo employeeId')
      .populate('items.product', 'name sku')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const total = await Quote.countDocuments(query);
    
    res.json({
      quotes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/quotes', auth, roleAuth(['admin', 'manager', 'employee']), async (req, res) => {
  try {
    const quoteNumber = `QUO-${Date.now()}`;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30); // 30 days validity
    
    const quote = new Quote({
      ...req.body,
      quoteNumber,
      validUntil,
      salesRep: req.body.salesRep || req.user._id
    });
    await quote.save();
    res.status(201).json(quote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Sales Analytics
router.get('/analytics', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const totalSales = await Sale.countDocuments();
    const totalRevenue = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const salesByStatus = await Sale.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
    ]);
    
    const leadsByStatus = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const quotesByStatus = await Quote.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const monthlySales = await Sale.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: '$saleDate' },
            month: { $month: '$saleDate' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $cond: [
                { $lt: ['$_id.month', 10] },
                { $concat: ['0', { $toString: '$_id.month' }] },
                { $toString: '$_id.month' }
              ]}
            ]
          },
          sales: '$count',
          revenue: '$revenue'
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    
    res.json({
      totalSales,
      totalRevenue: totalRevenue[0]?.total || 0,
      salesByStatus,
      leadsByStatus,
      quotesByStatus,
      monthlySales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sales Orders
router.get('/orders', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customer } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (customer) query.customer = customer;
    
    const orders = await SalesOrder.find(query)
      .populate('customer', 'companyName customerCode')
      .populate('items.product', 'name sku')
      .populate('createdBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const total = await SalesOrder.countDocuments(query);
    
    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/orders', auth, roleAuth(['admin', 'manager', 'employee']), async (req, res) => {
  try {
    const orderNumber = `SO-${Date.now()}`;
    const order = new SalesOrder({
      ...req.body,
      orderNumber,
      createdBy: req.user._id
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/orders/:id', auth, async (req, res) => {
  try {
    const order = await SalesOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Tax Invoices
router.get('/invoices', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customer } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (customer) query.customer = customer;
    
    const invoices = await TaxInvoice.find(query)
      .populate('customer', 'companyName customerCode')
      .populate('salesOrder', 'orderNumber')
      .populate('items.product', 'name sku')
      .populate('createdBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const total = await TaxInvoice.countDocuments(query);
    
    res.json({
      invoices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/invoices', auth, roleAuth(['admin', 'manager', 'employee']), async (req, res) => {
  try {
    const invoiceNumber = `INV-${Date.now()}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days payment term
    
    const invoice = new TaxInvoice({
      ...req.body,
      invoiceNumber,
      dueDate: req.body.dueDate || dueDate,
      createdBy: req.user._id
    });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/invoices/:id', auth, async (req, res) => {
  try {
    const invoice = await TaxInvoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Sales Pipeline
router.get('/pipeline', auth, async (req, res) => {
  try {
    const pipeline = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$opportunity.value' },
          avgProbability: { $avg: '$opportunity.probability' }
        }
      }
    ]);
    
    res.json(pipeline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;