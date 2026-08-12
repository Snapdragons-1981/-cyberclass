import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

interface CourseRef {
  name: string;
  code: string;
}

interface ReminderRow {
  id: string;
  remind_at: string;
  reminder_type: string;
  is_sent: boolean;
}

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  due_date: string | null;
  due_time: string | null;
  status: string;
  course: CourseRef | null;
  reminders?: ReminderRow[] | null;
}

type AlertType = 'due_soon' | 'overdue' | 'reminder';

interface Alert {
  task: TaskRow;
  type: AlertType;
  message: string;
}

function formatDue(task: TaskRow): string {
  return task.due_time ? `${task.due_date} at ${task.due_time}` : task.due_date ?? '';
}

export async function GET(request: NextRequest) {
  const authorized =
    request.headers.get('x-vercel-cron') === '1' ||
    request.nextUrl.searchParams.get('secret') === process.env.CRON_SECRET;

  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM ?? 'CyberClass <onboarding@resend.dev>';

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(
      'id, user_id, title, due_date, due_time, status, course:courses(name, code), reminders(id, remind_at, reminder_type, is_sent)'
    )
    .not('status', 'in', '("completed","archived")')
    .not('due_date', 'is', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const taskRows = (tasks ?? []) as unknown as TaskRow[];
  const taskIds = taskRows.map(t => t.id);

  const existingQuery = taskIds.length
    ? await supabase
        .from('notifications')
        .select('task_id')
        .in('task_id', taskIds)
        .in('type', ['due_soon', 'overdue'])
    : { data: [], error: null };

  const alreadyNotified = new Set(
    ((existingQuery.data ?? []) as { task_id: string }[]).map(n => n.task_id)
  );

  const alerts = new Map<string, Alert[]>();
  const firedReminderIds: string[] = [];

  for (const task of taskRows) {
    const reminder = task.reminders?.[0] ?? null;

    if (reminder) {
      if (!reminder.is_sent && new Date(reminder.remind_at) <= now) {
        const list = alerts.get(task.user_id) ?? [];
        list.push({
          task,
          type: 'reminder',
          message: `Reminder: ${task.title} is due ${formatDue(task)}`,
        });
        alerts.set(task.user_id, list);
        firedReminderIds.push(reminder.id);
      }
      continue;
    }

    if (alreadyNotified.has(task.id)) continue;
    if (!task.due_date) continue;

    const due = task.due_time
      ? new Date(`${task.due_date}T${task.due_time}`)
      : new Date(`${task.due_date}T23:59:59`);
    if (Number.isNaN(due.getTime())) continue;
    if (due > in24h) continue;

    const type: AlertType = due < now ? 'overdue' : 'due_soon';
    const list = alerts.get(task.user_id) ?? [];
    list.push({
      task,
      type,
      message:
        type === 'overdue'
          ? `${task.title} is now overdue`
          : `${task.title} is due within 24 hours`,
    });
    alerts.set(task.user_id, list);
  }

  if (alerts.size === 0) {
    return NextResponse.json({ sent: 0, notified: 0 });
  }

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

    const overdueCount = items.filter(i => i.type === 'overdue').length;
    const soonCount = items.filter(i => i.type === 'due_soon').length;
    const remindCount = items.filter(i => i.type === 'reminder').length;

    const parts: string[] = [];
    if (overdueCount) parts.push(`${overdueCount} overdue`);
    if (soonCount) parts.push(`${soonCount} due within 24 hours`);
    if (remindCount) parts.push(`${remindCount} reminders`);
    const subject = `CyberClass: ${parts.join(', ') || 'task alerts'}`;

    const lines = items.map(({ task }) => {
      const course = task.course
        ? `${task.course.code ?? ''} ${task.course.name}`.trim()
        : 'No course';
      return `- ${task.title} (${course}) - due ${formatDue(task)}`;
    });

    if (resendApiKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: emailFrom,
            to: [email],
            subject,
            text: `Hi, ${items.length} task(s) need attention:\n\n${lines.join('\n')}\n\n-- CyberClass`,
          }),
        });
        if (res.ok) sentEmails++;
      } catch {
        // Email failed, still record in-app notification
      }
    }

    const notifRows = items.map(({ task, type, message }) => ({
      user_id: userId,
      task_id: task.id,
      title:
        type === 'reminder' ? 'Task reminder' : type === 'overdue' ? 'Task overdue' : 'Due soon',
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

  return NextResponse.json({ sent: sentEmails, notified });
}
