const mongoose = require('mongoose');
require('dotenv').config();

const dropDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-erp');
    console.log('Connected to MongoDB');
    
    await mongoose.connection.db.dropDatabase();
    console.log('Database dropped successfully');
    
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
};

dropDatabase();