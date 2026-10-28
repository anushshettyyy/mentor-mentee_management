import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileCheck,
  Calendar,
  AlertCircle,
  Search,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../api/client';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';

export const MentorDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    api
      .getMentorDashboardData()
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const stats = data?.stats;
  const mentees = data?.mentees || [];
  const upcomingSessions = data?.upcomingSessions || [];

  const filteredMentees = mentees.filter((m: any) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.usn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Faculty Mentoring Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor assigned students, review profile submissions, and track academic intervention plans
          </p>
        </div>
        <Link to="/mentor/mentees">
          <Button variant="primary" size="sm" icon={<Users className="w-4 h-4" />}>
            View All Mentees
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Assigned Mentees</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {stats?.totalAssignedMentees || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Active student allocation</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Profiles Awaiting Review</span>
            <FileCheck className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {stats?.profilesAwaitingReview || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Submitted for verification</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Recommendations</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {stats?.recommendationsRequiringFollowup || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Interventions in progress</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Overdue Student Tasks</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            {stats?.overdueTasks || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Require mentor follow-up</p>
        </Card>
      </div>

      {/* Main Table: Assigned Mentees */}
      <Card>
        <CardHeader
          title="Assigned Mentees Directory"
          description="Detailed records, completion metrics, and review statuses"
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student or USN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 w-40 sm:w-56"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted (Pending Review)</option>
                <option value="APPROVED_ENDORSED">Approved</option>
                <option value="CHANGES_REQUESTED">Changes Requested</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">USN</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Profile Quality</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Recommendations</th>
                <th className="py-3 px-4">Pending Tasks</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredMentees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No mentees found matching the query.
                  </td>
                </tr>
              ) : (
                filteredMentees.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                          {m.name?.[0] || 'S'}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100 block">{m.name}</span>
                          <span className="text-[11px] text-slate-400">{m.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">{m.usn}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Sem {m.semester}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${m.completionPercentage}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          {m.completionPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {m.totalRecommendations} active
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${m.pendingTasks > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {m.pendingTasks}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/mentor/mentee/${m.id}`}>
                        <Button size="sm" variant="secondary" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                          Workspace
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
