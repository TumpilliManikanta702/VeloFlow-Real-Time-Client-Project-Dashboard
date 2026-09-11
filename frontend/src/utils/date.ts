import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export function formatRelativeTime(dateStringOrDate: string | Date): string {
  const date = typeof dateStringOrDate === 'string' ? new Date(dateStringOrDate) : dateStringOrDate;
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffInMinutes < 1) {
    return 'just now';
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  if (isToday(date)) {
    return format(date, 'h:mm a');
  }

  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }

  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDate(dateStringOrDate: string | Date): string {
  const date = typeof dateStringOrDate === 'string' ? new Date(dateStringOrDate) : dateStringOrDate;
  if (isNaN(date.getTime())) return '';
  return format(date, 'MMM d, yyyy');
}
