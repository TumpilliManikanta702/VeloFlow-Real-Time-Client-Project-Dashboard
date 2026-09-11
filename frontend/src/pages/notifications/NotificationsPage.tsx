import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notifications.api.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { formatRelativeTime } from '../../utils/date.js';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton.js';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'page'],
    queryFn: () => notificationsApi.list(1, 50),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const notifications = data?.data || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Notifications</h1>
          <p className="text-xs text-slate-400 mt-1">In-app alerts for assignments and review requests.</p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            isLoading={markAllReadMutation.isPending}
          >
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Mark All Read
          </Button>
        )}
      </div>

      <Card className="divide-y divide-slate-800/80 p-0 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 font-mono">No notifications recorded.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                !n.isRead ? 'bg-slate-850/50' : 'hover:bg-slate-850/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    !n.isRead
                      ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-100">{n.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </div>
              </div>

              {!n.isRead && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markReadMutation.mutate(n.id)}
                  className="flex-shrink-0"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Mark Read
                </Button>
              )}
            </div>
          ))
        )}
      </Card>
    </div>
  );
};
