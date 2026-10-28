import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Lightbulb,
  Target,
  Award,
  Sparkles,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  FileCheck,
} from 'lucide-react';
import { api } from '../../api/client';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';

export const ProfileWizardPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'learning' | 'skills' | 'goals' | 'achievements'>('basic');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState<any>({
    phone: '',
    dateOfBirth: '',
    address: '',
    profilePhoto: '',
    semester: 1,
    preferredLearningStyle: 'VISUAL',
    academicInterests: '',
    supportRequested: '',
    careerGoals: '',
    shortTermGoals: '',
    longTermGoals: '',
    extracurricularActivities: '',
    hobbies: [] as string[],
    interests: [] as string[],
    skills: [] as string[],
    strengths: [] as string[],
    areasToImprove: [] as string[],
    languages: [] as string[],
  });

  // Tag inputs
  const [hobbyInput, setHobbyInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [strengthInput, setStrengthInput] = useState('');
  const [improveInput, setImproveInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await api.getMyStudentProfile();
      if (res.success && res.profile) {
        setProfile(res.profile);
        setFormData({
          phone: res.profile.phone || '',
          dateOfBirth: res.profile.dateOfBirth ? res.profile.dateOfBirth.split('T')[0] : '',
          address: res.profile.address || '',
          profilePhoto: res.profile.profilePhoto || '',
          semester: res.profile.semester || 1,
          preferredLearningStyle: res.profile.preferredLearningStyle || 'VISUAL',
          academicInterests: res.profile.academicInterests || '',
          supportRequested: res.profile.supportRequested || '',
          careerGoals: res.profile.careerGoals || '',
          shortTermGoals: res.profile.shortTermGoals || '',
          longTermGoals: res.profile.longTermGoals || '',
          extracurricularActivities: res.profile.extracurricularActivities || '',
          hobbies: res.profile.hobbies || [],
          interests: res.profile.interests || [],
          skills: res.profile.skills || [],
          strengths: res.profile.strengths || [],
          areasToImprove: res.profile.areasToImprove || [],
          languages: res.profile.languages || [],
        });
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAddTag = (
    field: 'hobbies' | 'interests' | 'skills' | 'strengths' | 'areasToImprove' | 'languages',
    value: string,
    clearInput: () => void
  ) => {
    if (!value.trim()) return;
    if (!formData[field].includes(value.trim())) {
      setFormData({ ...formData, [field]: [...formData[field], value.trim()] });
    }
    clearInput();
  };

  const handleRemoveTag = (
    field: 'hobbies' | 'interests' | 'skills' | 'strengths' | 'areasToImprove' | 'languages',
    index: number
  ) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_: any, i: number) => i !== index),
    });
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setFeedbackMsg(null);
    try {
      const res = await api.updateMyStudentProfile(formData);
      if (res.success) {
        setProfile(res.profile);
        setFeedbackMsg({ type: 'success', text: 'Profile draft saved successfully!' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to save profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      // First save current fields
      await api.updateMyStudentProfile(formData);
      // Then submit
      const res = await api.submitMyStudentProfile();
      if (res.success) {
        setProfile(res.profile);
        setFeedbackMsg({ type: 'success', text: 'Profile submitted for mentor review!' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to submit profile' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  const tabs = [
    { id: 'basic', label: '1. Basic & Contact', icon: User },
    { id: 'learning', label: '2. Academic & Learning', icon: GraduationCap },
    { id: 'skills', label: '3. Skills & Strengths', icon: Lightbulb },
    { id: 'goals', label: '4. Career Goals', icon: Target },
    { id: 'achievements', label: '5. Activities & Support', icon: Award },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Completion Meter */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Mentee Profile Wizard</h1>
              <StatusBadge status={profile?.status || 'DRAFT'} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete your holistic academic profile to enable tailored faculty mentoring and institutional endorsements.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              isLoading={isSaving}
              icon={<Save className="w-4 h-4" />}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitForReview}
              isLoading={isSubmitting}
              icon={<Send className="w-4 h-4" />}
            >
              Submit for Mentor Review
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Profile Completion Quality</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{profile?.completionPercentage || 0}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${profile?.completionPercentage || 0}%` }}
            />
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${
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

      {/* Tab 1: Basic & Contact Info */}
      {activeTab === 'basic' && (
        <Card>
          <CardHeader title="Identity & Institutional Details" description="Verified student records and contact information" />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={`${profile?.user?.firstName || ''} ${profile?.user?.lastName || ''}`}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">USN / Student ID</label>
                <input
                  type="text"
                  disabled
                  value={profile?.usn || ''}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department & Course</label>
                <input
                  type="text"
                  disabled
                  value={`${profile?.department} - ${profile?.course}`}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth (Optional)</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Residential Address (Optional)</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address, city, state, postal code"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Profile Photo URL</label>
                <input
                  type="text"
                  value={formData.profilePhoto}
                  onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">Provide a professional portrait image link</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Learning & Academic Interests */}
      {activeTab === 'learning' && (
        <Card>
          <CardHeader title="Academic Interests & Learning Pedagogy" description="How you prefer to absorb concepts and subject matter" />
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Learning Style (VARK Model)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'VISUAL', label: 'Visual', desc: 'Diagrams, architectures, charts' },
                  { id: 'AUDITORY', label: 'Auditory', desc: 'Lectures, seminars, group debates' },
                  { id: 'KINESTHETIC', label: 'Kinesthetic', desc: 'Hands-on lab coding, build by doing' },
                  { id: 'READING_WRITING', label: 'Reading/Writing', desc: 'Documentation, research papers, notes' },
                ].map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredLearningStyle: style.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.preferredLearningStyle === style.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs block">{style.label}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">{style.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Academic & Research Interests
              </label>
              <textarea
                rows={3}
                value={formData.academicInterests}
                onChange={(e) => setFormData({ ...formData, academicInterests: e.target.value })}
                placeholder="E.g., Distributed Cloud Storage, Autonomous Robotics, NLP, Zero Knowledge Proofs..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mentoring Support Requested
              </label>
              <textarea
                rows={2}
                value={formData.supportRequested}
                onChange={(e) => setFormData({ ...formData, supportRequested: e.target.value })}
                placeholder="What specific guidance do you seek from your faculty mentor? (e.g. mock technical interviews, research paper advice, time management)"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Skills, Strengths & Areas to Improve */}
      {activeTab === 'skills' && (
        <Card>
          <CardHeader title="Skills, Strengths & Growth Areas" description="Self-assessed competencies and development roadmap" />
          <CardContent className="space-y-5">
            {/* Technical Skills */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Technical Skills</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('skills', skillInput, () => setSkillInput('')))}
                  placeholder="Add skill (e.g., React, Go, Docker) and press Enter"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
                <Button size="sm" variant="secondary" onClick={() => handleAddTag('skills', skillInput, () => setSkillInput(''))}>
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.skills.map((s: string, idx: number) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {s}
                    <button type="button" onClick={() => handleRemoveTag('skills', idx)} className="hover:text-indigo-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Key Strengths</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={strengthInput}
                  onChange={(e) => setStrengthInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('strengths', strengthInput, () => setStrengthInput('')))}
                  placeholder="Add strength (e.g., Quick Learner, Analytical Thinking)"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
                <Button size="sm" variant="secondary" onClick={() => handleAddTag('strengths', strengthInput, () => setStrengthInput(''))}>
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.strengths.map((s: string, idx: number) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {s}
                    <button type="button" onClick={() => handleRemoveTag('strengths', idx)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>

            {/* Areas to Improve */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Areas to Improve</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={improveInput}
                  onChange={(e) => setImproveInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('areasToImprove', improveInput, () => setImproveInput('')))}
                  placeholder="Add area (e.g., Public Speaking, Graph Algorithms)"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
                <Button size="sm" variant="secondary" onClick={() => handleAddTag('areasToImprove', improveInput, () => setImproveInput(''))}>
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.areasToImprove.map((s: string, idx: number) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    {s}
                    <button type="button" onClick={() => handleRemoveTag('areasToImprove', idx)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Languages Spoken</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('languages', languageInput, () => setLanguageInput('')))}
                  placeholder="Add language (e.g., English, Kannada, Hindi)"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
                <Button size="sm" variant="secondary" onClick={() => handleAddTag('languages', languageInput, () => setLanguageInput(''))}>
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.languages.map((s: string, idx: number) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {s}
                    <button type="button" onClick={() => handleRemoveTag('languages', idx)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Career Goals */}
      {activeTab === 'goals' && (
        <Card>
          <CardHeader title="Vision & Career Ambitions" description="Define your short-term milestones and long-term aspirational trajectory" />
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Career Goal
              </label>
              <textarea
                rows={2}
                value={formData.careerGoals}
                onChange={(e) => setFormData({ ...formData, careerGoals: e.target.value })}
                placeholder="E.g., Senior Systems Engineer or Founder in AI Developer Tools within 5 years."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Short-Term Goals (6 – 12 Months)
                </label>
                <textarea
                  rows={3}
                  value={formData.shortTermGoals}
                  onChange={(e) => setFormData({ ...formData, shortTermGoals: e.target.value })}
                  placeholder="E.g., Secure SDE summer internship, maintain 9.0+ CGPA, publish research poster."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Long-Term Goals (3 – 5 Years)
                </label>
                <textarea
                  rows={3}
                  value={formData.longTermGoals}
                  onChange={(e) => setFormData({ ...formData, longTermGoals: e.target.value })}
                  placeholder="E.g., Pursue MS in Computer Science or lead architectural decisions for distributed systems."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 5: Extracurriculars & Hobbies */}
      {activeTab === 'achievements' && (
        <Card>
          <CardHeader title="Extracurriculars, Activities & Hobbies" description="Campus involvement, hackathons, and personal interests" />
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Extracurricular Activities & Clubs
              </label>
              <textarea
                rows={3}
                value={formData.extracurricularActivities}
                onChange={(e) => setFormData({ ...formData, extracurricularActivities: e.target.value })}
                placeholder="E.g., Core Organizer for Annual CodeX Hackathon, Member IEEE Student Branch, Volunteer for NSS Blood Donation Camp..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Hobbies */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Hobbies & Sports</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={hobbyInput}
                  onChange={(e) => setHobbyInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('hobbies', hobbyInput, () => setHobbyInput('')))}
                  placeholder="Add hobby (e.g., Badminton, Chess, Speedcubing)"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
                <Button size="sm" variant="secondary" onClick={() => handleAddTag('hobbies', hobbyInput, () => setHobbyInput(''))}>
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.hobbies.map((s: string, idx: number) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {s}
                    <button type="button" onClick={() => handleRemoveTag('hobbies', idx)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-slate-500">
              Changes are saved as a draft until formally submitted for review.
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSaveDraft} isLoading={isSaving} icon={<Save className="w-3.5 h-3.5" />}>
                Save Draft
              </Button>
              <Button variant="primary" size="sm" onClick={handleSubmitForReview} isLoading={isSubmitting} icon={<Send className="w-3.5 h-3.5" />}>
                Submit for Review
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};
