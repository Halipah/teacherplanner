import React, { useState, useMemo } from "react";
import { Student, AttendanceRecord, AttendanceStatus, Teacher } from "../types";
import { Calendar, Download, Plus, CheckCircle, HelpCircle, Edit3, Trash2, Save } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface AttendanceProps {
  students: Student[];
  attendance: AttendanceRecord[];
  onSave: (updatedRecords: AttendanceRecord[]) => void;
  teacher: Teacher;
}

export default function Attendance({ students, attendance, onSave, teacher }: AttendanceProps) {
  const [selectedClass, setSelectedClass] = useState("X-A");
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [selectedMonth, setSelectedMonth] = useState("2026-07"); // YYYY-MM
  const [selectedDate, setSelectedDate] = useState("2026-07-07"); // for daily logging
  
  const [activeView, setActiveView] = useState<"summary" | "input">("summary");

  // Get distinct list of classes
  const classes = useMemo(() => Array.from(new Set(students.map(s => s.className))), [students]);

  // Filter students by selected class
  const classStudents = useMemo(() => {
    return students.filter(s => s.className === selectedClass);
  }, [students, selectedClass]);

  // List of dates in selected month for the calendar view
  const daysInMonth = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split("-");
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const dateCount = new Date(year, month, 0).getDate();
    return Array.from({ length: dateCount }, (_, i) => {
      const dayNum = i + 1;
      const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
      return `${selectedMonth}-${dayStr}`;
    });
  }, [selectedMonth]);

  // Handle cycle through H -> S -> I -> A -> H in cell clicks
  const handleCellClick = (studentId: string, studentName: string, date: string) => {
    const existing = attendance.find(a => a.studentId === studentId && a.date === date);
    let nextStatus: AttendanceStatus = "H";
    
    if (existing) {
      if (existing.status === "H") nextStatus = "S";
      else if (existing.status === "S") nextStatus = "I";
      else if (existing.status === "I") nextStatus = "A";
      else if (existing.status === "A") nextStatus = "H";
    }

    const newRecord: AttendanceRecord = {
      id: existing?.id || `att_${studentId}_${date.replace(/-/g, "")}`,
      studentId,
      studentName,
      className: selectedClass,
      date,
      status: nextStatus,
      semester: selectedSemester,
      month: selectedMonth
    };

    let updatedRecords: AttendanceRecord[];
    if (existing) {
      updatedRecords = attendance.map(a => a.id === existing.id ? newRecord : a);
    } else {
      updatedRecords = [...attendance, newRecord];
    }
    onSave(updatedRecords);
  };

  // Quick helper to fetch record for a student on a specific date
  const getRecordStatus = (studentId: string, date: string): AttendanceStatus | "-" => {
    const record = attendance.find(a => a.studentId === studentId && a.date === date);
    return record ? record.status : "-";
  };

  // Calculate monthly stats per student
  const studentRecap = useMemo(() => {
    return classStudents.map(student => {
      const studentMonthAtt = attendance.filter(a => 
        a.studentId === student.id && 
        a.month === selectedMonth && 
        a.semester === selectedSemester
      );

      const H = studentMonthAtt.filter(a => a.status === "H").length;
      const S = studentMonthAtt.filter(a => a.status === "S").length;
      const I = studentMonthAtt.filter(a => a.status === "I").length;
      const A = studentMonthAtt.filter(a => a.status === "A").length;
      const total = H + S + I + A;
      const rate = total > 0 ? Math.round((H / total) * 100) : 100;

      return {
        student,
        H, S, I, A, total, rate
      };
    });
  }, [classStudents, attendance, selectedMonth, selectedSemester]);

  // DAILY INPUT SHEET LOGIC
  const [dailyForm, setDailyForm] = useState<{ [studentId: string]: AttendanceStatus }>({});

  // Initialize Daily Form for selected date
  const initDailyForm = () => {
    const form: { [studentId: string]: AttendanceStatus } = {};
    classStudents.forEach(st => {
      const record = attendance.find(a => a.studentId === st.id && a.date === selectedDate);
      form[st.id] = record ? record.status : "H"; // Default is 'H' (Hadir)
    });
    setDailyForm(form);
  };

  React.useEffect(() => {
    initDailyForm();
  }, [selectedDate, selectedClass, students, attendance]);

  const handleDailyStatusChange = (studentId: string, status: AttendanceStatus) => {
    setDailyForm(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveDaily = () => {
    const updatedRecords = [...attendance];
    
    classStudents.forEach(st => {
      const existingIndex = updatedRecords.findIndex(a => a.studentId === st.id && a.date === selectedDate);
      const newRecord: AttendanceRecord = {
        id: `att_${st.id}_${selectedDate.replace(/-/g, "")}`,
        studentId: st.id,
        studentName: st.name,
        className: selectedClass,
        date: selectedDate,
        status: dailyForm[st.id] || "H",
        semester: selectedSemester,
        month: selectedDate.substring(0, 7)
      };

      if (existingIndex >= 0) {
        updatedRecords[existingIndex] = newRecord;
      } else {
        updatedRecords.push(newRecord);
      }
    });

    onSave(updatedRecords);
    alert(`Sukses! Absensi harian Kelas ${selectedClass} tanggal ${selectedDate} berhasil disimpan.`);
  };

  // --- PDF EXPORT FUNCTION ---
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Format date / Indonesian Months
      const indoMonths: { [key: string]: string } = {
        "01": "Januari", "02": "Februari", "03": "Maret", "04": "April", "05": "Mei", "06": "Juni",
        "07": "Juli", "08": "Agustus", "09": "September", "10": "Oktober", "11": "November", "12": "Desember"
      };
      const [year, monthNum] = selectedMonth.split("-");
      const monthName = indoMonths[monthNum] || monthNum;

      // Header Formal
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("REKAPITULASI ABSENSI SISWA BULANAN", 105, 15, { align: "center" });
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`${teacher.school || "SMA Negeri 1 Harapan"}`, 105, 21, { align: "center" });
      doc.text(`Tahun Pelajaran: ${teacher.academicYear || "2026/2027"}`, 105, 26, { align: "center" });
      doc.line(15, 29, 195, 29); // divider line

      // Teacher metadata info
      doc.setFontSize(9.5);
      doc.text(`Nama Guru: ${teacher.name}`, 15, 36);
      doc.text(`NIP: ${teacher.nip || "-"}`, 15, 41);
      doc.text(`Mata Pelajaran: ${teacher.subject}`, 15, 46);

      doc.text(`Kelas: ${selectedClass}`, 145, 36);
      doc.text(`Semester: ${selectedSemester}`, 145, 41);
      doc.text(`Bulan: ${monthName} ${year}`, 145, 46);

      // Table Headers and Body
      const headers = [["No", "NISN", "Nama Siswa", "Hadir (H)", "Sakit (S)", "Izin (I)", "Alpa (A)", "Rasio (%)"]];
      
      const body = studentRecap.map((item, idx) => [
        (idx + 1).toString(),
        item.student.nisn,
        item.student.name,
        item.H.toString(),
        item.S.toString(),
        item.I.toString(),
        item.A.toString(),
        `${item.rate}%`
      ]);

      // Draw PDF Table
      (doc as any).autoTable({
        startY: 52,
        head: headers,
        body: body,
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229], halign: "center" }, // indigo colors
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 25, halign: "center" },
          2: { cellWidth: 65 },
          3: { cellWidth: 20, halign: "center" },
          4: { cellWidth: 20, halign: "center" },
          5: { cellWidth: 20, halign: "center" },
          6: { cellWidth: 20, halign: "center" },
          7: { cellWidth: 20, halign: "center" }
        },
        styles: { fontSize: 9, cellPadding: 2 }
      });

      // Signatures
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      
      doc.setFontSize(9);
      doc.text("Mengetahui,", 15, finalY);
      doc.text("Kepala Sekolah", 15, finalY + 5);
      doc.text("_________________________", 15, finalY + 25);

      doc.text(`Kota Harapan, 31 ${monthName} ${year}`, 140, finalY);
      doc.text("Guru Mata Pelajaran", 140, finalY + 5);
      doc.text(`${teacher.name}`, 140, finalY + 25);
      doc.setFont("helvetica", "normal");
      doc.text(`NIP. ${teacher.nip || "-"}`, 140, finalY + 29);

      // Save file
      doc.save(`Rekap_Absensi_${selectedClass}_${monthName}_${year}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Gagal mengunduh PDF. Silakan periksa kembali data.");
    }
  };

  return (
    <div id="attendance-tab" className="space-y-6 font-sans">
      {/* Header and Controller bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Presensi & Absensi Siswa</h1>
          <p className="text-xs sm:text-sm text-slate-400">Pilih kelas, semester, dan kelola laporan presensi harian atau bulanan siswa.</p>
        </div>

        {/* View toggler */}
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveView("summary")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === "summary" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Laporan Rekap Bulanan
          </button>
          <button
            onClick={() => setActiveView("input")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === "input" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Input Harian
          </button>
        </div>
      </div>

      {/* Selector Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        {/* Class selector */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Pilih Kelas</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
          >
            {classes.map(cl => (
              <option key={cl} value={cl}>Kelas {cl}</option>
            ))}
          </select>
        </div>

        {/* Semester selector */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Pilih Semester</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(parseInt(e.target.value) as 1 | 2)}
            className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-220 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value={1}>Semester 1 (Ganjil)</option>
            <option value={2}>Semester 2 (Genap)</option>
          </select>
        </div>

        {/* Month selector for Monthly Summary */}
        {activeView === "summary" && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Pilih Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            >
              {selectedSemester === 1 ? (
                <>
                  <option value="2026-07">Juli 2026</option>
                  <option value="2026-08">Agustus 2026</option>
                  <option value="2026-09">September 2026</option>
                  <option value="2026-10">Oktober 2026</option>
                  <option value="2026-11">November 2026</option>
                  <option value="2026-12">Desember 2026</option>
                </>
              ) : (
                <>
                  <option value="2027-01">Januari 2027</option>
                  <option value="2027-02">Februari 2027</option>
                  <option value="2027-03">Maret 2027</option>
                  <option value="2027-04">April 2027</option>
                  <option value="2027-05">Mei 2027</option>
                  <option value="2027-06">Juni 2027</option>
                </>
              )}
            </select>
          </div>
        )}

        {/* Date Selector for Daily Input */}
        {activeView === "input" && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Pilih Tanggal</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-end">
          {activeView === "summary" ? (
            <button
              onClick={handleExportPDF}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" /> Unduh Laporan PDF
            </button>
          ) : (
            <button
              onClick={handleSaveDaily}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" /> Simpan Absen Hari Ini
            </button>
          )}
        </div>
      </div>

      {/* --- RENDER VIEW 1: SUMMARY GRID & RECAPITULATION --- */}
      {activeView === "summary" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {/* Quick Guide */}
          <div className="p-4 bg-slate-950/30 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1"><HelpCircle className="w-4 h-4 text-indigo-400" /> Petunjuk: Klik sel tanggal di grid untuk mengubah absensi dengan cepat (Siklus: Hadir H → Sakit S → Izin I → Alpa A)</span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1 font-bold text-emerald-400">● H: Hadir</span>
              <span className="flex items-center gap-1 font-bold text-blue-400">● S: Sakit</span>
              <span className="flex items-center gap-1 font-bold text-amber-500">● I: Izin</span>
              <span className="flex items-center gap-1 font-bold text-rose-500">● A: Alpa</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="p-3 font-semibold text-center w-10">No</th>
                  <th className="p-3 font-semibold">Nama Siswa</th>
                  <th className="p-3 font-semibold text-center w-12 border-r border-slate-800">H</th>
                  <th className="p-3 font-semibold text-center w-12 border-r border-slate-800">S</th>
                  <th className="p-3 font-semibold text-center w-12 border-r border-slate-800">I</th>
                  <th className="p-3 font-semibold text-center w-12 border-r border-slate-800">A</th>
                  <th className="p-3 font-semibold text-center w-16 border-r border-slate-800 bg-slate-950/90 font-bold">Rasio</th>
                  {/* Select first 10 days of the month to keep the layout compact and super responsive inside the iframe */}
                  {daysInMonth.slice(0, 10).map(day => (
                    <th key={day} className="p-2 text-center w-8 font-mono font-medium text-slate-400">
                      {day.slice(-2)}
                    </th>
                  ))}
                  <th className="p-2 text-slate-500 text-[10px] text-center italic">Hari lainnya ...</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {studentRecap.map((recap, idx) => (
                  <tr key={recap.student.id} className="hover:bg-slate-950/25 transition-all">
                    <td className="p-3 text-center text-slate-500">{idx + 1}</td>
                    <td className="p-3 font-medium text-slate-200">
                      <div>{recap.student.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">{recap.student.nisn}</div>
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-400 border-r border-slate-800 bg-emerald-500/5">{recap.H}</td>
                    <td className="p-3 text-center font-bold text-blue-400 border-r border-slate-800 bg-blue-500/5">{recap.S}</td>
                    <td className="p-3 text-center font-bold text-amber-500 border-r border-slate-800 bg-amber-500/5">{recap.I}</td>
                    <td className="p-3 text-center font-bold text-rose-500 border-r border-slate-800 bg-rose-500/5">{recap.A}</td>
                    <td className="p-3 text-center border-r border-slate-800 font-bold font-mono bg-slate-950/40 text-slate-100">
                      {recap.rate}%
                    </td>
                    {daysInMonth.slice(0, 10).map(day => {
                      const status = getRecordStatus(recap.student.id, day);
                      return (
                        <td 
                          key={day} 
                          onClick={() => handleCellClick(recap.student.id, recap.student.name, day)}
                          className="p-1 text-center font-bold font-mono cursor-pointer transition-all hover:bg-slate-800 border border-slate-800/30"
                        >
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded ${
                            status === "H" ? "bg-emerald-500/10 text-emerald-400" :
                            status === "S" ? "bg-blue-500/10 text-blue-400" :
                            status === "I" ? "bg-amber-500/10 text-amber-500" :
                            status === "A" ? "bg-rose-500/10 text-rose-500" :
                            "text-slate-600 bg-slate-950/20"
                          }`}>
                            {status}
                          </span>
                        </td>
                      );
                    })}
                    <td className="p-2 text-center text-[10px] text-slate-600 italic">Klik input harian untuk isi lengkap</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- RENDER VIEW 2: DAILY INPUT FORM --- */}
      {activeView === "input" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" /> Lembar Pengisian Harian Kelas {selectedClass} • Tanggal {selectedDate}
            </h3>
            <span className="text-xs text-slate-400 font-mono">Presensi Default: Hadir (H)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classStudents.map((st, idx) => {
              const currentStatus = dailyForm[st.id] || "H";
              return (
                <div 
                  key={st.id}
                  className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/80 hover:border-slate-700/60 transition-all"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-mono text-slate-500">{String(idx + 1).padStart(2, "0")}. NISN {st.nisn}</span>
                    <h4 className="text-sm font-bold text-slate-200 truncate">{st.name}</h4>
                  </div>

                  {/* Status Toggle buttons */}
                  <div className="flex gap-1.5 shrink-0">
                    {(["H", "S", "I", "A"] as AttendanceStatus[]).map(stSymbol => (
                      <button
                        key={stSymbol}
                        type="button"
                        onClick={() => handleDailyStatusChange(st.id, stSymbol)}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                          currentStatus === stSymbol 
                            ? stSymbol === "H" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10" :
                              stSymbol === "S" ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" :
                              stSymbol === "I" ? "bg-amber-600 text-white shadow-md shadow-amber-600/10" :
                              "bg-rose-600 text-white shadow-md shadow-rose-600/10"
                            : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                        }`}
                      >
                        {stSymbol}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={handleSaveDaily}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all shadow-md shadow-emerald-600/10 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" /> Simpan Laporan Presensi Hari Ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
