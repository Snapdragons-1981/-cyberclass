'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { getCourses, createCourse, updateCourse, deleteCourse } from '@/services/courses';
import { Plus, BookOpen, Edit, Trash2, X } from 'lucide-react';
import type { Course } from '@/types';

export default function CoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [room, setRoom] = useState('');
  const [schedule, setSchedule] = useState('');
  const [color, setColor] = useState('#00fff2');
  const [saving, setSaving] = useState(false);

  const loadCourses = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getCourses(user.id);
      setCourses(data);
    } catch {} finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  const openCreate = () => {
    setEditingCourse(null);
    setName(''); setCode(''); setDescription(''); setRoom(''); setSchedule(''); setColor('#00fff2');
    setShowModal(true);
  };

  const openEdit = (c: Course) => {
    setEditingCourse(c);
    setName(c.name); setCode(c.code); setDescription(c.description || '');
    setRoom(c.room || ''); setSchedule(c.schedule || ''); setColor(c.color);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setSaving(true);
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, { name, code, description, room, schedule, color });
      } else {
        await createCourse({
          user_id: user.id, semester_id: '', name, code, description: description || null,
          instructor_id: null, room: room || null, schedule: schedule || null, color,
        });
      }
      loadCourses();
      setShowModal(false);
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    try { await deleteCourse(id); loadCourses(); } catch {}
  };

  if (authLoading || loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-cyan-500/5 rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Courses</h1>
          <p className="text-sm text-gray-500">{courses.length} courses</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">ADD COURSE</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(course => (
          <div key={course.id} className="rounded-xl bg-[#0f0f1a]/70 border border-cyan-500/10 p-5 hover:border-cyan-500/30 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: course.color, boxShadow: `0 0 10px ${course.color}` }} />
                <div>
                  <h3 className="font-bold text-gray-100 group-hover:text-cyan-400 transition-colors">{course.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">{course.code}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(course)} className="p-1.5 rounded hover:bg-cyan-500/10 text-gray-500 hover:text-cyan-400"><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(course.id)} className="p-1.5 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            {course.description && <p className="text-sm text-gray-400 mb-3 line-clamp-2">{course.description}</p>}
            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
              {course.room && <span className="px-2 py-1 rounded bg-black/20">Room: {course.room}</span>}
              {course.schedule && <span className="px-2 py-1 rounded bg-black/20">{course.schedule}</span>}
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-cyan-400/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-300 mb-2">No courses yet</h3>
          <p className="text-gray-500 mb-4">Add your first course to organize your tasks</p>
          <button onClick={openCreate} className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm">
            <Plus className="w-4 h-4 inline mr-1" />Add Course
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0a0a0f] border border-cyan-500/20 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-cyan-500/10">
              <h2 className="text-lg font-bold text-cyan-400">{editingCourse ? 'EDIT COURSE' : 'NEW COURSE'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-cyan-500/10 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">COURSE NAME</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Database Systems" className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-400 focus:outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">CODE</label>
                  <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="IT 314" className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-400 focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">ROOM</label>
                  <input type="text" value={room} onChange={e => setRoom(e.target.value)} placeholder="Room 301" className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-400 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">SCHEDULE</label>
                <input type="text" value={schedule} onChange={e => setSchedule(e.target.value)} placeholder="MWF 10:00-11:30" className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">DESCRIPTION</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-400 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">COLOR</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded-lg border border-cyan-500/20 cursor-pointer" />
                  <span className="text-sm text-gray-400">{color}</span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:text-gray-200 text-sm">Cancel</button>
                <button type="submit" disabled={saving || !name.trim()} className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-bold text-sm disabled:opacity-50">
                  {saving ? 'Saving...' : editingCourse ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
