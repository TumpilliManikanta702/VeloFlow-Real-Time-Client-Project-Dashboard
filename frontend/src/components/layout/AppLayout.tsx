import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { TopNav } from './TopNav.js';
import { useAuthStore } from '../../stores/authStore.js';
import { useUiStore } from '../../stores/uiStore.js';
import { useSocket } from '../../hooks/useSocket.js';
import { cn } from '../../utils/cn.js';

export const AppLayout: React.FC = () => {
  const { user, isLoading } = useAuthStore();
  const { sidebarOpen, reconnectNotice, setReconnectNotice } = useUiStore();

  // Initialize socket event bindings and query cache invalidators
  useSocket();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-slate-400">Authenticating VeloFlow session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar />
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300',
          sidebarOpen ? 'md:ml-64' : 'md:ml-20'
        )}
      >
        <TopNav />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {reconnectNotice && (
            <div className="mb-6 px-4 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-200 flex items-center justify-between shadow-lg shadow-emerald-950/50">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium">{reconnectNotice}</span>
              </div>
              <button
                onClick={() => setReconnectNotice(null)}
                className="text-emerald-400 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-emerald-900/50 transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
