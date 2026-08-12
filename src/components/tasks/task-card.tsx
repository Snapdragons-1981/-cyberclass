'use client';

import { useState } from 'react';
import { Calendar, Clock, CheckCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import { formatDate, getCountdown, getCountdownProgress, getUrgencyScore, getTaskTypeColor, getPriorityColor, isOverdue } from '@/lib/helpers';
import { completeTask } from '@/services/tasks';
import type { Task } from '@/types';
import Link from 'next/link';

interface TaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  compact?: boolean;
}

export function TaskCard({ task, onComplete, compact = false }: TaskCardProps) {
  const [completing, setCompleting] = useState(false);
  const countdown = getCountdown(task.due_date, task.due_time);
  const progress = getCountdownProgress(task.due_date, task.due_time, task.created_at);
  const urgency = getUrgencyScore(task.priority, task.due_date, task.estimated_minutes);
  const overdue = isOverdue(task.due_date, task.due_time, task.status);

  const handleComplete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCompleting(true);
    try {
      await completeTask(task.id);
      onComplete?.(task.id);
    } catch {
    } finally {
      setCompleting(false);
    }
  };

  if (compact) {
    return (
      <Link href={`/tasks/${task.id}`} className="block">
        <div className={`flex items-center gap-3 p-3 rounded-lg bg-[#0f0f1a]/60 border transition-all hover:border-cyan-500/30 group ${
          overdue ? 'border-red-500/30' : 'border-cyan-500/10'
        }`}>
          <button
            onClick={handleComplete}
            disabled={completing}
            className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-600 hover:border-cyan-400 transition-colors flex items-center justify-center"
          >
            {task.status === 'completed' && <CheckCircle className="w-5 h-5 text-emerald-400 -m-2" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
              {task.title}
            </p>
            {task.course && (
              <p className="text-xs text-gray-500 truncate">{task.course.name}</p>
            )}
          </div>
          {task.due_date && (
            <span className={`text-xs font-mono ${overdue ? 'text-red-400' : 'text-gray-400'}`}>
              {countdown}
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/tasks/${task.id}`} className="block group">
      <div className={`relative overflow-hidden rounded-xl bg-[#0f0f1a]/70 border transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 ${
        overdue ? 'border-red-500/30' : 'border-cyan-500/10'
      }`}>
        {urgency > 70 && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
        )}

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${getTaskTypeColor(task.task_type)}`}>
                  {task.task_type.toUpperCase()}
                </span>
                <span className={`text-[10px] font-bold tracking-wider ${getPriorityColor(task.priority)}`}>
                  {task.priority.toUpperCase()}
                </span>
              </div>

              <h3 className="text-base font-semibold text-gray-100 group-hover:text-cyan-400 transition-colors mb-1">
                {task.title}
              </h3>

              {task.course && (
                <p className="text-sm text-gray-400 mb-2">{task.course.name}</p>
              )}

              {task.description && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
              )}
            </div>

            <button
              onClick={handleComplete}
              disabled={completing}
              className="flex-shrink-0 p-2 rounded-lg border border-gray-700 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all"
              title="Mark as complete"
            >
              <CheckCircle className="w-5 h-5 text-gray-500 group-hover:text-cyan-400" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-cyan-500/5">
            <div className="flex items-center gap-4">
              {task.due_date && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(task.due_date, 'MMM dd')}</span>
                  {task.due_time && (
                    <>
                      <Clock className="w-3.5 h-3.5 ml-1" />
                      <span>{task.due_time}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {countdown && (
                <span className={`text-xs font-mono px-2 py-1 rounded ${
                  overdue 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-cyan-500/10 text-cyan-400'
                }`}>
                  {overdue && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                  {countdown}
                </span>
              )}
              {urgency > 0 && (
                <span className="text-[10px] text-gray-500">URGENCY: {urgency}/100</span>
              )}
            </div>
          </div>

          {task.due_date && (
            <div className="mt-3">
              <div className="w-full h-1 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    overdue ? 'bg-red-500' : progress > 80 ? 'bg-orange-500' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
