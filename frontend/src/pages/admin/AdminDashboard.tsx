import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboard.api.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { OnlinePresenceBar } from '../../components/features/OnlinePresenceBar.js';
import { ActivityTimeline } from '../../components/features/ActivityTimeline.js';
import { FolderKanban, CheckSquare, AlertTriangle, Users } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton.js';

export const AdminDashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: () => dashboardApi.getAdmin(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const d = data?.data;
  const kpis = d?.kpis;
  const breakdown = d?.statusBreakdown || { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };

  const totalTasks = kpis?.totalTasks || 1;
  const getPercent = (count: number) => Math.round((count / totalTasks) * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Administrator Overview</h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time enterprise metrics, active online personnel, and global activity audit stream.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Projects</p>
              <h3 className="text-2xl font-extrabold text-white mt-1 font-mono">{kpis?.totalProjects ?? 0}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-950/60 border border-brand-800/60 flex items-center justify-center text-brand-400">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card hover className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</p>
              <h3 className="text-2xl font-extrabold text-white mt-1 font-mono">{kpis?.totalTasks ?? 0}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card hover className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overdue Tasks</p>
              <h3 className="text-2xl font-extrabold text-rose-400 mt-1 font-mono">{kpis?.overdueTasks ?? 0}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card hover className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Users</p>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{kpis?.activeUsersCount ?? 0}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      <OnlinePresenceBar
        activeUsers={d?.activeUsers || []}
        totalActiveCount={kpis?.activeUsersCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Task Status Breakdown</CardTitle>
          </CardHeader>
          <div className="space-y-4 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">To Do</span>
                <span className="font-mono text-slate-400">{breakdown.TODO} ({getPercent(breakdown.TODO)}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-slate-500 rounded-full" style={{ width: `${getPercent(breakdown.TODO)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-cyan-300 font-medium">In Progress</span>
                <span className="font-mono text-cyan-400">{breakdown.IN_PROGRESS} ({getPercent(breakdown.IN_PROGRESS)}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${getPercent(breakdown.IN_PROGRESS)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-purple-300 font-medium">In Review</span>
                <span className="font-mono text-purple-400">{breakdown.IN_REVIEW} ({getPercent(breakdown.IN_REVIEW)}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${getPercent(breakdown.IN_REVIEW)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-300 font-medium">Done</span>
                <span className="font-mono text-emerald-400">{breakdown.DONE} ({getPercent(breakdown.DONE)}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${getPercent(breakdown.DONE)}%` }} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Real-Time Global Activity Feed</CardTitle>
          </CardHeader>
          <ActivityTimeline activities={d?.recentActivities || []} />
        </Card>
      </div>
    </div>
  );
};
