import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, MapPin, Clock, BookOpen, Search, GraduationCap } from 'lucide-react';
import { api } from '../../api/client';
import { Card, CardContent } from '../../components/common/Card';
import { Skeleton } from '../../components/common/Skeleton';

export const MentorDirectoryPage: React.FC = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    api
      .getMentorDirectory()
      .then((res) => {
        if (res.success) setMentors(res.mentors);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = mentors.filter((m) => {
    const query = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      (m.specialization && m.specialization.toLowerCase().includes(query)) ||
      m.designation.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return <Skeleton className="h-96 rounded-2xl" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Faculty Mentor Directory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Department of Computer Science faculty advisors, research areas, and office consulting hours
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search mentor or research topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((mentor) => (
          <Card key={mentor.id} className="p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  {mentor.name
                    ?.split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part: string) => part[0])
                    .join('')
                    .toUpperCase() || 'FA'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{mentor.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{mentor.designation}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{mentor.qualifications}</p>
                </div>
              </div>

              {mentor.specialization && (
                <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 text-xs text-indigo-900 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30">
                  <span className="font-semibold block text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Specialization:
                  </span>
                  {mentor.specialization}
                </div>
              )}

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{mentor.email}</span>
                </div>
                {mentor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{mentor.phone}</span>
                  </div>
                )}
                {mentor.cabinLocation && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{mentor.cabinLocation}</span>
                  </div>
                )}
                {mentor.officeHours && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Office Hours: {mentor.officeHours}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Employee ID: {mentor.employeeId}</span>
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {mentor.activeMenteesCount} active mentees
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
