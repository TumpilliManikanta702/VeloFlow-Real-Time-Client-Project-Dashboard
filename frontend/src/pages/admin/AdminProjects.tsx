import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../../api/projects.api.js';
import { Card } from '../../components/ui/Card.js';
import { formatDate } from '../../utils/date.js';
import { FolderKanban, CheckSquare, Calendar, Building2 } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton.js';

export const AdminProjects: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(1, 50),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const projects = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Enterprise Projects</h1>
        <p className="text-xs text-slate-400 mt-1">
          Full visibility into all client projects across the organization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((project) => (
          <Card key={project.id} hover className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FolderKanban className="w-4 h-4 text-brand-400" />
                <span className="text-[11px] font-mono text-slate-400">ID: {project.id.slice(0, 8)}</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-100">{project.name}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{project.client?.companyName || 'Client'}</span>
                </span>
                <span className="flex items-center gap-1 font-mono text-slate-400">
                  <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                  <span>{project._count?.tasks ?? 0} tasks</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>PM: {project.createdBy?.name || 'Assigned PM'}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-600" />
                  {formatDate(project.createdAt)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
