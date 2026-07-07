import React, { useState } from "react";
import { LessonPlan } from "../types";
import { Sparkles, Copy, Save, FileText, CheckCircle2, History, RotateCcw, X } from "lucide-react";
import { motion } from "motion/react";

interface LessonPlannerAIProps {
  lessonPlans: LessonPlan[];
  onSavePlan: (updatedPlans: LessonPlan[]) => void;
}

export default function LessonPlannerAI({ lessonPlans, onSavePlan }: LessonPlannerAIProps) {
  // Input fields state
  const [subject, setSubject] = useState("Informatika");
  const [topic, setTopic] = useState("");
  const [className, setClassName] = useState("Kelas X-A");
  const [duration, setDuration] = useState("2 x 45 Menit");
  const [curriculum, setCurriculum] = useState<'Kurikulum Merdeka' | 'K-13'>("Kurikulum Merdeka");

  // Output generated state
  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);
  
  const [activeTab, setActiveTab] = useState<"generate" | "history">("generate");
  const [selectedHistoryPlan, setSelectedHistoryPlan] = useState<LessonPlan | null>(null);

  // Loading encouraging messages loop
  const loadingPhrases = [
    "Menghubungkan ke AI Gemini...",
    "Merancang tujuan pembelajaran sesuai kurikulum...",
    "Merumuskan elemen Profil Pelajar Pancasila...",
    "Menyusun langkah pembelajaran aktif (sintaks PBL)...",
    "Merancang rubrik asesmen formatif dan sumatif...",
    "Membuat lembar kerja peserta didik (LKPD) mandiri..."
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert("Harap masukkan topik/materi pokok terlebih dahulu.");
      return;
    }

    setLoading(true);
    setGeneratedContent("");
    setPlanSaved(false);
    
    // Cycle loading messages
    let msgIndex = 0;
    setLoadingMessage(loadingPhrases[0]);
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingPhrases.length;
      setLoadingMessage(loadingPhrases[msgIndex]);
    }, 2500);

    try {
      const response = await fetch("/api/gemini/generate-lesson-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          subject,
          className,
          duration,
          curriculum
        })
      });

      const data = await response.json();
      clearInterval(interval);

      if (response.ok && data.content) {
        setGeneratedContent(data.content);
      } else {
        throw new Error(data.error || "Gagal menghasilkan Rencana Pembelajaran.");
      }
    } catch (error: any) {
      clearInterval(interval);
      console.error("AI RPP Error:", error);
      alert(`Gagal membuat RPP AI: ${error.message || "Periksa koneksi Anda dan pastikan Secrets sudah diset."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent || selectedHistoryPlan?.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToLibrary = () => {
    if (!generatedContent) return;

    const newPlan: LessonPlan = {
      id: `lp_${Date.now()}`,
      topic,
      subject,
      className,
      duration,
      curriculum,
      content: generatedContent,
      createdAt: new Date().toISOString().split("T")[0]
    };

    onSavePlan([newPlan, ...lessonPlans]);
    setPlanSaved(true);
    alert("Sukses! Modul Ajar/RPP berhasil disimpan ke tab 'Riwayat RPP'.");
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Apakah Anda yakin ingin menghapus RPP ini dari riwayat pustaka?")) {
      const updated = lessonPlans.filter(p => p.id !== id);
      onSavePlan(updated);
      if (selectedHistoryPlan?.id === id) {
        setSelectedHistoryPlan(null);
      }
    }
  };

  return (
    <div id="ai-planner-tab" className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" /> AI Modul Ajar & RPP Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">Rancang Rencana Pembelajaran (RPP) formal berstandar nasional / Kurikulum Merdeka secara otomatis menggunakan kecerdasan buatan.</p>
        </div>

        {/* Tab switchers */}
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => { setActiveTab("generate"); setSelectedHistoryPlan(null); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "generate" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Generator RPP AI
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "history" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <History className="w-3.5 h-3.5" /> Riwayat RPP ({lessonPlans.length})
          </button>
        </div>
      </div>

      {activeTab === "generate" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 h-fit">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" /> Parameter Perancangan RPP
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Curriculum selector */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Kurikulum Sasaran</label>
                <div className="grid grid-cols-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurriculum("Kurikulum Merdeka")}
                    className={`py-1.5 px-3 rounded-lg text-[11px] font-bold transition-all ${
                      curriculum === "Kurikulum Merdeka" 
                        ? "bg-indigo-600 text-white shadow" 
                        : "text-slate-400"
                    }`}
                  >
                    K. Merdeka
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurriculum("K-13")}
                    className={`py-1.5 px-3 rounded-lg text-[11px] font-bold transition-all ${
                      curriculum === "K-13" 
                        ? "bg-indigo-600 text-white shadow" 
                        : "text-slate-400"
                    }`}
                  >
                    K-13 (Nasional)
                  </button>
                </div>
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
                  placeholder="Informatika, Bahasa Inggris, dll."
                />
              </div>

              {/* Topic */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Topik / Materi Pokok Pembelajaran</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  placeholder="Contoh: Algoritma Pencarian & Sorting"
                />
              </div>

              {/* Class */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Kelas / Sasaran Siswa</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  placeholder="Contoh: Kelas X Semester 1"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Alokasi Waktu</label>
                <input
                  type="text"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="Contoh: 2 x 45 Menit"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/15 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    Menyusun RPP...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Rancang RPP dengan AI
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Generated View Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between min-h-[460px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 my-auto">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <Sparkles className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-slate-200">Kecerdasan Buatan Sedang Bekerja</h3>
                <p className="text-xs text-indigo-400 font-mono animate-bounce max-w-sm">{loadingMessage}</p>
              </div>
            ) : generatedContent ? (
              <div className="space-y-4 h-full flex flex-col justify-between">
                {/* Options panel */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                    DRAFT RPP / MODUL AJAR BERHASIL DIRANCANG
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold flex items-center gap-1"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Tersalin!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Salin Teks
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleSaveToLibrary}
                      disabled={planSaved}
                      className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/25 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 rounded-lg text-[10px] font-bold flex items-center gap-1 disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {planSaved ? "Tersimpan" : "Simpan ke Pustaka"}
                    </button>
                  </div>
                </div>

                {/* Main Content box - beautifully styled document view */}
                <div className="p-5 bg-slate-950/40 border border-slate-800/80 rounded-2xl overflow-y-auto max-h-[480px] font-sans text-xs text-slate-300 leading-relaxed space-y-4 scrollbar-thin">
                  <div className="whitespace-pre-wrap text-left font-sans text-sm pr-2 selection:bg-indigo-500/30">
                    {generatedContent}
                  </div>
                </div>

                {planSaved && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-400 mt-3">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>RPP ini berhasil ditambahkan ke pustaka riwayat Anda. Anda dapat melihat, menyalin, atau menghapusnya kapan saja.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center my-auto">
                <Sparkles className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="text-base font-bold text-slate-200">Hasil Rencana Pelaksanaan Pembelajaran (RPP)</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Isi parameter di samping dan klik tombol "Rancang RPP dengan AI" untuk mulai merancang modul ajar Kurikulum Merdeka atau K-13 secara instan.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* History Tab RPP */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* History plans list */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 h-[480px] overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-800 pb-2">Pustaka Modul Ajar Tersimpan</h3>
            {lessonPlans.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-12 italic">Belum ada RPP disimpan.</p>
            ) : (
              lessonPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedHistoryPlan(plan)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex justify-between items-start gap-3 ${
                    selectedHistoryPlan?.id === plan.id 
                      ? "bg-indigo-600/10 border-indigo-500" 
                      : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase">{plan.curriculum}</span>
                    <h4 className="text-xs font-bold text-slate-200 truncate mt-0.5">{plan.topic}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{plan.subject} • {plan.className}</p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteHistory(plan.id, e)}
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 rounded transition-all shrink-0"
                    title="Hapus RPP"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* History Details View box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between min-h-[460px]">
            {selectedHistoryPlan ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono uppercase">{selectedHistoryPlan.curriculum}</span>
                    <h3 className="text-sm font-black text-slate-100 mt-1">{selectedHistoryPlan.topic}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Tersalin!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Salin RPP
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-5 bg-slate-950/40 border border-slate-800/80 rounded-2xl overflow-y-auto max-h-[400px] text-xs text-slate-300 leading-relaxed font-sans space-y-4">
                  <div className="whitespace-pre-wrap text-left font-sans text-sm selection:bg-indigo-500/30 pr-2">
                    {selectedHistoryPlan.content}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center my-auto">
                <FileText className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="text-base font-bold text-slate-200">Detail Pustaka RPP</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Pilih salah satu draft RPP yang tersimpan di sebelah kiri untuk melihat rincian rencana kegiatan belajar secara lengkap.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
