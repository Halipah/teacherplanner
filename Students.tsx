import React, { useState, useMemo } from "react";
import { Student } from "../types";
import { Plus, Edit2, Trash2, Users, Search, Download, Upload, Check, X, Save } from "lucide-react";
import { motion } from "motion/react";

interface StudentsProps {
  students: Student[];
  onSave: (updatedStudents: Student[]) => void;
}

export default function Students({ students, onSave }: StudentsProps) {
  const [selectedClass, setSelectedClass] = useState("X-A");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [nisn, setNisn] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<'L' | 'P'>("L");
  const [className, setClassName] = useState("X-A");

  const classes = useMemo(() => Array.from(new Set(students.map(s => s.className))), [students]);

  // Filter students based on selected class and search query
  const filteredStudents = useMemo(() => {
    return students.filter(st => 
      st.className === selectedClass &&
      (st.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       st.nisn.includes(searchQuery))
    );
  }, [students, selectedClass, searchQuery]);

  const resetForm = () => {
    setNisn("");
    setName("");
    setGender("L");
    setClassName(selectedClass);
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEditClick = (st: Student) => {
    setEditingId(st.id);
    setNisn(st.nisn);
    setName(st.name);
    setGender(st.gender);
    setClassName(st.className);
    setShowAddForm(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data murid ini? Menghapus murid juga akan menyulitkan pencocokan data absensi/nilai.")) {
      const updated = students.filter(s => s.id !== id);
      onSave(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nisn.trim()) return;

    const record: Student = {
      id: editingId || `std_${Date.now()}`,
      nisn: nisn.trim(),
      name: name.trim(),
      gender,
      className
    };

    let updated: Student[];
    if (editingId) {
      updated = students.map(s => s.id === editingId ? record : s);
    } else {
      updated = [...students, record];
    }

    onSave(updated);
    resetForm();
    alert("Data siswa berhasil disimpan!");
  };

  // Export roster as JSON backup
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(students, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Data_Siswa_TeacherPlanner_${selectedClass}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].nisn) {
            onSave(parsed);
            alert("Roster kelas berhasil diimpor secara utuh!");
          } else {
            alert("Format file salah. Harus berupa array JSON Data Siswa.");
          }
        } catch (error) {
          alert("Gagal membaca file JSON.");
        }
      };
    }
  };

  return (
    <div id="students-tab" className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Daftar Siswa per Kelas</h1>
          <p className="text-xs sm:text-sm text-slate-400">Atur database murid, tambahkan siswa baru, serta ekspor-impor database dengan mudah.</p>
        </div>

        <div className="flex gap-2">
          <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-700">
            <Upload className="w-4 h-4" /> Impor Roster
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>
          <button
            onClick={handleExportData}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700"
          >
            <Download className="w-4 h-4" /> Ekspor Roster
          </button>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah Siswa Baru
            </button>
          )}
        </div>
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
              <Users className="w-4 h-4 text-indigo-400" /> 
              {editingId ? `Edit Data Siswa: ${name}` : "Pendaftaran Siswa Baru"}
            </h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nomor NISN Siswa</label>
              <input
                type="text"
                required
                placeholder="10 digit NISN"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nama Lengkap Siswa</label>
              <input
                type="text"
                required
                placeholder="Nama murid"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Jenis Kelamin</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="L">Laki-Laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Masuk Roster Kelas</label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="X-A">Kelas X-A</option>
                <option value="XI-B">Kelas XI-B</option>
                <option value="XII-C">Kelas XII-C</option>
              </select>
            </div>

            <div className="sm:col-span-4 flex justify-end gap-3 pt-3 border-t border-slate-800">
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
                <Save className="w-4 h-4" /> Simpan Siswa
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Class Switcher and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          {classes.map(cl => (
            <button
              key={cl}
              onClick={() => setSelectedClass(cl)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedClass === cl 
                  ? "bg-indigo-600 text-white" 
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              Roster Kelas {cl}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Cari NISN atau nama murid..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-all"
          />
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-300 border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold text-center w-12">No</th>
                <th className="p-3.5 font-semibold w-36">NISN</th>
                <th className="p-3.5 font-semibold">Nama Lengkap</th>
                <th className="p-3.5 font-semibold text-center w-24">Gender</th>
                <th className="p-3.5 font-semibold text-center w-24">Kelas</th>
                <th className="p-3.5 font-semibold text-center w-28">Aksi Pengurus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    Tidak ada siswa terdaftar di kelas {selectedClass} dengan filter pencarian tersebut.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-slate-950/20 transition-all">
                    <td className="p-3.5 text-center text-slate-500">{idx + 1}</td>
                    <td className="p-3.5 font-mono text-slate-300 font-bold">{st.nisn}</td>
                    <td className="p-3.5 font-medium text-slate-100">{st.name}</td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded font-bold text-[10px] ${
                        st.gender === "L" ? "bg-sky-500/10 text-sky-400" : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {st.gender === "L" ? "Laki-Laki (L)" : "Perempuan (P)"}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-bold text-slate-300">{st.className}</td>
                    <td className="p-3.5 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(st)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg transition-all"
                          title="Edit Profil"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(st.id)}
                          className="p-1.5 bg-slate-800/80 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 rounded-lg transition-all"
                          title="Hapus Murid"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
