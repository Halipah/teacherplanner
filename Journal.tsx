import React, { useState } from "react";
import { JournalRecord } from "../types";
import { Plus, Edit2, Trash2, Calendar, FileText, Sparkles, Save, X, Search, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface JournalProps {
  journals: JournalRecord[];
  onSave: (updatedJournals: JournalRecord[]) => void;
}

export default function Journal({ journals, onSave }: JournalProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields State
  const [date, setDate] = useState("2026-07-07");
  const [timeSlot, setTimeSlot] = useState("Jam ke-1-2 (07:30 - 09:00)");
  const [className, setClassName] = useState("X-A");
  const [subject, setSubject] = useState("Informatika");
  const [topic, setTopic] = useState("");
  const [activities, setActivities] = useState("");
  const [notes, setNotes] = useState("");
  const [reflection, setReflection] = useState("");

  const [aiLoading, setAiLoading] = useState(false);

  // Filter journals based on search query (topic/activities/class)
  const filteredJournals = journals.filter(j => 
    j.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.activities.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setDate("2026-07-07");
    setTimeSlot("Jam ke-1-2 (07:30 - 09:00)");
    setClassName("X-A");
    setSubject("Informatika");
    setTopic("");
    setActivities("");
    setNotes("");
    setReflection("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (jrn: JournalRecord) => {
    setEditingId(jrn.id);
    setDate(jrn.date);
    setTimeSlot(jrn.timeSlot);
    setClassName(jrn.className);
    setSubject(jrn.subject);
    setTopic(jrn.topic);
    setActivities(jrn.activities);
    setNotes(jrn.notes);
    setReflection(jrn.reflection);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus jurnal harian ini?")) {
      const updated = journals.filter(j => j.id !== id);
      onSave(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !activities.trim()) {
      alert("Topik dan Kegiatan wajib diisi!");
      return;
    }

    const record: JournalRecord = {
      id: editingId || `jrn_${Date.now()}`,
      date,
      timeSlot,
      className,
      subject,
      topic: topic.trim(),
      activities: activities.trim(),
      notes: notes.trim(),
      reflection: reflection.trim()
    };

    let updated: JournalRecord[];
    if (editingId) {
      updated = journals.map(j => j.id === editingId ? record : j);
    } else {
      updated = [record, ...journals];
    }

    onSave(updated);
    resetForm();
    alert("Jurnal harian mengajar berhasil disimpan!");
  };

  // Call Gemini Backend API for AI Reflection Helper
  const handleGetAiReflection = async () => {
    if (!topic.trim() || !activities.trim()) {
      alert("Harap isi bidang 'Materi Pembelajaran' dan 'Kegiatan Pembelajaran' terlebih dahulu agar AI memahami konteks kelas Anda.");
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch("/api/gemini/suggest-journal-reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          subject,
          activities,
          notes
        })
      });

      const data = await response.json();
      if (response.ok && data.reflection) {
        setReflection(data.reflection);
      } else {
        throw new Error(data.error || "Gagal mendapatkan respons AI.");
      }
    } catch (error: any) {
      console.error("AI Reflection Error:", error);
      alert(`Gagal membuat refleksi otomatis: ${error.message || "Pastikan API Key sudah diset di Secrets."}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div id="journal-tab" className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Jurnal Harian Mengajar</h1>
          <p className="text-xs sm:text-sm text-slate-400">Catat seluruh agenda, aktivitas pembelajaran, refleksi mandiri, dan kendala mengajar guru di kelas.</p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tulis Jurnal Baru
          </button>
        )}
      </div>

      {/* Tulis/Edit Form */}
      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" /> 
              {editingId ? "Edit Jurnal Harian Mengajar" : "Tulis Jurnal Harian Mengajar Baru"}
            </h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Date */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Tanggal</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Time slot */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Jam Ke</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="Jam ke-1-2 (07:30 - 09:00)">Jam ke-1-2 (07:30 - 09:00)</option>
                  <option value="Jam ke-3-4 (09:15 - 10:45)">Jam ke-3-4 (09:15 - 10:45)</option>
                  <option value="Jam ke-5-6 (11:00 - 12:30)">Jam ke-5-6 (11:00 - 12:30)</option>
                  <option value="Jam ke-7-8 (13:00 - 14:30)">Jam ke-7-8 (13:00 - 14:30)</option>
                  <option value="Jam ke-9-10 (14:45 - 16:15)">Jam ke-9-10 (14:45 - 16:15)</option>
                </select>
              </div>

              {/* Class */}
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

              {/* Subject */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  placeholder="Contoh: Informatika, B. Inggris"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Topic */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Topik / Materi Pokok</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  placeholder="Contoh: Logika Algoritma & Flowchart"
                />
              </div>

              {/* Notes / Obstacles */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Hambatan / Catatan Khusus Siswa (Opsional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  placeholder="Contoh: Budi belum paham looping, laptop lab error 2 unit"
                />
              </div>
            </div>

            {/* Activities */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Kegiatan / Skenario Pembelajaran yang Dilaksanakan</label>
              <textarea
                required
                rows={3}
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
                placeholder="Tuliskan runtutan kegiatan dari pembukaan, penyampaian materi, latihan mandiri/kelompok, hingga penutupan pelajaran..."
              />
            </div>

            {/* Reflection with AI Helper */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1">
                  Refleksi / Rencana Tindak Lanjut Guru (RTL)
                </label>
                <button
                  type="button"
                  onClick={handleGetAiReflection}
                  disabled={aiLoading}
                  className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-500 hover:to-indigo-600 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow cursor-pointer disabled:opacity-50"
                >
                  {aiLoading ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                      Menganalisis...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                      Bantu Tulis Refleksi dengan AI Gemini
                    </>
                  )}
                </button>
              </div>
              <textarea
                rows={4}
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
                placeholder="Tulis refleksi mandiri Anda, atau klik tombol di atas untuk mendapat rekomendasi solusi reflektif & tindak lanjut pembelajaran secara otomatis dari AI..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Simpan Jurnal
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Search Filter */}
      {!showForm && (
        <div className="flex gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Cari materi jurnal, kelas, atau aktivitas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-all"
            />
          </div>
        </div>
      )}

      {/* List / History Cards of Journal */}
      {!showForm && (
        <div className="space-y-4">
          {filteredJournals.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-200">Belum ada catatan jurnal harian</h2>
              <p className="text-slate-400 text-xs mt-1">Klik "Tulis Jurnal Baru" untuk mencatat kegiatan mengajar harian Anda.</p>
            </div>
          ) : (
            filteredJournals.map((jrn) => (
              <div 
                key={jrn.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/30 transition-all flex flex-col md:flex-row gap-5 justify-between items-start"
              >
                <div className="space-y-3 flex-1">
                  {/* Badge Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      {jrn.date}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                      Kelas {jrn.className}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 font-mono">
                      {jrn.timeSlot}
                    </span>
                  </div>

                  {/* Main contents */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-100">{jrn.topic}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{jrn.subject}</p>
                  </div>

                  <div className="space-y-2 border-t border-slate-800/80 pt-3 text-xs leading-relaxed">
                    <div>
                      <h4 className="font-bold text-indigo-400">Kegiatan Mengajar:</h4>
                      <p className="text-slate-300 mt-0.5">{jrn.activities}</p>
                    </div>

                    {jrn.notes && (
                      <div>
                        <h4 className="font-bold text-rose-400">Kendala & Catatan Khusus:</h4>
                        <p className="text-slate-300 mt-0.5">{jrn.notes}</p>
                      </div>
                    )}

                    {jrn.reflection && (
                      <div className="bg-indigo-950/20 border border-indigo-500/10 p-3 rounded-xl mt-2">
                        <h4 className="font-semibold text-amber-300 flex items-center gap-1 text-[11px]">
                          <Sparkles className="w-3.5 h-3.5" /> Refleksi Guru & Tindak Lanjut:
                        </h4>
                        <p className="text-slate-300 mt-1 whitespace-pre-line text-xs font-sans leading-relaxed">{jrn.reflection}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit / Delete actions */}
                <div className="flex gap-2 shrink-0 md:self-start self-end pt-2 md:pt-0">
                  <button
                    onClick={() => handleEditClick(jrn)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
                    title="Edit Jurnal"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(jrn.id)}
                    className="p-2 bg-slate-800/80 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 rounded-lg transition-all"
                    title="Hapus Jurnal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
