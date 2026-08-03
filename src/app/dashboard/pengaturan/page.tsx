"use client";

import { useState } from "react";
import { CheckCircle, Zap, Globe, Save } from "lucide-react";

export default function PengaturanAPIPage() {
  const [url, setUrl] = useState("http://192.168.1.100/api/simrs/pasien");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTest = () => {
    alert("Simulasi Ping ke API SIMRS: Berhasil terhubung (200 OK)!");
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
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Konfigurasi Endpoint POST</h2>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Alamat API (URL Endpoint)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0 1rem', background: 'hsl(var(--bg-body))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius-md)', fontWeight: 600, color: 'hsl(var(--text-muted))' }}>POST</span>
              <input 
                type="url" 
                className="form-input" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                placeholder="http://ip-simrs/api/..." 
                required 
              />
            </div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.5rem' }}>Sistem IKP akan mengirim *request* POST ke alamat ini tanpa *Token/API Key*.</span>
          </div>

          <div style={{ padding: '1.25rem', background: 'hsl(var(--bg-body))', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border))' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Format Request (Dikirim oleh Aplikasi)</h4>
            <pre style={{ fontSize: '0.75rem', color: 'hsl(var(--primary))', margin: 0 }}>
{`{
  "no_rm": "123456"
}`}
            </pre>
          </div>

          <div style={{ padding: '1.25rem', background: 'hsl(var(--bg-body))', borderRadius: 'var(--radius-md)', border: '1px dashed hsl(var(--border))' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Ekspektasi Response (Diterima dari SIMRS)</h4>
            <pre style={{ fontSize: '0.75rem', color: 'hsl(var(--risk-green))', margin: 0 }}>
{`{
  "nama_pasien": "Budi Santoso",
  "tanggal_lahir": "1980-01-01",
  "jenis_kelamin": "L",
  "ruangan_aktif": "Rawat Inap - Melati",
  "dpjp": "Dr. Andi"
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
