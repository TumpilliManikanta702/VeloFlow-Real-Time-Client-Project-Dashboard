import React from 'react';
import { Menu, Shield } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { NotificationPopover } from '../notifications/NotificationPopover.js';
import { Badge } from '../ui/Badge.js';

export const TopNav: React.FC = () => {
  const { user } = useAuthStore();
  const { toggleSidebar } = useUiStore();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
            Enterprise RBAC Enforced
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-[11px] text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time Active</span>
        </div>

        <NotificationPopover />
        <Badge role={user.role} />
      </div>
    </header>
  );
};
