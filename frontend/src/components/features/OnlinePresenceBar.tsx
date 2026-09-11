import React from 'react';
import { User } from '../../types/index.js';
import { Users } from 'lucide-react';

interface OnlinePresenceBarProps {
  activeUsers: User[];
  totalActiveCount?: number;
}

export const OnlinePresenceBar: React.FC<OnlinePresenceBarProps> = ({
  activeUsers,
  totalActiveCount = 0,
}) => {
  const displayCount = totalActiveCount || activeUsers.length;

  return (
    <div className="flex items-center justify-between p-4 bg-slate-900/70 border border-slate-800 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
            <Users className="w-4 h-4" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-slate-200">Active Presence</h4>
          <p className="text-[11px] text-slate-400 font-mono">
            {displayCount} {displayCount === 1 ? 'user' : 'users'} online right now
          </p>
        </div>
      </div>

      <div className="flex items-center -space-x-2 overflow-hidden">
        {activeUsers.slice(0, 6).map((u) => (
          <div
            key={u.id}
            title={`${u.name} (${u.role})`}
            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 text-[10px] font-bold text-slate-200 uppercase ring-1 ring-slate-700"
          >
            {u.name.slice(0, 2)}
          </div>
        ))}
        {activeUsers.length > 6 && (
          <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 text-[10px] font-medium text-slate-400">
            +{activeUsers.length - 6}
          </div>
        )}
      </div>
    </div>
  );
};
