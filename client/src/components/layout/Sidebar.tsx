import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Calendar,
  Lightbulb,
  CheckSquare,
  Users,
  Settings,
  ShieldCheck,
  UserPlus,
  BarChart3,
  FileText,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse, onCloseMobile }) => {
  const { user } = useAuth();
  const role = user?.role;

  const studentLinks = [
    { to: '/mentee/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/mentee/profile', label: 'Profile Wizard', icon: UserCheck },
    { to: '/mentee/sessions', label: 'Mentoring Sessions', icon: Calendar },
    { to: '/mentee/recommendations', label: 'Recommendations', icon: Lightbulb },
    { to: '/mentee/action-items', label: 'Action Items', icon: CheckSquare },
    { to: '/mentors', label: 'Faculty Directory', icon: Users },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const mentorLinks = [
    { to: '/mentor/dashboard', label: 'Mentor Dashboard', icon: LayoutDashboard },
    { to: '/mentor/mentees', label: 'Assigned Mentees', icon: Users },
    { to: '/mentor/sessions', label: 'Session Records', icon: Calendar },
    { to: '/mentor/recommendations', label: 'Recommendations', icon: Lightbulb },
    { to: '/mentor/action-items', label: 'Action Items', icon: CheckSquare },
    { to: '/mentors', label: 'Faculty Directory', icon: BookOpen },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const hodLinks = [
    { to: '/hod/dashboard', label: 'Dept Dashboard', icon: LayoutDashboard },
    { to: '/hod/approvals', label: 'Endorsements Queue', icon: ShieldCheck },
    { to: '/hod/assignments', label: 'Mentor Allocation', icon: UserPlus },
    { to: '/hod/users', label: 'User Directory', icon: Users },
    { to: '/hod/analytics', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/hod/audit-logs', label: 'Audit History', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  let links = studentLinks;
  if (role === 'MENTOR') links = mentorLinks;
  else if (role === 'HOD' || role === 'ADMIN') links = hodLinks;

  return (
    <aside
      className={`relative flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out z-20 ${
        isCollapsed ? 'w-20' : 'w-64'
      } h-full select-none`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-200 dark:shadow-none">
            <GraduationCap className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100 truncate">
                MentorSync
              </h1>
              <p className="text-[11px] font-medium text-slate-400 truncate">Dept of CSE</p>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className={`px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? '•••' : 'Main Menu'}
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-colors group relative ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
              title={isCollapsed ? link.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
              {!isCollapsed && <span className="truncate">{link.label}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 ${
            isCollapsed ? 'justify-center p-1' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
            {((user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')).toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">
                {user?.role}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
