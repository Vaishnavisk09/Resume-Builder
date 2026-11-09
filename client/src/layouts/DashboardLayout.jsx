import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Zap, Briefcase, Settings,
  LogOut, ChevronLeft, ChevronRight, Plus, Star,
  BarChart2, User, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/resumes', icon: FileText, label: 'My Resumes' },
  { path: '/builder', icon: Plus, label: 'New Resume', isAction: true },
  { path: '/analyzer', icon: BarChart2, label: 'ATS Analyzer' },
  { path: '/job-matcher', icon: Briefcase, label: 'Job Matcher' },
  { path: '/templates', icon: Star, label: 'Templates' },
];

const bottomItems = [
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/profile', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-6 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-white font-bold text-lg tracking-tight">ResumeIQ</span>
            <span className="block text-xs text-slate-400 -mt-0.5">AI Career Assistant</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label, isAction }) => (
          <Link
            key={label}
            to={path}
            onClick={() => setMobileOpen(false)}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200 cursor-pointer group relative
              ${isAction
                ? 'bg-primary text-white hover:bg-primary-600 shadow-sm'
                : isActive(path) && !isAction
                  ? 'bg-white/15 text-white'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
            {!collapsed && <span>{label}</span>}
            {collapsed && (
              <div className="absolute left-full ml-3 px-2 py-1 bg-navy-light text-white text-xs rounded-lg
                opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-white/10">
                {label}
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4 space-y-1">
        {bottomItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={label}
            to={path}
            onClick={() => setMobileOpen(false)}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200 group relative
              ${isActive(path) ? 'bg-white/15 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}

        {/* User info */}
        <div className={`mt-3 px-3 py-3 rounded-xl bg-white/5 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(user?.name || 'U')}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-slate-400 text-xs truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-white/10"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-navy transition-all duration-300 flex-shrink-0 relative
        ${collapsed ? 'w-[70px]' : 'w-[240px]'}`}>
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 bg-white border border-border rounded-full w-6 h-6
            flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10 text-secondary-text"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-[240px] bg-navy flex flex-col h-full">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-border">
          <button onClick={() => setMobileOpen(true)} className="text-secondary-text">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-main-text">ResumeIQ</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold">
            {getInitials(user?.name || 'U')}
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
