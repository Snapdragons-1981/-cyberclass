'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { getTasks, getTaskStats } from '@/services/tasks';
import { BarChart3, TrendingUp, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import type { Task, TaskStats } from '@/types';

export default function StatisticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<TaskStats>({ total: 0, overdue: 0, due_today: 0, due_this_week: 0, completed: 0, completion_rate: 0 });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [allTasks, taskStats] = await Promise.all([getTasks(user.id), getTaskStats(user.id)]);
      setTasks(allTasks);
      setStats(taskStats);
    } catch {} finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => { loadData(); }, [loadData]);

  const courseLoad = tasks.reduce((acc, t) => {
    if (t.course) {
      acc[t.course.name] = (acc[t.course.name] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const priorityDist = tasks.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeDist = tasks.reduce((acc, t) => {
    acc[t.task_type] = (acc[t.task_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (authLoading || loading) {
    return <div className="h-96 bg-cyan-500/5 rounded-xl animate-pulse" />;
  }

  const maxCourse = Math.max(...Object.values(courseLoad), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Statistics</h1>
        <p className="text-sm text-gray-500">Your productivity overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-[#0f0f1a]/70 border border-cyan-500/10 p-4">
          <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-cyan-400" /><span className="text-xs text-gray-500">TOTAL TASKS</span></div>
          <p className="text-3xl font-bold text-cyan-400">{stats.total}</p>
        </div>
        <div className="rounded-xl bg-[#0f0f1a]/70 border border-emerald-500/10 p-4">
          <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><span className="text-xs text-gray-500">COMPLETED</span></div>
          <p className="text-3xl font-bold text-emerald-400">{stats.completed}</p>
        </div>
        <div className="rounded-xl bg-[#0f0f1a]/70 border border-red-500/10 p-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-red-400" /><span className="text-xs text-gray-500">OVERDUE</span></div>
          <p className="text-3xl font-bold text-red-400">{stats.overdue}</p>
        </div>
        <div className="rounded-xl bg-[#0f0f1a]/70 border border-purple-500/10 p-4">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-purple-400" /><span className="text-xs text-gray-500">COMPLETION RATE</span></div>
          <p className="text-3xl font-bold text-purple-400">{stats.completion_rate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-[#0f0f1a]/70 border border-cyan-500/10 p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-4">COMPLETION RATE</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Completed</span>
              <span className="text-emerald-400 font-bold">{stats.completion_rate}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-gray-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all" style={{ width: `${stats.completion_rate}%` }} />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[#0f0f1a]/70 border border-cyan-500/10 p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-4">PRIORITY DISTRIBUTION</h3>
          <div className="space-y-2">
            {Object.entries(priorityDist).map(([key, count]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-16 capitalize">{key}</span>
                <div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div className={`h-full rounded-full ${
                    key === 'critical' ? 'bg-red-500' :
                    key === 'high' ? 'bg-orange-500' :
                    key === 'medium' ? 'bg-yellow-500' : 'bg-cyan-500'
                  }`} style={{ width: `${(count / tasks.length) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-[#0f0f1a]/70 border border-cyan-500/10 p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-4">COURSE LOAD</h3>
          <div className="space-y-2">
            {Object.entries(courseLoad).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-32 truncate">{name}</span>
                <div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div className="h-full rounded-full bg-cyan-500" style={{ width: `${(count / maxCourse) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
              </div>
            ))}
            {Object.keys(courseLoad).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No course data yet</p>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-[#0f0f1a]/70 border border-cyan-500/10 p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-4">TASK TYPES</h3>
          <div className="space-y-2">
            {Object.entries(typeDist).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-32 truncate capitalize">{type.replace('_', ' ')}</span>
                <div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div className="h-full rounded-full bg-purple-500" style={{ width: `${(count / tasks.length) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
