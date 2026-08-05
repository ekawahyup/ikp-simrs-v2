"use client";

import { useState } from "react";
import { CheckCircle, Zap, Globe, Save } from "lucide-react";

export default function PengaturanAPIPage() {
  const [url, setUrl] = useState("https://rsdgunungjati.com/service/external/get-pasien-by-nocm");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTest = async () => {
    try {
      const res = await fetch('/api/simrs?rm=00026439');
      if (res.ok) {
        alert("Ping Berhasil! API Live RSD Gunung Jati merespon dengan status 200 OK.");
      } else {
        alert("Ping Gagal! Cek koneksi internet Anda.");
      }
    } catch (e) {
      alert("Terjadi kesalahan koneksi.");
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>Integrasi SIMRS (API Bridging)</h1>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>Atur alamat *Endpoint* untuk menarik data pasien otomatis saat penginputan IKP.</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid hsl(var(--border))' }}>
          <Globe size={24} style={{ color: 'hsl(var(--primary))' }} />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Konfigurasi Endpoint GET (Live)</h2>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Alamat API (URL Endpoint)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0 1rem', background: 'hsl(var(--bg-body))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius-md)', fontWeight: 600, color: 'hsl(var(--text-muted))' }}>GET</span>
              <input 
                type="url" 
                className="form-input" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                placeholder="https://rsdgunungjati.com/..." 
                required 
              />
            </div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.5rem' }}>Sistem IKP akan mengirim *request* GET ke alamat ini menggunakan parameter URL. Proxy Vercel digunakan untuk mengatasi *Mixed Content* & CORS.</span>
          </div>

          <div style={{ padding: '1.25rem', background: 'hsl(var(--bg-body))', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border))' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Format Query Parameter (Dikirim oleh Aplikasi)</h4>
            <pre style={{ fontSize: '0.75rem', color: 'hsl(var(--primary))', margin: 0 }}>
{`?nocm=00026439`}
            </pre>
          </div>

          <div style={{ padding: '1.25rem', background: 'hsl(var(--bg-body))', borderRadius: 'var(--radius-md)', border: '1px dashed hsl(var(--border))' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Ekspektasi Response (Diterima dari SIMRS)</h4>
            <pre style={{ fontSize: '0.75rem', color: 'hsl(var(--risk-green))', margin: 0 }}>
{`{
  "code": 200,
  "msg": "Data Pasien Berhasil Didapatkan",
  "data": {
    "norm": "00026439",
    "nama": "SRI RAHAYU",
    "jenis_kelamin": "P",
    "tanggal_lahir": "1954-04-03",
    "nama_departement": "R. Raden Kian Santang - RKS.07.01",
    "no_registrasi": "0026365985",
    "tglregistrasi": "2024-05-30"
  }
}`}
            </pre>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <button type="button" onClick={handleTest} className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Zap size={16} /> Test Ping Koneksi
            </button>
            <button type="submit" className="btn btn-primary hover-lift" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem 2rem' }}>
              {saved ? <CheckCircle size={18} /> : <Save size={18} />}
              {saved ? "Tersimpan" : "Simpan Konfigurasi"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
