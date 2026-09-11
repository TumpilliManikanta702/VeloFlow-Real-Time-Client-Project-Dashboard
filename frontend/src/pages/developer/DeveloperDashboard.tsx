import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboard.api.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { ActivityTimeline } from '../../components/features/ActivityTimeline.js';
import { TaskStatusModal } from '../../components/features/TaskStatusModal.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { formatDate } from '../../utils/date.js';
import { CheckSquare, Clock, AlertTriangle, Bell, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Task } from '../../types/index.js';

export const DeveloperDashboard: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'developer'],
    queryFn: () => dashboardApi.getDeveloper(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const d = data?.data;
  const kpis = d?.kpis;
  const assignedTasks = d?.assignedTasks || [];
  const upcomingDeadlines = d?.upcomingDeadlines || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Developer Command Center</h1>
        <p className="text-xs text-slate-400 mt-1">
          Direct overview of tasks assigned exclusively to your queue.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Tasks</p>
              <h3 className="text-2xl font-extrabold text-white mt-1 font-mono">{kpis?.totalAssigned ?? 0}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</p>
              <h3 className="text-2xl font-extrabold text-brand-400 mt-1 font-mono">{kpis?.inProgress ?? 0}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-950/60 border border-brand-800/60 flex items-center justify-center text-brand-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Review</p>
              <h3 className="text-2xl font-extrabold text-purple-400 mt-1 font-mono">{kpis?.inReview ?? 0}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unread Alerts</p>
              <h3 className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">{kpis?.unreadNotifications ?? 0}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>My Active Tasks (Priority Order)</CardTitle>
              <Link
                to="/developer/tasks"
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                <span>Full List</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>

          {assignedTasks.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500 font-mono">No tasks currently assigned to you.</p>
          ) : (
            <div className="space-y-3">
              {assignedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-slate-850/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-slate-500">#{task.id.slice(0, 6)}</span>
                      <span className="text-xs font-medium text-brand-300 truncate">{task.project?.name}</span>
                    </div>
                    <Link
                      to={`/developer/tasks/${task.id}`}
                      className="text-xs font-semibold text-slate-100 hover:text-brand-400 transition-colors block truncate"
                    >
                      {task.title}
                    </Link>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge priority={task.priority} />
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      title="Update status"
                    >
                      <Badge status={task.status} />
                    </button>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 pl-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Imminent Deadlines</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-500 font-mono">No upcoming deadlines.</p>
              ) : (
                upcomingDeadlines.map((t) => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                    <p className="text-xs font-semibold text-slate-200 truncate">{t.title}</p>
                    <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-slate-400">
                      <span className="text-brand-400">{t.project?.name}</span>
                      <span className={t.isOverdue ? 'text-rose-400 font-bold' : ''}>{formatDate(t.dueDate)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Task Activity</CardTitle>
            </CardHeader>
            <ActivityTimeline activities={d?.recentActivities || []} />
          </Card>
        </div>
      </div>

      <TaskStatusModal
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
};
