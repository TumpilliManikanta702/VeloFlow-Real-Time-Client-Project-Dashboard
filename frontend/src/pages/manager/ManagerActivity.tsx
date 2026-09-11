import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { activityApi } from '../../api/activity.api.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.js';
import { ActivityTimeline } from '../../components/features/ActivityTimeline.js';
import { Skeleton } from '../../components/ui/Skeleton.js';

export const ManagerActivity: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['activity', 'manager'],
    queryFn: () => activityApi.list(1, 50),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const activities = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Team Activity Stream</h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time activity audit strictly scoped to deliverables and tasks across your owned projects.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Activity Feed (Role-Filtered)</CardTitle>
        </CardHeader>
        <ActivityTimeline activities={activities} />
      </Card>
    </div>
  );
};
