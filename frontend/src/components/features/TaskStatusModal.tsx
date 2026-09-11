import React, { useState } from 'react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { Task, TaskStatus } from '../../types/index.js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../../api/tasks.api.js';

interface TaskStatusModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS: Array<{ status: TaskStatus; label: string; desc: string }> = [
  { status: 'TODO', label: 'To Do', desc: 'Backlog item ready to be picked up.' },
  { status: 'IN_PROGRESS', label: 'In Progress', desc: 'Active engineering implementation underway.' },
  { status: 'IN_REVIEW', label: 'In Review', desc: 'PR opened; PM notified for acceptance testing.' },
  { status: 'DONE', label: 'Done', desc: 'Fully verified and merged into production.' },
];

export const TaskStatusModal: React.FC<TaskStatusModalProps> = ({ task, isOpen, onClose }) => {
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const currentStatus = task?.status;

  const mutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      return tasksApi.updateStatus(taskId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to update task status');
    },
  });

  if (!task) return null;

  const handleSave = () => {
    if (!selectedStatus || selectedStatus === task.status) {
      onClose();
      return;
    }
    setErrorMsg(null);
    mutation.mutate({ taskId: task.id, status: selectedStatus });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Task Status">
      <div className="space-y-4">
        <div>
          <span className="text-xs text-slate-400 font-mono">Task #{task.id.slice(0, 8)}</span>
          <h4 className="text-sm font-semibold text-slate-100 mt-0.5">{task.title}</h4>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Current status:</span>
          <Badge status={task.status} />
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-lg text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        <div className="space-y-2 pt-2">
          {STATUS_OPTIONS.map((opt) => {
            const isCurrent = (selectedStatus || currentStatus) === opt.status;
            return (
              <div
                key={opt.status}
                onClick={() => setSelectedStatus(opt.status)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isCurrent
                    ? 'border-brand-500 bg-brand-950/30 ring-1 ring-brand-500/50'
                    : 'border-slate-800 bg-slate-800/30 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">{opt.label}</span>
                    <Badge status={opt.status} />
                  </div>
                  {isCurrent && <span className="text-brand-400 text-xs font-bold">Selected</span>}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{opt.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={mutation.isPending}
            disabled={!selectedStatus || selectedStatus === task.status}
          >
            Confirm Status Change
          </Button>
        </div>
      </div>
    </Modal>
  );
};
