import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  Calendar,
  Lightbulb,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { api } from '../../api/client';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';

export const MenteeDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await api.getMenteeDashboardData();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load mentee dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleActionItem = async (itemId: string, currentStatus: string) => {
    setToggleLoadingId(itemId);
    try {
      const newStatus = currentStatus === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
      await api.updateActionItem(itemId, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to toggle task', err);
    } finally {
      setToggleLoadingId(null);
    }
  };

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

  const profile = data?.profile;
  const mentor = data?.assignedMentor;
  const stats = data?.stats;
  const recentSessions = data?.recentSessions || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome, {profile?.user?.firstName || 'Student'}! 👋
            </h1>
            <StatusBadge status={profile?.status || 'DRAFT'} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            USN: <span className="font-semibold text-slate-700 dark:text-slate-300">{profile?.usn}</span> •{' '}
            {profile?.course} • Semester {profile?.semester}
          </p>
        </div>

        <Link to="/mentee/profile">
          <Button variant="primary" size="sm" icon={<UserCheck className="w-4 h-4" />}>
            Edit Profile Wizard
          </Button>
        </Link>
      </div>

      {/* Review Feedback Alert if changes requested or approved */}
      {profile?.reviewNotes && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            profile.status === 'CHANGES_REQUESTED'
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
              : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
          }`}
        >
          {profile.status === 'CHANGES_REQUESTED' ? (
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          ) : (
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          )}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">
              {profile.status === 'CHANGES_REQUESTED' ? 'Mentor Feedback (Action Required)' : 'Mentor Review Note'}
            </h4>
            <p className="text-xs mt-1 leading-relaxed">{profile.reviewNotes}</p>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Completion */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Profile Progress</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{stats?.completionPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats?.completionPercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {stats?.completionPercentage >= 80 ? 'Comprehensive profile verified' : 'Complete all fields for mentor review'}
          </p>
        </Card>

        {/* Next Follow-Up */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Next Follow-Up</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2">
            {stats?.nextFollowUpDate
              ? new Date(stats.nextFollowUpDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'None Scheduled'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Review check-in with faculty</p>
        </Card>

        {/* Active Recommendations */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Recommendations</span>
            <Lightbulb className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {stats?.activeRecommendations || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Career & skill development plans</p>
        </Card>

        {/* Tasks Pending */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Action Items</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {stats?.pendingTasks || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{stats?.completedTasks || 0} completed</p>
        </Card>
      </div>

      {/* Two Column Layout: Mentor Info & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Mentor Card */}
        <Card className="lg:col-span-1">
          <CardHeader title="Assigned Faculty Mentor" description="Your institutional academic counselor" />
          <CardContent className="space-y-4">
            {mentor ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                    {((mentor.user?.firstName?.[0] || '') + (mentor.user?.lastName?.[0] || '')).toUpperCase() || 'FA'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {mentor.user?.firstName} {mentor.user?.lastName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{mentor.designation}</p>
                    <p className="text-[11px] text-slate-400">{mentor.department}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{mentor.user?.email}</span>
                  </div>
                  {mentor.user?.phone && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{mentor.user?.phone}</span>
                    </div>
                  )}
                  {mentor.cabinLocation && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{mentor.cabinLocation}</span>
                    </div>
                  )}
                  {mentor.officeHours && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Hours: {mentor.officeHours}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                Mentor assignment pending from HOD office
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Mentoring Sessions */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent Mentoring Sessions"
            description="Discussion summaries and agreed outcomes"
            action={
              <Link to="/mentee/sessions" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentSessions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No recorded mentoring sessions yet</div>
            ) : (
              recentSessions.map((session: any) => (
                <div key={session.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {session.type?.replace('_', ' ')}
                      </span>
                      <StatusBadge status={session.status} />
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(session.sessionDate).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {session.discussionSummary}
                  </p>

                  {session.agreedActionItemsSummary && (
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Agreed Action: </span>
                      {session.agreedActionItemsSummary}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
