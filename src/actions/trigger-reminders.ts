'use server';

import { createAdminClient } from '@/lib/supabase/admin';

function formatDue(dueDate: string | null, dueTime: string | null): string {
  return dueTime ? `${dueDate} at ${dueTime}` : dueDate ?? '';
}

export async function triggerReminders() {
  const supabase = createAdminClient();
  if (!supabase) return { sent: 0, notified: 0, error: 'No admin client' };

  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM ?? 'CyberClass <onboarding@resend.dev>';

  const now = new Date();

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(
      'id, user_id, title, due_date, due_time, status, course:courses(name, code), reminders(id, remind_at, reminder_type, is_sent)'
    )
    .not('status', 'in', '("completed","archived")')
    .not('due_date', 'is', null);

  if (error) return { sent: 0, notified: 0, error: error.message };

  const taskRows = (tasks ?? []) as any[];
  const alerts = new Map<string, any[]>();
  const firedReminderIds: string[] = [];

  for (const task of taskRows) {
    const reminder = task.reminders?.[0] ?? null;
    if (reminder) {
      if (!reminder.is_sent && new Date(reminder.remind_at) <= now) {
        const list = alerts.get(task.user_id) ?? [];
        list.push({
          task,
          type: 'reminder',
          message: `Reminder: ${task.title} is due ${formatDue(task.due_date, task.due_time)}`,
        });
        alerts.set(task.user_id, list);
        firedReminderIds.push(reminder.id);
      }
      continue;
    }

    if (!task.due_date) continue;
    const due = task.due_time
      ? new Date(`${task.due_date}T${task.due_time}`)
      : new Date(`${task.due_date}T23:59:59`);
    if (Number.isNaN(due.getTime())) continue;
    if (due > now) continue;

    const list = alerts.get(task.user_id) ?? [];
    list.push({
      task,
      type: 'overdue',
      message: `${task.title} is now overdue`,
    });
    alerts.set(task.user_id, list);
  }

  if (alerts.size === 0) return { sent: 0, notified: 0 };

  const userCache = new Map<string, string | null>();
  let sentEmails = 0;
  let notified = 0;

  for (const [userId, items] of alerts) {
    if (!userCache.has(userId)) {
      const { data: u } = await supabase.auth.admin.getUserById(userId);
      userCache.set(userId, u?.user?.email ?? null);
    }
    const email = userCache.get(userId);
    if (!email) continue;

    const lines = items.map(({ task }: any) => {
      const course = task.course
        ? `${task.course.code ?? ''} ${task.course.name}`.trim()
        : 'No course';
      return `- ${task.title} (${course}) - due ${formatDue(task.due_date, task.due_time)}`;
    });

    if (resendApiKey) {
      try {
        const htmlLines = items
          .map(({ task, type }: any) => {
            const course = task.course
              ? `${task.course.code ?? ''} ${task.course.name}`.trim()
              : 'No course';
            const color = type === 'overdue' ? '#ef4444' : type === 'reminder' ? '#f59e0b' : '#3b82f6';
            return `<li style="margin-bottom:8px;"><span style="color:${color};font-weight:600;">${type === 'overdue' ? 'OVERDUE' : 'REMINDER'}</span> — <strong>${task.title}</strong> (${course}) — due ${formatDue(task.due_date, task.due_time)}</li>`;
          })
          .join('');

        const html = `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
            <h2 style="color:#6366f1;">CyberClass Task Alert</h2>
            <p>Hi, you have ${items.length} task(s) that need attention:</p>
            <ul style="list-style:none;padding:0;">${htmlLines}</ul>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
            <p style="color:#9ca3af;font-size:12px;">— CyberClass</p>
          </div>`;

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: emailFrom,
            to: [email],
            subject: `CyberClass: ${items.length} task(s) need attention`,
            html,
            text: `Hi, ${items.length} task(s) need attention:\n\n${lines.join('\n')}\n\n-- CyberClass`,
          }),
        });

        if (res.ok) sentEmails++;
      } catch (err) {
        console.error('[trigger-reminders] Email failed:', err);
      }
    }

    const notifRows = items.map(({ task, type, message }: any) => ({
      user_id: userId,
      task_id: task.id,
      title: type === 'reminder' ? 'Task reminder' : 'Task overdue',
      message,
      type,
      is_read: false,
    }));

    const { error: notifError } = await supabase.from('notifications').insert(notifRows);
    if (!notifError) notified += notifRows.length;
  }

  if (firedReminderIds.length) {
    await supabase.from('reminders').update({ is_sent: true }).in('id', firedReminderIds);
  }

  return { sent: sentEmails, notified };
}
