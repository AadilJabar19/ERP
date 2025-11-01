const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Import models
const Employee = require('../models/Employee');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Project = require('../models/Project');
const Lead = require('../models/Lead');
const Invoice = require('../models/Invoice');
const SalesOrder = require('../models/SalesOrder');
const Event = require('../models/Event');

// Global search endpoint
router.get('/', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ results: [] });
    }

    const searchRegex = new RegExp(q, 'i');
    const results = [];

    // Search Modules/Pages
    const modules = [
      { name: 'Dashboard', url: '/', keywords: ['dashboard', 'home', 'overview', 'analytics'] },
      { name: 'HRM', url: '/hrm', keywords: ['hrm', 'human resources', 'employee', 'staff', 'personnel'] },
      { name: 'Attendance System', url: '/attendance-system', keywords: ['attendance', 'check-in', 'check-out', 'time tracking'] },
      { name: 'Check-In/Out', url: '/checkin', keywords: ['checkin', 'checkout', 'clock in', 'clock out'] },
      { name: 'Inventory Management', url: '/inventory-mgmt', keywords: ['inventory', 'stock', 'warehouse', 'products'] },
      { name: 'Sales Management', url: '/sales-mgmt', keywords: ['sales', 'leads', 'quotes', 'orders', 'pipeline'] },
      { name: 'CRM System', url: '/crm-system', keywords: ['crm', 'customer', 'relationship', 'contacts'] },
      { name: 'Finance Management', url: '/finance-mgmt', keywords: ['finance', 'accounting', 'invoices', 'expenses', 'budget'] },
      { name: 'Projects', url: '/projects', keywords: ['projects', 'tasks', 'project management'] },
      { name: 'Calendar', url: '/calendar-system', keywords: ['calendar', 'events', 'schedule', 'meetings'] },
      { name: 'Helpdesk', url: '/helpdesk', keywords: ['helpdesk', 'tickets', 'support'] },
      { name: 'AI Assistant', url: '/ai-assistant', keywords: ['ai', 'assistant', 'chatbot', 'help'] },
      { name: 'AI Insights', url: '/ai-insights', keywords: ['insights', 'analytics', 'predictions', 'ai analytics'] },
      { name: 'Admin Panel', url: '/admin-panel', keywords: ['admin', 'administration', 'settings', 'users'] },
      { name: 'System Config', url: '/system-config', keywords: ['config', 'configuration', 'system settings'] },
      { name: 'Integrations', url: '/integrations', keywords: ['integrations', 'api', 'connections'] },
      { name: 'Profile', url: '/profile-system', keywords: ['profile', 'account', 'user settings'] },
      { name: 'Procurement', url: '/procurement', keywords: ['procurement', 'purchasing', 'suppliers'] },
      { name: 'Manufacturing', url: '/manufacturing', keywords: ['manufacturing', 'production'] }
    ];

    modules.forEach(module => {
      const matchesName = searchRegex.test(module.name);
      const matchesKeywords = module.keywords.some(keyword => searchRegex.test(keyword));
      
      if (matchesName || matchesKeywords) {
        results.push({
          type: 'module',
          title: module.name,
          description: 'Navigate to module',
          url: module.url,
          id: module.url
        });
      }
    });

    // Search Employees
    try {
      const employees = await Employee.find({
        $or: [
          { 'personalInfo.firstName': searchRegex },
          { 'personalInfo.lastName': searchRegex },
          { 'contactInfo.email': searchRegex },
          { employeeId: searchRegex }
        ]
      }).limit(5).select('personalInfo.firstName personalInfo.lastName contactInfo.email jobInfo.position');

      employees.forEach(emp => {
        results.push({
          type: 'employee',
          title: `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
          description: emp.jobInfo?.position || emp.contactInfo?.email || 'Employee',
          url: `/hrm?employee=${emp._id}`,
          id: emp._id
        });
      });
    } catch (err) {
      console.error('Employee search error:', err);
    }

    // Search Customers
    try {
      const customers = await Customer.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { company: searchRegex }
        ]
      }).limit(5).select('name email company');

      customers.forEach(customer => {
        results.push({
          type: 'customer',
          title: customer.name,
          description: customer.company || customer.email,
          url: `/crm?customer=${customer._id}`,
          id: customer._id
        });
      });
    } catch (err) {
      console.error('Customer search error:', err);
    }

    // Search Products
    try {
      const products = await Product.find({
        $or: [
          { name: searchRegex },
          { sku: searchRegex },
          { description: searchRegex }
        ]
      }).limit(5).select('name sku price');

      products.forEach(product => {
        results.push({
          type: 'product',
          title: product.name,
          description: `SKU: ${product.sku} - $${product.price}`,
          url: `/inventory?product=${product._id}`,
          id: product._id
        });
      });
    } catch (err) {
      console.error('Product search error:', err);
    }

    // Search Projects
    try {
      const projects = await Project.find({
        $or: [
          { name: searchRegex },
          { code: searchRegex },
          { description: searchRegex }
        ]
      }).limit(5).select('name code status');

      projects.forEach(project => {
        results.push({
          type: 'project',
          title: project.name,
          description: `${project.code} - ${project.status}`,
          url: `/projects?project=${project._id}`,
          id: project._id
        });
      });
    } catch (err) {
      console.error('Project search error:', err);
    }

    // Search Leads
    try {
      const leads = await Lead.find({
        $or: [
          { 'contact.firstName': searchRegex },
          { 'contact.lastName': searchRegex },
          { 'contact.email': searchRegex },
          { 'company.name': searchRegex },
          { leadNumber: searchRegex }
        ]
      }).limit(5).select('contact.firstName contact.lastName company.name status leadNumber');

      leads.forEach(lead => {
        results.push({
          type: 'lead',
          title: `${lead.contact.firstName} ${lead.contact.lastName}`,
          description: `${lead.company?.name || 'N/A'} - ${lead.status}`,
          url: `/sales-mgmt?lead=${lead._id}`,
          id: lead._id
        });
      });
    } catch (err) {
      console.error('Lead search error:', err);
    }

    // Search Invoices
    try {
      const invoices = await Invoice.find({
        $or: [
          { invoiceNumber: searchRegex }
        ]
      }).limit(5).select('invoiceNumber amount status').populate('customer', 'name');

      invoices.forEach(invoice => {
        results.push({
          type: 'invoice',
          title: `Invoice ${invoice.invoiceNumber}`,
          description: `${invoice.customer?.name || 'N/A'} - $${invoice.amount}`,
          url: `/finance?invoice=${invoice._id}`,
          id: invoice._id
        });
      });
    } catch (err) {
      console.error('Invoice search error:', err);
    }

    // Search Events
    try {
      const events = await Event.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex }
        ]
      }).limit(5).select('title type startDate');

      events.forEach(event => {
        results.push({
          type: 'event',
          title: event.title,
          description: `${event.type} - ${new Date(event.startDate).toLocaleDateString()}`,
          url: `/calendar?event=${event._id}`,
          id: event._id
        });
      });
    } catch (err) {
      console.error('Event search error:', err);
    }

    res.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
});

module.exports = router;
