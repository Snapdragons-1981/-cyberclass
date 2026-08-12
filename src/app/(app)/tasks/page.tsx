'use client';

import { Suspense } from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { getTasks } from '@/services/tasks';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskModal } from '@/components/tasks/task-modal';
import { Plus, Search, CheckSquare } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority, TaskType } from '@/types';

function TasksContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [typeFilter, setTypeFilter] = useState<TaskType | ''>('');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const loadTasks = useCallback(async () => {
    if (!user) return;
    try {
      const filters: Record<string, string> = {};
      if (statusFilter) filters.status = statusFilter;
      if (priorityFilter) filters.priority = priorityFilter;
      if (typeFilter) filters.task_type = typeFilter;
      
      const data = await getTasks(user.id, filters);
      
      let filtered = data;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = data.filter(t => 
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.course?.name?.toLowerCase().includes(q)
        );
      }
      
      setTasks(filtered);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [user, statusFilter, priorityFilter, typeFilter, searchQuery]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
  };

  const handleTaskCreated = () => {
    loadTasks();
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-cyan-500/5 rounded-lg animate-pulse" />
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-32 bg-cyan-500/5 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">{tasks.length} tasks total</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">ADD TASK</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
            className="px-3 py-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-sm text-gray-200 focus:border-cyan-400 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
            className="px-3 py-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-sm text-gray-200 focus:border-cyan-400 focus:outline-none"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TaskType | '')}
            className="px-3 py-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-sm text-gray-200 focus:border-cyan-400 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="assignment">Assignment</option>
            <option value="pit">PIT</option>
            <option value="quiz">Quiz</option>
            <option value="exam">Exam</option>
            <option value="project">Project</option>
            <option value="laboratory">Laboratory</option>
            <option value="activity">Activity</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onComplete={handleTaskComplete} />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-16">
          <CheckSquare className="w-12 h-12 text-cyan-400/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-300 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? 'Try a different search term' : 'Add your first task to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add Task
            </button>
          )}
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

export default function TasksPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="h-8 w-48 bg-cyan-500/5 rounded-lg animate-pulse" />
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-32 bg-cyan-500/5 rounded-xl animate-pulse" />)}
        </div>
      </div>
    }>
      <TasksContent />
    </Suspense>
  );
}
