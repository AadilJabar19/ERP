const express = require('express');
const { BOM, WorkOrder } = require('../models/Manufacturing');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// BOM Routes
router.get('/bom', auth, async (req, res) => {
  try {
    const boms = await BOM.find({ isActive: true })
      .populate('product', 'name sku')
      .populate('components.component', 'name sku');
    res.json(boms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/bom', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const bom = new BOM(req.body);
    await bom.save();
    res.status(201).json(bom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Work Order Routes
router.get('/work-orders', auth, async (req, res) => {
  try {
    const workOrders = await WorkOrder.find()
      .populate('product', 'name sku')
      .populate('bom')
      .populate('assignedTo', 'personalInfo.firstName personalInfo.lastName')
      .sort({ createdAt: -1 });
    res.json(workOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/work-orders', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const workOrder = new WorkOrder({
      ...req.body,
      orderNumber: `WO-${Date.now()}`
    });
    await workOrder.save();
    res.status(201).json(workOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update work order status
router.patch('/work-orders/:id/status', auth, async (req, res) => {
  try {
    const workOrder = await WorkOrder.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(workOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Analytics
router.get('/analytics', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const [statusStats, costAnalysis] = await Promise.all([
      WorkOrder.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      WorkOrder.aggregate([
        { $group: { _id: null, totalEstimated: { $sum: '$estimatedCost' }, totalActual: { $sum: '$actualCost' } } }
      ])
    ]);
    
    res.json({ statusStats, costAnalysis: costAnalysis[0] || {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;