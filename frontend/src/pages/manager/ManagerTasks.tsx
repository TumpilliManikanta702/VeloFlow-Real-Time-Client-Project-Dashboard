import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { tasksApi } from '../../api/tasks.api.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { TaskFilterBar } from '../../components/features/TaskFilterBar.js';
import { TaskStatusModal } from '../../components/features/TaskStatusModal.js';
import { TableSkeleton } from '../../components/ui/Skeleton.js';
import { formatDate } from '../../utils/date.js';
import { Clock, AlertTriangle } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../../types/index.js';

export const ManagerTasks: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const status = (searchParams.get('status') as TaskStatus) || undefined;
  const priority = (searchParams.get('priority') as TaskPriority) || undefined;
  const from = searchParams.get('from') || undefined;
  const to = searchParams.get('to') || undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', 'manager', { status, priority, from, to }],
    queryFn: () => tasksApi.list({ status, priority, from, to, limit: 50 }),
  });

  const tasks = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Project Tasks Directory</h1>
        <p className="text-xs text-slate-400 mt-1">
          Server-side filtered view of all tasks across projects you own.
        </p>
      </div>

      <TaskFilterBar />

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={5} />
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">
            No tasks match the active filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Task</th>
                  <th className="px-5 py-3.5">Project</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Status (Click to change)</th>
                  <th className="px-5 py-3.5">Assignee</th>
                  <th className="px-5 py-3.5">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="font-semibold text-slate-100 truncate">{task.title}</div>
                      <div className="text-[10px] font-mono text-slate-500">#{task.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-medium">{task.project?.name}</td>
                    <td className="px-5 py-3.5">
                      <Badge priority={task.priority} />
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <Badge status={task.status} />
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">
                      {task.assignedDeveloper?.name || <span className="text-slate-500 italic">Unassigned</span>}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span className={task.isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          {formatDate(task.dueDate)}
                        </span>
                        {task.isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <TaskStatusModal
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
};
