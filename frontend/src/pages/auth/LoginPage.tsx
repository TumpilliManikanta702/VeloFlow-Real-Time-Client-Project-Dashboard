import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { authApi } from '../../api/auth.api.js';
import { useAuthStore } from '../../stores/authStore.js';
import { Button } from '../../components/ui/Button.js';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@velozity.dev');
  const [password, setPassword] = useState('Password123!');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await authApi.login({ email, password });
      const { user, accessToken } = response.data;
      setAuth(user, accessToken);

      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'PROJECT_MANAGER') navigate('/manager/dashboard');
      else navigate('/developer/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const quickSwitch = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 selection:bg-brand-500 selection:text-white relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 text-white shadow-xl shadow-brand-900/50 mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">VeloFlow</h1>
          <p className="text-xs text-slate-400 mt-1">Real-Time Client Project Dashboard</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-7 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-xs text-rose-300 font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@velozity.dev"
                  className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-3 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
              <span>Assessment Demo Personas:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickSwitch('admin@velozity.dev')}
                className="p-2 rounded-lg bg-slate-800/60 border border-slate-750 hover:bg-slate-800 text-left transition-colors"
              >
                <span className="block text-[11px] font-bold text-rose-300">Admin</span>
                <span className="block text-[10px] text-slate-400 font-mono truncate">admin@velozity.dev</span>
              </button>

              <button
                type="button"
                onClick={() => quickSwitch('pm1@velozity.dev')}
                className="p-2 rounded-lg bg-slate-800/60 border border-slate-750 hover:bg-slate-800 text-left transition-colors"
              >
                <span className="block text-[11px] font-bold text-purple-300">Project Manager 1</span>
                <span className="block text-[10px] text-slate-400 font-mono truncate">pm1@velozity.dev</span>
              </button>

              <button
                type="button"
                onClick={() => quickSwitch('pm2@velozity.dev')}
                className="p-2 rounded-lg bg-slate-800/60 border border-slate-750 hover:bg-slate-800 text-left transition-colors"
              >
                <span className="block text-[11px] font-bold text-purple-300">Project Manager 2</span>
                <span className="block text-[10px] text-slate-400 font-mono truncate">pm2@velozity.dev</span>
              </button>

              <button
                type="button"
                onClick={() => quickSwitch('dev1@velozity.dev')}
                className="p-2 rounded-lg bg-slate-800/60 border border-slate-750 hover:bg-slate-800 text-left transition-colors"
              >
                <span className="block text-[11px] font-bold text-cyan-300">Developer 1</span>
                <span className="block text-[10px] text-slate-400 font-mono truncate">dev1@velozity.dev</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Velozity Global Solutions · Secure Senior-Level Assessment Suite
        </p>
      </div>
    </div>
  );
};
