import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../../api/projects.api.js';
import { clientsApi } from '../../api/clients.api.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { formatDate } from '../../utils/date.js';
import { FolderKanban, CheckSquare, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ManagerProjects: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', clientId: '' });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(1, 50),
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.list(1, 100),
    enabled: isModalOpen,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsModalOpen(false);
      setFormData({ name: '', description: '', clientId: '' });
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to create project');
    },
  });

  const projects = projectsData?.data || [];
  const clients = clientsData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">My Projects</h1>
          <p className="text-xs text-slate-400 mt-1">Manage deliverables and tasks in projects you created.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create Project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <Card key={p.id} hover className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-brand-400">
                  <FolderKanban className="w-4 h-4" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {p.client?.companyName}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100">{p.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                  <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                  <span>{p._count?.tasks ?? 0} tasks</span>
                </span>
                <Link
                  to={`/manager/projects/${p.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300"
                >
                  <span>Open Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErrorMsg(null);
            createMutation.mutate(formData);
          }}
          className="space-y-4"
        >
          {errorMsg && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Distributed Order Settlement Engine"
              className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Client</label>
            <select
              required
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            >
              <option value="">Select a client account</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Project Description</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Scope of work, milestone deliverables, and architectural specifications..."
              className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={createMutation.isPending}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
