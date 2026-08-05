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
      
      const kronologiLower = kronologi.toLowerCase();
      let kategori = "KPC (Kejadian Potensial Cedera)";
      let grading = "KUNING";
      let alasan = "Terdapat potensi cedera sedang jika tidak segera ditangani, namun belum mengenai pasien secara langsung.";
      let ringkasan = "Pelapor menemukan potensi bahaya berdasarkan kronologi yang disebutkan, yang memerlukan perbaikan sistem.";
      
      // Simple keyword-based mock for presentation purposes
      if (kronologiLower.includes("meninggal") || kronologiLower.includes("mati") || kronologiLower.includes("fatal") || kronologiLower.includes("salah pemberian obat")) {
        kategori = "SENTINEL (Kejadian Sentinel)";
        grading = "MERAH";
        alasan = "Insiden ini mengakibatkan kematian atau cedera permanen yang sangat fatal pada pasien, memerlukan investigasi RCA segera.";
        ringkasan = "Terjadi insiden sangat fatal yang mengakibatkan hilangnya nyawa atau cedera berat pada pasien.";
      } else if (kronologiLower.includes("jatuh") || kronologiLower.includes("luka") || kronologiLower.includes("pendarahan")) {
        kategori = "KTD (Kejadian Tidak Diharapkan)";
        grading = "MERAH";
        alasan = "Insiden ini telah mengakibatkan cedera fisik pada pasien yang memerlukan penanganan medis lebih lanjut.";
        ringkasan = "Pasien mengalami cedera fisik akibat insiden yang terjadi di area perawatan.";
      } else if (kronologiLower.includes("hampir") || kronologiLower.includes("nyaris") || kronologiLower.includes("segera disadari")) {
        kategori = "KNC (Kejadian Nyaris Cedera)";
        grading = "BIRU";
        alasan = "Insiden hampir terjadi dan berpotensi mencederai pasien, namun berhasil dicegah sebelum mengenai pasien.";
        ringkasan = "Potensi insiden berhasil dicegah oleh petugas sebelum mencapai pasien.";
      }

      return NextResponse.json({
        kategori: kategori,
        grading: grading,
        alasan_grading: alasan,
        ringkasan: ringkasan,
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
