import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, ExternalLink, Users } from 'lucide-react';
import { api } from '../../api/client';
import { Card, CardHeader } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const MenteesListPage: React.FC = () => {
  const [mentees, setMentees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [semesterFilter, setSemesterFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'usn' | 'completion'>('name');

  useEffect(() => {
    api
      .getMentorDashboardData()
      .then((res) => {
        if (res.success) setMentees(res.data.mentees);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = mentees
    .filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSem = semesterFilter === 'ALL' || String(m.semester) === semesterFilter;
      const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
      return matchesSearch && matchesSem && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'completion') return b.completionPercentage - a.completionPercentage;
      if (sortBy === 'usn') return a.usn.localeCompare(b.usn);
      return a.name.localeCompare(b.name);
    });

  if (isLoading) {
    return <Skeleton className="h-96 rounded-2xl" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Assigned Mentees</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Complete list of students assigned to you for academic mentoring and guidance
          </p>
        </div>
      </div>

      <Card>
        <CardHeader
          title={`All Mentees (${filtered.length})`}
          description="Filter and search across allocated cohorts"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student or USN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 w-44 sm:w-56"
                />
              </div>

              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={String(s)}>Sem {s}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED_ENDORSED">Approved</option>
                <option value="CHANGES_REQUESTED">Changes Requested</option>
                <option value="DRAFT">Draft</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="name">Sort by Name</option>
                <option value="usn">Sort by USN</option>
                <option value="completion">Sort by Completion %</option>
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
                <th className="py-3 px-4">Course & Sem</th>
                <th className="py-3 px-4">Profile Quality</th>
                <th className="py-3 px-4">Review Status</th>
                <th className="py-3 px-4">Recommendations</th>
                <th className="py-3 px-4">Pending Tasks</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No assigned mentees match the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {m.name?.[0] || 'S'}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100 block">{m.name}</span>
                          <span className="text-[11px] text-slate-400">{m.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">{m.usn}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{m.course} • Sem {m.semester}</td>
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
