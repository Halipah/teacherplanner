import React, { useState, useMemo } from "react";
import { TaskRecord } from "../types";
import { Plus, Check, Clock, AlertCircle, Trash2, Calendar, ClipboardList } from "lucide-react";
import { motion } from "motion/react";

interface TasksProps {
  tasks: TaskRecord[];
  onSave: (updatedTasks: TaskRecord[]) => void;
}

export default function Tasks({ tasks, onSave }: TasksProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("2026-07-07");
  const [priority, setPriority] = useState<'Rendah' | 'Sedang' | 'Tinggi'>("Sedang");
  const [category, setCategory] = useState<'Koreksi' | 'Materi' | 'Administrasi' | 'Lainnya'>("Materi");

  const [activeFilter, setActiveFilter] = useState<"semua" | "belum" | "selesai">("belum");

  // Calculate stats
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === "Selesai").length;
  const incompleteCount = tasks.filter(t => t.status === "Belum").length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (activeFilter === "belum") return t.status === "Belum";
      if (activeFilter === "selesai") return t.status === "Selesai";
      return true;
    });
  }, [tasks, activeFilter]);

  const handleToggleStatus = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === "Belum" ? "Selesai" as const : "Belum" as const };
      }
      return t;
    });
    onSave(updated);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus agenda tugas ini?")) {
      const updated = tasks.filter(t => t.id !== id);
      onSave(updated);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: TaskRecord = {
      id: `tsk_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
      status: "Belum",
      category
    };

    onSave([newTask, ...tasks]);
    setShowAddForm(false);
    setTitle("");
    setDescription("");
    alert("Tugas baru berhasil ditambahkan!");
  };

  return (
    <div id="tasks-tab" className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Daftar Agenda & Tugas Guru</h1>
          <p className="text-xs sm:text-sm text-slate-400">Atur tenggat waktu penyelesaian berkas ujian, koreksi siswa, dan administrasi mandiri.</p>
        </div>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Agenda Tugas
          </button>
        )}
      </div>

      {/* Progress Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1 text-center sm:text-left w-full sm:w-auto">
          <h2 className="text-base font-bold text-slate-200">Progress Agenda Kerja</h2>
          <p className="text-xs text-slate-400">Menyelesaikan {completedCount} dari {totalCount} total tugas administrasi guru.</p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-80">
          <div className="flex-1 bg-slate-950 h-3 rounded-full overflow-hidden">
            <div 
              style={{ width: `${completionPercentage}%` }} 
              className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
            />
          </div>
          <span className="text-sm font-bold text-indigo-400 font-mono shrink-0">{completionPercentage}%</span>
        </div>
      </div>

      {/* Pop-up Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-indigo-400" /> Tambah Tugas & Agenda Baru
            </h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-200">
              <Plus className="w-4 h-4 rotate-45" />
            </button>
          </div>

          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Judul Tugas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Koreksi UTS Ganjil Kelas X"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Deskripsi Singkat</label>
                <input
                  type="text"
                  placeholder="Koreksi 10 esai logika pemrograman"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Tanggal Batas Akhir (Tempo)</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Prioritas</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="Rendah">Rendah (Hijau)</option>
                  <option value="Sedang">Sedang (Kuning)</option>
                  <option value="Tinggi">Tinggi (Merah)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Kategori Kegiatan</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="Materi">Bahan Ajar / Materi</option>
                  <option value="Koreksi">Koreksi Nilai Siswa</option>
                  <option value="Administrasi">Administrasi Kurikulum</option>
                  <option value="Lainnya">Lain-Lain</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                Tambah Agenda
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filters and List */}
      <div className="space-y-4">
        {/* Filters Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          {(["belum", "selesai", "semua"] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all ${
                activeFilter === f 
                  ? "bg-slate-800 text-indigo-400 font-extrabold" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {f === "belum" ? `Belum Selesai (${incompleteCount})` : 
               f === "selesai" ? `Selesai (${completedCount})` : `Semua (${totalCount})`}
            </button>
          ))}
        </div>

        {/* Task cards list */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
            <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-200">Tidak ada agenda tugas ditemukan</h2>
            <p className="text-slate-400 text-xs mt-1">Anda bebas hari ini! Klik "Tambah Agenda Tugas" untuk membuat catatan kerja.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((tsk) => {
              const isCompleted = tsk.status === "Selesai";
              return (
                <div 
                  key={tsk.id}
                  className={`bg-slate-900 border rounded-2xl p-4.5 flex gap-4 items-start justify-between transition-all ${
                    isCompleted ? "border-slate-800/50 opacity-60" : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex gap-3 items-start min-w-0">
                    {/* Checkbox button */}
                    <button
                      onClick={() => handleToggleStatus(tsk.id)}
                      className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isCompleted 
                          ? "bg-indigo-600 border-indigo-600 text-white" 
                          : "border-slate-700 hover:border-indigo-500"
                      }`}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="min-w-0">
                      <h3 className={`text-sm font-bold truncate ${
                        isCompleted ? "text-slate-500 line-through" : "text-slate-200"
                      }`}>
                        {tsk.title}
                      </h3>
                      {tsk.description && (
                        <p className={`text-xs mt-0.5 line-clamp-1 ${
                          isCompleted ? "text-slate-600" : "text-slate-400"
                        }`}>
                          {tsk.description}
                        </p>
                      )}

                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-2 mt-3 text-[10px] font-semibold">
                        <span className="bg-slate-950/60 text-slate-400 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {tsk.dueDate}
                        </span>
                        <span className="bg-slate-950/60 text-indigo-400 px-2 py-0.5 rounded uppercase font-mono">
                          {tsk.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded ${
                          tsk.priority === "Tinggi" ? "bg-rose-500/10 text-rose-400" :
                          tsk.priority === "Sedang" ? "bg-amber-500/10 text-amber-400" :
                          "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {tsk.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(tsk.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 shrink-0 self-start hover:bg-rose-500/5 rounded transition-all"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
