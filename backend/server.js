const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const { csrfProtection, generateToken } = require('./middleware/csrf');
const { handleConnection } = require('./socket/socketHandler');
const { createFallbackRouter } = require('./utils/routeFallback');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  }
});
const PORT = process.env.PORT || 5000;

// Initialize WebSocket
handleConnection(io);

// Make io available to routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-erp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  const token = generateToken(req);
  res.json({ csrfToken: token });
});

// Routes
console.log('Loading Production ERP routes...');

// Auth routes (no CSRF protection)
try {
  app.use('/api/auth', require('./routes/auth'));
} catch (error) {
  console.error('Error loading auth route:', error);
}

// AI Assistant route (no CSRF protection)
try {
  app.use('/api/ai-assistant', require('./routes/ai-assistant'));
  console.log('✓ Loaded /api/ai-assistant (no CSRF)');
} catch (error) {
  console.error('Error loading AI assistant route:', error);
}

// Apply CSRF protection to all other routes (temporarily disabled)
// app.use('/api', csrfProtection);

// Load routes with error handling
const routes = [
  { path: '/api/inventory', file: './routes/inventory' },
  { path: '/api/sales', file: './routes/sales' },
  { path: '/api/attendance', file: './routes/attendance' },
  { path: '/api/events', file: './routes/events' },
  { path: '/api/projects', file: './routes/projects' },
  { path: '/api/invoices', file: './routes/invoices' },
  { path: '/api/customers', file: './routes/customers' },
  { path: '/api/payroll', file: './routes/payroll' },
  { path: '/api/hrm', file: './routes/hrm' },
  { path: '/api/finance', file: './routes/finance' },
  { path: '/api/suppliers', file: './routes/suppliers' },
  { path: '/api/admin', file: './routes/admin' },
  { path: '/api/dashboard', file: './routes/dashboard' }
];

// Optional new routes
const optionalRoutes = [
  { path: '/api/procurement', file: './routes/procurement' },
  { path: '/api/helpdesk', file: './routes/helpdesk' },
  { path: '/api/manufacturing', file: './routes/manufacturing' },
  { path: '/api/system', file: './routes/system' },
  { path: '/api/ai-analytics', file: './routes/ai-analytics' },
  { path: '/api/integrations', file: './routes/integrations' },
  { path: '/api/automation', file: './routes/automation' }
];

// Load core routes
routes.forEach(route => {
  try {
    app.use(route.path, require(route.file));
    console.log(`✓ Loaded ${route.path}`);
  } catch (error) {
    console.error(`✗ Error loading ${route.path}:`, error.message);
  }
});

// Load optional routes with fallbacks
optionalRoutes.forEach(route => {
  try {
    app.use(route.path, require(route.file));
    console.log(`✓ Loaded ${route.path}`);
  } catch (error) {
    console.warn(`⚠ ${route.path} not loaded, using fallback:`, error.message);
    const moduleName = route.path.replace('/api/', '').toUpperCase();
    app.use(route.path, createFallbackRouter(moduleName));
  }
});

console.log('Route loading completed');

app.get('/', (req, res) => {
  res.json({ message: 'Mini ERP API is running!' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});



server.listen(PORT, () => {
  console.log(`Server with WebSocket is running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server startup error:', err);
});