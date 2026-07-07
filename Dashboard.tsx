import React from "react";
import { Teacher, Student, AttendanceRecord, JournalRecord, TaskRecord, ScheduleRecord } from "../types";
import { Users, BookOpen, Calendar, ClipboardCheck, ArrowRight, UserCheck, AlertCircle, FileText } from "lucide-react";
import { motion } from "motion/react";

interface DashboardProps {
  teacher: Teacher;
  students: Student[];
  attendance: AttendanceRecord[];
  journals: JournalRecord[];
  tasks: TaskRecord[];
  schedules: ScheduleRecord[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ 
  teacher, students, attendance, journals, tasks, schedules, onNavigate 
}: DashboardProps) {
  
  // Calculate analytics
  const totalStudents = students.length;
  
  const classes = Array.from(new Set(students.map(s => s.className)));
  const totalClasses = classes.length;

  const incompleteTasks = tasks.filter(t => t.status === "Belum");
  const pendingTasksCount = incompleteTasks.length;

  // Calculate Average Attendance Rate
  const attendanceRate = React.useMemo(() => {
    if (attendance.length === 0) return 0;
    const presentCount = attendance.filter(a => a.status === 'H').length;
    return Math.round((presentCount / attendance.length) * 100);
  }, [attendance]);

  // Daily schedules (Simulated for today)
  const todaySchedules = schedules.slice(0, 3); // Grab some schedules for display

  // Calculate monthly attendance stats for custom SVG chart
  const monthlyAttendanceData = React.useMemo(() => {
    // Generate simulated monthly attendance data based on seed
    return [
      { name: "Jul", rate: attendanceRate || 92 },
      { name: "Agt", rate: 94 },
      { name: "Sep", rate: 89 },
      { name: "Okt", rate: 91 },
      { name: "Nov", rate: 95 },
      { name: "Des", rate: 93 }
    ];
  }, [attendanceRate]);

  // Calculate grade performance for custom SVG chart
  const gradePerformanceData = [
    { label: "Tugas 1", X_A: 85, XI_B: 82 },
    { label: "UH 1", X_A: 78, XI_B: 84 },
    { label: "Tugas 2", X_A: 88, XI_B: 80 },
    { label: "UTS", X_A: 76, XI_B: 79 },
    { label: "UAS", X_A: 82, XI_B: 85 }
  ];

  return (
    <div id="dashboard-tab" className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 sm:p-8 border border-indigo-500/20 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 rounded-full filter blur-[120px] opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-3">
              Tahun Ajaran {teacher.academicYear}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Selamat Datang, {teacher.name}
            </h1>
            <p className="text-indigo-200/80 mt-1 max-w-xl text-sm sm:text-base leading-relaxed">
              Selamat datang kembali di pusat kendali Teacher Planner Anda. Kelola absensi siswa, jurnal harian, dan rencanakan pembelajaran dengan asisten AI terintegrasi secara mudah.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs text-indigo-300/90 font-mono border-t border-indigo-500/20 pt-4">
              <div>NIP: {teacher.nip || "-"}</div>
              <div>Instansi: {teacher.school}</div>
              <div>Mata Pelajaran: {teacher.subject}</div>
            </div>
          </div>
          <button 
            onClick={() => onNavigate("profile")}
            className="shrink-0 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-md shadow-indigo-600/10 active:scale-[0.98] flex items-center gap-1.5"
          >
            Edit Biodata
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Siswa */}
        <div 
          onClick={() => onNavigate("students")}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-indigo-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm font-medium">Total Siswa</span>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-100">{totalStudents}</div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            Tersebar di {totalClasses} kelas terdaftar
          </p>
        </div>

        {/* Card 2: Kehadiran */}
        <div 
          onClick={() => onNavigate("attendance")}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm font-medium">Kehadiran Rata-Rata</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-100">{attendanceRate}%</div>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            Melampaui target nasional (85%)
          </p>
        </div>

        {/* Card 3: Jurnal Harian */}
        <div 
          onClick={() => onNavigate("journal")}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-violet-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm font-medium">Jurnal Harian</span>
            <div className="p-2.5 bg-violet-500/10 text-violet-400 rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-all">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-100">{journals.length}</div>
          <p className="text-xs text-slate-400 mt-2">
            Catatan kegiatan belajar tersimpan
          </p>
        </div>

        {/* Card 4: Tugas Pending */}
        <div 
          onClick={() => onNavigate("tasks")}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm font-medium">Tugas Administrasi</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-all">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-100">{pendingTasksCount}</div>
          <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {pendingTasksCount} agenda perlu diselesaikan
          </p>
        </div>
      </div>

      {/* Analytics Visuals - Beautiful Interactive SVGs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kehadiran Bulanan */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-100">Statistik Kehadiran Siswa</h2>
              <p className="text-xs text-slate-400">Rerata tingkat kehadiran per bulan (%)</p>
            </div>
            <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-1 rounded">Sem 1 - 2026</span>
          </div>

          {/* SVG Line / Bar Chart */}
          <div className="relative h-64 w-full flex items-end justify-between pt-6 px-4">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-500 font-mono">
              <div className="border-b border-slate-800/80 w-full pb-1">100%</div>
              <div className="border-b border-slate-800/80 w-full pb-1">80%</div>
              <div className="border-b border-slate-800/80 w-full pb-1">60%</div>
              <div className="border-b border-slate-800/80 w-full pb-1">40%</div>
              <div className="border-b border-slate-800/80 w-full pb-1">20%</div>
              <div className="w-full h-0" />
            </div>

            {monthlyAttendanceData.map((data, index) => {
              const heightPercent = `${data.rate}%`;
              return (
                <div key={index} className="flex flex-col items-center gap-2 z-10 w-1/6 group">
                  <div className="relative w-full flex justify-center items-end h-48">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-slate-950 text-white border border-slate-800 rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-all pointer-events-none font-mono">
                      {data.rate}%
                    </div>
                    {/* Bar */}
                    <div 
                      style={{ height: heightPercent }} 
                      className="w-10 bg-gradient-to-t from-indigo-600 to-indigo-400 hover:from-indigo-500 hover:to-indigo-300 rounded-t-md shadow-lg shadow-indigo-600/10 transition-all"
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-400">{data.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analisis Nilai Kelas */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-100">Performa Nilas Asesmen</h2>
              <p className="text-xs text-slate-400">Nilai rata-rata per mata pelajaran & asesmen</p>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 bg-indigo-500 rounded-full" /> X-A
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 bg-emerald-500 rounded-full" /> XI-B
              </div>
            </div>
          </div>

          {/* SVG Grouped Bar Chart */}
          <div className="relative h-64 w-full flex items-end justify-between pt-6 px-4">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-500 font-mono">
              <div className="border-b border-slate-800/80 w-full pb-1">100</div>
              <div className="border-b border-slate-800/80 w-full pb-1">80</div>
              <div className="border-b border-slate-800/80 w-full pb-1">60</div>
              <div className="border-b border-slate-800/80 w-full pb-1">40</div>
              <div className="border-b border-slate-800/80 w-full pb-1">20</div>
              <div className="w-full h-0" />
            </div>

            {gradePerformanceData.map((data, index) => {
              const h_xa = `${data.X_A}%`;
              const h_xib = `${data.XI_B}%`;
              return (
                <div key={index} className="flex flex-col items-center gap-2 z-10 w-1/5 group">
                  <div className="relative w-full flex justify-center items-end h-48 gap-1.5">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-slate-950 text-white border border-slate-800 rounded p-2 text-[10px] opacity-0 group-hover:opacity-100 transition-all pointer-events-none font-mono flex flex-col gap-0.5 z-20">
                      <div>X-A: <span className="font-bold">{data.X_A}</span></div>
                      <div>XI-B: <span className="font-bold">{data.XI_B}</span></div>
                    </div>
                    {/* Bar X-A */}
                    <div 
                      style={{ height: h_xa }} 
                      className="w-4 sm:w-5 bg-indigo-500 rounded-t shadow-sm hover:brightness-110 transition-all"
                    />
                    {/* Bar XI-B */}
                    <div 
                      style={{ height: h_xib }} 
                      className="w-4 sm:w-5 bg-emerald-500 rounded-t shadow-sm hover:brightness-110 transition-all"
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-slate-400 text-center truncate w-full">{data.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agenda & Jurnal / Tasks Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agenda Hari Ini */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" /> Agenda Hari Ini
            </h2>
            <button 
              onClick={() => onNavigate("schedule")}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Lihat Semua
            </button>
          </div>
          {todaySchedules.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">Tidak ada jadwal hari ini.</p>
          ) : (
            <div className="space-y-3">
              {todaySchedules.map((sc, index) => (
                <div 
                  key={index}
                  className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 flex items-start gap-3"
                >
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-lg shrink-0">
                    {sc.day}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-200 truncate">{sc.subject}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Kelas {sc.className} • Jam: {sc.timeSlot}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Jurnal Terakhir */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Jurnal Terbaru
            </h2>
            <button 
              onClick={() => onNavigate("journal")}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Tulis Baru
            </button>
          </div>
          {journals.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">Belum ada jurnal ditulis.</p>
          ) : (
            <div className="space-y-3">
              {journals.slice(0, 2).map((jrn, index) => (
                <div 
                  key={index}
                  className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Kelas {jrn.className}
                    </span>
                    <span className="text-[10px] text-slate-400">{jrn.date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-200 truncate">{jrn.topic}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{jrn.activities}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* To-Do List Guru */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-amber-400" /> Tugas Tertunda
            </h2>
            <button 
              onClick={() => onNavigate("tasks")}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Kelola Tugas
            </button>
          </div>
          {incompleteTasks.length === 0 ? (
            <p className="text-emerald-400 text-sm py-8 text-center flex items-center justify-center gap-1.5">
              <UserCheck className="w-4 h-4" /> Semua tugas sudah selesai!
            </p>
          ) : (
            <div className="space-y-3">
              {incompleteTasks.slice(0, 3).map((tsk, index) => (
                <div 
                  key={index}
                  className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 flex items-start justify-between gap-2.5"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-200 truncate">{tsk.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">Tempo: {tsk.dueDate}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded shrink-0 ${
                    tsk.priority === "Tinggi" ? "bg-rose-500/10 text-rose-400" :
                    tsk.priority === "Sedang" ? "bg-amber-500/10 text-amber-400" :
                    "bg-blue-500/10 text-blue-400"
                  }`}>
                    {tsk.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
