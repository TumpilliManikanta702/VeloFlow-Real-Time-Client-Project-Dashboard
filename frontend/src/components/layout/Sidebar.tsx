import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Building2,
  Activity,
  LogOut,
  Layers,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { authApi } from '../../api/auth.api.js';
import { Badge } from '../ui/Badge.js';
import { cn } from '../../utils/cn.js';

export const Sidebar: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const { sidebarOpen } = useUiStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore error on logout
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  if (!user) return null;

  const role = user.role;

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
    { to: '/admin/users', label: 'Team Members', icon: Users },
    { to: '/admin/clients', label: 'Clients', icon: Building2 },
    { to: '/admin/activity', label: 'Global Activity', icon: Activity },
  ];

  const managerLinks = [
    { to: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/manager/projects', label: 'My Projects', icon: FolderKanban },
    { to: '/manager/tasks', label: 'Project Tasks', icon: CheckSquare },
    { to: '/manager/activity', label: 'Team Activity', icon: Activity },
  ];

  const devLinks = [
    { to: '/developer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/developer/tasks', label: 'My Tasks', icon: CheckSquare },
    { to: '/developer/activity', label: 'Task Activity', icon: Activity },
  ];

  const navLinks = role === 'ADMIN' ? adminLinks : role === 'PROJECT_MANAGER' ? managerLinks : devLinks;

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 w-64',
        !sidebarOpen && '-translate-x-full md:translate-x-0 md:w-20'
      )}
    >
      <div className="flex items-center gap-3 h-16 px-6 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-900/40">
          <Layers className="w-5 h-5" />
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <span className="font-bold text-base tracking-tight text-white block">VeloFlow</span>
            <span className="text-[10px] text-brand-400 font-mono tracking-wider uppercase block -mt-1">
              Real-Time SaaS
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group',
                  isActive
                    ? 'bg-brand-600/15 text-brand-300 border border-brand-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                )
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/80 border border-slate-800 mb-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
              <Badge role={user.role} className="text-[9px] px-1 py-0 mt-0.5" />
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
