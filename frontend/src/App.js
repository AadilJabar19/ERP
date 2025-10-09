import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { setupAxiosInterceptors } from './utils/csrf';
import NotificationPanel from './components/NotificationPanel';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Calendar from './pages/Calendar';
import Attendance from './pages/Attendance';
import CheckIn from './pages/CheckIn';
import Projects from './pages/Projects';
import CRM from './pages/CRM';
import HRM from './pages/HRM';
import InventoryManagement from './pages/InventoryManagement';
import SalesManagement from './pages/SalesManagement';
import Admin from './pages/Admin';
import Finance from './pages/Finance';
import Profile from './pages/Profile';
import Login from './pages/Login';
import './App.scss';

function App() {
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
        <div className="App">
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />

              <Route path="/inventory" element={<Inventory />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/checkin" element={<CheckIn />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/hrm" element={<HRM />} />
              <Route path="/inventory-mgmt" element={<InventoryManagement />} />
              <Route path="/sales-mgmt" element={<SalesManagement />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
          <NotificationPanel />
        </div>
      </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;