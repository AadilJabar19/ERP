const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const { csrfProtection, generateToken } = require('./middleware/csrf');
const { handleConnection } = require('./socket/socketHandler');
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
// Apply CSRF protection to all routes except auth
app.use('/api', csrfProtection);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/events', require('./routes/events'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/hrm', require('./routes/hrm'));
console.log('All routes loaded successfully');

app.get('/', (req, res) => {
  res.json({ message: 'Mini ERP API is running!' });
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