import React from 'react';
import { cn } from '../../utils/cn.js';
import { TaskPriority, TaskStatus, UserRole } from '../../types/index.js';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  status?: TaskStatus;
  priority?: TaskPriority;
  role?: UserRole;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  priority,
  role,
  className,
}) => {
  let computedVariant = variant;
  let text = children;

  if (status) {
    switch (status) {
      case 'TODO':
        computedVariant = 'default';
        text = text || 'To Do';
        break;
      case 'IN_PROGRESS':
        computedVariant = 'info';
        text = text || 'In Progress';
        break;
      case 'IN_REVIEW':
        computedVariant = 'purple';
        text = text || 'In Review';
        break;
      case 'DONE':
        computedVariant = 'success';
        text = text || 'Done';
        break;
    }
  } else if (priority) {
    switch (priority) {
      case 'LOW':
        computedVariant = 'default';
        text = text || 'Low';
        break;
      case 'MEDIUM':
        computedVariant = 'info';
        text = text || 'Medium';
        break;
      case 'HIGH':
        computedVariant = 'warning';
        text = text || 'High';
        break;
      case 'CRITICAL':
        computedVariant = 'danger';
        text = text || 'Critical';
        break;
    }
  } else if (role) {
    switch (role) {
      case 'ADMIN':
        computedVariant = 'danger';
        text = text || 'Admin';
        break;
      case 'PROJECT_MANAGER':
        computedVariant = 'purple';
        text = text || 'Project Manager';
        break;
      case 'DEVELOPER':
        computedVariant = 'info';
        text = text || 'Developer';
        break;
    }
  }

  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60',
    warning: 'bg-amber-950/70 text-amber-300 border-amber-800/60',
    danger: 'bg-rose-950/70 text-rose-300 border-rose-800/60',
    info: 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60',
    purple: 'bg-purple-950/70 text-purple-300 border-purple-800/60',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase font-mono',
        variantStyles[computedVariant],
        className
      )}
    >
      {text}
    </span>
  );
};
