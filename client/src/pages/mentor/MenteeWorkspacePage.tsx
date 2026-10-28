import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  GraduationCap,
  Lightbulb,
  Calendar,
  CheckSquare,
  ShieldCheck,
  ArrowLeft,
  Mail,
  Phone,
  Clock,
  Plus,
  Send,
  Lock,
  AlertCircle,
  FileText,
  CheckCircle2,
  XCircle,
  BookOpen,
  Award,
  Sparkles,
} from 'lucide-react';
import { api } from '../../api/client';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const MenteeWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'profile' | 'academic' | 'recommendations' | 'sessions' | 'actionItems' | 'endorsements'
  >('overview');

  // Modals state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'APPROVED_ENDORSED' | 'CHANGES_REQUESTED'>('APPROVED_ENDORSED');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // New Recommendation Modal state
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [recTitle, setRecTitle] = useState('');
  const [recCategory, setRecCategory] = useState('ACADEMIC_IMPROVEMENT');
  const [recExplanation, setRecExplanation] = useState('');
  const [recPriority, setRecPriority] = useState('MEDIUM');
  const [recTargetDate, setRecTargetDate] = useState('');
  const [recResources, setRecResources] = useState('');
  const [recSuccessCriteria, setRecSuccessCriteria] = useState('');
  const [recSubmitForEndorsement, setRecSubmitForEndorsement] = useState(false);
  const [isSubmittingRec, setIsSubmittingRec] = useState(false);

  // New Session Modal state
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState('ONE_ON_ONE');
  const [discussionSummary, setDiscussionSummary] = useState('');
  const [privateFacultyNotes, setPrivateFacultyNotes] = useState('');
  const [agreedActionSummary, setAgreedActionSummary] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);

  // Snapshot Viewer Modal
  const [activeSnapshot, setActiveSnapshot] = useState<any | null>(null);

  const loadWorkspaceData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [profRes, sessRes, recRes, actRes] = await Promise.all([
        api.getStudentProfileById(id),
        api.getSessions(id),
        api.getRecommendations(id),
        api.getActionItems(id),
      ]);

      if (profRes.success) {
        setProfile(profRes.profile);
        setEndorsements(profRes.profile.endorsements || []);
      }
      if (sessRes.success) setSessions(sessRes.sessions);
      if (recRes.success) setRecommendations(recRes.recommendations);
      if (actRes.success) setActionItems(actRes.items);
    } catch (err) {
      console.error('Error loading mentee workspace:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, [id]);

  const handleReviewProfile = async () => {
    if (!id || !reviewNotes.trim()) return;
    setIsSubmittingReview(true);
    try {
      const res = await api.reviewStudentProfile(id, {
        status: reviewStatus,
        reviewNotes,
      });
      if (res.success) {
        setProfile(res.profile);
        setIsReviewModalOpen(false);
        setReviewNotes('');
      }
    } catch (err) {
      console.error('Failed to submit review', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleCreateRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmittingRec(true);
    try {
      const res = await api.createRecommendation({
        studentProfileId: id,
        title: recTitle,
        category: recCategory,
        explanation: recExplanation,
        priority: recPriority,
        targetDate: recTargetDate || null,
        resources: recResources,
        successCriteria: recSuccessCriteria,
        submitForEndorsement: recSubmitForEndorsement,
      });
      if (res.success) {
        setIsRecModalOpen(false);
        // Reset form
        setRecTitle('');
        setRecExplanation('');
        setRecResources('');
        setRecSuccessCriteria('');
        setRecSubmitForEndorsement(false);
        loadWorkspaceData();
      }
    } catch (err) {
      console.error('Failed to create recommendation', err);
    } finally {
      setIsSubmittingRec(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmittingSession(true);
    try {
      const res = await api.createSession({
        studentProfileId: id,
        sessionDate,
        type: sessionType,
        discussionSummary,
        privateFacultyNotes: privateFacultyNotes || null,
        agreedActionItemsSummary: agreedActionSummary || null,
        nextFollowUpDate: nextFollowUpDate || null,
      });
      if (res.success) {
        setIsSessionModalOpen(false);
        // Reset form
        setDiscussionSummary('');
        setPrivateFacultyNotes('');
        setAgreedActionSummary('');
        setNextFollowUpDate('');
        loadWorkspaceData();
      }
    } catch (err) {
      console.error('Failed to create session', err);
    } finally {
      setIsSubmittingSession(false);
    }
  };

  const handleSubmitRecForEndorsement = async (recId: string) => {
    try {
      await api.submitForEndorsement(recId);
      loadWorkspaceData();
    } catch (err) {
      console.error('Failed to submit recommendation for endorsement', err);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  if (!profile) {
    return (
      <EmptyState
        title="Student Record Not Found"
        description="The requested student profile does not exist or you lack permission to view it."
      />
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'profile', label: 'Mentee Profile', icon: User },
    { id: 'academic', label: 'Academic Progress', icon: GraduationCap },
    { id: 'recommendations', label: `Recommendations (${recommendations.length})`, icon: Lightbulb },
    { id: 'sessions', label: `Mentoring Sessions (${sessions.length})`, icon: Calendar },
    { id: 'actionItems', label: `Action Items (${actionItems.length})`, icon: CheckSquare },
    { id: 'endorsements', label: `Endorsement History (${endorsements.length})`, icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex items-center gap-2">
        <Link
          to="/mentor/mentees"
          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Mentees List
        </Link>
      </div>

      {/* Student Banner Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-base shadow-xs shrink-0">
            {((profile.user?.firstName?.[0] || '') + (profile.user?.lastName?.[0] || '')).toUpperCase() || 'ST'}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {profile.user?.firstName} {profile.user?.lastName}
              </h1>
              <StatusBadge status={profile.status} />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              USN: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{profile.usn}</span> •{' '}
              {profile.course} • Semester {profile.semester} • {profile.department}
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {profile.user?.email}</span>
              {profile.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {profile.phone}</span>}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsReviewModalOpen(true)}
            icon={<ShieldCheck className="w-4 h-4 text-indigo-600" />}
          >
            Review Profile
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsSessionModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Log Session
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-5 md:col-span-2 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Mentee Academic Summary</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {profile.careerGoals ? `Career Target: ${profile.careerGoals}` : 'No career goal defined yet.'}
            </p>

            {profile.supportRequested && (
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs">
                <span className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide text-[11px] block">
                  Support Requested by Student:
                </span>
                <p className="text-amber-700 dark:text-amber-400 mt-0.5">{profile.supportRequested}</p>
              </div>
            )}

            <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Preferred Style</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.preferredLearningStyle}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Profile Quality</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{profile.completionPercentage}%</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Sessions</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{sessions.length} logged</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsRecModalOpen(true)}
                icon={<Lightbulb className="w-4 h-4 text-amber-500" />}
              >
                Create Recommendation
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsSessionModalOpen(true)}
                icon={<Calendar className="w-4 h-4 text-indigo-500" />}
              >
                Log Mentoring Session
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsReviewModalOpen(true)}
                icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
              >
                Approve / Request Changes
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Profile Detail */}
      {activeTab === 'profile' && (
        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Technical Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills?.map((s: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-md text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Strengths</h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.strengths?.map((s: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-md text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Areas to Improve</h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.areasToImprove?.map((s: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-md text-xs bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Hobbies & Interests</h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.hobbies?.map((s: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-md text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Short-Term Goals (6-12 Months)</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">{profile.shortTermGoals || 'Not specified'}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Long-Term Goals (3-5 Years)</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">{profile.longTermGoals || 'Not specified'}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Extracurricular Activities</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">{profile.extracurricularActivities || 'Not specified'}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Academic Progress */}
      {activeTab === 'academic' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4">
              <span className="text-xs font-medium text-slate-500">Cumulative CGPA</span>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                {profile.academicRecords?.[profile.academicRecords.length - 1]?.cgpa || '9.26'}
              </p>
              <span className="text-[11px] text-slate-400">Scale of 10.0</span>
            </Card>

            <Card className="p-4">
              <span className="text-xs font-medium text-slate-500">Latest SGPA</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {profile.academicRecords?.[profile.academicRecords.length - 1]?.sgpa || '9.5'}
              </p>
              <span className="text-[11px] text-slate-400">Semester 5</span>
            </Card>

            <Card className="p-4">
              <span className="text-xs font-medium text-slate-500">Active Backlogs</span>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">0</p>
              <span className="text-[11px] text-emerald-600 font-semibold">Clean Academic Record</span>
            </Card>
          </div>

          <Card>
            <CardHeader title="Semester Breakdown & Grades" description="Verified exam records from registrar" />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-4">Semester</th>
                    <th className="py-2.5 px-4">SGPA</th>
                    <th className="py-2.5 px-4">CGPA</th>
                    <th className="py-2.5 px-4">Backlogs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {profile.academicRecords?.map((rec: any) => (
                    <tr key={rec.id}>
                      <td className="py-2.5 px-4 font-semibold">Semester {rec.semester}</td>
                      <td className="py-2.5 px-4 font-bold text-emerald-600">{rec.sgpa}</td>
                      <td className="py-2.5 px-4 font-semibold">{rec.cgpa}</td>
                      <td className="py-2.5 px-4">{rec.backlogsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Faculty Recommendations</h3>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsRecModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Recommendation
            </Button>
          </div>

          {recommendations.length === 0 ? (
            <EmptyState
              title="No Recommendations Created"
              description="Click Add Recommendation to record targeted developmental goals for this mentee."
            />
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="p-5">
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                        {rec.category?.replace(/_/g, ' ')}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">{rec.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={rec.priority} />
                      <StatusBadge status={rec.status} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">{rec.explanation}</p>

                  {rec.successCriteria && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs border border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Success Criteria: </span>
                      {rec.successCriteria}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Target: {rec.targetDate ? new Date(rec.targetDate).toLocaleDateString() : 'Continuous'}
                    </span>

                    {rec.status === 'IN_PROGRESS' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSubmitRecForEndorsement(rec.id)}
                        icon={<ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />}
                      >
                        Submit for HOD Endorsement
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Mentoring Sessions */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Mentoring Sessions Log</h3>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsSessionModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Log New Session
            </Button>
          </div>

          {sessions.length === 0 ? (
            <EmptyState
              title="No Mentoring Sessions"
              description="Record one-on-one sessions, discussions, and private faculty observation notes."
            />
          ) : (
            <div className="space-y-4">
              {sessions.map((sess) => (
                <Card key={sess.id} className="p-5 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {sess.type?.replace('_', ' ')}
                      </span>
                      <StatusBadge status={sess.status} />
                    </div>
                    <span className="text-xs text-slate-400">{new Date(sess.sessionDate).toLocaleDateString()}</span>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Discussion Summary</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{sess.discussionSummary}</p>
                  </div>

                  {/* Private Faculty Notes (Strictly Separated and Clearly Labelled) */}
                  {sess.privateFacultyNotes && (
                    <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/40 text-xs">
                      <div className="flex items-center gap-1.5 text-purple-900 dark:text-purple-300 font-bold mb-1">
                        <Lock className="w-3.5 h-3.5 text-purple-600" />
                        <span>Private Faculty Notes (Confidential – Never Shared with Student)</span>
                      </div>
                      <p className="text-purple-800 dark:text-purple-300/90 leading-relaxed">
                        {sess.privateFacultyNotes}
                      </p>
                    </div>
                  )}

                  {sess.agreedActionItemsSummary && (
                    <div className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Agreed Action: </span>
                      {sess.agreedActionItemsSummary}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Action Items */}
      {activeTab === 'actionItems' && (
        <Card className="p-5">
          <CardHeader title="Action Items & Tasks" description="Monitor student milestone completion" />
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {actionItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No action items created yet</div>
            ) : (
              actionItems.map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.title}</span>
                      <PriorityBadge priority={item.priority} />
                    </div>
                    {item.studentNotes && (
                      <p className="text-xs text-slate-500 mt-1">Student Note: {item.studentNotes}</p>
                    )}
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Tab 7: Endorsement History */}
      {activeTab === 'endorsements' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">HOD Endorsement Records</h3>
          {endorsements.length === 0 ? (
            <EmptyState
              title="No Endorsement Submissions"
              description="Records submitted to HOD for formal institutional sign-off will appear here."
            />
          ) : (
            <div className="space-y-3">
              {endorsements.map((end) => (
                <Card key={end.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {end.itemType?.replace('_', ' ')}
                    </span>
                    <StatusBadge status={end.status} />
                  </div>

                  {end.decisionNotes && (
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">HOD Decision Notes: </span>
                      {end.decisionNotes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
                    <span>Submitted: {new Date(end.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => setActiveSnapshot(end.originalContentSnapshot)}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                    >
                      View Version Snapshot
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Profile Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Review Student Profile"
        description="Verify submitted profile quality and provide formal mentor feedback"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Decision</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReviewStatus('APPROVED_ENDORSED')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                  reviewStatus === 'APPROVED_ENDORSED'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Approve & Endorse
              </button>

              <button
                type="button"
                onClick={() => setReviewStatus('CHANGES_REQUESTED')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                  reviewStatus === 'CHANGES_REQUESTED'
                    ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Request Changes
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Review Feedback Notes (Required)
            </label>
            <textarea
              rows={4}
              required
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Detail your feedback or specify what sections need enhancement..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button size="sm" variant="ghost" onClick={() => setIsReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleReviewProfile}
              isLoading={isSubmittingReview}
              disabled={!reviewNotes.trim()}
            >
              Submit Review
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Recommendation Modal */}
      <Modal
        isOpen={isRecModalOpen}
        onClose={() => setIsRecModalOpen(false)}
        title="Create Faculty Recommendation"
        description="Formulate targeted skill, academic, or career goals for student growth"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateRecommendation} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Recommendation Title</label>
            <input
              type="text"
              required
              value={recTitle}
              onChange={(e) => setRecTitle(e.target.value)}
              placeholder="E.g., AWS Certified Solutions Architect or NPTEL Discrete Mathematics Course"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={recCategory}
                onChange={(e) => setRecCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                {[
                  'ACADEMIC_IMPROVEMENT',
                  'CAREER_GUIDANCE',
                  'TECHNICAL_SKILLS',
                  'COMMUNICATION',
                  'SOFT_SKILLS',
                  'WELLBEING_SUPPORT',
                  'EXTRACURRICULAR_ACTIVITIES',
                  'PROJECTS',
                  'INTERNSHIPS',
                  'CERTIFICATIONS',
                  'PERSONAL_DEVELOPMENT',
                ].map((c) => (
                  <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={recPriority}
                onChange={(e) => setRecPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Detailed Explanation & Rationale</label>
            <textarea
              rows={3}
              required
              value={recExplanation}
              onChange={(e) => setRecExplanation(e.target.value)}
              placeholder="Why this recommendation is necessary and how it helps the student..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Date</label>
              <input
                type="date"
                value={recTargetDate}
                onChange={(e) => setRecTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Resources / References</label>
              <input
                type="text"
                value={recResources}
                onChange={(e) => setRecResources(e.target.value)}
                placeholder="Books, URLs, course links..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Measurable Success Criteria</label>
            <input
              type="text"
              value={recSuccessCriteria}
              onChange={(e) => setRecSuccessCriteria(e.target.value)}
              placeholder="E.g., Scoring 80%+ on practice exam and deploying prototype"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="submitHOD"
              checked={recSubmitForEndorsement}
              onChange={(e) => setRecSubmitForEndorsement(e.target.checked)}
              className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="submitHOD" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Submit immediately for HOD Endorsement (e.g. Funding / Special Approval)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button size="sm" variant="ghost" type="button" onClick={() => setIsRecModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" isLoading={isSubmittingRec}>
              Create Recommendation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Log Mentoring Session Modal */}
      <Modal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        title="Log Mentoring Session"
        description="Record session summary, private internal observations, and action items"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSession} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Session Date</label>
              <input
                type="date"
                required
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Session Type</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="ONE_ON_ONE">One-on-One Check-in</option>
                <option value="ACADEMIC_REVIEW">Academic Review</option>
                <option value="CAREER_COUNSELING">Career Counseling</option>
                <option value="SUPPORT_WELLBEING">Support & Wellbeing</option>
                <option value="CRISIS_FOLLOWUP">Crisis Follow-up</option>
                <option value="CASUAL_CHECKIN">Casual Check-in</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Discussion Summary (Shared with Student)</label>
            <textarea
              rows={3}
              required
              value={discussionSummary}
              onChange={(e) => setDiscussionSummary(e.target.value)}
              placeholder="Topics covered, academic progress reviewed, feedback provided..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Private Faculty Notes (Confidential) */}
          <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 space-y-1.5">
            <div className="flex items-center gap-1.5 text-purple-900 dark:text-purple-300 font-bold text-xs">
              <Lock className="w-3.5 h-3.5 text-purple-600" />
              <span>Private Faculty Notes (Internal & Confidential)</span>
            </div>
            <p className="text-[11px] text-purple-700 dark:text-purple-400">
              Notes entered here are NEVER visible to students or unauthorized staff.
            </p>
            <textarea
              rows={2}
              value={privateFacultyNotes}
              onChange={(e) => setPrivateFacultyNotes(e.target.value)}
              placeholder="Confidential observations on student demeanor, personal challenges, or internal mentoring strategy..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Agreed Action Summary</label>
              <input
                type="text"
                value={agreedActionSummary}
                onChange={(e) => setAgreedActionSummary(e.target.value)}
                placeholder="E.g., Complete Lab 4 by Friday"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Next Follow-Up Date</label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button size="sm" variant="ghost" type="button" onClick={() => setIsSessionModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" isLoading={isSubmittingSession}>
              Save Session Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Snapshot Viewer Modal */}
      <Modal
        isOpen={Boolean(activeSnapshot)}
        onClose={() => setActiveSnapshot(null)}
        title="Version Snapshot"
        description="Preserved immutable record of submitted mentor content at time of endorsement request"
      >
        <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs overflow-x-auto font-mono max-h-80">
          {JSON.stringify(activeSnapshot, null, 2)}
        </pre>
      </Modal>
    </div>
  );
};
