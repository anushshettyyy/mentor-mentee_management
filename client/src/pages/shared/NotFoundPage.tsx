import React from 'react';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-200 dark:border-indigo-900 shadow-sm">
        <FileQuestion className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">404 – Page Not Found</h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-2 mb-6 leading-relaxed">
        The requested URL could not be found within the Mentor–Mentee Management portal. Please check the address or return to the main portal.
      </p>

      <Link to="/login">
        <Button variant="primary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
          Return to Portal
        </Button>
      </Link>
    </div>
  );
};
