import React, { useState } from 'react';
import { User, Shield, Lock, Moon, Sun, CheckCircle2, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme, toggleTheme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus('Passwords do not match');
      return;
    }
    setPasswordStatus('Password updated successfully (simulation)');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Account & System Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your personal profile, credentials, and accessibility preferences
        </p>
      </div>

      {/* Account Profile Card */}
      <Card>
        <CardHeader title="Account Details" description="Institutional credentials and department affiliation" />
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-semibold text-slate-500 block">Full Name</span>
              <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {user?.firstName} {user?.lastName}
              </p>
            </div>

            <div>
              <span className="font-semibold text-slate-500 block">Institutional Email</span>
              <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">{user?.email}</p>
            </div>

            <div>
              <span className="font-semibold text-slate-500 block">System Role</span>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 border border-indigo-200 mt-1 uppercase">
                {user?.role}
              </span>
            </div>

            <div>
              <span className="font-semibold text-slate-500 block">Department</span>
              <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                Computer Science & Engineering (CSE)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance & Theme */}
      <Card>
        <CardHeader title="Appearance & Theme" description="Choose your preferred interface theme" />
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-left flex items-start justify-between transition-all ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 shadow-2xs">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Light (White) Theme</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Clean, warm off-white academic background with high contrast</p>
                </div>
              </div>
              {theme === 'light' && (
                <span className="p-1 rounded-full bg-indigo-600 text-white shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left flex items-start justify-between transition-all ${
                theme === 'dark'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800 shadow-2xs">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Dark Theme</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Deep slate and navy low-light interface</p>
                </div>
              </div>
              {theme === 'dark' && (
                <span className="p-1 rounded-full bg-indigo-600 text-white shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Security & Password */}
      <Card>
        <CardHeader title="Security & Password" description="Update your institutional login password" />
        <form onSubmit={handlePasswordChange}>
          <CardContent className="space-y-4">
            {passwordStatus && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordStatus}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <div className="text-[11px] text-slate-400">Password must be at least 6 characters long</div>
            <Button size="sm" variant="primary" type="submit">
              Update Password
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Privacy Notice & Data Retention */}
      <Card className="p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
          <FileText className="w-4 h-4 text-indigo-500" />
          <span>Institutional Privacy Notice & Data Retention</span>
        </div>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
          Student profile records, mentoring session logs, and faculty evaluations are strictly classified as confidential educational records. Phone numbers, residential addresses, and dates of birth are optional unless required for institutional registration. Internal faculty observations remain confidential and are never exposed to students or unauthorized third parties. Audit logs are preserved for 5 years to meet statutory NAAC and NBA accreditation compliance standards.
        </p>
      </Card>
    </div>
  );
};
