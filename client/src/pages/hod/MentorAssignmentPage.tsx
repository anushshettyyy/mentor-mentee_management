import React, { useState, useEffect } from 'react';
import { UserPlus, Users, CheckCircle2, Search, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const MentorAssignmentPage: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Assign Modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchAssignmentData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAssignments();
      if (res.success) {
        setAssignments(res.assignments);
        setUnassignedStudents(res.unassignedStudents);
        setFaculty(res.faculty);
      }
    } catch (err) {
      console.error('Failed to load assignments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentData();
  }, []);

  const handleAssignMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedFacultyId) return;

    setIsSubmitting(true);
    try {
      const res = await api.assignMentor({
        studentProfileId: selectedStudentId,
        facultyProfileId: selectedFacultyId,
        notes: assignmentNotes || undefined,
      });
      if (res.success) {
        setIsAssignModalOpen(false);
        setSelectedStudentId('');
        setSelectedFacultyId('');
        setAssignmentNotes('');
        fetchAssignmentData();
      }
    } catch (err) {
      console.error('Failed to assign mentor', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-96 rounded-2xl" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Mentor Allocation & Coverage</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Assign students to faculty mentors, manage reassignments, and balance mentee cohorts
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            if (unassignedStudents.length > 0) setSelectedStudentId(unassignedStudents[0].id);
            if (faculty.length > 0) setSelectedFacultyId(faculty[0].id);
            setIsAssignModalOpen(true);
          }}
          icon={<UserPlus className="w-4 h-4" />}
        >
          New Allocation
        </Button>
      </div>

      {/* Unassigned Students Alert */}
      {unassignedStudents.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 dark:text-amber-300">
                {unassignedStudents.length} Students Currently Unassigned
              </h4>
              <p className="text-amber-800 dark:text-amber-400 mt-0.5">
                Ensure 100% departmental mentoring coverage in compliance with university accreditation standards.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedStudentId(unassignedStudents[0].id);
              if (faculty.length > 0) setSelectedFacultyId(faculty[0].id);
              setIsAssignModalOpen(true);
            }}
          >
            Assign First
          </Button>
        </div>
      )}

      {/* Faculty Capacity Grid */}
      <Card>
        <CardHeader title="Faculty Mentor Capacity" description="Current student cohort size vs institutional maximum" />
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {faculty.map((f) => (
              <div
                key={f.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{f.name}</span>
                    <p className="text-[11px] text-slate-400">{f.designation}</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {f.activeCount} / {f.maxMentees}
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, (f.activeCount / f.maxMentees) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Assignments List */}
      <Card>
        <CardHeader
          title={`Active Mentor Assignments (${assignments.length})`}
          description="Institutional pairing records and notes"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">USN</th>
                <th className="py-3 px-4">Assigned Mentor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Date</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {assignments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {a.studentProfile?.user?.firstName} {a.studentProfile?.user?.lastName}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">{a.studentProfile?.usn}</td>
                  <td className="py-3 px-4 font-medium text-indigo-600 dark:text-indigo-400">
                    {a.facultyProfile?.user?.firstName} {a.facultyProfile?.user?.lastName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200">
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{new Date(a.assignedAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{a.notes || '—'}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedStudentId(a.studentProfileId);
                        setSelectedFacultyId(a.facultyProfileId);
                        setIsAssignModalOpen(true);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Reassign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Assign Mentor Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Allocate / Reassign Mentor"
        description="Pair a student with a faculty advisor"
      >
        <form onSubmit={handleAssignMentor} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="" disabled>-- Select a student --</option>
              {unassignedStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.usn} - {s.user?.firstName} {s.user?.lastName} (Unassigned)
                </option>
              ))}
              {assignments.map((a) => (
                <option key={a.studentProfileId} value={a.studentProfileId}>
                  {a.studentProfile?.usn} - {a.studentProfile?.user?.firstName} {a.studentProfile?.user?.lastName} (Currently with {a.facultyProfile?.user?.lastName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Faculty Mentor</label>
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="" disabled>-- Select a faculty mentor --</option>
              {faculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.designation}) - {f.activeCount}/{f.maxMentees} mentees
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assignment Rationale / Notes</label>
            <textarea
              rows={3}
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              placeholder="E.g., Assigned based on shared interest in Distributed Systems and Cloud Computing..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button size="sm" variant="ghost" type="button" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" isLoading={isSubmitting}>
              Confirm Allocation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
