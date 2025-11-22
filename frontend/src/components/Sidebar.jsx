import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Package, 
  Calendar, 
  Box, 
  MapPin, 
  FileText, 
  BarChart3, 
  Settings,
  Wrench,
  FolderOpen,
  Shield,
  Calculator,
  Mail
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/work-orders', icon: ClipboardList, label: 'Work Orders' },
    { path: '/assets', icon: Package, label: 'Assets' },
    { path: '/preventive-maintenance', icon: Calendar, label: 'Preventive Maintenance' },
    { path: '/inventory', icon: Box, label: 'Inventory' },
    { path: '/requests', icon: FileText, label: 'Service Requests' },
    { path: '/locations', icon: MapPin, label: 'Locations' },
    { path: '/documents', icon: FolderOpen, label: 'Documents' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/budget', icon: Calculator, label: 'Budget Calculations' },
    { path: '/email', icon: Mail, label: 'Email Communication' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">CMMS MADAMPE MILLS</h1>
            <p className="text-xs text-slate-400">Maintenance Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
          
          {/* Admin Section */}
          <li className="mt-8 pt-8 border-t border-slate-700">
            <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Administration
            </div>
          </li>
          <li>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Admin Dashboard</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
            SM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Sarah Johnson</p>
            <p className="text-xs text-slate-400">Maintenance Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;