import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
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
import CRMSystem from './pages/CRMSystem';
import CalendarSystem from './pages/CalendarSystem';
import AttendanceSystem from './pages/AttendanceSystem';
import AdminPanel from './pages/AdminPanel';
import ProfileSystem from './pages/ProfileSystem';
import FinanceManagement from './pages/FinanceManagement';
import Admin from './pages/Admin';
import Finance from './pages/Finance';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Procurement from './pages/Procurement';
import Helpdesk from './pages/Helpdesk';
import Manufacturing from './pages/Manufacturing';
import AIInsights from './pages/AIInsights';
import SystemConfig from './pages/SystemConfig';
import Integrations from './pages/Integrations';
import AIAssistantPage from './pages/AIAssistant';
import AIAssistant from './components/AIAssistant';
import './App.scss';

function App() {
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
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
              <Route path="/crm-system" element={<CRMSystem />} />
              <Route path="/hrm" element={<HRM />} />
              <Route path="/inventory-mgmt" element={<InventoryManagement />} />
              <Route path="/sales-mgmt" element={<SalesManagement />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/finance-mgmt" element={<FinanceManagement />} />
              <Route path="/calendar-system" element={<CalendarSystem />} />
              <Route path="/attendance-system" element={<AttendanceSystem />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile-system" element={<ProfileSystem />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin-panel" element={<AdminPanel />} />
              <Route path="/procurement" element={<Procurement />} />
              <Route path="/helpdesk" element={<Helpdesk />} />
              <Route path="/manufacturing" element={<Manufacturing />} />
              <Route path="/ai-insights" element={<AIInsights />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />
              <Route path="/system-config" element={<SystemConfig />} />
              <Route path="/integrations" element={<Integrations />} />
            </Routes>
          </div>
          <NotificationPanel />
          <AIAssistant />
        </div>
          </Router>
        </SocketProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;