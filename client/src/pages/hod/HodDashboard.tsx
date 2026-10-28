import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  UserPlus,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Award,
} from 'lucide-react';
import { api } from '../../api/client';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';

export const HodDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [pendingEndorsements, setPendingEndorsements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([api.getDepartmentOverview(), api.getEndorsements('PENDING')])
      .then(([overviewRes, endRes]) => {
        if (overviewRes.success) setStats(overviewRes.stats);
        if (endRes.success) setPendingEndorsements(endRes.endorsements);
      })
      .catch((err) => console.error('Failed to load HOD dashboard', err))
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            HOD Department Administration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Department of Computer Science & Engineering • Academic Session 2025-2026
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/hod/assignments">
            <Button size="sm" variant="outline" icon={<UserPlus className="w-4 h-4" />}>
              Allocate Mentors
            </Button>
          </Link>
          <Link to="/hod/approvals">
            <Button size="sm" variant="primary" icon={<ShieldCheck className="w-4 h-4" />}>
              Review Queue ({pendingEndorsements.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Mentor Coverage</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats?.coveragePercentage}%</p>
            <span className="text-xs text-slate-400">
              ({stats?.activeAssignments} / {stats?.totalStudents} students)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${stats?.coveragePercentage}%` }} />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Endorsements</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {stats?.pendingEndorsements || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Requiring HOD formal decision</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Profiles Awaiting Review</span>
            <FileCheck className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {stats?.submittedProfiles || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Submitted student records</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Mentoring Sessions</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {stats?.totalSessions || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Conducted by faculty mentors</p>
        </Card>
      </div>

      {/* Two Column Layout: Pending Endorsement Queue & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Endorsements Queue */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Pending Endorsements Queue"
            description="Mentor proposals requiring departmental approval or funding sign-off"
            action={
              <Link to="/hod/approvals" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendingEndorsements.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                All endorsement submissions have been processed! No pending items.
              </div>
            ) : (
              pendingEndorsements.map((end) => (
                <div key={end.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {end.recommendation?.title || 'Profile Endorsement'}
                      </span>
                      <StatusBadge status={end.status} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Requested by: <span className="font-medium text-slate-700 dark:text-slate-300">
                        Dr. {end.requestedByMentor?.user?.lastName || 'Mentor'}
                      </span> • Student: <span className="font-medium text-slate-700 dark:text-slate-300">{end.studentProfile?.usn}</span>
                    </p>
                  </div>

                  <Link to="/hod/approvals">
                    <Button size="sm" variant="secondary">
                      Review
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Department Overview & Quick Management Links */}
        <Card className="lg:col-span-1">
          <CardHeader title="Department Management" description="Administrative shortcuts" />
          <CardContent className="space-y-3">
            <Link to="/hod/assignments" className="block p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>Mentor Allocation</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                {stats?.unassignedStudentsCount > 0 ? `${stats.unassignedStudentsCount} students unassigned` : '100% assigned'}
              </p>
            </Link>

            <Link to="/hod/users" className="block p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>User & Role Directory</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                {stats?.totalStudents} students • {stats?.totalFaculty} faculty
              </p>
            </Link>

            <Link to="/hod/audit-logs" className="block p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>Audit History</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                Tamper-evident log of all system changes
              </p>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
