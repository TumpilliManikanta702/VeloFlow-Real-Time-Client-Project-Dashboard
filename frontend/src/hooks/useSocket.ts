import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore.js';
import { useUiStore } from '../stores/uiStore.js';
import { getSocket, disconnectSocket } from '../socket/socketClient.js';
import { activityApi } from '../api/activity.api.js';

export function useSocket() {
  const { accessToken, user } = useAuthStore();
  const { setReconnectNotice } = useUiStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!accessToken || !user) {
      disconnectSocket();
      return;
    }

    const socket = getSocket(accessToken);
    if (!socket) return;

    const handleTaskStatusChanged = () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    };

    const handleTaskUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };

    const handleActivityNew = () => {
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };

    const handleNotificationNew = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    const handleCountUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    const handlePresenceUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    };

    const handleReconnect = async () => {
      try {
        // Fetch missed activity events directly from PostgreSQL database (not cache)
        const recentRes = await activityApi.getRecent();
        if (recentRes?.data) {
          queryClient.setQueryData(['activity', 'recent'], recentRes.data);
          setReconnectNotice('Reconnected: Retrieved last 20 missed events from PostgreSQL database.');
          setTimeout(() => setReconnectNotice(null), 6000);
        }
      } catch (err) {
        console.warn('Could not fetch recent activities on reconnect:', err);
      }
      queryClient.invalidateQueries();
    };

    socket.on('task:status_changed', handleTaskStatusChanged);
    socket.on('task:created', handleTaskUpdated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('activity:new', handleActivityNew);
    socket.on('notification:new', handleNotificationNew);
    socket.on('notification:count_updated', handleCountUpdated);
    socket.on('presence:update', handlePresenceUpdate);
    socket.on('reconnect', handleReconnect);

    window.addEventListener('online', handleReconnect);

    return () => {
      socket.off('task:status_changed', handleTaskStatusChanged);
      socket.off('task:created', handleTaskUpdated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('activity:new', handleActivityNew);
      socket.off('notification:new', handleNotificationNew);
      socket.off('notification:count_updated', handleCountUpdated);
      socket.off('presence:update', handlePresenceUpdate);
      socket.off('reconnect', handleReconnect);
      window.removeEventListener('online', handleReconnect);
    };
  }, [accessToken, user, queryClient, setReconnectNotice]);
}
