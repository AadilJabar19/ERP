const Employee = require('../models/Employee');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Project = require('../models/Project');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');

class AIAssistantService {
  static async processNaturalQuery(query, userId) {
    const lowerQuery = query.toLowerCase();
    
    try {
      // Simple test response first
      if (lowerQuery.includes('test')) {
        return {
          type: 'info',
          answer: 'AI Assistant is working! You asked: ' + query
        };
      }
      
      // Employee queries
      if (lowerQuery.includes('employee') || lowerQuery.includes('staff')) {
        if (lowerQuery.includes('count') || lowerQuery.includes('how many')) {
          const count = await Employee.countDocuments({ status: 'active' });
          return {
            type: 'data',
            answer: `There are currently ${count} active employees in the system.`
          };
        }
        if (lowerQuery.includes('department')) {
          const employees = await Employee.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$employment.department', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]);
          let response = 'Employee distribution by department:\n';
          employees.forEach(emp => {
            response += `${emp._id}: ${emp.count} employees\n`;
          });
          return {
            type: 'data',
            answer: response.trim()
          };
        }
      }

      // Product/Inventory queries
      if (lowerQuery.includes('product') || lowerQuery.includes('inventory') || lowerQuery.includes('stock')) {
        if (lowerQuery.includes('low stock') || lowerQuery.includes('reorder')) {
          const products = await Product.find({
            'inventory.locations.quantity': { $exists: true }
          }).populate('inventory.locations.warehouse');
          
          const lowStock = products.filter(product => {
            const totalQty = product.inventory.locations.reduce((sum, loc) => sum + loc.quantity, 0);
            return totalQty <= (product.inventory.stockLevels.reorderPoint || 10);
          });
          
          let response = `Found ${lowStock.length} products with low stock levels.\n`;
          lowStock.forEach(p => {
            response += `${p.name} (${p.sku}) - Quantity: ${p.totalQuantity || 0}\n`;
          });
          return {
            type: 'alert',
            answer: response.trim()
          };
        }
        if (lowerQuery.includes('count') || lowerQuery.includes('how many')) {
          const count = await Product.countDocuments({ status: 'active' });
          return {
            type: 'data',
            answer: `There are ${count} active products in inventory.`
          };
        }
      }

      // Customer queries
      if (lowerQuery.includes('customer') || lowerQuery.includes('client')) {
        if (lowerQuery.includes('count') || lowerQuery.includes('how many')) {
          const count = await Customer.countDocuments({ status: 'active' });
          return {
            type: 'data',
            answer: `There are ${count} active customers in the system.`
          };
        }
      }

      // Lead queries
      if (lowerQuery.includes('lead') || lowerQuery.includes('prospect')) {
        const leads = await Lead.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        let response = 'Lead status breakdown:\n';
        leads.forEach(lead => {
          response += `${lead._id}: ${lead.count} leads\n`;
        });
        return {
          type: 'data',
          answer: response.trim()
        };
      }

      // Project queries
      if (lowerQuery.includes('project')) {
        if (lowerQuery.includes('active') || lowerQuery.includes('ongoing')) {
          const count = await Project.countDocuments({ status: 'active' });
          return {
            type: 'data',
            answer: `There are ${count} active projects currently running.`
          };
        }
        if (lowerQuery.includes('overdue') || lowerQuery.includes('delayed')) {
          const overdue = await Project.find({
            status: 'active',
            endDate: { $lt: new Date() }
          });
          
          let response = `Found ${overdue.length} overdue projects that need attention.\n`;
          overdue.forEach(p => {
            response += `${p.name} (${p.code}) - Due: ${p.endDate.toDateString()}\n`;
          });
          
          return {
            type: 'alert',
            answer: response.trim()
          };
        }
      }

      // Leave queries
      if (lowerQuery.includes('leave') || lowerQuery.includes('vacation') || lowerQuery.includes('time off')) {
        if (lowerQuery.includes('pending')) {
          const pending = await Leave.find({ status: 'pending' }).populate('employee');
          let response = `There are ${pending.length} pending leave requests.\n`;
          pending.forEach(l => {
            response += `${l.employee?.fullName} - ${l.leaveType} (${l.totalDays} days)\n`;
          });
          return {
            type: 'data',
            answer: response.trim()
          };
        }
      }

      // Attendance queries
      if (lowerQuery.includes('attendance') || lowerQuery.includes('present') || lowerQuery.includes('absent')) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const attendance = await Attendance.find({
          date: { $gte: today }
        }).populate('employee');
        
        let response = `Today's attendance: ${attendance.length} employees checked in.\n`;
        attendance.forEach(a => {
          response += `${a.employee?.fullName} - ${a.status} (${a.checkIn ? a.checkIn.toLocaleTimeString() : 'N/A'})\n`;
        });
        return {
          type: 'data',
          answer: response.trim()
        };
      }

      // Sales queries
      if (lowerQuery.includes('sales') || lowerQuery.includes('revenue')) {
        return {
          type: 'info',
          answer: 'Sales data analysis is available in the Sales Analytics dashboard. Would you like me to show you the latest sales trends?\nNavigate to Sales > Analytics for detailed reports.'
        };
      }

      // General help
      if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
        return {
          type: 'help',
          answer: 'I can help you with:\n• Employee and HR information\n• Inventory and stock levels\n• Customer and lead data\n• Project status and deadlines\n• Leave requests and attendance\n• Sales and analytics insights\n\nJust ask me questions in natural language!'
        };
      }

      // Default response
      return {
        type: 'info',
        answer: 'I understand you\'re asking about "' + query + '". Could you be more specific? I can help with employees, inventory, customers, projects, leaves, and attendance data.\nTry asking: "How many employees do we have?" or "Show me low stock products"'
      };

    } catch (error) {
      return {
        type: 'error',
        answer: 'Sorry, I encountered an error processing your request. Please try again.'
      };
    }
  }

  static async detectAnomalies(module, data) {
    const anomalies = [];

    switch (module) {
      case 'inventory':
        // Check for unusual stock movements
        if (data.stockMovements) {
          const unusualMovements = data.stockMovements.filter(movement => 
            movement.quantity > 1000 || movement.quantity < -1000
          );
          if (unusualMovements.length > 0) {
            anomalies.push({
              type: 'unusual_stock_movement',
              severity: 'medium',
              description: `Detected ${unusualMovements.length} unusual stock movements`,
              data: unusualMovements
            });
          }
        }
        break;

      case 'sales':
        // Check for unusual sales patterns
        if (data.sales) {
          const avgSale = data.sales.reduce((sum, sale) => sum + sale.amount, 0) / data.sales.length;
          const unusualSales = data.sales.filter(sale => sale.amount > avgSale * 3);
          if (unusualSales.length > 0) {
            anomalies.push({
              type: 'unusual_sale_amount',
              severity: 'low',
              description: `Detected ${unusualSales.length} sales with unusually high amounts`,
              data: unusualSales
            });
          }
        }
        break;

      case 'hr':
        // Check for attendance anomalies
        if (data.attendance) {
          const lateArrivals = data.attendance.filter(record => {
            const checkIn = new Date(record.checkIn);
            return checkIn.getHours() > 9; // After 9 AM
          });
          if (lateArrivals.length > data.attendance.length * 0.3) {
            anomalies.push({
              type: 'high_late_arrivals',
              severity: 'medium',
              description: `${Math.round(lateArrivals.length / data.attendance.length * 100)}% of employees arrived late`,
              data: { percentage: lateArrivals.length / data.attendance.length * 100 }
            });
          }
        }
        break;
    }

    return anomalies;
  }

  static async optimizePrice(productId, marketData) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const currentPrice = product.pricing.sellingPrice;
      const cost = product.pricing.cost;
      const minPrice = cost * 1.1; // 10% markup minimum
      
      // Simple optimization based on market data
      let optimizedPrice = currentPrice;
      let recommendation = 'maintain';

      if (marketData.demand === 'high' && marketData.competition === 'low') {
        optimizedPrice = currentPrice * 1.15; // Increase by 15%
        recommendation = 'increase';
      } else if (marketData.demand === 'low' && marketData.competition === 'high') {
        optimizedPrice = Math.max(minPrice, currentPrice * 0.9); // Decrease by 10% but not below min
        recommendation = 'decrease';
      }

      return {
        productId,
        currentPrice,
        optimizedPrice: Math.round(optimizedPrice * 100) / 100,
        recommendation,
        expectedImpact: {
          revenueChange: `${recommendation === 'increase' ? '+' : recommendation === 'decrease' ? '-' : ''}${Math.abs(Math.round((optimizedPrice - currentPrice) / currentPrice * 100))}%`,
          demandChange: recommendation === 'increase' ? 'May decrease slightly' : recommendation === 'decrease' ? 'May increase' : 'No change expected'
        },
        confidence: 0.75
      };
    } catch (error) {
      throw new Error(`Price optimization failed: ${error.message}`);
    }
  }

  static async getRecommendations(userId) {
    const recommendations = [];

    try {
      // Check for low stock products
      const products = await Product.find({ status: 'active' });
      const lowStockProducts = products.filter(product => {
        const totalQty = product.inventory.locations.reduce((sum, loc) => sum + loc.quantity, 0);
        return totalQty <= (product.inventory.stockLevels.reorderPoint || 10);
      });

      if (lowStockProducts.length > 0) {
        recommendations.push({
          type: 'inventory',
          priority: 'high',
          title: 'Low Stock Alert',
          message: `${lowStockProducts.length} products are running low on stock`,
          action: 'review_inventory',
          data: lowStockProducts.slice(0, 3).map(p => p.name)
        });
      }

      // Check for pending leave requests
      const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
      if (pendingLeaves > 0) {
        recommendations.push({
          type: 'hr',
          priority: 'medium',
          title: 'Pending Leave Requests',
          message: `${pendingLeaves} leave requests need approval`,
          action: 'review_leaves',
          data: { count: pendingLeaves }
        });
      }

      // Check for overdue projects
      const overdueProjects = await Project.find({
        status: 'active',
        endDate: { $lt: new Date() }
      });

      if (overdueProjects.length > 0) {
        recommendations.push({
          type: 'project',
          priority: 'high',
          title: 'Overdue Projects',
          message: `${overdueProjects.length} projects are past their deadline`,
          action: 'review_projects',
          data: overdueProjects.slice(0, 2).map(p => p.name)
        });
      }

      // Check for new leads
      const newLeads = await Lead.countDocuments({ status: 'new' });
      if (newLeads > 5) {
        recommendations.push({
          type: 'sales',
          priority: 'medium',
          title: 'New Leads Available',
          message: `${newLeads} new leads need follow-up`,
          action: 'review_leads',
          data: { count: newLeads }
        });
      }

      return recommendations;
    } catch (error) {
      return [];
    }
  }
}

module.exports = AIAssistantService;