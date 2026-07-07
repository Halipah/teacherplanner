import { 
  Teacher, Student, AttendanceRecord, GradeRecord, 
  JournalRecord, ScheduleRecord, TaskRecord, NoteRecord, LessonPlan 
} from "./types";
import { db, isFirebaseConnected } from "./firebase";
import { 
  collection, doc, getDocs, setDoc, deleteDoc, getDoc 
} from "firebase/firestore";

// --- SEED DATA ---
const INITIAL_TEACHER: Teacher = {
  id: "teacher_01",
  name: "Rispa NurHalipah, S.Kom.",
  nip: "3740776677230062",
  subject: "REKAYASA PERANGKAT LUNAK",
  school: "SMK JAMIYATUL AULAD",
  email: "rispa.halipah@sch.id",
  phone: "0812-3456-7890",
  academicYear: "2026/2027",
  photoUrl: ""
};

const INITIAL_STUDENTS: Student[] = [
  // Kelas X-A
  { id: "std_101", nisn: "0098765411", name: "Ahmad Syarif", gender: "L", className: "X-A" },
  { id: "std_102", nisn: "0098765412", name: "Budi Pratama", gender: "L", className: "X-A" },
  { id: "std_103", nisn: "0098765413", name: "Citra Lestari", gender: "P", className: "X-A" },
  { id: "std_104", nisn: "0098765414", name: "Dika Wijaya", gender: "L", className: "X-A" },
  { id: "std_105", nisn: "0098765415", name: "Eka Saputra", gender: "L", className: "X-A" },
  { id: "std_106", nisn: "0098765416", name: "Farhan Ramadhan", gender: "L", className: "X-A" },
  { id: "std_107", nisn: "0098765417", name: "Gita Amalia", gender: "P", className: "X-A" },
  { id: "std_108", nisn: "0098765418", name: "Habibie Yusuf", gender: "L", className: "X-A" },
  { id: "std_109", nisn: "0098765419", name: "Indah Permata", gender: "P", className: "X-A" },
  { id: "std_110", nisn: "0098765420", name: "Joko Susilo", gender: "L", className: "X-A" },
  // Kelas XI-B
  { id: "std_201", nisn: "0087654321", name: "Kurniawati", gender: "P", className: "XI-B" },
  { id: "std_202", nisn: "0087654322", name: "Lutfi Hakim", gender: "L", className: "XI-B" },
  { id: "std_203", nisn: "0087654323", name: "Mega Utami", gender: "P", className: "XI-B" },
  { id: "std_204", nisn: "0087654324", name: "Naufal Arkan", gender: "L", className: "XI-B" },
  { id: "std_205", nisn: "0087654325", name: "Olivia Putri", gender: "P", className: "XI-B" },
  { id: "std_206", nisn: "0087654326", name: "Pandu Winata", gender: "L", className: "XI-B" },
  { id: "std_207", nisn: "0087654327", name: "Queen Rania", gender: "P", className: "XI-B" },
  { id: "std_208", nisn: "0087654328", name: "Rendy Kurniawan", gender: "L", className: "XI-B" },
  { id: "std_209", nisn: "0087654329", name: "Salsa Bella", gender: "P", className: "XI-B" },
  { id: "std_210", nisn: "0087654330", name: "Taufik Hidayat", gender: "L", className: "XI-B" }
];

const INITIAL_SCHEDULES: ScheduleRecord[] = [
  { id: "sc_01", day: "Senin", timeSlot: "07:30 - 09:00", className: "X-A", subject: "Informatika", color: "indigo" },
  { id: "sc_02", day: "Senin", timeSlot: "09:15 - 10:45", className: "XI-B", subject: "Bahasa Inggris", color: "emerald" },
  { id: "sc_03", day: "Selasa", timeSlot: "08:00 - 09:30", className: "X-A", subject: "Informatika", color: "indigo" },
  { id: "sc_04", day: "Rabu", timeSlot: "10:00 - 11:30", className: "XI-B", subject: "Informatika", color: "violet" },
  { id: "sc_05", day: "Kamis", timeSlot: "07:30 - 09:00", className: "XI-B", subject: "Bahasa Inggris", color: "emerald" },
  { id: "sc_06", day: "Jumat", timeSlot: "08:30 - 10:00", className: "X-A", subject: "Bahasa Inggris", color: "amber" }
];

const INITIAL_TASKS: TaskRecord[] = [
  { id: "tsk_01", title: "Koreksi Tugas Bahasa Inggris Kelas XI-B", description: "Esai tentang hortatory exposition siswa", dueDate: "2026-07-10", priority: "Tinggi", status: "Belum", category: "Koreksi" },
  { id: "tsk_02", title: "Siapkan Bahan Modul Informatika Bab Algoritma", description: "Modul flowchart dan pemecahan masalah sederhana untuk kelas X-A", dueDate: "2026-07-12", priority: "Sedang", status: "Belum", category: "Materi" },
  { id: "tsk_03", title: "Input Nilai Ulangan Harian Informatika Semester 1", description: "Rekap nilai Bab 1 di rapor sementara", dueDate: "2026-07-15", priority: "Tinggi", status: "Belum", category: "Administrasi" },
  { id: "tsk_04", title: "Kirim RPP Kurikulum Merdeka ke Kepala Sekolah", description: "Laporan administrasi mingguan", dueDate: "2026-07-08", priority: "Sedang", status: "Selesai", category: "Administrasi" }
];

const INITIAL_NOTES: NoteRecord[] = [
  { id: "not_01", title: "Ide Proyek Informatika", content: "Siswa kelas X-A membuat infografis tentang dampak sosial media secara berkelompok. Evaluasi menggunakan penilaian sejawat (peer assessment).", date: "2026-07-01", color: "bg-yellow-50 text-yellow-900 border-yellow-200", isPinned: true },
  { id: "not_02", title: "Catatan Siswa: Farhan X-A", content: "Farhan sangat mahir dalam logika pemrograman scratch. Berikan tugas tambahan berupa tantangan modul mandiri agar potensinya berkembang.", date: "2026-07-05", color: "bg-blue-50 text-blue-900 border-blue-200", isPinned: false },
  { id: "not_03", title: "Rapat Guru Bulanan", content: "Agenda: Pembahasan kurikulum baru, persiapan ujian tengah semester, dan penilaian karakter P5 (Projek Penguatan Profil Pelajar Pancasila).", date: "2026-07-06", color: "bg-purple-50 text-purple-900 border-purple-200", isPinned: false }
];

const INITIAL_JOURNALS: JournalRecord[] = [
  { 
    id: "jrn_01", 
    date: "2026-07-06", 
    timeSlot: "Jam ke-1-2 (07:30 - 09:00)", 
    className: "X-A", 
    subject: "Informatika", 
    topic: "Berpikir Komputasional", 
    activities: "Penjelasan konsep dekomposisi dan pengenalan pola. Siswa mengerjakan studi kasus pencarian rute terpendek secara berkelompok.", 
    notes: "Citra dan Farhan sangat aktif. Beberapa siswa masih bingung membedakan abstraksi dan algoritma.", 
    reflection: "Pada pertemuan berikutnya, berikan contoh visual interaktif/peta nyata agar dekomposisi lebih mudah dipahami." 
  },
  { 
    id: "jrn_02", 
    date: "2026-07-06", 
    timeSlot: "Jam ke-3-4 (09:15 - 10:45)", 
    className: "XI-B", 
    subject: "Bahasa Inggris", 
    topic: "Analytical Exposition", 
    activities: "Membahas struktur teks Analytical Exposition dan fungsi sosialnya. Siswa membaca artikel opini dan menentukan thesis statement.", 
    notes: "Kurniawati memberikan analisis struktur yang sangat baik. Partisipasi kelas cukup kondusif.", 
    reflection: "Bagus. Pertemuan selanjutnya akan fokus pada pembuatan draft tesis pribadi tentang isu lingkungan." 
  }
];

// Seed some attendance records (July 2026) for Semester 1
const generateInitialAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const dates = ["2026-07-01", "2026-07-02", "2026-07-03", "2026-07-06", "2026-07-07"];
  
  INITIAL_STUDENTS.forEach(student => {
    dates.forEach((date, index) => {
      // Create highly authentic variety: most attend, few are sick/excused/absent
      let status: 'H' | 'S' | 'I' | 'A' = 'H';
      const hash = (student.name.length + index) % 15;
      if (hash === 3) status = 'S';
      else if (hash === 7) status = 'I';
      else if (hash === 11) status = 'A';
      
      records.push({
        id: `att_${student.id}_${date.replace(/-/g, '')}`,
        studentId: student.id,
        studentName: student.name,
        className: student.className,
        date,
        status,
        semester: 1,
        month: "2026-07"
      });
    });
  });
  return records;
};

// Seed some grades
const generateInitialGrades = (): GradeRecord[] => {
  const records: GradeRecord[] = [];
  const assessments: { name: string; type: 'Tugas' | 'UH' | 'UTS' | 'UAS'; semester: 1 | 2 }[] = [
    { name: "Tugas 1 - Logika", type: "Tugas", semester: 1 },
    { name: "UH 1 - Berpikir Komputasional", type: "UH", semester: 1 },
    { name: "Tugas 2 - Pemrograman", type: "Tugas", semester: 1 },
  ];
  
  INITIAL_STUDENTS.forEach(student => {
    assessments.forEach((asm, index) => {
      // Calculate realistic scores (70 to 100)
      const baseScore = 75 + ((student.name.charCodeAt(0) + student.name.charCodeAt(1) + index) % 25);
      records.push({
        id: `grd_${student.id}_${index}`,
        studentId: student.id,
        studentName: student.name,
        className: student.className,
        semester: asm.semester,
        type: asm.type,
        assessmentName: asm.name,
        score: baseScore,
        date: "2026-07-05"
      });
    });
  });
  return records;
};

// --- DATA SERVICE OBJECT ---
export const DataService = {
  // --- CORE GET/SAVE ENGINE ---
  getData<T>(key: string, defaultData: T[]): T[] {
    const local = localStorage.getItem(`tp_${key}`);
    if (local) {
      try { return JSON.parse(local); } catch (e) { return defaultData; }
    }
    localStorage.setItem(`tp_${key}`, JSON.stringify(defaultData));
    return defaultData;
  },

  saveData<T>(key: string, data: T[]): void {
    localStorage.setItem(`tp_${key}`, JSON.stringify(data));
    this.syncToFirebase(key, data);
  },

  async syncToFirebase(key: string, data: any[]) {
    if (!isFirebaseConnected || !db) return;
    try {
      // Push bulk to firebase
      // We will save to a container doc for high reliability and atomic transactions
      const docRef = doc(db, "teacher_planner_data", key);
      await setDoc(docRef, { items: data }, { merge: true });
    } catch (e) {
      console.warn(`Firestore sync failed for ${key}:`, e);
    }
  },

  async loadFromFirebaseAndMerge(key: string, defaultData: any[]): Promise<any[]> {
    if (!isFirebaseConnected || !db) {
      return this.getData(key, defaultData);
    }
    try {
      const docRef = doc(db, "teacher_planner_data", key);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists() && snapshot.data().items) {
        const fbData = snapshot.data().items;
        // Merge & save locally
        localStorage.setItem(`tp_${key}`, JSON.stringify(fbData));
        return fbData;
      }
    } catch (e) {
      console.warn(`Firestore retrieve failed for ${key}:`, e);
    }
    return this.getData(key, defaultData);
  },

  // --- TEACHER PROFILE ---
  getTeacherProfile(): Teacher {
    const local = localStorage.getItem("tp_teacher_profile");
    if (local) {
      try { return JSON.parse(local); } catch (e) { return INITIAL_TEACHER; }
    }
    localStorage.setItem("tp_teacher_profile", JSON.stringify(INITIAL_TEACHER));
    return INITIAL_TEACHER;
  },

  saveTeacherProfile(teacher: Teacher): void {
    localStorage.setItem("tp_teacher_profile", JSON.stringify(teacher));
    if (isFirebaseConnected && db) {
      setDoc(doc(db, "teacher_planner_data", "teacher_profile"), teacher, { merge: true })
        .catch(e => console.warn("Firestore profile sync failed:", e));
    }
  },

  async loadTeacherProfileAsync(): Promise<Teacher> {
    if (isFirebaseConnected && db) {
      try {
        const snap = await getDoc(doc(db, "teacher_planner_data", "teacher_profile"));
        if (snap.exists()) {
          const profile = snap.data() as Teacher;
          localStorage.setItem("tp_teacher_profile", JSON.stringify(profile));
          return profile;
        }
      } catch (e) {
        console.warn("Firestore load profile error:", e);
      }
    }
    return this.getTeacherProfile();
  },

  // --- STUDENTS ---
  getStudents(): Student[] {
    return DataService.getData<Student>("students", INITIAL_STUDENTS);
  },

  saveStudents(students: Student[]): void {
    DataService.saveData("students", students);
  },

  // --- ATTENDANCE ---
  getAttendance(): AttendanceRecord[] {
    return DataService.getData<AttendanceRecord>("attendance", generateInitialAttendance());
  },

  saveAttendance(records: AttendanceRecord[]): void {
    DataService.saveData("attendance", records);
  },

  // --- GRADES ---
  getGrades(): GradeRecord[] {
    return DataService.getData<GradeRecord>("grades", generateInitialGrades());
  },

  saveGrades(records: GradeRecord[]): void {
    DataService.saveData("grades", records);
  },

  // --- JOURNALS ---
  getJournals(): JournalRecord[] {
    return DataService.getData<JournalRecord>("journals", INITIAL_JOURNALS);
  },

  saveJournals(records: JournalRecord[]): void {
    DataService.saveData("journals", records);
  },

  // --- SCHEDULES ---
  getSchedules(): ScheduleRecord[] {
    return DataService.getData<ScheduleRecord>("schedules", INITIAL_SCHEDULES);
  },

  saveSchedules(records: ScheduleRecord[]): void {
    DataService.saveData("schedules", records);
  },

  // --- TASKS ---
  getTasks(): TaskRecord[] {
    return DataService.getData<TaskRecord>("tasks", INITIAL_TASKS);
  },

  saveTasks(records: TaskRecord[]): void {
    DataService.saveData("tasks", records);
  },

  // --- NOTES ---
  getNotes(): NoteRecord[] {
    return DataService.getData<NoteRecord>("notes", INITIAL_NOTES);
  },

  saveNotes(records: NoteRecord[]): void {
    DataService.saveData("notes", records);
  },

  // --- LESSON PLANS (RPP AI) ---
  getLessonPlans(): LessonPlan[] {
    return DataService.getData<LessonPlan>("lesson_plans", []);
  },

  saveLessonPlans(plans: LessonPlan[]): void {
    DataService.saveData("lesson_plans", plans);
  },

  // --- FULL SYNC WRAPPER ---
  async syncAllDataFromFirebase(): Promise<void> {
    if (!isFirebaseConnected) return;
    try {
      await this.loadTeacherProfileAsync();
      await this.loadFromFirebaseAndMerge("students", INITIAL_STUDENTS);
      await this.loadFromFirebaseAndMerge("attendance", generateInitialAttendance());
      await this.loadFromFirebaseAndMerge("grades", generateInitialGrades());
      await this.loadFromFirebaseAndMerge("journals", INITIAL_JOURNALS);
      await this.loadFromFirebaseAndMerge("schedules", INITIAL_SCHEDULES);
      await this.loadFromFirebaseAndMerge("tasks", INITIAL_TASKS);
      await this.loadFromFirebaseAndMerge("notes", INITIAL_NOTES);
      await this.loadFromFirebaseAndMerge("lesson_plans", []);
    } catch (e) {
      console.warn("Full sync from Firebase encountered warning/error:", e);
    }
  }
};
