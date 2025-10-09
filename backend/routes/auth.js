const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

const logActivity = async (userId, action, details = '') => {
  try {
    await Activity.create({ userId, action, details });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ 
      name: name.trim(), 
      email: email.toLowerCase(), 
      password, 
      role: role || 'employee' 
    });
    await user.save();
    await logActivity(user._id, 'Account created');

    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password
router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    // In production, send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`);
    
    res.json({ message: 'Password reset token generated', token: resetToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Change Password
router.post('/change-password', require('../middleware/auth'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    
    const user = await User.findById(req.user._id);
    const isValidPassword = await user.comparePassword(currentPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    await logActivity(req.user._id, 'Password changed');
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Profile
router.put('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    
    const updateData = { name: name.trim(), email: email.toLowerCase() };
    if (avatar) updateData.avatar = avatar;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    );
    
    await logActivity(req.user._id, 'Profile updated');
    
    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Log Activity
router.post('/log-activity', require('../middleware/auth'), async (req, res) => {
  try {
    const { action } = req.body;
    await logActivity(req.user._id, action);
    res.json({ message: 'Activity logged' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Activities
router.get('/activities', require('../middleware/auth'), async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(10);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify Token
router.get('/verify', require('../middleware/auth'), async (req, res) => {
  res.json({ 
    user: { 
      id: req.user._id, 
      name: req.user.name, 
      email: req.user.email, 
      role: req.user.role,
      lastLogin: req.user.lastLogin,
      avatar: req.user.avatar
    } 
  });
});

// Login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }
    
    if (user.isLocked) {
      const lockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ 
        message: `Account locked. Try again in ${lockTime} minutes.`,
        lockUntil: user.lockUntil
      });
    }
    
    const isValidPassword = await user.comparePassword(password);
    
    if (!isValidPassword) {
      await user.incLoginAttempts();
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    await user.resetLoginAttempts();
    await user.updateLastLogin();
    await logActivity(user._id, 'Login successful');

    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        lastLogin: user.lastLogin,
        avatar: user.avatar
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;