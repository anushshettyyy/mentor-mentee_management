import React, { useState, useEffect } from 'react';
import { Sparkles, Check, UserCircle, GraduationCap, ShieldAlert, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { api } from '../../api/client';
import { useNavigate } from 'react-router-dom';

interface DemoSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoSwitcherModal: React.FC<DemoSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { user, switchAccount } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      api.getDemoAccounts().then((res) => {
        if (res.success) setAccounts(res.accounts);
      });
    }
  }, [isOpen]);

  const handleSwitch = async (account: any) => {
    setLoadingEmail(account.email);
    try {
      const loggedUser = await switchAccount(account.email, account.password);
      onClose();
      // Redirect to the appropriate dashboard
      if (loggedUser.role === 'STUDENT') {
        navigate('/mentee/dashboard');
      } else if (loggedUser.role === 'MENTOR') {
        navigate('/mentor/dashboard');
      } else if (loggedUser.role === 'HOD' || loggedUser.role === 'ADMIN') {
        navigate('/hod/dashboard');
      }
    } catch (err) {
      console.error('Failed to switch demo account', err);
    } finally {
      setLoadingEmail(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return <GraduationCap className="w-5 h-5 text-indigo-500" />;
      case 'MENTOR':
        return <Award className="w-5 h-5 text-emerald-500" />;
      case 'HOD':
        return <UserCircle className="w-5 h-5 text-amber-500" />;
      case 'ADMIN':
        return <ShieldAlert className="w-5 h-5 text-purple-500" />;
      default:
        return <UserCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Instant Role & Account Switcher"
      description="Quickly switch between pre-seeded personas to test live workflows and access boundaries"
      maxWidth="lg"
    >
      <div className="space-y-3">
        {accounts.map((acc) => {
          const isCurrent = user?.email === acc.email;
          const isLoading = loadingEmail === acc.email;

          return (
            <div
              key={acc.email}
              onClick={() => !isCurrent && !isLoading && handleSwitch(acc)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                isCurrent
                  ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-100 dark:border-slate-700">
                  {getRoleIcon(acc.role)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{acc.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      {acc.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{acc.description}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1">{acc.email}</p>
                </div>
              </div>

              <div>
                {isCurrent ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full bg-indigo-100/60 dark:bg-indigo-900/40">
                    <Check className="w-3.5 h-3.5" /> Current
                  </span>
                ) : (
                  <button
                    disabled={isLoading}
                    className="text-xs font-medium px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors shadow-xs"
                  >
                    {isLoading ? 'Switching...' : 'Switch'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};
