'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { getTasks, updateTask } from '@/services/tasks';
import { formatDate, getCountdown, getTaskTypeColor, getPriorityColor } from '@/lib/helpers';
import { Zap, GripVertical } from 'lucide-react';
import type { Task, TaskStatus } from '@/types';

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'todo', label: 'TODO', color: 'border-gray-500/30' },
  { status: 'in_progress', label: 'IN PROGRESS', color: 'border-blue-500/30' },
  { status: 'completed', label: 'COMPLETED', color: 'border-emerald-500/30' },
];

export default function BoardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getTasks(user.id);
      setTasks(data.filter(t => t.status !== 'archived'));
    } catch {} finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleDragStart = (taskId: string) => setDraggedTask(taskId);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    if (!draggedTask) return;

    try {
      await updateTask(draggedTask, { status: newStatus });
      setTasks(prev => prev.map(t => 
        t.id === draggedTask ? { ...t, status: newStatus } : t
      ));
    } catch {}
    setDraggedTask(null);
  };

  if (authLoading || loading) {
    return <div className="h-96 bg-cyan-500/5 rounded-xl animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Task Board</h1>
        <p className="text-sm text-gray-500">Drag and drop tasks between columns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(column => {
          const columnTasks = tasks.filter(t => t.status === column.status);
          return (
            <div
              key={column.status}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
              className={`rounded-xl bg-[#0f0f1a]/50 border ${column.color} p-4 min-h-[400px]`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-300 tracking-wider">{column.label}</h3>
                <span className="text-xs text-gray-500 bg-black/30 px-2 py-1 rounded">{columnTasks.length}</span>
              </div>

              <div className="space-y-3">
                {columnTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    onClick={() => router.push(`/tasks/${task.id}`)}
                    className="p-3 rounded-lg bg-[#0a0a0f]/70 border border-cyan-500/10 cursor-grab active:cursor-grabbing hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getTaskTypeColor(task.task_type)}`}>
                        {task.task_type.toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-bold ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-200 mb-1">{task.title}</h4>
                    {task.course && <p className="text-xs text-gray-500 mb-2">{task.course.name}</p>}
                    {task.due_date && (
                      <p className="text-xs text-gray-400 font-mono">{formatDate(task.due_date, 'MMM dd')}</p>
                    )}
                  </div>
                ))}
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-600 text-sm">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
