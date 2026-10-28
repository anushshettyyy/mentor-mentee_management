import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  MessageSquare,
  FileText,
  User,
} from 'lucide-react';
import { api } from '../../api/client';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const EndorsementsQueuePage: React.FC = () => {
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Decision Modal state
  const [selectedEndorsement, setSelectedEndorsement] = useState<any | null>(null);
  const [decisionAction, setDecisionAction] = useState<'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED'>('APPROVED');
  const [decisionNotes, setDecisionNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Snapshot modal
  const [activeSnapshot, setActiveSnapshot] = useState<any | null>(null);

  const fetchEndorsements = async () => {
    setIsLoading(true);
    try {
      const res = await api.getEndorsements();
      if (res.success) setEndorsements(res.endorsements);
    } catch (err) {
      console.error('Failed to load endorsements', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEndorsements();
  }, []);

  const handleMakeDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEndorsement || !decisionNotes.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.makeEndorsementDecision(selectedEndorsement.id, {
        status: decisionAction,
        decisionNotes,
      });
      if (res.success) {
        setSelectedEndorsement(null);
        setDecisionNotes('');
        fetchEndorsements();
      }
    } catch (err) {
      console.error('Failed to record endorsement decision', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = endorsements.filter((e) => {
    if (statusFilter === 'ALL') return true;
    return e.status === statusFilter;
  });

  if (isLoading) {
    return <Skeleton className="h-96 rounded-2xl" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Endorsements & Approval Queue</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review mentor proposals, track snapshot versioning, and record auditable decisions
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Requests ({endorsements.length})</option>
          <option value="PENDING">Pending Review</option>
          <option value="APPROVED">Approved / Endorsed</option>
          <option value="CHANGES_REQUESTED">Changes Requested</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="w-10 h-10 text-slate-400" />}
          title="No Endorsement Requests"
          description={
            statusFilter === 'ALL'
              ? 'No proposals have been submitted for endorsement yet.'
              : `No endorsement requests matching status "${statusFilter}".`
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {item.itemType?.replace(/_/g, ' ')}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {item.recommendation?.title || 'Student Profile Endorsement'}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveSnapshot(item.originalContentSnapshot)}
                    icon={<Eye className="w-3.5 h-3.5 text-slate-500" />}
                  >
                    View Snapshot
                  </Button>

                  {item.status === 'PENDING' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setSelectedEndorsement(item);
                        setDecisionAction('APPROVED');
                        setDecisionNotes('');
                      }}
                      icon={<ShieldCheck className="w-3.5 h-3.5" />}
                    >
                      Make Decision
                    </Button>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="py-3 text-xs space-y-2">
                <div className="flex flex-wrap items-center gap-4 text-slate-500">
                  <span>
                    Mentor: <strong className="text-slate-700 dark:text-slate-300">
                      Dr. {item.requestedByMentor?.user?.lastName || 'Mentor'}
                    </strong>
                  </span>
                  <span>
                    Student: <strong className="text-slate-700 dark:text-slate-300">
                      {item.studentProfile?.usn} ({item.studentProfile?.user?.firstName} {item.studentProfile?.user?.lastName})
                    </strong>
                  </span>
                  <span>
                    Submitted: <strong>{new Date(item.createdAt).toLocaleDateString()}</strong>
                  </span>
                </div>

                {item.recommendation?.explanation && (
                  <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Proposal Summary: </span>
                    {item.recommendation.explanation}
                  </p>
                )}

                {item.decisionNotes && (
                  <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                    <span className="font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide text-[10px] block">
                      HOD Formal Decision Note:
                    </span>
                    <p className="text-indigo-800 dark:text-indigo-300/90 mt-0.5">{item.decisionNotes}</p>
                    {item.reviewedAt && (
                      <span className="text-[10px] text-indigo-400 mt-1 block">
                        Decided on {new Date(item.reviewedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Decision Dialog Modal */}
      <Modal
        isOpen={Boolean(selectedEndorsement)}
        onClose={() => setSelectedEndorsement(null)}
        title="Department Endorsement Decision"
        description="Formal sign-off for student recommendation and institutional support"
      >
        <form onSubmit={handleMakeDecision} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Action</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecisionAction('APPROVED')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 ${
                  decisionAction === 'APPROVED'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Endorse (Approve)
              </button>

              <button
                type="button"
                onClick={() => setDecisionAction('CHANGES_REQUESTED')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 ${
                  decisionAction === 'CHANGES_REQUESTED'
                    ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Request Changes
              </button>

              <button
                type="button"
                onClick={() => setDecisionAction('REJECTED')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 ${
                  decisionAction === 'REJECTED'
                    ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 ring-2 ring-rose-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                Reject
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mandatory Explanation & Decision Notes
            </label>
            <textarea
              rows={4}
              required
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              placeholder="Detail reasons for approval, funding terms, or specific feedback for changes..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button size="sm" variant="ghost" type="button" onClick={() => setSelectedEndorsement(null)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" isLoading={isSubmitting} disabled={!decisionNotes.trim()}>
              Record Decision
            </Button>
          </div>
        </form>
      </Modal>

      {/* Version Snapshot Modal */}
      <Modal
        isOpen={Boolean(activeSnapshot)}
        onClose={() => setActiveSnapshot(null)}
        title="Version Snapshot Viewer"
        description="Original mentor content snapshot saved at submission time (immutable history)"
        maxWidth="lg"
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            This snapshot preserves the original content submitted by the faculty mentor, protecting against accidental overwrites.
          </p>
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-96">
            {JSON.stringify(activeSnapshot, null, 2)}
          </pre>
        </div>
      </Modal>
    </div>
  );
};
