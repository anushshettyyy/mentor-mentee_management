import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckSquare } from 'lucide-react';
import { api } from '../../api/client';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';

export const MenteeSessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api
      .getSessions()
      .then((res) => {
        if (res.success) setSessions(res.sessions);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <Skeleton className="h-64 rounded-xl" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Mentoring Session History</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Records of one-on-one sessions, discussions, and agreed action milestones
          </p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-10 h-10 text-slate-400" />}
          title="No Sessions Recorded Yet"
          description="Your mentor will log your one-on-one academic and career advising sessions here."
        />
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {session.type?.replace('_', ' ')}
                      </h3>
                      <StatusBadge status={session.status} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Session Date: {new Date(session.sessionDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {session.nextFollowUpDate && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 self-start sm:self-auto">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Follow-up: {new Date(session.nextFollowUpDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Discussion Summary</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {session.discussionSummary}
                  </p>
                </div>

                {session.agreedActionItemsSummary && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                      Agreed Action Summary
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {session.agreedActionItemsSummary}
                    </p>
                  </div>
                )}

                {/* Attached Action Items */}
                {session.actionItems && session.actionItems.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                      Assigned Action Items ({session.actionItems.length})
                    </h4>
                    <div className="space-y-1.5">
                      {session.actionItems.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                        >
                          <span className="font-medium text-slate-800 dark:text-slate-200">{item.title}</span>
                          <StatusBadge status={item.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
