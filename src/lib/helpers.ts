import { format, formatDistanceToNow, isPast, isToday, isTomorrow, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import type { TaskPriority, TaskStatus, TaskType, ReminderType } from '@/types';

const REMINDER_OFFSETS_MS: Record<ReminderType, number> = {
  '5min': 5 * 60 * 1000,
  '15min': 15 * 60 * 1000,
  '30min': 30 * 60 * 1000,
  '1hour': 60 * 60 * 1000,
  '3hours': 3 * 60 * 60 * 1000,
  '12hours': 12 * 60 * 60 * 1000,
  '24hours': 24 * 60 * 60 * 1000,
  '2days': 2 * 24 * 60 * 60 * 1000,
  custom: 0,
};

export function computeRemindAt(dueDate: string | null, dueTime: string | null, reminderType: ReminderType): string {
  const due = dueTime ? new Date(`${dueDate}T${dueTime}`) : new Date(`${dueDate}T23:59:59`);
  return new Date(due.getTime() - (REMINDER_OFFSETS_MS[reminderType] ?? 0)).toISOString();
}

export function formatDate(date: string | Date, formatStr = 'MMM dd, yyyy'): string {
  return format(new Date(date), formatStr);
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'h:mm a');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy h:mm a');
}

export function getCountdown(dueDate: string | null, dueTime: string | null): string {
  if (!dueDate) return '';
  
  const due = dueTime 
    ? new Date(`${dueDate}T${dueTime}`)
    : new Date(`${dueDate}T23:59:59`);
  
  if (isPast(due)) {
    const days = differenceInDays(new Date(), due);
    if (days === 0) return 'OVERDUE TODAY';
    if (days === 1) return 'OVERDUE BY 1 DAY';
    return `OVERDUE BY ${days} DAYS`;
  }
  
  const days = differenceInDays(due, new Date());
  const hours = differenceInHours(due, new Date()) % 24;
  const minutes = differenceInMinutes(due, new Date()) % 60;
  
  if (days === 0 && hours === 0) {
    return `DUE IN ${minutes} MINUTES`;
  }
  if (days === 0) {
    return hours === 1 ? 'DUE IN 1 HOUR' : `DUE IN ${hours} HOURS`;
  }
  if (days === 1) return 'DUE TOMORROW';
  return `DUE IN ${days} DAYS`;
}

export function getCountdownProgress(dueDate: string | null, dueTime: string | null, createdAt: string): number {
  if (!dueDate) return 0;
  
  const due = dueTime 
    ? new Date(`${dueDate}T${dueTime}`)
    : new Date(`${dueDate}T23:59:59`);
  
  const created = new Date(createdAt);
  const now = new Date();
  const total = due.getTime() - created.getTime();
  const elapsed = now.getTime() - created.getTime();
  
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

export function getUrgencyScore(priority: TaskPriority, dueDate: string | null, estimatedMinutes: number | null): number {
  let score = 0;
  
  const priorityScores: Record<TaskPriority, number> = {
    low: 10,
    medium: 25,
    high: 40,
    critical: 50,
  };
  
  score += priorityScores[priority] || 25;
  
  if (dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const daysLeft = differenceInDays(due, now);
    
    if (daysLeft < 0) score += 50;
    else if (daysLeft === 0) score += 40;
    else if (daysLeft === 1) score += 30;
    else if (daysLeft <= 3) score += 20;
    else if (daysLeft <= 7) score += 10;
  }
  
  if (estimatedMinutes && estimatedMinutes > 120) score += 10;
  
  return Math.min(100, score);
}

export function getPriorityColor(priority: TaskPriority): string {
  const colors: Record<TaskPriority, string> = {
    low: 'text-cyan-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    critical: 'text-red-400',
  };
  return colors[priority] || 'text-gray-400';
}

export function getStatusColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    todo: 'text-gray-400',
    in_progress: 'text-blue-400',
    completed: 'text-emerald-400',
    overdue: 'text-red-400',
    archived: 'text-gray-500',
  };
  return colors[status] || 'text-gray-400';
}

export function getTaskTypeColor(type: TaskType): string {
  const colors: Record<TaskType, string> = {
    assignment: 'bg-cyan-500/20 text-cyan-300',
    pit: 'bg-pink-500/20 text-pink-300',
    quiz: 'bg-orange-500/20 text-orange-300',
    exam: 'bg-red-500/20 text-red-300',
    project: 'bg-purple-500/20 text-purple-300',
    laboratory: 'bg-green-500/20 text-green-300',
    activity: 'bg-yellow-500/20 text-yellow-300',
    presentation: 'bg-blue-500/20 text-blue-300',
    report: 'bg-pink-500/20 text-pink-300',
    research: 'bg-violet-500/20 text-violet-300',
    requirement: 'bg-orange-500/20 text-orange-300',
    reading: 'bg-teal-500/20 text-teal-300',
    event: 'bg-emerald-500/20 text-emerald-300',
    other: 'bg-gray-500/20 text-gray-300',
  };
  return colors[type] || 'bg-gray-500/20 text-gray-300';
}

export function isOverdue(dueDate: string | null, dueTime: string | null, status: TaskStatus): boolean {
  if (status === 'completed' || status === 'archived') return false;
  if (!dueDate) return false;
  const due = dueTime ? new Date(`${dueDate}T${dueTime}`) : new Date(`${dueDate}T23:59:59`);
  return isPast(due);
}

export function isDueToday(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return isToday(new Date(dueDate));
}

export function isDueTomorrow(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return isTomorrow(new Date(dueDate));
}

export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}
