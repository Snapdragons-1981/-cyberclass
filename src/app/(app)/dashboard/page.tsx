'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { getTasks, getTaskStats } from '@/services/tasks';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskModal } from '@/components/tasks/task-modal';
import { isOverdue, isDueToday } from '@/lib/helpers';
import { Plus, Zap, AlertTriangle, Clock, Calendar, CheckCircle } from 'lucide-react';
import type { Task, TaskStats } from '@/types';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({ total: 0, overdue: 0, due_today: 0, due_this_week: 0, completed: 0, completion_rate: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [allTasks, taskStats] = await Promise.all([
        getTasks(user.id),
        getTaskStats(user.id),
      ]);
      setTasks(allTasks);
      setStats(taskStats);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed', completed_at: new Date().toISOString() } : t));
    loadData();
  };

  const handleTaskCreated = (task: Task) => {
    setTasks(prev => [task, ...prev]);
    loadData();
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-cyan-500/5 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-cyan-500/5 rounded-xl animate-pulse" />)}
        </div>
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-cyan-500/5 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const overdueTasks = tasks.filter(t => isOverdue(t.due_date, t.due_time, t.status));
  const todayTasks = tasks.filter(t => isDueToday(t.due_date) && t.status !== 'completed');
  const criticalTasks = tasks
    .filter(t => t.status !== 'completed' && t.status !== 'archived' && t.priority === 'critical')
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    })
    .slice(0, 3);
  const upcomingTasks = tasks
    .filter(t => t.status !== 'completed' && t.status !== 'archived' && !isDueToday(t.due_date))
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    })
    .slice(0, 5);
  const recentCompleted = tasks
    .filter(t => t.status === 'completed')
    .sort((a, b) => {
      if (!a.completed_at) return 1;
      if (!b.completed_at) return -1;
      return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Mission Status</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your academic command center</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">ADD TASK</span>
        </button>
      </div>

      <SummaryCards
        overdue={stats.overdue}
        dueToday={stats.due_today}
        dueThisWeek={stats.due_this_week}
        completed={stats.completed}
      />

      {criticalTasks.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-bold text-red-400" style={{ textShadow: '0 0 10px rgba(255,0,64,0.3)' }}>
              MISSION CRITICAL
            </h2>
          </div>
          <div className="space-y-3">
            {criticalTasks.map(task => (
              <TaskCard key={task.id} task={task} onComplete={handleTaskComplete} />
            ))}
          </div>
        </section>
      )}

      {overdueTasks.length > 0 && criticalTasks.length === 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-bold text-red-400">OVERDUE</h2>
          </div>
          <div className="space-y-3">
            {overdueTasks.slice(0, 3).map(task => (
              <TaskCard key={task.id} task={task} onComplete={handleTaskComplete} />
            ))}
          </div>
        </section>
      )}

      {todayTasks.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-bold text-orange-400">TODAY</h2>
          </div>
          <div className="space-y-2">
            {todayTasks.map(task => (
              <TaskCard key={task.id} task={task} onComplete={handleTaskComplete} compact />
            ))}
          </div>
        </section>
      )}

      {upcomingTasks.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-cyan-400">UPCOMING</h2>
          </div>
          <div className="space-y-2">
            {upcomingTasks.map(task => (
              <TaskCard key={task.id} task={task} onComplete={handleTaskComplete} compact />
            ))}
          </div>
        </section>
      )}

      {recentCompleted.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-emerald-400">RECENTLY COMPLETED</h2>
          </div>
          <div className="space-y-2">
            {recentCompleted.map(task => (
              <TaskCard key={task.id} task={task} onComplete={handleTaskComplete} compact />
            ))}
          </div>
        </section>
      )}

      {tasks.length === 0 && !loading && (
        <div className="text-center py-20">
          <Zap className="w-16 h-16 text-cyan-400/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-300 mb-2">Welcome to CyberClass</h3>
          <p className="text-gray-500 mb-6">Your academic command center is ready. Add your first task to get started.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Add Your First Task
          </button>
        </div>
      )}

      <TaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleTaskCreated}
        userId={user?.id || ''}
      />
    </div>
  );
}
