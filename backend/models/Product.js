const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  sku: { type: String, required: true, unique: true },
  barcode: { type: String, unique: true, sparse: true },
  qrCode: String,
  name: { type: String, required: true },
  description: String,
  shortDescription: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: String,
  model: String,
  
  // Pricing
  pricing: {
    cost: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    msrp: Number, // Manufacturer Suggested Retail Price
    currency: { type: String, default: 'USD' },
    taxable: { type: Boolean, default: true },
    taxRate: { type: Number, default: 0 }
  },
  
  // Physical Properties
  physical: {
    weight: Number, // in kg
    dimensions: {
      length: Number, // in cm
      width: Number,
      height: Number
    },
    volume: Number, // in cubic cm
    color: String,
    material: String
  },
  
  // Inventory Management
  inventory: {
    trackInventory: { type: Boolean, default: true },
    stockLevels: {
      reorderPoint: { type: Number, default: 10 },
      maxStock: Number,
      safetyStock: { type: Number, default: 5 },
      economicOrderQty: Number
    },
    locations: [{
      warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
      zone: String,
      bin: String,
      quantity: { type: Number, default: 0 },
      reserved: { type: Number, default: 0 },
      available: { type: Number, default: 0 }
    }],
    serialNumbers: [{
      serial: String,
      status: { type: String, enum: ['available', 'sold', 'damaged', 'returned'], default: 'available' },
      location: String,
      purchaseDate: Date,
      warrantyExpiry: Date
    }],
    batchTracking: {
      enabled: { type: Boolean, default: false },
      batches: [{
        batchNumber: String,
        quantity: Number,
        manufactureDate: Date,
        expiryDate: Date,
        supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' }
      }]
    }
  },
  
  // Supplier Information
  suppliers: [{
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    supplierSku: String,
    cost: Number,
    leadTime: Number, // in days
    minOrderQty: Number,
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Product Variants
  variants: [{
    name: String, // e.g., "Size", "Color"
    value: String, // e.g., "Large", "Red"
    sku: String,
    price: Number,
    quantity: Number
  }],
  
  // Quality Control
  qualityControl: {
    inspectionRequired: { type: Boolean, default: false },
    qualityChecks: [{
      parameter: String,
      specification: String,
      tolerance: String
    }]
  },
  
  // Images and Documents
  media: {
    images: [String],
    documents: [{
      name: String,
      type: String,
      url: String
    }]
  },
  
  // Status and Lifecycle
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'discontinued', 'draft'], 
    default: 'active' 
  },
  lifecycle: {
    launchDate: Date,
    discontinueDate: Date,
    phase: { type: String, enum: ['introduction', 'growth', 'maturity', 'decline'] }
  },
  
  // Analytics
  analytics: {
    totalSold: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    lastSaleDate: Date,
    turnoverRate: Number
  },
  
  // Compliance
  compliance: {
    hazardous: { type: Boolean, default: false },
    certifications: [String],
    restrictions: [String],
    countryOfOrigin: String
  }
}, { timestamps: true });

// Indexes for performance
productSchema.index({ sku: 1 });
productSchema.index({ barcode: 1 });
productSchema.index({ category: 1 });
productSchema.index({ 'inventory.locations.warehouse': 1 });
productSchema.index({ status: 1 });

// Virtual for total quantity across all locations
productSchema.virtual('totalQuantity').get(function() {
  return this.inventory.locations.reduce((total, loc) => total + loc.quantity, 0);
});

// Virtual for available quantity
productSchema.virtual('availableQuantity').get(function() {
  return this.inventory.locations.reduce((total, loc) => total + loc.available, 0);
});

// Backward compatibility virtuals
productSchema.virtual('quantity').get(function() {
  return this.totalQuantity;
});

productSchema.virtual('price').get(function() {
  return this.pricing.sellingPrice;
});

productSchema.virtual('minStock').get(function() {
  return this.inventory.stockLevels.reorderPoint;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);