import React, { useState } from "react";
import { Teacher } from "../types";
import { User, Award, School, Mail, Phone, Calendar, Save, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface ProfileProps {
  teacher: Teacher;
  onSave: (updated: Teacher) => void;
}

export default function Profile({ teacher, onSave }: ProfileProps) {
  const [name, setName] = useState(teacher.name);
  const [nip, setNip] = useState(teacher.nip);
  const [subject, setSubject] = useState(teacher.subject);
  const [school, setSchool] = useState(teacher.school);
  const [email, setEmail] = useState(teacher.email);
  const [phone, setPhone] = useState(teacher.phone);
  const [academicYear, setAcademicYear] = useState(teacher.academicYear);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);

    const updatedTeacher: Teacher = {
      ...teacher,
      name,
      nip,
      subject,
      school,
      email,
      phone,
      academicYear
    };

    onSave(updatedTeacher);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div id="profile-tab" className="max-w-3xl mx-auto space-y-6 font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Biodata Guru</h1>
          <p className="text-xs sm:text-sm text-slate-400">Atur informasi profil dan data administrasi kepegawaian Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Avatar & Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full filter blur-[80px] opacity-10" />
          
          <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center text-white text-3xl font-bold border border-indigo-500/30 shadow-lg mb-4">
            {name.split(" ").map(n => n[0]).filter((_, i) => i < 2).join("")}
          </div>

          <h2 className="text-lg font-bold text-slate-100">{name}</h2>
          <p className="text-xs text-indigo-400 font-mono mt-1">{nip ? `NIP. ${nip}` : "NIP belum diisi"}</p>
          
          <div className="w-full mt-6 pt-6 border-t border-slate-800 space-y-3 text-left text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Mata Pelajaran:</span>
              <span className="text-slate-300 font-medium text-right">{subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Sekolah:</span>
              <span className="text-slate-300 font-medium text-right">{school}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tahun Ajaran:</span>
              <span className="text-indigo-400 font-bold text-right">{academicYear}</span>
            </div>
          </div>
        </div>

        {/* Right Card: Detailed Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" /> Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm transition-all"
                  placeholder="Nama lengkap beserta gelar akademik"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-400" /> Nomor Induk Pegawai (NIP)
                </label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm transition-all"
                  placeholder="NIP. 19xxxxxxxxxxxxxx"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-400" /> Fokus Mata Pelajaran
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm transition-all"
                  placeholder="Contoh: Informatika, Bahasa Inggris"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-indigo-400" /> Satuan Pendidikan (Sekolah)
                </label>
                <input
                  type="text"
                  required
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm transition-all"
                  placeholder="Nama instansi sekolah"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" /> Alamat Email Resmi
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm transition-all"
                  placeholder="alamat@sekolah.sch.id"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" /> Nomor Telepon / WA
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm transition-all"
                  placeholder="0812-xxxx-xxxx"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Tahun Pelajaran Aktif
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm transition-all"
              >
                <option value="2025/2026">2025/2026</option>
                <option value="2026/2027">2026/2027</option>
                <option value="2027/2028">2027/2028</option>
              </select>
            </div>

            {saved && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-400"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Biodata guru berhasil diperbarui dan disimpan secara aman.</span>
              </motion.div>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-md shadow-indigo-600/15 text-sm flex items-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Save className="w-4 h-4" /> Simpan Profil Guru
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
