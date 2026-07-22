import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/pos', label: 'POS Billing', icon: 'M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4' },
  { to: '/products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { to: '/orders', label: 'Orders', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
];

const pageTitles = { '/dashboard': 'Dashboard', '/pos': 'POS Billing', '/products': 'Products', '/orders': 'Order History' };

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U';
  const title = pageTitles[location.pathname] || 'RiceBillingApp';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>🌾 RiceBilling</h2>
          <p>Point of Sale System</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <Icon d={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <p>{user?.username}</p>
              <span>{isAdmin() ? 'Admin' : 'Staff'}</span>
            </div>
          </div>
          <button className="nav-item" onClick={handleLogout} style={{ color: '#f87171' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:18,height:18}}>
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>
      <div className="main-content">
        <header className="topbar">
          <div>
            <div className="topbar-title">{title}</div>
          </div>
          <div className="topbar-actions">
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Welcome, <strong style={{ color: 'var(--text)' }}>{user?.username}</strong></span>
          </div>
        </header>
        <div className="page-wrapper page-load">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
