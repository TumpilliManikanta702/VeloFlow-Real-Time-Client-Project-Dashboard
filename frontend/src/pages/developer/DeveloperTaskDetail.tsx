import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '../../api/tasks.api.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { TaskStatusModal } from '../../components/features/TaskStatusModal.js';
import { ActivityTimeline } from '../../components/features/ActivityTimeline.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { formatDate } from '../../utils/date.js';
import { ArrowLeft, Clock, AlertTriangle, ShieldAlert, FolderKanban } from 'lucide-react';

export const DeveloperTaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksApi.getById(id!),
    enabled: Boolean(id),
    retry: false, // Don't retry on 403 Forbidden
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  // Handle RBAC / Authorization rejection from backend API
  if (error) {
    const apiError = (error as any).response?.data?.error;
    return (
      <div className="py-12">
        <Card className="max-w-md mx-auto p-6 text-center bg-rose-950/20 border-rose-800/60">
          <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400 mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-rose-200">Access Denied (403 Forbidden)</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {apiError?.message || 'Backend API rejected access: You are not authorized to view this task.'}
          </p>
          <div className="mt-5">
            <Link to="/developer/tasks">
              <Button variant="secondary" size="sm">
                Return to My Tasks
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const task = data?.data;
  if (!task) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to="/developer/tasks"
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-xs text-slate-400 font-mono">Tasks / #{task.id.slice(0, 8)}</span>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FolderKanban className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-semibold text-brand-300">{task.project?.name}</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">{task.title}</h1>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge priority={task.priority} />
            <Badge status={task.status} />
            <Button variant="primary" size="sm" onClick={() => setIsStatusModalOpen(true)}>
              Change Status
            </Button>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-800 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono mb-2">
              Specification & Description
            </h4>
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {task.description}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Due: {formatDate(task.dueDate)}</span>
            </div>

            {task.isOverdue && (
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                OVERDUE
              </span>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task Status Transition History</CardTitle>
        </CardHeader>
        <ActivityTimeline activities={(task as any).activityLogs || []} />
      </Card>

      <TaskStatusModal
        task={task}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      />
    </div>
  );
};
