import { createClient } from '@/lib/supabase/client';
import type { Course, Semester, Instructor } from '@/types';

function getClient() {
  const client = createClient();
  if (!client) throw new Error('Supabase not configured');
  return client;
}

export async function getCourses(userId: string, semesterId?: string) {
  const supabase = getClient();
  let query = supabase
    .from('courses')
    .select('*, instructor:instructors(*), semester:semesters(*)')
    .eq('user_id', userId)
    .order('name');

  if (semesterId) query = query.eq('semester_id', semesterId);

  const { data, error } = await query;
  if (error) throw error;
  return data as Course[];
}

export async function createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at' | 'instructor' | 'semester'>) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('courses')
    .insert(course)
    .select()
    .single();

  if (error) throw error;
  return data as Course;
}

export async function updateCourse(id: string, updates: Partial<Course>) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('courses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Course;
}

export async function deleteCourse(id: string) {
  const supabase = getClient();
  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (error) throw error;
}

export async function getSemesters(userId: string) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('semesters')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Semester[];
}

export async function createSemester(semester: Omit<Semester, 'id' | 'created_at'>) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('semesters')
    .insert(semester)
    .select()
    .single();

  if (error) throw error;
  return data as Semester;
}

export async function updateSemester(id: string, updates: Partial<Semester>) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('semesters')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Semester;
}

export async function getInstructors(userId: string) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('instructors')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (error) throw error;
  return data as Instructor[];
}

export async function createInstructor(instructor: Omit<Instructor, 'id' | 'created_at'>) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('instructors')
    .insert(instructor)
    .select()
    .single();

  if (error) throw error;
  return data as Instructor;
}

export async function updateInstructor(id: string, updates: Partial<Instructor>) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('instructors')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Instructor;
}

export async function deleteInstructor(id: string) {
  const supabase = getClient();
  const { error } = await supabase.from('instructors').delete().eq('id', id);
  if (error) throw error;
}
