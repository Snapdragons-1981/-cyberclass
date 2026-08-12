import { createClient } from '@/lib/supabase/client';
import { computeRemindAt } from '@/lib/helpers';
import type { Task, TaskStatus, TaskPriority, TaskType, Reminder, ReminderType } from '@/types';

function getClient() {
  const client = createClient();
  if (!client) throw new Error('Supabase not configured');
  return client;
}

export async function getTasks(userId: string, filters?: {
  status?: TaskStatus;
  priority?: TaskPriority;
  course_id?: string;
  task_type?: TaskType;
  semester_id?: string;
}) {
  const supabase = getClient();
  let query = supabase
    .from('tasks')
    .select('*, course:courses(*, instructor:instructors(*))')
    .eq('user_id', userId)
    .order('due_date', { ascending: true, nullsFirst: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.priority) query = query.eq('priority', filters.priority);
  if (filters?.course_id) query = query.eq('course_id', filters.course_id);
  if (filters?.task_type) query = query.eq('task_type', filters.task_type);
  if (filters?.semester_id) query = query.eq('semester_id', filters.semester_id);

  const { data, error } = await query;
  if (error) throw error;
  return data as Task[];
}

export async function getTaskById(id: string, userId: string) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*, course:courses(*, instructor:instructors(*)), reminders(*), tags:task_tags(tag:tags(*))')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data as Task;
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'course' | 'tags' | 'reminders'>) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function deleteTask(id: string) {
  const supabase = getClient();
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function completeTask(id: string) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('tasks')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function getTaskStats(userId: string, semesterId?: string) {
  const supabase = getClient();
  let query = supabase
    .from('tasks')
    .select('id, status, priority, due_date, course_id')
    .eq('user_id', userId);

  if (semesterId) query = query.eq('semester_id', semesterId);

  const { data, error } = await query;
  if (error) throw error;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const tasks = data || [];
  const total = tasks.length;
  const overdue = tasks.filter(t => t.status === 'overdue').length;
  const due_today = tasks.filter(t => {
    if (!t.due_date) return false;
    const d = new Date(t.due_date);
    return d >= today && d < new Date(today.getTime() + 86400000);
  }).length;
  const due_this_week = tasks.filter(t => {
    if (!t.due_date) return false;
    const d = new Date(t.due_date);
    return d >= today && d <= endOfWeek;
  }).length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const completion_rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, overdue, due_today, due_this_week, completed, completion_rate };
}

export async function getReminder(taskId: string) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as Reminder | null;
}

export async function saveReminder(
  taskId: string,
  userId: string,
  reminderType: ReminderType | '',
  dueDate: string | null,
  dueTime: string | null
) {
  const supabase = getClient();
  const { error: delError } = await supabase.from('reminders').delete().eq('task_id', taskId);
  if (delError) throw delError;

  if (!reminderType || reminderType === 'custom' || !dueDate) return;

  const { error: insError } = await supabase.from('reminders').insert({
    task_id: taskId,
    user_id: userId,
    remind_at: computeRemindAt(dueDate, dueTime, reminderType),
    reminder_type: reminderType,
    is_sent: false,
  });
  if (insError) throw insError;
}

export async function searchTasks(userId: string, query: string) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*, course:courses(*)')
    .eq('user_id', userId)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,task_type.ilike.%${query}%`)
    .order('due_date', { ascending: true, nullsFirst: false })
    .limit(20);

  if (error) throw error;
  return data as Task[];
}
