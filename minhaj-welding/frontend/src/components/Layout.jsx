import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import IconImg from './IconImg';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', roles: null },
  { to: '/calculators', label: 'Calculators', icon: 'pos', roles: null },
  { to: '/rates', label: 'Rates', icon: 'ledger', roles: ['super_admin', 'admin', 'manager'] },
  { to: '/catalog', label: 'Catalog', icon: 'ledger', roles: ['super_admin', 'admin', 'manager'] },
  { to: '/customers', label: 'Customers', icon: 'appointment', roles: null },
  { to: '/leads', label: 'Leads', icon: 'appointment', roles: ['super_admin', 'admin', 'manager'] },
  { to: '/quotations', label: 'Quotations', icon: 'pdf', roles: null },
  { to: '/invoices', label: 'Invoices', icon: 'expenses', roles: ['super_admin', 'admin', 'manager', 'accounts'] },
  { to: '/projects', label: 'Projects', icon: 'appointment', roles: ['super_admin', 'admin', 'manager', 'project_manager'] },
  { to: '/expenses', label: 'Expenses', icon: 'expenses', roles: ['super_admin', 'admin', 'manager', 'accounts'] },
  { to: '/inventory', label: 'Inventory', icon: 'pos', roles: ['super_admin', 'admin', 'manager', 'inventory'] },
  { to: '/machinery', label: 'Machinery', icon: 'pos', roles: ['super_admin', 'admin', 'manager'] },
  { to: '/reports', label: 'Reports', icon: 'reports', roles: ['super_admin', 'admin', 'manager', 'accounts'] },
  { to: '/audit-log', label: 'Audit Log', icon: 'bell', roles: ['super_admin', 'admin', 'manager'] },
  { to: '/media', label: 'Media Library', icon: 'pos', roles: ['super_admin', 'admin', 'manager'] },
  { to: '/website', label: 'Website', icon: 'pdf', roles: ['super_admin', 'admin'] },
  { to: '/custom-fields', label: 'Custom Fields', icon: 'settings', roles: ['super_admin', 'admin'] },
  { to: '/users', label: 'Users', icon: 'settings', roles: ['super_admin', 'admin'] },
  { to: '/settings', label: 'Settings', icon: 'settings', roles: ['super_admin', 'admin'] },
];

const visibleFor = (role) => NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));

// Bottom nav on mobile shows max 5 items (Section 7 rule)

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = visibleFor(user?.role);
  const mobileNavItems = navItems.slice(0, 5);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg">
      {/* ---- Desktop / Tablet Sidebar ---- */}
      <aside className="hidden md:flex md:flex-col w-56 lg:w-64 border-r border-border shrink-0 min-h-screen">
        <div className="p-4 border-b border-border">
          <div className="font-bold text-lg leading-tight">MINHAJ</div>
          <div className="font-bold text-lg leading-tight text-brand">WELDING</div>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-input text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand text-white' : 'text-text hover:bg-gray-100'
                }`
              }
            >
              <IconImg name={item.icon} size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <a href="/site" target="_blank" rel="noreferrer" className="btn-outline text-sm w-full block text-center mb-2">View Public Site ↗</a>
          <div className="text-xs text-text-secondary mb-2 truncate">{user?.name} — {user?.role}</div>
          <button onClick={handleLogout} className="btn-ghost text-sm w-full text-left">Logout</button>
        </div>
      </aside>

      {/* ---- Top bar (mobile) ---- */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-bg z-10">
        <div className="font-bold">MINHAJ <span className="text-brand">WELDING</span></div>
        <IconImg name="bell" size={22} />
      </header>

      {/* ---- Main content ---- */}
      <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 max-w-full overflow-x-hidden">
        <Outlet />
      </main>

      {/* ---- Bottom nav (mobile only, max 5 items, min 44px tap targets) ---- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around items-center h-16 z-20">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] text-[10px] ${
                isActive ? 'text-brand' : 'text-text-secondary'
              }`
            }
          >
            <IconImg name={item.icon} size={22} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
