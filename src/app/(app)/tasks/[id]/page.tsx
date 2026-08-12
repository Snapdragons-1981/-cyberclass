'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useParams } from 'next/navigation';
import { getTaskById, updateTask, deleteTask, completeTask } from '@/services/tasks';
import { formatDate, getCountdown, getCountdownProgress, getUrgencyScore, getTaskTypeColor, getPriorityColor, isOverdue } from '@/lib/helpers';
import { ArrowLeft, Calendar, Clock, CheckCircle, Trash2, Edit, Archive, ExternalLink, AlertTriangle } from 'lucide-react';
import { TaskModal } from '@/components/tasks/task-modal';
import type { Task } from '@/types';

export default function TaskDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadTask = async () => {
      if (!user || !taskId) return;
      try {
        const data = await getTaskById(taskId, user.id);
        setTask(data);
      } catch (error) {
        router.push('/tasks');
      } finally {
        setLoading(false);
      }
    };
    loadTask();
  }, [user, taskId, router]);

  const handleComplete = async () => {
    if (!task) return;
    try {
      await completeTask(task.id);
      setTask({ ...task, status: 'completed', completed_at: new Date().toISOString() });
    } catch {}
  };

  const handleDelete = async () => {
    if (!task || !confirm('Delete this task?')) return;
    try {
      await deleteTask(task.id);
      router.push('/tasks');
    } catch {}
  };

  const handleUpdate = (updated: Task) => {
    setTask(updated);
    setShowEditModal(false);
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-cyan-500/5 rounded-lg animate-pulse" />
        <div className="h-64 bg-cyan-500/5 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!task) return null;

  const countdown = getCountdown(task.due_date, task.due_time);
  const progress = getCountdownProgress(task.due_date, task.due_time, task.created_at);
  const urgency = getUrgencyScore(task.priority, task.due_date, task.estimated_minutes);
  const overdue = isOverdue(task.due_date, task.due_time, task.status);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="rounded-2xl bg-[#0f0f1a]/70 border border-cyan-500/10 overflow-hidden">
        {urgency > 70 && (
          <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
        )}

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold tracking-wider ${getTaskTypeColor(task.task_type)}`}>
                  {task.task_type.toUpperCase()}
                </span>
                <span className={`text-xs font-bold tracking-wider ${getPriorityColor(task.priority)}`}>
                  {task.priority.toUpperCase()} PRIORITY
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-100 mb-2">{task.title}</h1>
              {task.course && (
                <p className="text-gray-400">{task.course.name} {task.course.code && `(${task.course.code})`}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 rounded-lg border border-cyan-500/20 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg border border-red-500/20 text-gray-400 hover:text-red-400 hover:border-red-500/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-gray-300 mb-6 leading-relaxed">{task.description}</p>
          )}

          {countdown && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-6 ${
              overdue ? 'bg-red-500/10 border border-red-500/20' : 'bg-cyan-500/10 border border-cyan-500/20'
            }`}>
              {overdue && <AlertTriangle className="w-4 h-4 text-red-400" />}
              <span className={`text-sm font-bold ${overdue ? 'text-red-400' : 'text-cyan-400'}`}>
                {countdown}
              </span>
              <span className="text-xs text-gray-500">| Urgency: {urgency}/100</span>
            </div>
          )}

          {task.due_date && (
            <div className="mb-6">
              <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    overdue ? 'bg-red-500' : progress > 80 ? 'bg-orange-500' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}% time elapsed</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            {task.due_date && (
              <div className="p-3 rounded-lg bg-black/20 border border-cyan-500/5">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Due Date
                </div>
                <p className="text-sm font-medium text-gray-200">{formatDate(task.due_date, 'MMMM dd, yyyy')}</p>
                {task.due_time && <p className="text-xs text-gray-400">{task.due_time}</p>}
              </div>
            )}
            {task.estimated_minutes && (
              <div className="p-3 rounded-lg bg-black/20 border border-cyan-500/5">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  Estimated Time
                </div>
                <p className="text-sm font-medium text-gray-200">{task.estimated_minutes} minutes</p>
              </div>
            )}
            <div className="p-3 rounded-lg bg-black/20 border border-cyan-500/5">
              <div className="text-xs text-gray-500 mb-1">Status</div>
              <p className={`text-sm font-medium capitalize ${
                task.status === 'completed' ? 'text-emerald-400' :
                task.status === 'overdue' ? 'text-red-400' :
                task.status === 'in_progress' ? 'text-blue-400' : 'text-gray-200'
              }`}>
                {task.status.replace('_', ' ')}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-black/20 border border-cyan-500/5">
              <div className="text-xs text-gray-500 mb-1">Created</div>
              <p className="text-sm font-medium text-gray-200">{formatDate(task.created_at, 'MMM dd, yyyy')}</p>
            </div>
          </div>

          {task.status !== 'completed' && (
            <button
              onClick={handleComplete}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-black font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              MARK AS COMPLETE
            </button>
          )}

          {task.status === 'completed' && (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-400 font-bold">COMPLETED</p>
              {task.completed_at && (
                <p className="text-xs text-gray-500 mt-1">Completed on {formatDate(task.completed_at, 'MMM dd, yyyy h:mm a')}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <TaskModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdate}
        editingTask={task}
        userId={user?.id || ''}
      />
    </div>
  );
}
