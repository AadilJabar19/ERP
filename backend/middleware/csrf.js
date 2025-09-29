const csrf = require('csrf');
const tokens = new csrf();

const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests and auth endpoints
  if (req.method === 'GET' || req.path.includes('/api/auth/')) {
    return next();
  }

  const secret = req.session?.csrfSecret || tokens.secretSync();
  const token = req.headers['x-csrf-token'] || req.body._csrf;

  if (!req.session) {
    return res.status(403).json({ message: 'Session required for CSRF protection' });
  }

  if (!req.session.csrfSecret) {
    req.session.csrfSecret = secret;
  }

  if (!token || !tokens.verify(req.session.csrfSecret, token)) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  next();
};

const generateToken = (req) => {
  if (!req.session) return null;
  
  const secret = req.session.csrfSecret || tokens.secretSync();
  if (!req.session.csrfSecret) {
    req.session.csrfSecret = secret;
  }
  
  return tokens.create(secret);
};

module.exports = { csrfProtection, generateToken };