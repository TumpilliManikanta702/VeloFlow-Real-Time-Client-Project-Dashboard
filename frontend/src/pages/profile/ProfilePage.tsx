import React from 'react';
import { useAuthStore } from '../../stores/authStore.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { User, Shield, Mail, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/date.js';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">My Account Profile</h1>
        <p className="text-xs text-slate-400 mt-1">Authenticated user credentials and security authorizations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Identity</CardTitle>
        </CardHeader>

        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-brand-900/40">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">{user.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge role={user.role} />
                <span className="text-xs text-slate-500 font-mono">ID: {user.id}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-850/60 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="font-semibold">Email</span>
              </div>
              <p className="text-slate-200 font-mono">{user.email}</p>
            </div>

            <div className="p-3 bg-slate-850/60 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Shield className="w-4 h-4 text-slate-500" />
                <span className="font-semibold">Authorization Level</span>
              </div>
              <p className="text-slate-200 font-mono">{user.role}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
