import React from 'react';
import { ActivityLog } from '../../types/index.js';
import { formatRelativeTime } from '../../utils/date.js';
import { Badge } from '../ui/Badge.js';
import { ArrowRight, History } from 'lucide-react';

interface ActivityTimelineProps {
  activities: ActivityLog[];
  emptyMessage?: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  emptyMessage = 'No recent activity recorded.',
}) => {
  if (!activities || activities.length === 0) {
    return <div className="py-8 text-center text-xs text-slate-500 font-mono">{emptyMessage}</div>;
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
      {activities.map((act) => {
        const actorName = act.user?.name || act.metadata?.userName || 'User';
        const taskName = act.task?.title || act.metadata?.taskTitle || (act.taskId ? `Task #${act.taskId.slice(0, 6)}` : 'Task');
        const projectName = act.project?.name;

        return (
          <div key={act.id} className="relative group">
            <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-brand-500 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
            </div>

            <div className="text-xs">
              <div className="flex flex-wrap items-center gap-1.5 leading-snug text-slate-300">
                <span className="font-semibold text-slate-100">{actorName}</span>
                {act.action === 'STATUS_CHANGED' && act.oldStatus && act.newStatus ? (
                  <>
                    <span className="text-slate-400">moved</span>
                    <span className="font-medium text-brand-300">"{taskName}"</span>
                    <span className="text-slate-400">from</span>
                    <Badge status={act.oldStatus} className="text-[10px] px-1.5 py-0" />
                    <ArrowRight className="w-3 h-3 text-slate-500 inline" />
                    <Badge status={act.newStatus} className="text-[10px] px-1.5 py-0" />
                  </>
                ) : act.action === 'TASK_CREATED' ? (
                  <>
                    <span className="text-slate-400">created task</span>
                    <span className="font-medium text-slate-200">"{taskName}"</span>
                  </>
                ) : (
                  <span className="text-slate-400">{act.action}</span>
                )}

                {projectName && (
                  <span className="text-[11px] text-slate-500">
                    in <span className="text-slate-400">{projectName}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                <History className="w-3 h-3 text-slate-600" />
                <span>{formatRelativeTime(act.createdAt)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
