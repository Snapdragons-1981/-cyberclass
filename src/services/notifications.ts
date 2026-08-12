import { createClient } from '@/lib/supabase/client';
import type { Notification } from '@/types';

function getClient() {
  const client = createClient();
  if (!client) throw new Error('Supabase not configured');
  return client;
}

export async function getNotifications(userId: string, unreadOnly = false) {
  const supabase = getClient();
  let query = supabase
    .from('notifications')
    .select('*, task:tasks(id, title)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (unreadOnly) query = query.eq('is_read', false);

  const { data, error } = await query;
  if (error) throw error;
  return data as Notification[];
}

export async function markNotificationRead(id: string) {
  const supabase = getClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);

  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string) {
  const supabase = getClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
}

export async function deleteNotification(id: string) {
  const supabase = getClient();
  const { error } = await supabase.from('notifications').delete().eq('id', id);
  if (error) throw error;
}

export async function getUnreadCount(userId: string) {
  const supabase = getClient();
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
}
