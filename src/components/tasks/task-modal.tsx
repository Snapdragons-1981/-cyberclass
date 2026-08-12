'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, AlertTriangle, BookOpen, FileText, Bell } from 'lucide-react';
import { toast } from 'sonner';
import type { Task, TaskType, TaskPriority, Course, ReminderType } from '@/types';
import { TASK_TYPE_LABELS, REMINDER_TYPE_LABELS } from '@/types';
import { createTask, updateTask, saveReminder, getReminder } from '@/services/tasks';
import { createClient } from '@/lib/supabase/client';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (task: Task) => void;
  editingTask?: Task | null;
  userId: string;
}

export function TaskModal({ isOpen, onClose, onSave, editingTask, userId }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [course_id, setCourseId] = useState('');
  const [task_type, setTaskType] = useState<TaskType>('assignment');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [due_date, setDueDate] = useState('');
  const [due_time, setDueTime] = useState('');
  const [estimated_minutes, setEstimatedMinutes] = useState('');
  const [reminder_type, setReminderType] = useState<ReminderType | ''>('');
  const [notes, setNotes] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadCourses = async () => {
        const client = createClient();
        if (!client) return;
        const { data } = await client
          .from('courses')
          .select('*')
          .eq('user_id', userId)
          .order('name');
        setCourses(data || []);
      };
      loadCourses();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setCourseId(editingTask.course_id || '');
      setTaskType(editingTask.task_type);
      setPriority(editingTask.priority);
      setDueDate(editingTask.due_date || '');
      setDueTime(editingTask.due_time || '');
      setEstimatedMinutes(editingTask.estimated_minutes?.toString() || '');
      setNotes(editingTask.description || '');
    } else {
      setTitle('');
      setDescription('');
      setCourseId('');
      setTaskType('assignment');
      setPriority('medium');
      setDueDate('');
      setDueTime('');
      setEstimatedMinutes('');
      setNotes('');
    }
    setReminderType('');
  }, [editingTask, isOpen]);

  useEffect(() => {
    if (isOpen && editingTask) {
      getReminder(editingTask.id)
        .then(r => setReminderType(r?.reminder_type ?? ''))
        .catch(() => setReminderType(''));
    }
  }, [isOpen, editingTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const taskData = {
        user_id: userId,
        title: title.trim(),
        description: description.trim() || null,
        course_id: course_id || null,
        semester_id: null,
        task_type,
        priority,
        status: 'todo' as const,
        due_date: due_date || null,
        due_time: due_time || null,
        estimated_minutes: estimated_minutes ? parseInt(estimated_minutes) : null,
        completed_at: null,
      };

      let result: Task;
      if (editingTask) {
        result = await updateTask(editingTask.id, taskData);
      } else {
        result = await createTask(taskData);
      }

      try {
        await saveReminder(result.id, userId, reminder_type, due_date, due_time);
      } catch (reminderError) {
        console.error('Failed to save reminder:', reminderError);
        toast.error('Task saved, but the reminder could not be set');
      }

      onSave?.(result);
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0a0a0f] border border-cyan-500/20 shadow-2xl shadow-cyan-500/5">
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/10">
          <h2 className="text-lg font-bold text-cyan-400" style={{ textShadow: '0 0 10px rgba(0,255,242,0.3)' }}>
            {editingTask ? 'EDIT TASK' : 'NEW TASK'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 tracking-wider">TASK TITLE</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 tracking-wider">DESCRIPTION</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 tracking-wider">
                <BookOpen className="w-3 h-3 inline mr-1" />
                COURSE
              </label>
              <select
                value={course_id}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-sm text-gray-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
              >
                <option value="">No course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 tracking-wider">
                <FileText className="w-3 h-3 inline mr-1" />
                TYPE
              </label>
              <select
                value={task_type}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
                className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-sm text-gray-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
              >
                {Object.entries(TASK_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 tracking-wider">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                PRIORITY
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-sm text-gray-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 tracking-wider">
                <Clock className="w-3 h-3 inline mr-1" />
                EST. TIME (min)
              </label>
              <input
                type="number"
                value={estimated_minutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                placeholder="60"
                min="0"
                className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 tracking-wider">
                <Calendar className="w-3 h-3 inline mr-1" />
                DUE DATE
              </label>
              <input
                type="date"
                value={due_date}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-sm text-gray-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 tracking-wider">
                <Clock className="w-3 h-3 inline mr-1" />
                DUE TIME
              </label>
              <input
                type="time"
                value={due_time}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-sm text-gray-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 tracking-wider">
              <Bell className="w-3 h-3 inline mr-1" />
              REMIND ME VIA EMAIL
            </label>
            <select
              value={reminder_type}
              onChange={(e) => setReminderType(e.target.value as ReminderType | '')}
              className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-sm text-gray-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
            >
              <option value="">No reminder (email only when 24h before / overdue)</option>
              {Object.entries(REMINDER_TYPE_LABELS)
                .filter(([key]) => key !== 'custom')
                .map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
