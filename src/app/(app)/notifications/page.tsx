'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '@/services/notifications';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '@/types';

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getNotifications(user.id);
      setNotifications(data);
    } catch {} finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllNotificationsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (authLoading || loading) {
    return <div className="h-96 bg-cyan-500/5 rounded-xl animate-pulse" />;
  }

  const unread = notifications.filter(n => !n.is_read);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Notifications</h1>
          <p className="text-sm text-gray-500">{unread.length} unread</p>
        </div>
        {unread.length > 0 && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-colors">
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 rounded-xl border transition-all ${
            n.is_read ? 'bg-[#0f0f1a]/30 border-cyan-500/5' : 'bg-[#0f0f1a]/70 border-cyan-500/15'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className={`w-4 h-4 ${n.is_read ? 'text-gray-500' : 'text-cyan-400'}`} />
                  <h3 className={`text-sm font-medium ${n.is_read ? 'text-gray-400' : 'text-gray-200'}`}>{n.title}</h3>
                </div>
                <p className="text-xs text-gray-500 mb-1">{n.message}</p>
                <p className="text-[10px] text-gray-600">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
              </div>
              <div className="flex gap-1">
                {!n.is_read && (
                  <button onClick={() => handleMarkRead(n.id)} className="p-1.5 rounded hover:bg-cyan-500/10 text-gray-500 hover:text-cyan-400">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => handleDelete(n.id)} className="p-1.5 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-cyan-400/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-300 mb-2">No notifications</h3>
          <p className="text-gray-500">You&apos;re all caught up!</p>
        </div>
      )}
    </div>
  );
}
