const crypto = require('crypto');

// Biometric authentication middleware
const biometricAuth = async (req, res, next) => {
  try {
    const { biometricData, biometricType } = req.body;
    
    if (!biometricData || !biometricType) {
      return res.status(400).json({ message: 'Biometric data required' });
    }

    // Simulate biometric verification
    const isValid = await verifyBiometric(biometricData, biometricType);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Biometric verification failed' });
    }

    req.biometricVerified = true;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Biometric verification error' });
  }
};

// Multi-factor authentication
const mfaAuth = async (req, res, next) => {
  try {
    const { mfaCode, mfaMethod } = req.body;
    
    if (!mfaCode || !mfaMethod) {
      return res.status(400).json({ message: 'MFA code required' });
    }

    const isValid = await verifyMFA(mfaCode, mfaMethod, req.user);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid MFA code' });
    }

    req.mfaVerified = true;
    next();
  } catch (error) {
    res.status(500).json({ message: 'MFA verification error' });
  }
};

// Risk-based authentication
const riskAuth = async (req, res, next) => {
  try {
    const riskScore = calculateRiskScore(req);
    
    if (riskScore > 70) {
      return res.status(403).json({ 
        message: 'High-risk login detected. Additional verification required.',
        riskScore 
      });
    }

    req.riskScore = riskScore;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Risk assessment error' });
  }
};

// Helper functions
async function verifyBiometric(data, type) {
  // Simulate biometric verification
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return hash.length > 0; // Simple validation
}

async function verifyMFA(code, method, user) {
  // Simulate MFA verification
  if (method === 'totp') {
    return code.length === 6 && /^\d+$/.test(code);
  }
  if (method === 'sms') {
    return code.length === 6 && /^\d+$/.test(code);
  }
  return false;
}

function calculateRiskScore(req) {
  let score = 0;
  
  // Check for unusual IP
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.ip || req.connection.remoteAddress;
  
  // Simple risk factors
  if (!userAgent.includes('Chrome') && !userAgent.includes('Firefox')) score += 20;
  if (ip && ip.startsWith('192.168.')) score -= 10; // Local network
  if (req.headers['x-forwarded-for']) score += 15; // Proxy/VPN
  
  // Time-based risk
  const hour = new Date().getHours();
  if (hour < 6 || hour > 22) score += 25; // Off-hours
  
  return Math.max(0, Math.min(100, score));
}

module.exports = { biometricAuth, mfaAuth, riskAuth };