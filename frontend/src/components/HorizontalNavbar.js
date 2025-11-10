import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlobalSearch from './GlobalSearch';
import NotificationCenter from './NotificationCenter';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import '../styles/components/HorizontalNavbar.scss';

// Material-UI Icons
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FolderIcon from '@mui/icons-material/Folder';
import BuildIcon from '@mui/icons-material/Build';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const DropdownMenu = ({ title, icon, children, isOpen, onToggle, onClose }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (onClose) onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div className="nav-dropdown" ref={dropdownRef}>
      <button className="nav-dropdown-trigger" onClick={onToggle}>
        <span className="nav-icon">{icon}</span>
        <span className="nav-label">{title}</span>
        <KeyboardArrowDownIcon className={`nav-arrow ${isOpen ? 'open' : ''}`} fontSize="small" />
      </button>
      {isOpen && (
        <div className="nav-dropdown-menu">
          {children}
        </div>
      )}
    </div>
  );
};

const HorizontalNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const { user, logout, hasRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  if (!user) {
    return (
      <nav className="horizontal-navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">🏢</span>
            <span className="brand-text">Claryx ERP</span>
          </Link>
          <div className="navbar-right">
            <Link to="/login" className="nav-link-button">{t('login')}</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="horizontal-navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={closeMenus}>
          <BusinessIcon className="brand-icon" />
          <span className="brand-text">Claryx ERP</span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Main Navigation */}
        <div className={`navbar-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="navbar-nav">
            <DropdownMenu
              title="HR"
              icon={<PeopleIcon fontSize="small" />}
              isOpen={openDropdown === 'hr'}
              onToggle={() => toggleDropdown('hr')}
              onClose={() => setOpenDropdown(null)}
            >
              <Link to="/hrm" onClick={closeMenus}>👥 {t('employees')} Management</Link>
              <Link to="/attendance-system" onClick={closeMenus}>📊 {t('attendance')}</Link>
              <Link to="/checkin" onClick={closeMenus}>⏰ Check-In/Out</Link>
            </DropdownMenu>

            <DropdownMenu
              title="Operations"
              icon={<InventoryIcon fontSize="small" />}
              isOpen={openDropdown === 'ops'}
              onToggle={() => toggleDropdown('ops')}
              onClose={() => setOpenDropdown(null)}
            >
              <Link to="/inventory-mgmt" onClick={closeMenus}>📦 {t('inventory')}</Link>
              {hasRole(['admin', 'manager']) && (
                <>
                  <Link to="/procurement" onClick={closeMenus}>🛒 Procurement</Link>
                  <Link to="/manufacturing" onClick={closeMenus}>🏭 Manufacturing</Link>
                </>
              )}
            </DropdownMenu>

            <DropdownMenu
              title="Sales"
              icon={<AttachMoneyIcon fontSize="small" />}
              isOpen={openDropdown === 'sales'}
              onToggle={() => toggleDropdown('sales')}
              onClose={() => setOpenDropdown(null)}
            >
              <Link to="/sales-mgmt" onClick={closeMenus}>💰 {t('sales')} Management</Link>
              <Link to="/crm-system" onClick={closeMenus}>🤝 CRM System</Link>
            </DropdownMenu>

            {hasRole(['admin', 'manager']) && (
              <DropdownMenu
                title="Finance"
                icon={<AttachMoneyIcon fontSize="small" />}
                isOpen={openDropdown === 'finance'}
                onToggle={() => toggleDropdown('finance')}
                onClose={() => setOpenDropdown(null)}
              >
                <Link to="/finance-mgmt" onClick={closeMenus}>💳 {t('finance')} Management</Link>
              </DropdownMenu>
            )}

            <DropdownMenu
              title="Projects"
              icon={<FolderIcon fontSize="small" />}
              isOpen={openDropdown === 'projects'}
              onToggle={() => toggleDropdown('projects')}
              onClose={() => setOpenDropdown(null)}
            >
              <Link to="/projects" onClick={closeMenus}>📋 {t('projects')}</Link>
            </DropdownMenu>

            <DropdownMenu
              title="Tools"
              icon={<BuildIcon fontSize="small" />}
              isOpen={openDropdown === 'tools'}
              onToggle={() => toggleDropdown('tools')}
              onClose={() => setOpenDropdown(null)}
            >
              <Link to="/calendar-system" onClick={closeMenus}>📅 {t('calendar')}</Link>
              <Link to="/helpdesk" onClick={closeMenus}>🎧 Helpdesk</Link>
              <Link to="/ai-assistant" onClick={closeMenus}>🤖 AI Assistant</Link>
              {hasRole(['admin', 'manager']) && (
                <Link to="/ai-insights" onClick={closeMenus}>📈 AI Insights</Link>
              )}
            </DropdownMenu>

            {hasRole(['admin']) && (
              <DropdownMenu
                title="Admin"
                icon={<AdminPanelSettingsIcon fontSize="small" />}
                isOpen={openDropdown === 'admin'}
                onToggle={() => toggleDropdown('admin')}
                onClose={() => setOpenDropdown(null)}
              >
                <Link to="/admin-panel" onClick={closeMenus}>⚙️ Admin Panel</Link>
                <Link to="/system-config" onClick={closeMenus}>🔧 System Config</Link>
                <Link to="/integrations" onClick={closeMenus}>🔗 Integrations</Link>
              </DropdownMenu>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="navbar-actions">
            <GlobalSearch />
            
            {/* User Menu */}
            <div className="nav-dropdown user-dropdown">
              <button 
                className="user-menu-trigger"
                onClick={() => toggleDropdown('user')}
              >
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{user.name?.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                  )}
                </div>
                <KeyboardArrowDownIcon className={`nav-arrow ${openDropdown === 'user' ? 'open' : ''}`} fontSize="small" />
              </button>
              {openDropdown === 'user' && (
                <div className="nav-dropdown-menu user-menu">
                  <Link to="/profile-system" onClick={closeMenus} className="user-menu-header-link">
                    <div className="user-menu-header">
                      <div className="user-info-detail">
                        <div className="user-name-large">{user.name}</div>
                        <div className="user-role">{user.role}</div>
                      </div>
                    </div>
                  </Link>
                  <div className="user-menu-divider"></div>
                  <div className="user-menu-item-inline">
                    <NotificationsIcon fontSize="small" /> Notifications
                    <NotificationCenter />
                  </div>
                  <div className="user-menu-item-inline">
                    <DarkModeIcon fontSize="small" /> Dark Mode
                    <ThemeToggle />
                  </div>
                  <div className="user-menu-item-inline">
                    🌍 Language
                    <LanguageSelector />
                  </div>
                  <div className="user-menu-divider"></div>
                  <Link to="/profile-system" onClick={closeMenus}>
                    <SettingsIcon fontSize="small" /> {t('settings')}
                  </Link>
                  <div className="user-menu-divider"></div>
                  <button onClick={handleLogout}>
                    <LogoutIcon fontSize="small" /> {t('logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default HorizontalNavbar;
