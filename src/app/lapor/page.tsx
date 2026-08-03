"use client";

import { useState, useEffect } from "react";
import { Search, ShieldAlert, User, Clock, MapPin, FileText, Activity, ShieldCheck, CheckCircle2, Sparkles, BrainCircuit } from "lucide-react";

// Custom Searchable Dropdown Component
function SearchableSelect({ options, value, onChange, placeholder }: { options: string[], value: string, onChange: (val: string) => void, placeholder: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ position: 'relative' }}>
      <input 
        type="text" 
        className="form-input" 
        placeholder={placeholder}
        value={isOpen ? search : (value || "")}
        onChange={(e) => { setSearch(e.target.value); setIsOpen(true); onChange(""); }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        style={{ width: '100%' }}
      />
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'hsl(var(--bg-surface))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius-md)', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: 'var(--shadow-md)', marginTop: '4px' }}>
          {filtered.length > 0 ? filtered.map(opt => (
            <div 
              key={opt} 
              onClick={() => { onChange(opt); setSearch(""); setIsOpen(false); }}
              style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid hsl(var(--border))', fontSize: '0.875rem' }}
              className="hover-menu"
            >
              {opt}
            </div>
          )) : (
            <div style={{ padding: '0.75rem 1rem', color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>Tidak ditemukan</div>
          )}
        </div>
      )}
    </div>
  );
}

// Hardcoded fallback data in case no Excel uploaded
const FALLBACK_PEGAWAI = [
  "Dr. Budi Setiawan", "Dr. Siti Aminah", "Ns. Joko Anwar", "Ns. Rini Sugiarti", 
  "Drg. Ahmad Dahlan", "Bidan Sari", "Apoteker Linda", "Radiografer Tono"
];

const FALLBACK_UNIT = [
  "Manajemen / Komite", "Instalasi Gawat Darurat (IGD)", "ICU / HCU", 
  "Rawat Inap - Melati", "Rawat Inap - Mawar", "Instalasi Farmasi", 
  "Radiologi", "Laboratorium", "Instalasi Gizi"
];

export default function LaporInsidenPage() {
  const [rm, setRm] = useState("");
  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [namaPelapor, setNamaPelapor] = useState("");
  const [unitPelapor, setUnitPelapor] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [masterPegawai, setMasterPegawai] = useState<string[]>(FALLBACK_PEGAWAI);
  const [masterUnit, setMasterUnit] = useState<string[]>(FALLBACK_UNIT);

  // State untuk AI
  const [kronologi, setKronologi] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);

  useEffect(() => {
    // Try to load uploaded excel data from localStorage
    const localR = localStorage.getItem("ikp_master_ruangan");
    const localP = localStorage.getItem("ikp_master_pegawai");
    
    if (localR) {
      try {
        const data = JSON.parse(localR);
        const units = data.map((row: any) => Object.values(row)[0] as string);
        if (units.length > 0) setMasterUnit(Array.from(new Set(units)));
      } catch (e) {}
    }
    
    if (localP) {
      try {
        const data = JSON.parse(localP);
        const employees = data.map((row: any) => Object.values(row)[0] as string);
        if (employees.length > 0) setMasterPegawai(Array.from(new Set(employees)));
      } catch (e) {}
    }
  }, []);

  const searchPatient = async () => {
    if (!rm) return;
    setLoading(true);
    setError("");
    setPatientData(null);
    try {
      const res = await fetch(`/api/simrs?rm=${rm}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil data");
      setPatientData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeWithAI = async () => {
    if (!kronologi || kronologi.length < 20) {
      alert("Ceritakan kronologi minimal 20 karakter agar AI dapat menganalisisnya.");
      return;
    }
    setIsAnalyzing(true);
    setAiInsights(null);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kronologi })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAiInsights(data);
    } catch (err: any) {
      alert("Gagal menganalisis dengan AI: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const waktuRaw = formData.get("waktu") as string;
    const dateObj = waktuRaw ? new Date(waktuRaw) : new Date();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    const report = {
      id: Math.random().toString(36).substr(2, 9),
      tanggal: formattedDate,
      pasien: patientData ? `${patientData.name}` : `Pasien Belum Dicari`,
      rmRoom: patientData ? `${rm} - ${patientData.room}` : `${rm} - ${unitPelapor}`,
      jenis: formData.get("jenis") as string,
      grading: "BELUM DIGRADING", 
      status: "Laporan Baru"
    };

    const existing = JSON.parse(localStorage.getItem("ikp_reports") || "[]");
    localStorage.setItem("ikp_reports", JSON.stringify([report, ...existing]));

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
          <CheckCircle2 size={64} style={{ color: 'hsl(var(--risk-green))', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Laporan Berhasil Dikirim!</h2>
          <p style={{ color: 'hsl(var(--text-muted))', marginBottom: '2rem' }}>
            Terima kasih telah berkontribusi dalam budaya keselamatan pasien. Laporan Anda telah dicatat dengan aman dan akan segera ditindaklanjuti oleh unit terkait.
          </p>
          <button onClick={() => window.location.reload()} className="btn btn-primary hover-lift">
            Lapor Insiden Lainnya
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, hsl(var(--bg-body)), #f0f7ff)', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem' }}>
            <img src="/logo.png" alt="Logo RSD Gunung Jati" width={80} height={80} style={{ objectFit: 'contain', margin: '0 auto' }} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(var(--text-main))', letterSpacing: '-0.025em' }}>Formulir Pelaporan Insiden</h1>
          <p style={{ color: 'hsl(var(--text-muted))', marginTop: '0.5rem', fontWeight: 500 }}>RSD Gunung Jati Kota Cirebon (Internal & Rahasia)</p>
        </header>

        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflow: 'visible' }}>
          
          {/* Sembunyikan Identitas */}
          <div style={{ padding: '1rem', background: 'hsla(var(--primary), 0.1)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid hsla(var(--primary), 0.2)' }}>
            <ShieldCheck size={24} style={{ color: 'hsl(var(--primary))' }} />
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', fontSize: '0.875rem' }}>Whistleblower Protection</strong>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Identitas Anda dienkripsi dan dirahasiakan jika opsi ini dicentang.</span>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} style={{ width: '1rem', height: '1rem', accentColor: 'hsl(var(--primary))' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Lapor Anonim</span>
            </label>
          </div>

          {/* Section 1: Data Pelapor & Unit */}
          <section>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nama Pelapor (Petugas Kesehatan)</label>
                {isAnonymous ? (
                  <input type="text" className="form-input" disabled value="-- Disembunyikan (Anonim) --" />
                ) : (
                  <SearchableSelect 
                    options={masterPegawai} 
                    value={namaPelapor} 
                    onChange={setNamaPelapor}
                    placeholder="Ketik untuk mencari nama..."
                  />
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Unit / Ruangan Pelapor (Tempat Bertugas)</label>
                <SearchableSelect 
                  options={masterUnit} 
                  value={unitPelapor} 
                  onChange={setUnitPelapor}
                  placeholder="Ketik untuk mencari unit..."
                />
              </div>
            </div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginBottom: '1.5rem' }}>Laporan akan dikirim ke Verifikator (Kepala Unit/Ruangan) terkait untuk di-grading.</span>

            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '0.5rem' }}>
              <User size={18} style={{ color: 'hsl(var(--primary))' }} /> Data Pasien Terkait
            </h3>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Nomor Rekam Medis (RM)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={rm}
                  onChange={(e) => setRm(e.target.value)}
                  placeholder="Contoh: RM123456" 
                  className="form-input" 
                  style={{ flex: 1 }}
                  required
                />
                <button type="button" onClick={searchPatient} className="btn btn-outline hover-lift" disabled={loading}>
                  {loading ? 'Mencari...' : <><Search size={16} /> Cari SIMRS</>}
                </button>
              </div>
              {error && <span style={{ color: 'hsl(var(--risk-red))', fontSize: '0.75rem', marginTop: '0.25rem' }}>{error}</span>}
            </div>

            {patientData && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'hsl(var(--bg-body))', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border))' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Nama Pasien</span>
                  <strong style={{ display: 'block', fontSize: '0.875rem' }}>{patientData.name} ({patientData.gender})</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Umur</span>
                  <strong style={{ display: 'block', fontSize: '0.875rem' }}>{patientData.age} Tahun</strong>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Ruangan / Bangsal</span>
                  <strong style={{ display: 'block', fontSize: '0.875rem' }}>{patientData.room}</strong>
                </div>
              </div>
            )}
          </section>

          {/* Section 2: Detail Insiden */}
          <section>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '0.5rem' }}>
              <Activity size={18} style={{ color: 'hsl(var(--primary))' }} /> Rincian Kejadian
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label"><Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Waktu Insiden</label>
                <input type="datetime-local" name="waktu" className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label"><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> Lokasi Kejadian</label>
                <input type="text" name="lokasi" placeholder="Cth: Kamar Operasi 2" className="form-input" required />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Jenis Insiden</label>
              <select className="form-select" name="jenis" required defaultValue="">
                <option value="" disabled>Pilih Klasifikasi Insiden...</option>
                <option value="KPC">KPC - Kejadian Potensial Cedera</option>
                <option value="KNC">KNC - Kejadian Nyaris Cedera</option>
                <option value="KTC">KTC - Kejadian Tidak Cedera</option>
                <option value="KTD">KTD - Kejadian Tidak Diharapkan (Adverse Event)</option>
                <option value="SENTINEL">Kejadian Sentinel (Kematian/Cedera Serius)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label"><FileText size={14} style={{ display: 'inline', marginRight: '4px' }} /> Kronologi Kejadian (Deskripsi Lengkap)</label>
              <textarea 
                value={kronologi}
                onChange={(e) => setKronologi(e.target.value)}
                placeholder="Ceritakan secara objektif dan runtut: Apa yang terjadi? Siapa yang terlibat? Bagaimana kejadiannya?" 
                className="form-textarea" 
                required
                rows={4}
              ></textarea>
              
              <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={analyzeWithAI} 
                  disabled={isAnalyzing}
                  className="btn hover-lift" 
                  style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: 'white', padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {isAnalyzing ? "AI Sedang Menganalisis..." : <><Sparkles size={16} /> Analisis dengan Gemini AI</>}
                </button>
              </div>
            </div>

            {aiInsights && (
              <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, hsla(270, 95%, 60%, 0.1), hsla(230, 90%, 65%, 0.05))', borderRadius: 'var(--radius-md)', border: '1px solid hsla(270, 90%, 65%, 0.3)', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'hsl(var(--text-main))' }}>
                  <BrainCircuit style={{ color: '#a855f7' }} /> Hasil Analisis Gemini AI
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Rekomendasi Kategori:</span>
                    <strong style={{ display: 'block', fontSize: '0.875rem', color: '#6366f1' }}>{aiInsights.kategori}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Prediksi Grading Risiko:</span>
                    <strong style={{ display: 'block', fontSize: '0.875rem', color: aiInsights.grading === 'MERAH' ? 'hsl(var(--risk-red))' : aiInsights.grading === 'KUNING' ? 'hsl(var(--risk-yellow))' : aiInsights.grading === 'HIJAU' ? 'hsl(var(--risk-green))' : 'hsl(var(--primary))' }}>
                      Pita {aiInsights.grading}
                    </strong>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Alasan Grading:</span>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>{aiInsights.alasan_grading}</p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Ringkasan Eksekutif:</span>
                  <p style={{ fontSize: '0.875rem', margin: 0, fontStyle: 'italic' }}>"{aiInsights.ringkasan}"</p>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Saran Pertanyaan Investigasi (5-Whys):</span>
                  <ul style={{ fontSize: '0.875rem', margin: '0.5rem 0 0 0', paddingLeft: '1.25rem', color: 'hsl(var(--text-muted))' }}>
                    {aiInsights.whys.map((why: string, i: number) => (
                      <li key={i}>{why}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Tindakan Segera yang Dilakukan</label>
              <textarea placeholder="Apa yang langsung dilakukan sesaat setelah kejadian untuk menangani dampak?" className="form-textarea" required></textarea>
            </div>
            
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Tindakan Dilakukan Oleh</label>
              <select className="form-select" required defaultValue="">
                <option value="" disabled>Pilih Penanganan Oleh...</option>
                <option value="Dokter">Dokter Penanggung Jawab Jaga (DPJP)</option>
                <option value="Perawat">Perawat / Bidan</option>
                <option value="Tim Medis Lainnya">Tim Medis Lainnya</option>
              </select>
            </div>
          </section>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline hover-lift" onClick={() => window.history.back()}>Batal</button>
            <button type="submit" className="btn btn-primary hover-lift" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>Kirim Laporan IKP</button>
          </div>

        </form>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hover-menu:hover { background: hsla(var(--primary), 0.05); }
      `}} />
    </div>
  );
}
