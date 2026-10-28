import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export const AccessDeniedPage: React.FC = () => {
  const { user } = useAuth();

  const getHomeRoute = () => {
    if (user?.role === 'STUDENT') return '/mentee/dashboard';
    if (user?.role === 'MENTOR') return '/mentor/dashboard';
    return '/hod/dashboard';
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-900 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">403 – Access Prohibited</h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-2 mb-6 leading-relaxed">
        You do not possess the required institutional role or ownership authorization to view this resource. This event has been logged for security audit.
      </p>

      <Link to={getHomeRoute()}>
        <Button variant="primary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
          Return to Your Dashboard
        </Button>
      </Link>
    </div>
  );
};
