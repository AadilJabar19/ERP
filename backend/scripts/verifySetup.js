const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
require('dotenv').config();

const verifySetup = async () => {
  try {
    console.log('🔍 Verifying ERP System Setup...\n');
    
    // 1. Check MongoDB Connection
    console.log('1️⃣ Checking MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/claryx-erp', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully\n');
    
    // 2. Check Environment Variables
    console.log('2️⃣ Checking environment variables...');
    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'SESSION_SECRET', 'PORT'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
    } else {
      console.log('✅ All required environment variables are set\n');
    }
    
    // 3. Check Database Collections
    console.log('3️⃣ Checking database collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`   Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    console.log('');
    
    // 4. Check Admin User
    console.log('4️⃣ Checking admin user...');
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      console.log(`✅ Admin user found: ${adminUser.email}\n`);
    } else {
      console.log('⚠️  No admin user found. Run createAdmin.js to create one\n');
    }
    
    // 5. Check Data Counts
    console.log('5️⃣ Checking data counts...');
    const [userCount, employeeCount, productCount, customerCount] = await Promise.all([
      User.countDocuments(),
      Employee.countDocuments(),
      Product.countDocuments(),
      Customer.countDocuments()
    ]);
    
    console.log(`   Users: ${userCount}`);
    console.log(`   Employees: ${employeeCount}`);
    console.log(`   Products: ${productCount}`);
    console.log(`   Customers: ${customerCount}\n`);
    
    // 6. Check Indexes
    console.log('6️⃣ Checking database indexes...');
    const userIndexes = await User.collection.getIndexes();
    const employeeIndexes = await Employee.collection.getIndexes();
    console.log(`   User indexes: ${Object.keys(userIndexes).length}`);
    console.log(`   Employee indexes: ${Object.keys(employeeIndexes).length}\n`);
    
    // 7. Summary
    console.log('📊 Setup Verification Summary:');
    console.log('================================');
    console.log(`✅ MongoDB: Connected`);
    console.log(`${missingVars.length === 0 ? '✅' : '⚠️ '} Environment: ${missingVars.length === 0 ? 'Complete' : 'Incomplete'}`);
    console.log(`${adminUser ? '✅' : '⚠️ '} Admin User: ${adminUser ? 'Exists' : 'Missing'}`);
    console.log(`✅ Collections: ${collections.length} found`);
    console.log(`✅ Total Records: ${userCount + employeeCount + productCount + customerCount}`);
    console.log('================================\n');
    
    if (missingVars.length === 0 && adminUser) {
      console.log('🎉 System is ready to use!');
    } else {
      console.log('⚠️  Please address the warnings above before using the system.');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

verifySetup();
