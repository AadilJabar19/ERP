const csrf = require('csrf');
const tokens = new csrf();

const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests and auth endpoints
  if (req.method === 'GET' || req.path.includes('/api/auth/')) {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;

  if (!req.session) {
    console.log('CSRF: No session found');
    return res.status(403).json({ message: 'Session required for CSRF protection' });
  }

  if (!req.session.csrfSecret) {
    console.log('CSRF: No secret in session, generating new one');
    req.session.csrfSecret = tokens.secretSync();
  }

  if (!token) {
    console.log('CSRF: No token provided');
    return res.status(403).json({ message: 'CSRF token required' });
  }

  if (!tokens.verify(req.session.csrfSecret, token)) {
    console.log('CSRF: Token verification failed');
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  next();
};

const generateToken = (req) => {
  if (!req.session) {
    console.log('Generate token: No session');
    return null;
  }
  
  if (!req.session.csrfSecret) {
    req.session.csrfSecret = tokens.secretSync();
    console.log('Generate token: Created new secret');
  }
  
  const token = tokens.create(req.session.csrfSecret);
  console.log('Generate token: Token created successfully');
  return token;
};

module.exports = { csrfProtection, generateToken };