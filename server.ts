import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry User-Agent
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini SDK initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Gemini SDK:", error);
  }
} else {
  console.warn("GEMINI_API_KEY is not set in environment variables. AI features will fail gracefully.");
}

// --- API ENDPOINTS ---

// Check API status
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    aiInitialized: !!ai,
    firebaseProjectId: "genuine-ellipse-dnn32"
  });
});

// Endpoint for generating Lesson Plan (RPP) using Gemini
app.post("/api/gemini/generate-lesson-plan", async (req, res) => {
  if (!ai) {
    return res.status(503).json({ 
      error: "AI service is currently unavailable. Please verify that GEMINI_API_KEY is set in your Secrets panel." 
    });
  }

  const { topic, subject, className, duration, curriculum } = req.body;

  if (!topic || !subject) {
    return res.status(400).json({ error: "Mata pelajaran dan Topik/Materi wajib diisi." });
  }

  try {
    const systemPrompt = `Anda adalah asisten AI ahli pendidikan dan kurikulum di Indonesia. 
Tugas Anda adalah membuat Rencana Pelaksanaan Pembelajaran (RPP) / Modul Ajar yang sangat profesional, terstruktur, mendalam, dan siap digunakan oleh guru di sekolah dasar/menengah.
Gunakan bahasa Indonesia yang baku, sopan, dan inspiratif. Format output harus menggunakan Markdown yang rapi dengan pembagian heading, list, dan tabel jika diperlukan.`;

    const userPrompt = `Buatlah Rencana Pelaksanaan Pembelajaran (RPP) / Modul Ajar lengkap berdasarkan informasi berikut:
- **Kurikulum**: ${curriculum || "Kurikulum Merdeka"}
- **Mata Pelajaran**: ${subject}
- **Topik/Materi**: ${topic}
- **Kelas/Semester**: ${className || "Umum"}
- **Alokasi Waktu**: ${duration || "2 x 45 Menit"}

Struktur RPP harus mencakup:
1. **Identitas Modul** (Nama Sekolah, Mata Pelajaran, Kelas, Alokasi Waktu, Kurikulum, dll.)
2. **Tujuan Pembelajaran** (sesuai konsep ABCD: Audience, Behavior, Condition, Degree / KKTP)
3. **Kompetensi Awal & Profil Pelajar Pancasila** (jika Kurikulum Merdeka)
4. **Sarana & Prasarana** serta Media Pembelajaran yang diusulkan
5. **Kegiatan Pembelajaran (Skenario Utama)**:
   - **Kegiatan Pendahuluan** (Apersepsi, Motivasi, Pemetaan Kemampuan) - Berikan menitnya.
   - **Kegiatan Inti** (Gunakan metode pembelajaran aktif, misalnya PBL, Project-Based Learning, Discovery Learning, atau Cooperative Learning) - Berikan menit dan langkah sintaksnya.
   - **Kegiatan Penutup** (Refleksi, Kesimpulan, Tindak Lanjut/PR singkat) - Berikan menitnya.
6. **Asesmen/Penilaian**:
   - Diagnostik (sebelum belajar)
   - Formatif (selama proses, misalnya observasi/kuis)
   - Sumatif (akhir materi, berupa tes tertulis/produk)
7. **Refleksi Guru dan Refleksi Siswa** (berupa pertanyaan pemandu)
8. **Lembar Kerja Peserta Didik (LKPD) Singkat** (berupa 3-5 pertanyaan latihan aplikatif untuk siswa)

Buatlah RPP ini sejelas dan sepraktis mungkin agar guru bisa langsung menyalin dan menerapkannya di kelas.`;

    console.log(`Generating lesson plan for topic: ${topic}, subject: ${subject}`);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response received from Gemini model.");
    }

    res.json({ content: resultText });
  } catch (error: any) {
    console.error("Gemini lesson plan generation failed:", error);
    res.status(500).json({ 
      error: "Gagal membuat RPP menggunakan AI.",
      details: error.message || error 
    });
  }
});

// Endpoint for daily journal AI helper (Reflections, lesson ideas)
app.post("/api/gemini/suggest-journal-reflection", async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "AI service is currently unavailable." });
  }

  const { topic, subject, activities, notes } = req.body;

  if (!topic || !activities) {
    return res.status(400).json({ error: "Topik dan Kegiatan wajib diisi untuk membuat refleksi." });
  }

  try {
    const prompt = `Saya adalah seorang guru yang baru saja mengajar kelas. Berikut adalah jurnal singkat saya:
- **Mata Pelajaran**: ${subject || "Umum"}
- **Topik/Materi**: ${topic}
- **Kegiatan**: ${activities}
- **Hambatan/Catatan Guru**: ${notes || "Tidak ada hambatan berarti"}

Berdasarkan data di atas, tolong berikan analisis singkat (2-3 paragraf) yang mencakup:
1. **Evaluasi Keberhasilan**: Apa yang kemungkinan besar berjalan baik dari kegiatan tersebut.
2. **Saran Refleksi**: Rekomendasi konkret atau solusi praktis untuk mengatasi hambatan tersebut pada pertemuan selanjutnya.
3. **Ide Tindak Lanjut**: Satu aktivitas menyenangkan/kuis kilat untuk me-refresh ingatan siswa sebelum bab baru.

Gunakan bahasa Indonesia yang suportif, profesional, dan membangkitkan semangat keguruan.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    res.json({ reflection: response.text });
  } catch (error: any) {
    console.error("Gemini reflection suggestion failed:", error);
    res.status(500).json({ error: "Gagal membuat saran refleksi AI.", details: error.message || error });
  }
});

// --- VITE MIDDLEWARE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
