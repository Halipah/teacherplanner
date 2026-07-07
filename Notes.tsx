import React, { useState } from "react";
import { NoteRecord } from "../types";
import { Plus, Trash2, Pin, Search, Sparkles, X, Check } from "lucide-react";
import { motion } from "motion/react";

interface NotesProps {
  notes: NoteRecord[];
  onSave: (updatedNotes: NoteRecord[]) => void;
}

export default function Notes({ notes, onSave }: NotesProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // New note fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("bg-yellow-500/10 text-yellow-300 border-yellow-500/20");

  const colors = [
    { name: "Kuning", value: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20 hover:bg-yellow-500/20" },
    { name: "Biru", value: "bg-sky-500/10 text-sky-300 border-sky-500/20 hover:bg-sky-500/20" },
    { name: "Hijau", value: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20" },
    { name: "Ungu", value: "bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20" },
    { name: "Merah", value: "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20" },
  ];

  // Filter notes based on search query
  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate pinned vs unpinned
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newNote: NoteRecord = {
      id: `not_${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      date: new Date().toISOString().split('T')[0],
      color,
      isPinned: false
    };

    onSave([newNote, ...notes]);
    setShowAddForm(false);
    setTitle("");
    setContent("");
    alert("Catatan guru berhasil dibuat!");
  };

  const handleDeleteNote = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus catatan guru ini?")) {
      const updated = notes.filter(n => n.id !== id);
      onSave(updated);
    }
  };

  const handleTogglePin = (id: string) => {
    const updated = notes.map(n => {
      if (n.id === id) {
        return { ...n, isPinned: !n.isPinned };
      }
      return n;
    });
    onSave(updated);
  };

  return (
    <div id="notes-tab" className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Catatan Pribadi Guru</h1>
          <p className="text-xs sm:text-sm text-slate-400">Pusat corat-coret ide, bahan evaluasi non-formal, serta catatan refleksi mengajar harian.</p>
        </div>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tulis Catatan Baru
          </button>
        )}
      </div>

      {/* Pop-up note writer */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Tulis Catatan Guru Baru
            </h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddNote} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Judul Catatan</label>
              <input
                type="text"
                required
                placeholder="Contoh: Rencana Kuis Mandiri"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Isi Catatan</label>
              <textarea
                required
                rows={4}
                placeholder="Tulis ide, rangkuman rapat, atau catatan khusus tentang kelas di sini..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
              />
            </div>

            {/* Color selection circles */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Pilih Label Warna</label>
              <div className="flex gap-2">
                {colors.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`px-3 py-1.5 border rounded-xl text-[11px] font-bold transition-all ${c.value} ${
                      color === c.value ? "ring-2 ring-indigo-500 scale-105" : ""
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Simpan Catatan
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Search and Filters */}
      {!showAddForm && (
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Cari kata kunci di judul atau isi catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-all"
          />
        </div>
      )}

      {/* Notes Masonry / Grid */}
      {!showAddForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedNotes.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl col-span-full">
              <Plus className="w-12 h-12 text-slate-600 mx-auto mb-4 cursor-pointer" onClick={() => setShowAddForm(true)} />
              <h2 className="text-lg font-bold text-slate-200">Belum ada catatan tertulis</h2>
              <p className="text-slate-400 text-xs mt-1">Gunakan catatan personal untuk merencanakan coretan ide mengajar Anda.</p>
            </div>
          ) : (
            sortedNotes.map((note) => {
              // Extract style classes from color configuration, keeping safety fallback
              const colorStyle = note.color || "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
              return (
                <div 
                  key={note.id}
                  className={`border rounded-2xl p-5 flex flex-col justify-between group transition-all relative ${colorStyle}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2.5">
                      <h3 className="text-sm font-black font-sans leading-snug line-clamp-2">{note.title}</h3>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all absolute top-2 right-2">
                        <button
                          onClick={() => handleTogglePin(note.id)}
                          className={`p-1 hover:bg-slate-800/40 rounded transition-all ${
                            note.isPinned ? "text-amber-400" : "text-slate-400"
                          }`}
                          title={note.isPinned ? "Lepas Pin" : "Sematkan di Atas"}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 rounded transition-all"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Sticky Pin indicator when not hovered */}
                      {note.isPinned && (
                        <span className="p-0.5 text-amber-400 shrink-0 group-hover:hidden" title="Semat">
                          <Pin className="w-3.5 h-3.5 fill-current" />
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs font-sans whitespace-pre-line leading-relaxed line-clamp-6 opacity-90">{note.content}</p>
                  </div>

                  <span className="text-[9px] font-mono mt-4 block text-right opacity-60">Dibuat: {note.date}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
