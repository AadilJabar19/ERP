const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Warehouse = require('../models/Warehouse');
const StockMovement = require('../models/StockMovement');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// Product Management
router.get('/products', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, status, warehouse, lowStock } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { sku: new RegExp(search, 'i') },
        { productId: new RegExp(search, 'i') },
        { barcode: new RegExp(search, 'i') }
      ];
    }
    if (category) query.category = category;
    if (status) query.status = status;
    if (warehouse) query['inventory.locations.warehouse'] = warehouse;
    
    let products = await Product.find(query)
      .populate('category', 'name categoryCode')
      .populate('inventory.locations.warehouse', 'name warehouseCode')
      .populate('suppliers.supplier', 'companyName supplierCode')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    // Filter for low stock if requested
    if (lowStock === 'true') {
      products = products.filter(product => 
        product.totalQuantity <= product.inventory.stockLevels.reorderPoint
      );
    }
    
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/products', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/products/:id', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/products/:id', auth, roleAuth(['admin']), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Stock Movements
router.get('/stock-movements', auth, async (req, res) => {
  try {
    const movements = await StockMovement.find()
      .sort({ movementDate: -1 })
      .limit(100);
      
    res.json(movements);
  } catch (error) {
    // Return empty array if no movements exist
    res.json([]);
  }
});

router.post('/stock-movements', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const movement = new StockMovement({
      ...req.body,
      createdBy: req.user._id
    });
    
    // Update product inventory
    const product = await Product.findById(movement.product);
    const locationIndex = product.inventory.locations.findIndex(
      loc => loc.warehouse.toString() === movement.warehouse.toString()
    );
    
    if (locationIndex >= 0) {
      if (movement.movementType === 'in') {
        product.inventory.locations[locationIndex].quantity += movement.quantity;
        product.inventory.locations[locationIndex].available += movement.quantity;
      } else if (movement.movementType === 'out') {
        product.inventory.locations[locationIndex].quantity -= movement.quantity;
        product.inventory.locations[locationIndex].available -= movement.quantity;
      }
    } else if (movement.movementType === 'in') {
      product.inventory.locations.push({
        warehouse: movement.warehouse,
        quantity: movement.quantity,
        available: movement.quantity
      });
    }
    
    movement.runningBalance = product.totalQuantity;
    await movement.save();
    await product.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('inventory_updated', {
      productName: product.name,
      productId: product._id,
      newQuantity: product.totalQuantity,
      movementType: movement.movementType
    });
    
    // Check for low stock alert
    if (product.totalQuantity <= product.inventory.stockLevels.reorderPoint) {
      io.emit('inventory_alert', {
        productName: product.name,
        productId: product._id,
        currentStock: product.totalQuantity,
        reorderPoint: product.inventory.stockLevels.reorderPoint
      });
    }
    
    res.status(201).json(movement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Warehouse Management
router.get('/warehouses', auth, async (req, res) => {
  try {
    const warehouses = await Warehouse.find()
      .populate('manager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .sort({ name: 1 });
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/warehouses', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const warehouseCode = `WH-${Date.now()}`;
    const warehouse = new Warehouse({ ...req.body, warehouseCode });
    await warehouse.save();
    res.status(201).json(warehouse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Category Management
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/categories', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const category = new Category({ 
      name: req.body.categoryName || req.body.name,
      description: req.body.description
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Inventory Analytics
router.get('/analytics', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ status: 'active' });
    const totalValue = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$totalQuantity', '$pricing.cost'] } } } }
    ]);
    
    const outOfStockProducts = await Product.countDocuments({
      status: 'active',
      totalQuantity: 0
    });
    
    const lowStockProducts = await Product.countDocuments({
      status: 'active',
      totalQuantity: { $gt: 0 },
      $expr: { $lte: ['$totalQuantity', '$inventory.stockLevels.reorderPoint'] }
    });
    
    const inStockProducts = totalProducts - lowStockProducts - outOfStockProducts;
    
    const categoryStats = await Product.aggregate([
      { $match: { status: 'active' } },
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo' } },
      { $unwind: '$categoryInfo' },
      { $group: { 
        _id: '$categoryInfo.name', 
        count: { $sum: 1 }, 
        totalValue: { $sum: { $multiply: ['$totalQuantity', '$pricing.cost'] } } 
      }}
    ]);
    
    const warehouseStats = await Product.aggregate([
      { $unwind: '$inventory.locations' },
      { $lookup: { from: 'warehouses', localField: 'inventory.locations.warehouse', foreignField: '_id', as: 'warehouseInfo' } },
      { $unwind: '$warehouseInfo' },
      { $group: { 
        _id: '$warehouseInfo.name', 
        productCount: { $sum: 1 },
        capacity: { $first: '$warehouseInfo.capacity.totalSpace' }
      }}
    ]);
    
    res.json({
      totalProducts,
      totalValue: totalValue[0]?.total || 0,
      lowStockProducts,
      outOfStockProducts,
      inStockProducts,
      categoryStats,
      warehouseStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Stock Alerts
router.get('/alerts', auth, async (req, res) => {
  try {
    const lowStock = await Product.find({
      status: 'active',
      $expr: { $lte: ['$totalQuantity', '$inventory.stockLevels.reorderPoint'] }
    }).populate('category', 'name');
    
    const EXPIRY_WARNING_DAYS = 30;
    const expiryThreshold = new Date(Date.now() + EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000);
    
    const expiringSoon = await Product.find({
      'inventory.batchTracking.batches.expiryDate': { $lte: expiryThreshold }
    }).populate('category', 'name');
    
    res.json({
      lowStock,
      expiringSoon
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk upload routes
router.post('/products/bulk', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { products } = req.body;
    const results = [];
    
    for (const prodData of products) {
      const product = new Product({
        productId: prodData.productId,
        name: prodData.name,
        sku: prodData.sku,
        pricing: {
          cost: parseFloat(prodData.cost) || 0,
          sellingPrice: parseFloat(prodData.sellingPrice) || 0
        },
        inventory: {
          stockLevels: {
            reorderPoint: parseInt(prodData.reorderPoint) || 10,
            maxStock: parseInt(prodData.maxStock) || 100
          }
        }
      });
      await product.save();
      results.push(product);
    }
    
    res.status(201).json({ message: `Successfully imported ${results.length} products`, products: results });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/categories/bulk', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { categories } = req.body;
    const results = [];
    
    for (const catData of categories) {
      const category = new Category({
        name: catData.name,
        description: catData.description
      });
      await category.save();
      results.push(category);
    }
    
    res.status(201).json({ message: `Successfully imported ${results.length} categories`, categories: results });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/warehouses/bulk', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const { warehouses } = req.body;
    const results = [];
    
    for (const whData of warehouses) {
      const warehouseCode = `WH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const warehouse = new Warehouse({
        name: whData.name,
        warehouseCode: whData.warehouseCode || warehouseCode,
        location: whData.location,
        capacity: {
          totalSpace: parseInt(whData.totalSpace) || 1000
        }
      });
      await warehouse.save();
      results.push(warehouse);
    }
    
    res.status(201).json({ message: `Successfully imported ${results.length} warehouses`, warehouses: results });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;