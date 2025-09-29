const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  warehouseCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['main', 'distribution', 'retail', 'transit'], default: 'main' },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  capacity: {
    totalSpace: Number, // in sq ft
    usedSpace: { type: Number, default: 0 },
    maxWeight: Number, // in kg
    currentWeight: { type: Number, default: 0 }
  },
  zones: [{
    zoneCode: String,
    name: String,
    type: { type: String, enum: ['receiving', 'storage', 'picking', 'shipping', 'quarantine'] },
    temperature: { min: Number, max: Number },
    humidity: { min: Number, max: Number }
  }],
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Warehouse', warehouseSchema);