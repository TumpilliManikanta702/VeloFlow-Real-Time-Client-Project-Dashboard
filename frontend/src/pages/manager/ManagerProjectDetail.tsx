import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../../api/projects.api.js';
import { tasksApi } from '../../api/tasks.api.js';
import { usersApi } from '../../api/users.api.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { TaskStatusModal } from '../../components/features/TaskStatusModal.js';
import { formatDate } from '../../utils/date.js';
import { joinSocketRoom, leaveSocketRoom } from '../../socket/socketClient.js';
import {
  FolderKanban,
  Building2,
  Calendar,
  Plus,
  ArrowLeft,
  Clock,
  User as UserIcon,
  AlertTriangle,
} from 'lucide-react';
import { Task, TaskPriority } from '../../types/index.js';

export const ManagerProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskForStatus, setSelectedTaskForStatus] = useState<Task | null>(null);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedDeveloperId: '',
    priority: 'MEDIUM' as TaskPriority,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] + 'T23:59:59.000Z',
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Join authorized project room for real-time push
  useEffect(() => {
    if (id) {
      joinSocketRoom(`project:${id}`);
    }
    return () => {
      if (id) {
        leaveSocketRoom(`project:${id}`);
      }
    };
  }, [id]);

  const { data: projectData, isLoading } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getById(id!),
    enabled: Boolean(id),
  });

  const { data: devsData } = useQuery({
    queryKey: ['users', 'devs'],
    queryFn: () => usersApi.list('DEVELOPER'),
    enabled: isTaskModalOpen,
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: typeof taskForm) =>
      tasksApi.create({
        ...data,
        projectId: id!,
        assignedDeveloperId: data.assignedDeveloperId || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsTaskModalOpen(false);
      setTaskForm({
        title: '',
        description: '',
        assignedDeveloperId: '',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] + 'T23:59:59.000Z',
      });
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to create task');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const project = projectData?.data;
  const tasks = project?.tasks || [];
  const developers = devsData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to="/manager/projects"
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-xs text-slate-400 font-mono">Projects / Details</span>
      </div>

      <Card className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-400 text-xs mb-1">
              <FolderKanban className="w-4 h-4" />
              <span className="font-mono">PROJECT #{project?.id.slice(0, 8)}</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">{project?.name}</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">{project?.description}</p>
          </div>

          <Button variant="primary" size="sm" onClick={() => setIsTaskModalOpen(true)} className="flex-shrink-0">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Project Task
          </Button>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span className="text-slate-300 font-medium">{project?.client?.companyName}</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Started {project && formatDate(project.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-300 font-bold">{tasks.length}</span>
            <span>Total Tasks</span>
          </div>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">Project Tasks</h2>
        </div>

        {tasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">
            No tasks created in this project yet. Click "Add Project Task" to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <Card key={task.id} hover className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono text-slate-500">TASK #{task.id.slice(0, 6)}</span>
                    <div className="flex items-center gap-2">
                      <Badge priority={task.priority} />
                      <button
                        onClick={() => setSelectedTaskForStatus(task)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        title="Click to update status"
                      >
                        <Badge status={task.status} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100">{task.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>{task.assignedDeveloper?.name || 'Unassigned'}</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    {task.isOverdue && (
                      <span className="flex items-center gap-1 text-rose-400 font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        OVERDUE
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <TaskStatusModal
        task={selectedTaskForStatus}
        isOpen={Boolean(selectedTaskForStatus)}
        onClose={() => setSelectedTaskForStatus(null)}
      />

      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create Task in Project">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErrorMsg(null);
            createTaskMutation.mutate(taskForm);
          }}
          className="space-y-4"
        >
          {errorMsg && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title</label>
            <input
              type="text"
              required
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="e.g. Implement WebSocket Ingestion Heartbeat"
              className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Technical instructions and acceptance criteria..."
              className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Developer</label>
              <select
                value={taskForm.assignedDeveloperId}
                onChange={(e) => setTaskForm({ ...taskForm, assignedDeveloperId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">Leave Unassigned</option>
                {developers.map((dev) => (
                  <option key={dev.id} value={dev.id}>
                    {dev.name} ({dev.isOnline ? 'Online' : 'Offline'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
            <input
              type="date"
              required
              value={taskForm.dueDate.split('T')[0]}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: `${e.target.value}T23:59:59.000Z` })}
              className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setIsTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={createTaskMutation.isPending}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
