import React, { useState, useEffect } from "react";
import { UserSession, Teacher, Student, AttendanceRecord, GradeRecord, JournalRecord, ScheduleRecord, TaskRecord, NoteRecord, LessonPlan } from "./types";
import { DataService } from "./dataStore";

// Component imports
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import Attendance from "./components/Attendance";
import Grades from "./components/Grades";
import Journal from "./components/Journal";
import Schedule from "./components/Schedule";
import Tasks from "./components/Tasks";
import Students from "./components/Students";
import Notes from "./components/Notes";
import LessonPlannerAI from "./components/LessonPlannerAI";

// Icons
import {
  LayoutDashboard, User, CheckSquare, GraduationCap, FileSpreadsheet,
  CalendarDays, CheckSquare2, Users, FileEdit, Sparkles, LogOut, Menu, X, Globe, Wifi, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type TabID = 'dashboard' | 'profile' | 'attendance' | 'grades' | 'journal' | 'schedule' | 'tasks' | 'students' | 'notes' | 'lesson-plan';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<TabID>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // States for database entities
  const [teacher, setTeacher] = useState<Teacher>(DataService.getTeacherProfile());
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [journals, setJournals] = useState<JournalRecord[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load session from local storage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem("tp_session");
    if (savedSession) {
      try {
        setSession(JSON.parse(savedSession));
      } catch (e) {
        localStorage.removeItem("tp_session");
      }
    }
  }, []);

  // Sync data whenever session loads or is valid
  useEffect(() => {
    if (session) {
      setIsSyncing(true);
      // Async trigger full firebase merge & load
      DataService.syncAllDataFromFirebase().then(() => {
        setTeacher(DataService.getTeacherProfile());
        setStudents(DataService.getStudents());
        setAttendance(DataService.getAttendance());
        setGrades(DataService.getGrades());
        setJournals(DataService.getJournals());
        setSchedules(DataService.getSchedules());
        setTasks(DataService.getTasks());
        setNotes(DataService.getNotes());
        setLessonPlans(DataService.getLessonPlans());
        setIsSyncing(false);
      }).catch(err => {
        console.warn("Error background-syncing:", err);
        // Fallback to local storage instant load
        setStudents(DataService.getStudents());
        setAttendance(DataService.getAttendance());
        setGrades(DataService.getGrades());
        setJournals(DataService.getJournals());
        setSchedules(DataService.getSchedules());
        setTasks(DataService.getTasks());
        setNotes(DataService.getNotes());
        setLessonPlans(DataService.getLessonPlans());
        setIsSyncing(false);
      });
    }
  }, [session]);

  const handleLogin = (userSession: UserSession) => {
    setSession(userSession);
    localStorage.setItem("tp_session", JSON.stringify(userSession));
  };

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
      setSession(null);
      localStorage.removeItem("tp_session");
    }
  };

  // State update & atomic local+firestore sync triggers
  const handleSaveTeacher = (updated: Teacher) => {
    setTeacher(updated);
    DataService.saveTeacherProfile(updated);
  };

  const handleSaveStudents = (updated: Student[]) => {
    setStudents(updated);
    DataService.saveStudents(updated);
  };

  const handleSaveAttendance = (updated: AttendanceRecord[]) => {
    setAttendance(updated);
    DataService.saveAttendance(updated);
  };

  const handleSaveGrades = (updated: GradeRecord[]) => {
    setGrades(updated);
    DataService.saveGrades(updated);
  };

  const handleSaveJournals = (updated: JournalRecord[]) => {
    setJournals(updated);
    DataService.saveJournals(updated);
  };

  const handleSaveSchedules = (updated: ScheduleRecord[]) => {
    setSchedules(updated);
    DataService.saveSchedules(updated);
  };

  const handleSaveTasks = (updated: TaskRecord[]) => {
    setTasks(updated);
    DataService.saveTasks(updated);
  };

  const handleSaveNotes = (updated: NoteRecord[]) => {
    setNotes(updated);
    DataService.saveNotes(updated);
  };

  const handleSaveLessonPlans = (updated: LessonPlan[]) => {
    setLessonPlans(updated);
    DataService.saveLessonPlans(updated);
  };

  if (!session) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  // Sidebar items definition
  const menuItems = [
    { id: 'dashboard' as TabID, label: 'Beranda Dasbor', icon: LayoutDashboard },
    { id: 'profile' as TabID, label: 'Biodata Guru', icon: User },
    { id: 'attendance' as TabID, label: 'Absensi Siswa', icon: CheckSquare },
    { id: 'grades' as TabID, label: 'Buku Nilai', icon: GraduationCap },
    { id: 'journal' as TabID, label: 'Jurnal Harian', icon: FileSpreadsheet },
    { id: 'schedule' as TabID, label: 'Jadwal Pelajaran', icon: CalendarDays },
    { id: 'tasks' as TabID, label: 'Daftar Tugas', icon: CheckSquare2 },
    { id: 'students' as TabID, label: 'Data Kelas', icon: Users },
    { id: 'notes' as TabID, label: 'Catatan Guru', icon: FileEdit },
    { id: 'lesson-plan' as TabID, label: 'RPP AI Generator', icon: Sparkles, highlight: true },
  ];

  // Restrict Admin vs Guru actions if needed (both have full access by request, but UI highlights role)
  const isAdmin = session.role === "Admin";

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            teacher={teacher}
            students={students} 
            attendance={attendance} 
            journals={journals}
            tasks={tasks}
            schedules={schedules}
            onNavigate={(tab) => setActiveTab(tab as TabID)}
          />
        );
      case 'profile':
        return <Profile teacher={teacher} onSave={handleSaveTeacher} />;
      case 'attendance':
        return <Attendance students={students} attendance={attendance} onSave={handleSaveAttendance} teacher={teacher} />;
      case 'grades':
        return <Grades students={students} grades={grades} onSave={handleSaveGrades} />;
      case 'journal':
        return <Journal journals={journals} onSave={handleSaveJournals} />;
      case 'schedule':
        return <Schedule schedules={schedules} onSave={handleSaveSchedules} />;
      case 'tasks':
        return <Tasks tasks={tasks} onSave={handleSaveTasks} />;
      case 'students':
        return <Students students={students} onSave={handleSaveStudents} />;
      case 'notes':
        return <Notes notes={notes} onSave={handleSaveNotes} />;
      case 'lesson-plan':
        return <LessonPlannerAI lessonPlans={lessonPlans} onSavePlan={handleSaveLessonPlans} />;
      default:
        return <div className="text-white">Halaman tidak ditemukan.</div>;
    }
  };

  const activeMenuItem = menuItems.find(item => item.id === activeTab);

  return (
    <div id="main-applet-root" className="min-h-screen bg-slate-950 text-slate-100 flex font-sans overflow-x-hidden antialiased selection:bg-indigo-500/30 selection:text-white">
      {/* 1. Large Screen Left Sidebar */}
      <aside
        id="desktop-sidebar"
        className={`hidden md:flex flex-col shrink-0 border-r border-slate-900 bg-slate-900/60 backdrop-blur-xl transition-all duration-300 relative ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Header Branding */}
        <div className="h-16 flex items-center px-5 justify-between border-b border-slate-900">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-extrabold text-white shrink-0 shadow-lg shadow-indigo-600/25">
              T
            </div>
            {isSidebarOpen && (
              <span className="font-extrabold text-xs uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
                Teacher Planner
              </span>
            )}
          </div>
        </div>

        {/* User Mini-Profile */}
        {isSidebarOpen && (
          <div className="p-4 mx-3 my-4 bg-slate-950/40 rounded-2xl border border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center font-bold text-indigo-400">
                {teacher.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-slate-200 truncate">{teacher.name}</h4>
                <p className="text-[10px] text-indigo-400 font-mono font-bold mt-0.5">
                  {isAdmin ? "🔑 Administrator" : "🎓 Guru Pengajar"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 px-3 space-y-1 py-4 overflow-y-auto scrollbar-none">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                  isActive
                    ? item.highlight 
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/10" 
                      : "bg-slate-800 text-indigo-400 font-extrabold"
                    : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                }`}
              >
                <IconComponent className={`w-4.5 h-4.5 shrink-0 ${isActive && !item.highlight ? "text-indigo-400" : ""}`} />
                {isSidebarOpen && <span className="truncate">{item.label}</span>}
                {isSidebarOpen && item.highlight && (
                  <span className="absolute right-2 px-1.5 py-0.5 bg-indigo-500/20 border border-indigo-400/20 text-indigo-300 rounded font-bold text-[8px] tracking-wide uppercase animate-pulse">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout bottom block */}
        <div className="p-3 border-t border-slate-900">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/5 hover:text-rose-300 transition-all cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            {isSidebarOpen && <span>Keluar Sistem</span>}
          </button>
        </div>
      </aside>

      {/* 2. Mobile Floating Drawer Navigation Menu */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div id="mobile-drawer-overlay" className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop wrapper */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="absolute inset-0 bg-black"
            />

            {/* Content Drawer panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-full z-10 p-5"
            >
              <div className="space-y-6 flex-1">
                {/* Branding drawer top */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-black text-white">
                      T
                    </div>
                    <span className="font-extrabold text-xs uppercase tracking-widest text-slate-200">
                      Teacher Planner
                    </span>
                  </div>
                  <button onClick={() => setIsMobileDrawerOpen(false)} className="text-slate-400 hover:text-slate-200">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Profile panel */}
                <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-850 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center font-bold text-indigo-400">
                    {teacher.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-200 truncate">{teacher.name}</h4>
                    <p className="text-[9px] text-indigo-400 font-mono font-bold mt-0.5 uppercase">
                      {session.role}
                    </p>
                  </div>
                </div>

                {/* Navigation list */}
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileDrawerOpen(false);
                        }}
                        className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                          isActive
                            ? item.highlight
                              ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/10"
                              : "bg-slate-800 text-indigo-400"
                            : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                        }`}
                      >
                        <IconComponent className="w-4.5 h-4.5 shrink-0" />
                        <span>{item.label}</span>
                        {item.highlight && (
                          <span className="absolute right-2.5 px-1.5 py-0.5 bg-indigo-500/20 border border-indigo-400/20 text-indigo-300 rounded font-bold text-[8px] tracking-wide uppercase">
                            AI
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer bottom logout */}
              <div className="border-t border-slate-800 pt-4">
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/5 transition-all cursor-pointer"
                >
                  <LogOut className="w-4.5 h-4.5 shrink-0" />
                  <span>Keluar Sistem</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Main Workspace Area Container */}
      <div id="workspace-container" className="flex-1 flex flex-col min-w-0">
        {/* Workspace Toolbar Header */}
        <header id="workspace-header" className="h-16 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle for Desktop / Mobile */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:flex p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 rounded-xl transition-all"
              title="Perluas / Tutup Panel"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Burger Menu Button */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="flex md:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 rounded-xl transition-all"
              title="Menu Navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Current Active Tab Info Title */}
            <div className="flex items-center gap-2 ml-1">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono hidden sm:inline">Modul</span>
              <span className="text-xs text-slate-600 hidden sm:inline">/</span>
              <h2 className="text-sm font-extrabold text-slate-200">
                {activeMenuItem?.label}
              </h2>
            </div>
          </div>

          {/* Sync & Role badge indicator */}
          <div className="flex items-center gap-3">
            {/* Real-time sync badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] text-emerald-400 font-mono font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isSyncing ? "Menyinkronkan..." : "Cloud Terkoneksi"}</span>
            </div>

            {/* Quick Session Indicator */}
            <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-[10px] text-slate-400 font-mono font-bold uppercase hidden md:block">
              Role: {session.role}
            </div>
          </div>
        </header>

        {/* Dynamic Workspace Scroll Area */}
        <main id="workspace-main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderActiveTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
