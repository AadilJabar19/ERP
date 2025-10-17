const express = require('express');
const Supplier = require('../models/Supplier');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// Get all suppliers
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { companyName: new RegExp(search, 'i') },
        { supplierCode: new RegExp(search, 'i') },
        { contactPerson: new RegExp(search, 'i') }
      ];
    }
    if (status) query.status = status;
    
    const suppliers = await Supplier.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const total = await Supplier.countDocuments(query);
    
    res.json({
      suppliers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create supplier
router.post('/', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const supplierCode = `SUP-${Date.now()}`;
    const supplier = new Supplier({
      ...req.body,
      supplierCode
    });
    await supplier.save();
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update supplier
router.put('/:id', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete supplier
router.delete('/:id', auth, roleAuth(['admin']), async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get supplier analytics
router.get('/analytics', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const totalSuppliers = await Supplier.countDocuments({ status: 'active' });
    
    const suppliersByStatus = await Supplier.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const suppliersByCountry = await Supplier.aggregate([
      { $group: { _id: '$contactInfo.address.country', count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalSuppliers,
      suppliersByStatus,
      suppliersByCountry
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk upload suppliers
router.post('/bulk', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { suppliers } = req.body;
    const results = [];
    
    for (const supplierData of suppliers) {
      const supplierCode = `SUP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const supplier = new Supplier({
        supplierCode,
        companyName: supplierData.companyName,
        contactPerson: supplierData.contactPerson,
        contactInfo: {
          email: supplierData.email,
          phone: supplierData.phone,
          address: supplierData.address
        }
      });
      await supplier.save();
      results.push(supplier);
    }
    
    res.status(201).json({ message: `Successfully imported ${results.length} suppliers`, suppliers: results });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;