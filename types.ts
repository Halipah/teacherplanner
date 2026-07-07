/**
 * Types and interfaces for the Teacher Planner Application
 */

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  subject: string;
  school: string;
  email: string;
  phone: string;
  photoUrl?: string;
  academicYear: string;
}

export interface Student {
  id: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P'; // Laki-laki / Perempuan
  className: string;
}

export type AttendanceStatus = 'H' | 'S' | 'I' | 'A'; // Hadir, Sakit, Izin, Alpa

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  semester: 1 | 2;
  month: string; // YYYY-MM
}

export type GradeType = 'Tugas' | 'UH' | 'UTS' | 'UAS'; // Ulangan Harian, UTS, UAS

export interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  semester: 1 | 2;
  type: GradeType;
  assessmentName: string; // e.g., "Tugas 1", "UH Bab 2"
  score: number; // 0 - 100
  date: string; // YYYY-MM-DD
}

export interface JournalRecord {
  id: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // Jam ke-1, Jam ke-2-3, etc.
  className: string;
  subject: string;
  topic: string; // Materi Pembelajaran
  activities: string; // Kegiatan Pembelajaran
  notes: string; // Hambatan / Catatan Guru
  reflection: string; // Refleksi / Rencana Tindak Lanjut
}

export interface ScheduleRecord {
  id: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  timeSlot: string; // e.g. "07:30 - 09:00"
  className: string;
  subject: string;
  color?: string;
}

export interface TaskRecord {
  id: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  priority: 'Rendah' | 'Sedang' | 'Tinggi';
  status: 'Belum' | 'Selesai';
  category: 'Koreksi' | 'Materi' | 'Administrasi' | 'Lainnya';
}

export interface NoteRecord {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  color: string; // Tailwind bg class like "bg-yellow-100"
  isPinned?: boolean;
}

export interface LessonPlan {
  id: string;
  topic: string;
  className: string;
  subject: string;
  duration: string; // e.g. "2 x 45 Menit"
  curriculum: 'Kurikulum Merdeka' | 'K-13';
  content: string; // Markdown formatted lesson plan from AI
  createdAt: string;
}

export interface UserSession {
  role: 'admin' | 'guru';
  teacherId?: string;
  name: string;
}
