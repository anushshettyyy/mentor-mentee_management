import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, Calendar, Check, MessageSquare, AlertCircle, Save } from 'lucide-react';
import { api } from '../../api/client';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';

export const MenteeActionItemsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeNoteItemId, setActiveNoteItemId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState<string>('');
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      const res = await api.getActionItems();
      if (res.success) setItems(res.items);
    } catch (err) {
      console.error('Failed to fetch action items', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleToggleStatus = async (item: any) => {
    const newStatus = item.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    try {
      await api.updateActionItem(item.id, { status: newStatus });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: newStatus, completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : null } : i))
      );
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleSaveStudentNotes = async (itemId: string) => {
    setSavingNoteId(itemId);
    try {
      await api.updateActionItem(itemId, { studentNotes: noteContent });
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, studentNotes: noteContent } : i)));
      setActiveNoteItemId(null);
    } catch (err) {
      console.error('Failed to save student notes', err);
    } finally {
      setSavingNoteId(null);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-64 rounded-xl" />;
  }

  const pendingCount = items.filter((i) => i.status !== 'COMPLETED').length;
  const completedCount = items.filter((i) => i.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Agreed Action Items</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Milestones and tasks agreed upon during faculty mentoring sessions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {pendingCount} Pending
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {completedCount} Completed
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-10 h-10 text-slate-400" />}
          title="No Action Items Assigned"
          description="Action items assigned by your mentor during review sessions will appear here."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isCompleted = item.status === 'COMPLETED';
            return (
              <Card
                key={item.id}
                className={`p-4 transition-all ${
                  isCompleted ? 'bg-slate-50/60 dark:bg-slate-900/40 opacity-80' : 'hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Interactive Completion Checkbox */}
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 bg-white dark:bg-slate-800'
                    }`}
                    title={isCompleted ? 'Mark as In Progress' : 'Mark as Completed'}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            isCompleted
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {item.title}
                        </span>
                        <PriorityBadge priority={item.priority} />
                      </div>

                      <div className="flex items-center gap-2">
                        {item.dueDate && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due: {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        <StatusBadge status={item.status} />
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {/* Student Reflections / Notes */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      {activeNoteItemId === item.id ? (
                        <div className="w-full space-y-2">
                          <textarea
                            rows={2}
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder="Add your progress reflection, github links, or questions for your mentor..."
                            className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setActiveNoteItemId(null)}>
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleSaveStudentNotes(item.id)}
                              isLoading={savingNoteId === item.id}
                              icon={<Save className="w-3.5 h-3.5" />}
                            >
                              Save Notes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1">
                          {item.studentNotes ? (
                            <p className="text-slate-600 dark:text-slate-400 bg-indigo-50/50 dark:bg-indigo-950/20 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                              <span className="font-semibold text-indigo-900 dark:text-indigo-300 text-[11px]">
                                Your Note:{' '}
                              </span>
                              {item.studentNotes}
                            </p>
                          ) : (
                            <span className="text-slate-400 italic">No notes added</span>
                          )}
                        </div>
                      )}

                      {activeNoteItemId !== item.id && (
                        <button
                          onClick={() => {
                            setActiveNoteItemId(item.id);
                            setNoteContent(item.studentNotes || '');
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium flex items-center gap-1 shrink-0 self-end sm:self-auto"
                        >
                          <MessageSquare className="w-3 h-3" />
                          {item.studentNotes ? 'Edit Note' : 'Add Note'}
                        </button>
                      )}
                    </div>

                    {/* Mentor Feedback if provided */}
                    {item.mentorFeedback && (
                      <div className="mt-2 p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                          Mentor Feedback:{' '}
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-400">{item.mentorFeedback}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
