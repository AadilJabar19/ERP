const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendNotification(to, subject, html, text) {
    if (!process.env.SMTP_USER) {
      console.log('Email service not configured, skipping notification');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
        text
      });
      console.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      console.error('Email send failed:', error);
    }
  }

  async sendLeaveApproval(employee, leave) {
    const subject = `Leave Request ${leave.status}`;
    const html = `
      <h2>Leave Request Update</h2>
      <p>Dear ${employee.name},</p>
      <p>Your leave request from ${leave.startDate} to ${leave.endDate} has been <strong>${leave.status}</strong>.</p>
      <p>Reason: ${leave.reason}</p>
      <p>Best regards,<br>Claryx ERP System</p>
    `;
    
    await this.sendNotification(employee.email, subject, html);
  }

  async sendLowStockAlert(managers, product) {
    const subject = `Low Stock Alert: ${product.name}`;
    const html = `
      <h2>Low Stock Alert</h2>
      <p>Product: <strong>${product.name}</strong></p>
      <p>Current Stock: <strong>${product.stock}</strong></p>
      <p>Minimum Stock: <strong>${product.minStock}</strong></p>
      <p>Please reorder immediately.</p>
    `;
    
    for (const manager of managers) {
      await this.sendNotification(manager.email, subject, html);
    }
  }
}

module.exports = new EmailService();