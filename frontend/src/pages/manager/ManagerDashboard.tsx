import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboard.api.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { ActivityTimeline } from '../../components/features/ActivityTimeline.js';
import { Badge } from '../../components/ui/Badge.js';
import { FolderKanban, CheckSquare, AlertTriangle, Calendar } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { formatDate } from '../../utils/date.js';
import { Link } from 'react-router-dom';

export const ManagerDashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'manager'],
    queryFn: () => dashboardApi.getManager(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const d = data?.data;
  const kpis = d?.kpis;
  const priorities = d?.priorityBreakdown || { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  const upcomingTasks = d?.upcomingTasks || [];
  const myProjects = d?.myProjects || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Project Manager Workspace</h1>
        <p className="text-xs text-slate-400 mt-1">
          Scattered view of projects and deadlines under your direct management.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Projects</p>
              <h3 className="text-2xl font-extrabold text-white mt-1 font-mono">{kpis?.totalProjects ?? 0}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Project Tasks</p>
              <h3 className="text-2xl font-extrabold text-cyan-400 mt-1 font-mono">{kpis?.totalTasks ?? 0}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overdue Alerts</p>
              <h3 className="text-2xl font-extrabold text-rose-400 mt-1 font-mono">{kpis?.overdueTasks ?? 0}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-rose-950/30 border border-rose-900/40 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-rose-400 font-mono">Critical</span>
              <p className="text-xl font-extrabold text-rose-300 mt-1 font-mono">{priorities.CRITICAL}</p>
            </div>
            <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-amber-400 font-mono">High</span>
              <p className="text-xl font-extrabold text-amber-300 mt-1 font-mono">{priorities.HIGH}</p>
            </div>
            <div className="p-3 bg-cyan-950/30 border border-cyan-900/40 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono">Medium</span>
              <p className="text-xl font-extrabold text-cyan-300 mt-1 font-mono">{priorities.MEDIUM}</p>
            </div>
            <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Low</span>
              <p className="text-xl font-extrabold text-slate-300 mt-1 font-mono">{priorities.LOW}</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 mb-3">My Managed Projects</h4>
            <div className="space-y-2">
              {myProjects.map((p) => (
                <Link
                  key={p.id}
                  to={`/manager/projects/${p.id}`}
                  className="block p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 transition-colors"
                >
                  <p className="text-xs font-semibold text-slate-200 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {p.client?.companyName} · {p._count?.tasks} tasks
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Due Dates (This Week)</CardTitle>
          </CardHeader>
          <div className="divide-y divide-slate-800/60">
            {upcomingTasks.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500 font-mono">No imminent deadlines this week.</p>
            ) : (
              upcomingTasks.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{t.title}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {t.project?.name} · Assignee: {t.assignedDeveloper?.name || 'Unassigned'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge priority={t.priority} />
                    <span className="flex items-center gap-1 text-xs text-slate-300 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {formatDate(t.dueDate)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-200 mb-4">Project Activity Stream</h4>
            <ActivityTimeline activities={d?.recentActivities || []} />
          </div>
        </Card>
      </div>
    </div>
  );
};
