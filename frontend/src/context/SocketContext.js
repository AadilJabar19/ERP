import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      const newSocket = io('http://localhost:5000', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      // Real-time event listeners
      newSocket.on('inventory_updated', (data) => {
        addNotification('Inventory Updated', `${data.productName} stock changed`, 'info');
      });

      newSocket.on('new_sale', (data) => {
        addNotification('New Sale', `Sale ${data.saleId} created`, 'success');
      });

      newSocket.on('employee_activity', (data) => {
        addNotification('Employee Activity', `${data.employeeName} checked in`, 'info');
      });

      newSocket.on('lead_activity', (data) => {
        addNotification('Lead Update', `Lead ${data.leadNumber} updated`, 'warning');
      });

      newSocket.on('inventory_alert', (data) => {
        addNotification('Stock Alert', `${data.productName} is low on stock`, 'error');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const addNotification = (title, message, type) => {
    const notification = {
      id: Date.now(),
      title,
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const emitEvent = (event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      notifications,
      removeNotification,
      emitEvent
    }}>
      {children}
    </SocketContext.Provider>
  );
};