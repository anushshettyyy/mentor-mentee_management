import React from 'react';
import { ProfileStatus, Priority, RecommendationStatus, ActionItemStatus, EndorsementStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
    info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/60',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',
    slate: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 rounded-full font-medium',
    md: 'text-sm px-3 py-1 rounded-full font-medium',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{
  status: ProfileStatus | RecommendationStatus | ActionItemStatus | EndorsementStatus | string;
}> = ({ status }) => {
  switch (status) {
    case 'APPROVED_ENDORSED':
    case 'ENDORSED':
    case 'APPROVED':
    case 'COMPLETED':
      return <Badge variant="success">● {status.replace('_', ' ')}</Badge>;

    case 'SUBMITTED':
    case 'SUBMITTED_FOR_ENDORSEMENT':
    case 'PENDING':
    case 'UNDER_REVIEW':
      return <Badge variant="warning">● {status.replace('_', ' ')}</Badge>;

    case 'IN_PROGRESS':
      return <Badge variant="purple">● In Progress</Badge>;

    case 'CHANGES_REQUESTED':
      return <Badge variant="warning">⚠ Changes Requested</Badge>;

    case 'REJECTED':
    case 'OVERDUE':
    case 'CANCELLED':
      return <Badge variant="danger">✕ {status.replace('_', ' ')}</Badge>;

    case 'DRAFT':
    default:
      return <Badge variant="slate">Draft</Badge>;
  }
};

export const PriorityBadge: React.FC<{ priority: Priority | string }> = ({ priority }) => {
  switch (priority) {
    case 'URGENT':
      return <Badge variant="danger">Urgent Priority</Badge>;
    case 'HIGH':
      return <Badge variant="warning">High Priority</Badge>;
    case 'MEDIUM':
      return <Badge variant="purple">Medium Priority</Badge>;
    case 'LOW':
    default:
      return <Badge variant="slate">Low Priority</Badge>;
  }
};
