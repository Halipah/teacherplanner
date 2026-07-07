import React, { useState, useMemo } from "react";
import { Student, GradeRecord, GradeType } from "../types";
import { Plus, Save, BookOpen, AlertTriangle, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface GradesProps {
  students: Student[];
  grades: GradeRecord[];
  onSave: (updatedGrades: GradeRecord[]) => void;
}

export default function Grades({ students, grades, onSave }: GradesProps) {
  const [selectedClass, setSelectedClass] = useState("X-A");
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<GradeType>("Tugas");

  // State for creating new assessment
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAssessmentName, setNewAssessmentName] = useState("");
  const [newAssessmentDate, setNewAssessmentDate] = useState("2026-07-07");

  // State for editing grades in bulk
  const [bulkEditScores, setBulkEditScores] = useState<{ [studentId: string]: number }>({});
  const [activeAssessment, setActiveAssessment] = useState<string>("");

  // Get distinct list of classes
  const classes = useMemo(() => Array.from(new Set(students.map(s => s.className))), [students]);

  // Filter students in selected class
  const classStudents = useMemo(() => {
    return students.filter(s => s.className === selectedClass);
  }, [students, selectedClass]);

  // Find all distinct assessment names for the selected filter
  const assessments = useMemo(() => {
    const filtered = grades.filter(g => 
      g.className === selectedClass && 
      g.semester === selectedSemester && 
      g.type === selectedType
    );
    return Array.from(new Set(filtered.map(g => g.assessmentName)));
  }, [grades, selectedClass, selectedSemester, selectedType]);

  // If no active assessment is selected, default to the first one available
  React.useEffect(() => {
    if (assessments.length > 0 && !assessments.includes(activeAssessment)) {
      setActiveAssessment(assessments[0]);
    } else if (assessments.length === 0) {
      setActiveAssessment("");
    }
  }, [assessments, activeAssessment]);

  // Load scores for bulk editing when activeAssessment changes
  React.useEffect(() => {
    if (activeAssessment) {
      const scores: { [studentId: string]: number } = {};
      classStudents.forEach(st => {
        const record = grades.find(g => 
          g.studentId === st.id && 
          g.assessmentName === activeAssessment && 
          g.className === selectedClass &&
          g.type === selectedType &&
          g.semester === selectedSemester
        );
        scores[st.id] = record ? record.score : 80; // Default to 80 for new fields
      });
      setBulkEditScores(scores);
    }
  }, [activeAssessment, classStudents, grades, selectedClass, selectedType, selectedSemester]);

  // Handle saving the edited scores
  const handleSaveScores = () => {
    if (!activeAssessment) return;
    const updatedGrades = [...grades];

    classStudents.forEach(st => {
      const scoreValue = Math.min(100, Math.max(0, Number(bulkEditScores[st.id] || 0)));
      const existingIndex = updatedGrades.findIndex(g => 
        g.studentId === st.id && 
        g.assessmentName === activeAssessment && 
        g.className === selectedClass &&
        g.type === selectedType &&
        g.semester === selectedSemester
      );

      const record: GradeRecord = {
        id: `grd_${st.id}_${activeAssessment.replace(/\s+/g, "_")}`,
        studentId: st.id,
        studentName: st.name,
        className: selectedClass,
        semester: selectedSemester,
        type: selectedType,
        assessmentName: activeAssessment,
        score: scoreValue,
        date: newAssessmentDate
      };

      if (existingIndex >= 0) {
        updatedGrades[existingIndex] = record;
      } else {
        updatedGrades.push(record);
      }
    });

    onSave(updatedGrades);
    alert(`Sukses! Nilai untuk Asesmen "${activeAssessment}" berhasil disimpan.`);
  };

  // Create a brand new assessment
  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssessmentName.trim()) return;

    const name = newAssessmentName.trim();
    if (assessments.includes(name)) {
      alert("Nama asesmen sudah ada!");
      return;
    }

    // Prepare default grades for all class students
    const updatedGrades = [...grades];
    classStudents.forEach(st => {
      updatedGrades.push({
        id: `grd_${st.id}_${name.replace(/\s+/g, "_")}`,
        studentId: st.id,
        studentName: st.name,
        className: selectedClass,
        semester: selectedSemester,
        type: selectedType,
        assessmentName: name,
        score: 80, // Default passing mark seed
        date: newAssessmentDate
      });
    });

    onSave(updatedGrades);
    setActiveAssessment(name);
    setNewAssessmentName("");
    setShowAddForm(false);
    alert(`Asesmen "${name}" berhasil dibuat. Silakan sesuaikan nilai masing-masing siswa.`);
  };

  const scoreStats = useMemo(() => {
    if (!activeAssessment) return { avg: 0, min: 0, max: 0, countBelowKkm: 0 };
    const classScores = classStudents.map(st => {
      const record = grades.find(g => 
        g.studentId === st.id && 
        g.assessmentName === activeAssessment &&
        g.className === selectedClass &&
        g.type === selectedType &&
        g.semester === selectedSemester
      );
      return record ? record.score : 80;
    });

    if (classScores.length === 0) return { avg: 0, min: 0, max: 0, countBelowKkm: 0 };
    const total = classScores.reduce((sum, s) => sum + s, 0);
    const avg = Math.round(total / classScores.length);
    const min = Math.min(...classScores);
    const max = Math.max(...classScores);
    const countBelowKkm = classScores.filter(s => s < 75).length; // KKM is 75

    return { avg, min, max, countBelowKkm };
  }, [classStudents, grades, activeAssessment, selectedClass, selectedType, selectedSemester]);

  return (
    <div id="grades-tab" className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Buku Nilai Siswa</h1>
          <p className="text-xs sm:text-sm text-slate-400">Rekam nilai harian, UTS, UAS, dan pantau performa akademis murid.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Buat Asesmen / Tugas Baru
        </button>
      </div>

      {/* Pop-up Add Assessment Form */}
      {showAddForm && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-xl"
        >
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-400" /> Buat Kolom Asesmen Baru (Kelas {selectedClass} • {selectedType})
          </h3>
          <form onSubmit={handleCreateAssessment} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nama Asesmen/Tugas</label>
              <input
                type="text"
                required
                placeholder="Contoh: Ulangan Harian Bab 1, Tugas Esai"
                value={newAssessmentName}
                onChange={(e) => setNewAssessmentName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Tanggal Pelaksanaan</label>
              <input
                type="date"
                required
                value={newAssessmentDate}
                onChange={(e) => setNewAssessmentDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                Buat Kolom Nilai
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                Batal
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Selectors and KPI Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Pilih Kelas</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
          >
            {classes.map(cl => (
              <option key={cl} value={cl}>Kelas {cl}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Pilih Semester</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(parseInt(e.target.value) as 1 | 2)}
            className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value={1}>Semester 1 (Ganjil)</option>
            <option value={2}>Semester 2 (Genap)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Kategori Nilai</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as GradeType)}
            className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="Tugas">Tugas / PR</option>
            <option value="UH">Ulangan Harian (UH)</option>
            <option value="UTS">Ujian Tengah Semester (UTS)</option>
            <option value="UAS">Ujian Akhir Semester (UAS)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Pilih Asesmen Terdaftar</label>
          <select
            value={activeAssessment}
            disabled={assessments.length === 0}
            onChange={(e) => setActiveAssessment(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          >
            {assessments.length === 0 ? (
              <option value="">Belum ada asesmen dibuat</option>
            ) : (
              assessments.map(asm => (
                <option key={asm} value={asm}>{asm}</option>
              ))
            )}
          </select>
        </div>
      </div>

      {activeAssessment ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Grade Sheet Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-400" /> Kolom Input Nilai: {activeAssessment}
              </h3>
              <span className="text-xs font-mono text-slate-400">Target KKM: 75</span>
            </div>

            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-300 border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="p-3 font-semibold text-center w-12">No</th>
                    <th className="p-3 font-semibold">Nama Siswa</th>
                    <th className="p-3 font-semibold text-center w-28">Nilai Asesmen (0-100)</th>
                    <th className="p-3 font-semibold text-center w-28">Status Kelulusan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {classStudents.map((st, idx) => {
                    const val = bulkEditScores[st.id] !== undefined ? bulkEditScores[st.id] : 80;
                    const isBelowKkm = val < 75;

                    return (
                      <tr key={st.id} className="hover:bg-slate-950/20 transition-all">
                        <td className="p-3 text-center text-slate-500">{idx + 1}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-200">{st.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">NISN {st.nisn}</div>
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={val}
                            onChange={(e) => {
                              const s = parseInt(e.target.value) || 0;
                              setBulkEditScores(prev => ({ ...prev, [st.id]: s }));
                            }}
                            className={`w-20 px-2 py-1 bg-slate-950/60 border rounded-lg text-center font-bold text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                              isBelowKkm ? "text-rose-400 border-rose-500/40 bg-rose-500/5" : "text-emerald-400 border-emerald-500/40 bg-emerald-500/5"
                            }`}
                          />
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded font-bold text-[10px] ${
                            isBelowKkm ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"
                          }`}>
                            {isBelowKkm ? "REMEDIAL ( < 75 )" : "TUNTAS ( KKM )"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={handleSaveScores}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Simpan Perubahan Nilai
              </button>
            </div>
          </div>

          {/* Quick Analytics Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Analisis Hasil Kelas
              </h3>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800">
                  <div className="text-2xl font-black text-indigo-400">{scoreStats.avg}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">Rata-Rata Kelas</div>
                </div>
                <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800">
                  <div className="text-2xl font-black text-emerald-400">{scoreStats.max}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">Nilai Tertinggi</div>
                </div>
                <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800">
                  <div className="text-2xl font-black text-amber-500">{scoreStats.min}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">Nilai Terendah</div>
                </div>
                <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800">
                  <div className="text-2xl font-black text-rose-400">{scoreStats.countBelowKkm}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">Siswa Remedial</div>
                </div>
              </div>

              {scoreStats.countBelowKkm > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2 text-xs text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Sebanyak {scoreStats.countBelowKkm} siswa belum tuntas KKM (75). Kami sarankan untuk menjadwalkan program Remedial Pengajaran khusus.
                  </span>
                </div>
              )}
            </div>

            {/* Custom SVG Distribution Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Sebaran Nilai Siswa</h4>
              <p className="text-[10px] text-slate-400">Jumlah siswa per kelompok rentang nilai</p>

              {/* Simple distribution logic */}
              {(() => {
                const scores = classStudents.map(st => bulkEditScores[st.id] || 80);
                const r1 = scores.filter(s => s < 75).length; // < 75
                const r2 = scores.filter(s => s >= 75 && s < 85).length; // 75 - 84
                const r3 = scores.filter(s => s >= 85 && s <= 100).length; // 85 - 100
                const maxCount = Math.max(r1, r2, r3, 1);

                return (
                  <div className="space-y-3 pt-2">
                    {/* Range <75 */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Kurang ( &lt;75 )</span>
                        <span className="font-bold text-rose-400">{r1} Siswa</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div style={{ width: `${(r1/maxCount)*100}%` }} className="bg-rose-500 h-full rounded-full" />
                      </div>
                    </div>
                    {/* Range 75-84 */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Cukup ( 75 - 84 )</span>
                        <span className="font-bold text-indigo-400">{r2} Siswa</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div style={{ width: `${(r2/maxCount)*100}%` }} className="bg-indigo-500 h-full rounded-full" />
                      </div>
                    </div>
                    {/* Range 85-100 */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Sangat Baik ( 85 - 100 )</span>
                        <span className="font-bold text-emerald-400">{r3} Siswa</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div style={{ width: `${(r3/maxCount)*100}%` }} className="bg-emerald-500 h-full rounded-full" />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-200">Tidak ada Asesmen/Tugas yang dipilih</h2>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            Gunakan filter di atas untuk melihat nilai, atau klik "Buat Asesmen/Tugas Baru" untuk mulai mencatat.
          </p>
        </div>
      )}
    </div>
  );
}
