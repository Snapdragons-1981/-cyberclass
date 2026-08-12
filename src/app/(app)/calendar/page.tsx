'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { getTasks } from '@/services/tasks';
import { formatDate, getTaskTypeColor, isOverdue } from '@/lib/helpers';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from 'date-fns';
import type { Task } from '@/types';

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadTasks = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getTasks(user.id);
      setTasks(data);
    } catch {} finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <h2 className="text-lg font-bold text-gray-100">{format(currentMonth, 'MMMM yyyy')}</h2>
      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-400">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">{day}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDate = day;
        const dayTasks = tasks.filter(t => {
          if (!t.due_date) return false;
          return isSameDay(parseISO(t.due_date), currentDate);
        });
        const isCurrentMonth = isSameMonth(currentDate, currentMonth);
        const isSelected = isSameDay(currentDate, selectedDate);
        const isToday = isSameDay(currentDate, new Date());

        days.push(
          <div
            key={currentDate.toString()}
            onClick={() => setSelectedDate(currentDate)}
            className={`min-h-[80px] p-1.5 border border-cyan-500/5 rounded-lg cursor-pointer transition-all hover:border-cyan-500/20 ${
              !isCurrentMonth ? 'opacity-30' : ''
            } ${isSelected ? 'border-cyan-400 bg-cyan-500/10' : 'bg-[#0a0a0f]/50'} ${isToday ? 'ring-1 ring-cyan-400/50' : ''}`}
          >
            <div className={`text-xs font-medium mb-1 ${isToday ? 'text-cyan-400' : 'text-gray-400'}`}>
              {format(currentDate, 'd')}
            </div>
            <div className="space-y-0.5">
              {dayTasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  onClick={(e) => { e.stopPropagation(); router.push(`/tasks/${task.id}`); }}
                  className={`text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer ${
                    task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 line-through' :
                    isOverdue(task.due_date, task.due_time, task.status) ? 'bg-red-500/20 text-red-400' :
                    'bg-cyan-500/10 text-cyan-300'
                  }`}
                >
                  {task.title}
                </div>
              ))}
              {dayTasks.length > 3 && (
                <div className="text-[10px] text-gray-500 px-1">+{dayTasks.length - 3} more</div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div key={day.toString()} className="grid grid-cols-7 gap-1">{days}</div>);
      days = [];
    }
    return <div className="space-y-1">{rows}</div>;
  };

  const selectedDayTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    return isSameDay(parseISO(t.due_date), selectedDate);
  }).sort((a, b) => {
    if (!a.due_time) return 1;
    if (!b.due_time) return -1;
    return a.due_time.localeCompare(b.due_time);
  });

  if (authLoading || loading) {
    return <div className="h-96 bg-cyan-500/5 rounded-xl animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Calendar</h1>
        <p className="text-sm text-gray-500">View your tasks by date</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-[#0f0f1a]/70 border border-cyan-500/10 p-4">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </div>

        <div className="rounded-xl bg-[#0f0f1a]/70 border border-cyan-500/10 p-4">
          <h3 className="text-sm font-bold text-gray-300 mb-3">
            {format(selectedDate, 'EEEE, MMMM d')}
          </h3>
          {selectedDayTasks.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No tasks for this day</p>
          ) : (
            <div className="space-y-2">
              {selectedDayTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => router.push(`/tasks/${task.id}`)}
                  className="p-3 rounded-lg bg-black/20 border border-cyan-500/5 cursor-pointer hover:border-cyan-500/20 transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getTaskTypeColor(task.task_type)}`}>
                      {task.task_type.toUpperCase()}
                    </span>
                    {task.due_time && <span className="text-xs text-gray-500">{task.due_time}</span>}
                  </div>
                  <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                    {task.title}
                  </p>
                  {task.course && <p className="text-xs text-gray-500 mt-1">{task.course.name}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
