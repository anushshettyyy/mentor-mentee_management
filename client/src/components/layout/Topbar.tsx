import React, { useState } from 'react';
import { Menu, Sun, Moon, Sparkles, LogOut, User as UserIcon, Shield, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { DemoSwitcherModal } from '../demo/DemoSwitcherModal';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  onToggleMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileMenu }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme, toggleTheme } = useTheme();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const f = firstName?.[0] || '';
    const l = lastName?.[0] || '';
    return (f + l).toUpperCase() || 'U';
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'HOD':
        return 'bg-amber-600 text-white';
      case 'MENTOR':
        return 'bg-emerald-600 text-white';
      case 'ADMIN':
        return 'bg-purple-600 text-white';
      case 'STUDENT':
      default:
        return 'bg-indigo-600 text-white';
    }
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between gap-4 sticky top-0 z-10 transition-colors">
        {/* Left Side: Mobile Menu Button & Context */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Department of Computer Science</span>
            <span>/</span>
            <span className="capitalize">{user?.role?.toLowerCase()} Portal</span>
          </div>
        </div>

        {/* Right Side: Demo Persona Switcher, Explicit Theme Selector, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Switcher Pill */}
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 dark:from-indigo-950/50 dark:to-violet-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden xs:inline">Test Role:</span>
            <span className="font-bold">{user?.role}</span>
          </button>

          {/* Theme Selector (Light / Dark) */}
          <div className="relative">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Change theme appearance"
            >
              {theme === 'light' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {isThemeMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsThemeMenuOpen(false)}
              >
                <button
                  onClick={() => setTheme('light')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 ${
                    theme === 'light' ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> Light (White)
                  </span>
                  {theme === 'light' && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 ${
                    theme === 'dark' ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Moon className="w-3.5 h-3.5 text-indigo-400" /> Dark Mode
                  </span>
                  {theme === 'dark' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <NotificationCenter />

          {/* Profile Monogram (NO PICTURES) */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-400 transition-all focus:outline-hidden"
              aria-label="Open user menu"
            >
              <div
                className={`w-8 h-8 rounded-full ${getRoleBadgeColor(
                  user?.role
                )} flex items-center justify-center text-xs font-bold shadow-xs`}
              >
                {getInitials(user?.firstName, user?.lastName)}
              </div>
            </button>

            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                    <Shield className="w-3 h-3" /> {user?.role}
                  </div>
                </div>

                <button
                  onClick={() => navigate('/settings')}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2"
                >
                  <UserIcon className="w-3.5 h-3.5" /> Account Settings
                </button>

                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="w-full text-left px-4 py-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2 font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Switch Persona
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Demo Persona Modal */}
      <DemoSwitcherModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </>
  );
};
