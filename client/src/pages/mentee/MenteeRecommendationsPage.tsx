import React, { useState, useEffect } from 'react';
import { Lightbulb, Calendar, CheckCircle2, ShieldCheck, ExternalLink, Filter } from 'lucide-react';
import { api } from '../../api/client';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';

export const MenteeRecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  useEffect(() => {
    api
      .getRecommendations()
      .then((res) => {
        if (res.success) setRecommendations(res.recommendations);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = recommendations.filter((r) => {
    if (categoryFilter === 'ALL') return true;
    return r.category === categoryFilter;
  });

  if (isLoading) {
    return <Skeleton className="h-64 rounded-xl" />;
  }

  const categories = [
    'ALL',
    'ACADEMIC_IMPROVEMENT',
    'CAREER_GUIDANCE',
    'TECHNICAL_SKILLS',
    'COMMUNICATION',
    'SOFT_SKILLS',
    'WELLBEING_SUPPORT',
    'PROJECTS',
    'CERTIFICATIONS',
    'INTERNSHIPS',
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Faculty Recommendations</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Targeted skill development, academic plans, and department-endorsed career objectives
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Lightbulb className="w-10 h-10 text-slate-400" />}
          title="No Recommendations Found"
          description={
            categoryFilter === 'ALL'
              ? 'Your mentor has not issued any specific recommendations yet.'
              : 'No recommendations found matching the selected category.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((rec) => (
            <Card key={rec.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
                      {rec.category?.replace(/_/g, ' ')}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 leading-snug">
                      {rec.title}
                    </h3>
                  </div>
                  <PriorityBadge priority={rec.priority} />
                </div>

                <div className="pt-3 space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {rec.explanation}
                  </p>

                  {rec.successCriteria && (
                    <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs">
                      <span className="font-semibold text-emerald-800 dark:text-emerald-300 block text-[11px] uppercase tracking-wide">
                        Success Criteria:
                      </span>
                      <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">{rec.successCriteria}</p>
                    </div>
                  )}

                  {rec.resources && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Recommended Resources: </span>
                      {rec.resources}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {rec.targetDate ? `Target: ${new Date(rec.targetDate).toLocaleDateString()}` : 'Continuous'}
                  </span>
                </div>
                <StatusBadge status={rec.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
