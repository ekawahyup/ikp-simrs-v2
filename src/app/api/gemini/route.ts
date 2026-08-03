import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini SDK
// Jika API key tidak ada, kita akan mem-bypass dengan mock data agar tidak error saat didemokan
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { kronologi } = await req.json();

    if (!kronologi) {
      return NextResponse.json({ error: 'Kronologi tidak boleh kosong' }, { status: 400 });
    }

    // Jika API Key belum diisi atau masih berupa dummy teks
    if (!apiKey || apiKey.includes('ISI_DENGAN_API_KEY')) {
      console.log("Mocking AI response (No valid API Key detected)");
      // Jeda 2 detik untuk mensimulasikan pemrosesan AI
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return NextResponse.json({
        kategori: "KPC (Kejadian Potensial Cedera)",
        grading: "KUNING",
        alasan_grading: "Terdapat potensi cedera sedang jika tidak segera ditangani, namun belum mengenai pasien secara langsung.",
        ringkasan: "Pelapor menemukan potensi bahaya berdasarkan kronologi yang disebutkan, yang memerlukan perbaikan sistem.",
        whys: [
          "Mengapa kejadian ini bisa terjadi di ruangan tersebut?",
          "Mengapa prosedur standar (SPO) tidak berjalan dengan baik?",
          "Mengapa tidak ada pengecekan berkala sebelumnya?"
        ]
      });
    }

    // Pemrosesan Real AI menggunakan Gemini Flash (Cepat & Pintar)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Anda adalah "AI Patient Safety Expert" di RSD Gunung Jati.
      Tugas Anda adalah menganalisis kronologi kejadian berikut dan memberikan rekomendasi kategorisasi, grading risiko, ringkasan, dan 3 pertanyaan awal untuk investigasi 5-Whys.
      
      KRONOLOGI KEJADIAN:
      "${kronologi}"
      
      Instruksi format balasan (Berikan HANYA dalam format JSON valid tanpa format markdown \`\`\`json):
      {
        "kategori": "Pilih salah satu: KPC / KNC / KTC / KTD / SENTINEL",
        "grading": "Pilih warna pita risiko: BIRU / HIJAU / KUNING / MERAH",
        "alasan_grading": "Jelaskan secara medis/logis 1 kalimat mengapa Anda memilih warna tersebut",
        "ringkasan": "Rangkuman kronologi dalam 1 kalimat padat untuk dasbor eksekutif",
        "whys": ["Pertanyaan Why 1", "Pertanyaan Why 2", "Pertanyaan Why 3"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Bersihkan teks dari markdown formatting jika ada
    const cleanJsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiData = JSON.parse(cleanJsonText);

    return NextResponse.json(aiData);

  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
