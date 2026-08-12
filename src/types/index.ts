export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'overdue' | 'archived';
export type TaskType = 'assignment' | 'pit' | 'quiz' | 'exam' | 'project' | 'laboratory' | 'activity' | 'presentation' | 'report' | 'research' | 'requirement' | 'reading' | 'event' | 'other';
export type SemesterTerm = '1st_semester' | '2nd_semester' | 'summer';
export type ReminderType = '5min' | '15min' | '30min' | '1hour' | '3hours' | '12hours' | '24hours' | '2days' | 'custom';
export type NotificationType = 'due_soon' | 'overdue' | 'completed' | 'reminder' | 'info';
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Semester {
  id: string;
  user_id: string;
  name: string;
  school_year: string;
  term: SemesterTerm;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  user_id: string;
  semester_id: string;
  name: string;
  code: string;
  description: string | null;
  instructor_id: string | null;
  room: string | null;
  schedule: string | null;
  color: string;
  created_at: string;
  updated_at: string;
  instructor?: Instructor;
  semester?: Semester;
  task_count?: number;
  completed_count?: number;
}

export interface Instructor {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  department: string | null;
  contact: string | null;
  notes: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  course_id: string | null;
  semester_id: string | null;
  title: string;
  description: string | null;
  task_type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  due_time: string | null;
  estimated_minutes: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  course?: Course;
  tags?: Tag[];
  reminders?: Reminder[];
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface TaskTag {
  task_id: string;
  tag_id: string;
}

export interface Reminder {
  id: string;
  task_id: string;
  user_id: string;
  remind_at: string;
  reminder_type: ReminderType;
  is_sent: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  task_id: string | null;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  task?: Task;
}

export interface Attachment {
  id: string;
  task_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface TaskStats {
  total: number;
  overdue: number;
  due_today: number;
  due_this_week: number;
  completed: number;
  completion_rate: number;
}

export interface ThemeSettings {
  accentColor: string;
  glowIntensity: number;
  animationIntensity: number;
  backgroundGrid: boolean;
  cardTransparency: number;
  reducedMotion: boolean;
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  assignment: 'Assignment',
  pit: 'PIT',
  quiz: 'Quiz',
  exam: 'Exam',
  project: 'Project',
  laboratory: 'Laboratory',
  activity: 'Activity',
  presentation: 'Presentation',
  report: 'Report',
  research: 'Research',
  requirement: 'Requirement',
  reading: 'Reading',
  event: 'Event',
  other: 'Other',
};

export const TASK_TYPE_COLORS: Record<TaskType, string> = {
  assignment: '#00fff2',
  pit: '#ff00ff',
  quiz: '#ff6b00',
  exam: '#ff0040',
  project: '#8b5cf6',
  laboratory: '#00ff88',
  activity: '#ffcc00',
  presentation: '#00aaff',
  report: '#ff69b4',
  research: '#7c3aed',
  requirement: '#f97316',
  reading: '#06b6d4',
  event: '#10b981',
  other: '#6b7280',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#06b6d4',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: '#6b7280',
  in_progress: '#3b82f6',
  completed: '#10b981',
  overdue: '#ef4444',
  archived: '#6b7280',
};
