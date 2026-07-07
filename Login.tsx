import React, { useState } from "react";
import { UserSession } from "../types";
import { Lock, User, Key, CheckCircle, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

interface LoginProps {
  onLoginSuccess: (session: UserSession) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "guru">("guru");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate standard role authentication
    setTimeout(() => {
      setLoading(false);
      if (role === "admin") {
        if (username.toLowerCase() === "admin" && password === "admin123") {
          onLoginSuccess({
            role: "admin",
            name: "Super Administrator"
          });
        } else {
          setError("Username atau Password Admin salah! (Gunakan admin / admin123)");
        }
      } else {
        if (username.toLowerCase() === "guru" && password === "guru123") {
          onLoginSuccess({
            role: "guru",
            teacherId: "teacher_01",
            name: "Rizka Halipah, S.Pd."
          });
        } else {
          setError("Username atau Password Guru salah! (Gunakan guru / guru123)");
        }
      }
    }, 600);
  };

  const handleQuickLogin = (selectedRole: "admin" | "guru") => {
    setRole(selectedRole);
    if (selectedRole === "admin") {
      setUsername("admin");
      setPassword("admin123");
    } else {
      setUsername("guru");
      setPassword("guru123");
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-slate-900 flex items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Decorative background grid and ambient glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500 rounded-full filter blur-[120px] opacity-20 animate-pulse" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500 rounded-full filter blur-[120px] opacity-15" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20 mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Teacher Planner</h1>
          <p className="text-slate-400 text-sm mt-1">Aplikasi Manajemen Pembelajaran & Administrasi Guru</p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => { setRole("guru"); setUsername(""); setPassword(""); setError(""); }}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              role === "guru" 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Guru (User)
          </button>
          <button
            type="button"
            onClick={() => { setRole("admin"); setUsername(""); setPassword(""); setError(""); }}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              role === "admin" 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={role === "admin" ? "admin" : "guru"}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Key className="w-5 h-5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-400"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 active:scale-[0.98] disabled:opacity-50 text-sm mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>

        {/* Quick Testing Box */}
        <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
          <p className="text-xs text-slate-400 mb-3">Klik tombol di bawah untuk login cepat (Fasilitas Demo):</p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handleQuickLogin("guru")}
              className="py-1.5 px-3 bg-slate-900 border border-slate-700/50 hover:bg-slate-950 hover:border-indigo-500 text-xs text-slate-300 font-medium rounded-lg transition-all flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Demo Guru (User)
            </button>
            <button
              onClick={() => handleQuickLogin("admin")}
              className="py-1.5 px-3 bg-slate-900 border border-slate-700/50 hover:bg-slate-950 hover:border-indigo-500 text-xs text-slate-300 font-medium rounded-lg transition-all flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5 text-indigo-400" /> Demo Admin
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
