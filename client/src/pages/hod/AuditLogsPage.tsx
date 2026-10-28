import React, { useState, useEffect } from 'react';
import { FileText, Shield, Search, Clock, User, Filter } from 'lucide-react';
import { api } from '../../api/client';
import { Card, CardHeader } from '../../components/common/Card';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  useEffect(() => {
    api
      .getAuditLogs()
      .then((res) => {
        if (res.success) setLogs(res.logs);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.changeSummary && log.changeSummary.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.actor && `${log.actor.firstName} ${log.actor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  if (isLoading) {
    return <Skeleton className="h-96 rounded-2xl" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Audit & Governance Trail</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable log of all user logins, profile submissions, recommendations, reassignments, and HOD decisions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader
          title={`Audit Log Records (${filtered.length})`}
          description="Tamper-evident record of state mutations across department"
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search action, actor, details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 w-48 sm:w-64"
                />
              </div>

              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Event Actions</option>
                <option value="USER_LOGIN">User Logins</option>
                <option value="PROFILE_SUBMIT">Profile Submissions</option>
                <option value="PROFILE_REVIEW">Profile Reviews</option>
                <option value="RECOMMENDATION_CREATE">Recommendations</option>
                <option value="ENDORSEMENT_DECISION">Endorsement Decisions</option>
                <option value="MENTOR_ASSIGN">Mentor Allocations</option>
                <option value="USER_CREATE">User Account Creations</option>
              </select>
            </div>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Change Summary</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No audit records found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {log.actor ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {log.actor.firstName} {log.actor.lastName}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                            {log.actor.role}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">System Event</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{log.entityType}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-sm truncate">
                      {log.changeSummary || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{log.ipAddress || 'localhost'}</td>
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
