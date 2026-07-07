import React, { useState } from "react";
import { ScheduleRecord } from "../types";
import { Plus, Trash2, Calendar, Clock, Save, X } from "lucide-react";
import { motion } from "motion/react";

interface ScheduleProps {
  schedules: ScheduleRecord[];
  onSave: (updatedSchedules: ScheduleRecord[]) => void;
}

export default function Schedule({ schedules, onSave }: ScheduleProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New entry fields
  const [day, setDay] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'>("Senin");
  const [timeSlot, setTimeSlot] = useState("07:30 - 09:00");
  const [className, setClassName] = useState("X-A");
  const [subject, setSubject] = useState("Informatika");
  const [color, setColor] = useState("indigo");

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeSlot || !subject) return;

    const newRecord: ScheduleRecord = {
      id: `sc_${Date.now()}`,
      day,
      timeSlot,
      className,
      subject,
      color
    };

    onSave([...schedules, newRecord]);
    setShowAddForm(false);
    setTimeSlot("07:30 - 09:00");
    alert("Jadwal mengajar baru berhasil ditambahkan!");
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus slot jadwal mengajar ini?")) {
      const updated = schedules.filter(s => s.id !== id);
      onSave(updated);
    }
  };

  // Days list
  const days: ('Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu')[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  // Color options
  const colorOptions = [
    { value: "indigo", label: "Indigo", bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20" },
    { value: "emerald", label: "Hijau", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" },
    { value: "violet", label: "Ungu", bg: "bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/20" },
    { value: "amber", label: "Kuning", bg: "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20" },
    { value: "rose", label: "Merah", bg: "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20" },
    { value: "sky", label: "Biru", bg: "bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20" },
  ];

  return (
    <div id="schedule-tab" className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Jadwal Mengajar Guru</h1>
          <p className="text-xs sm:text-sm text-slate-400">Atur dan pantau jadwal pelajaran mingguan di sekolah Anda.</p>
        </div>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Jam Mengajar
          </button>
        )}
      </div>

      {/* Pop-up Add Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" /> Tambah Slot Jadwal Mengajar
            </h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddSchedule} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {/* Day selection */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Hari</label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                >
                  {days.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Time slot input */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Waktu / Alokasi Jam</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 07:30 - 09:00"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Class input */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Kelas</label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="X-A">Kelas X-A</option>
                  <option value="XI-B">Kelas XI-B</option>
                </select>
              </div>

              {/* Subject input */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  placeholder="Informatika"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Color input */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Warna Tampilan</label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                >
                  {colorOptions.map(co => (
                    <option key={co.value} value={co.value}>{co.label}</option>
                  ))}
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
                <Save className="w-4 h-4" /> Simpan Jadwal
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Grid Weekly Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {days.map((dayName) => {
          const daySchedules = schedules.filter(s => s.day === dayName);
          return (
            <div key={dayName} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-4 shadow-sm">
              <div className="border-b border-slate-800 pb-2 text-center">
                <h3 className="font-bold text-slate-100">{dayName}</h3>
                <span className="text-[10px] text-slate-400">{daySchedules.length} Jam Mengajar</span>
              </div>

              <div className="space-y-3 flex-1">
                {daySchedules.length === 0 ? (
                  <p className="text-[10px] text-slate-600 text-center py-8 italic">Libur / Kosong</p>
                ) : (
                  daySchedules.map((sc) => {
                    const matchedColor = colorOptions.find(co => co.value === sc.color) || colorOptions[0];
                    return (
                      <div 
                        key={sc.id}
                        className={`p-3 rounded-xl border flex flex-col justify-between group relative transition-all ${matchedColor.bg}`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[9px] font-extrabold uppercase font-mono">Kelas {sc.className}</span>
                            <button
                              onClick={() => handleDeleteSchedule(sc.id)}
                              className="text-slate-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all absolute top-1 right-1 p-0.5"
                              title="Hapus"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <h4 className="text-xs font-bold truncate pr-3">{sc.subject}</h4>
                        </div>
                        <span className="text-[9px] font-mono mt-2 flex items-center gap-1 opacity-90">
                          <Clock className="w-3 h-3 shrink-0" /> {sc.timeSlot}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
