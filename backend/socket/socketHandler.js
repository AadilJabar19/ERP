const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new Error('User not found'));
    }
    
    socket.userId = user._id.toString();
    socket.userRole = user.role;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

const handleConnection = (io) => {
  io.use(socketAuth);
  
  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);
    
    // Join user to their role room
    socket.join(socket.userRole);
    socket.join(`user_${socket.userId}`);
    
    // Handle real-time events
    socket.on('inventory_update', (data) => {
      socket.broadcast.emit('inventory_updated', data);
    });
    
    socket.on('sale_created', (data) => {
      io.emit('new_sale', data);
    });
    
    socket.on('employee_checkin', (data) => {
      io.to('admin').to('manager').emit('employee_activity', data);
    });
    
    socket.on('lead_updated', (data) => {
      io.to('admin').to('manager').emit('lead_activity', data);
    });
    
    socket.on('stock_alert', (data) => {
      io.to('admin').to('manager').emit('inventory_alert', data);
    });
    
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
};

const emitToRole = (io, role, event, data) => {
  io.to(role).emit(event, data);
};

const emitToUser = (io, userId, event, data) => {
  io.to(`user_${userId}`).emit(event, data);
};

const emitToAll = (io, event, data) => {
  io.emit(event, data);
};

module.exports = { handleConnection, emitToRole, emitToUser, emitToAll };