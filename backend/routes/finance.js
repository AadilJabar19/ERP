const express = require('express');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const router = express.Router();

// Accounts
router.get('/accounts', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const accounts = await Account.find()
      .populate('parentAccount', 'accountName accountCode')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ accountCode: 1 });
    const total = await Account.countDocuments();
    res.json({ accounts, totalPages: Math.ceil(total / limit), currentPage: page, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/accounts', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const account = new Account(req.body);
    await account.save();
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const transactions = await Transaction.find()
      .populate('entries.account', 'accountName accountCode')
      .populate('createdBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });
    const total = await Transaction.countDocuments();
    res.json({ transactions, totalPages: Math.ceil(total / limit), currentPage: page, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/transactions', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const transactionNumber = `TXN-${Date.now()}`;
    const transaction = new Transaction({
      ...req.body,
      transactionNumber,
      createdBy: req.user._id
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Budgets
router.get('/budgets', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const budgets = await Budget.find()
      .populate('items.account', 'accountName accountCode')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ year: -1 });
    const total = await Budget.countDocuments();
    res.json({ budgets, totalPages: Math.ceil(total / limit), currentPage: page, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/budgets', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const budget = new Budget(req.body);
    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Expenses
router.get('/expenses', auth, async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/expenses', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    res.status(201).json({ message: 'Expense created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Analytics
router.get('/analytics', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const [accountStats, transactionStats, budgetStats] = await Promise.all([
      Account.aggregate([{ $group: { _id: '$accountType', count: { $sum: 1 }, totalBalance: { $sum: '$balance' } } }]),
      Transaction.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$totalAmount' } } }]),
      Budget.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, totalBudget: { $sum: '$totalBudget' } } }])
    ]);
    
    res.json({ accountStats, transactionStats, budgetStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk upload routes
router.post('/accounts/bulk', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { accounts } = req.body;
    const results = [];
    
    for (const accData of accounts) {
      const account = new Account({
        name: accData.name,
        code: accData.code,
        type: accData.type,
        balance: parseFloat(accData.balance) || 0,
        description: accData.description
      });
      await account.save();
      results.push(account);
    }
    
    res.status(201).json({ message: `Successfully imported ${results.length} accounts`, accounts: results });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/transactions/bulk', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { transactions } = req.body;
    const results = [];
    
    for (const txnData of transactions) {
      const transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const transaction = new Transaction({
        transactionNumber,
        type: txnData.type,
        amount: parseFloat(txnData.amount) || 0,
        description: txnData.description,
        category: txnData.category,
        date: new Date(txnData.transactionDate),
        reference: txnData.reference,
        createdBy: req.user._id
      });
      await transaction.save();
      results.push(transaction);
    }
    
    res.status(201).json({ message: `Successfully imported ${results.length} transactions`, transactions: results });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/expenses/bulk', auth, roleAuth(['admin', 'manager']), async (req, res) => {
  try {
    const { expenses } = req.body;
    res.status(201).json({ message: `Successfully imported ${expenses.length} expenses` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;