"use client";

import { useState, useEffect } from "react";
import { PROBABILITY, IMPACT, calculateRisk, RiskBand } from "@/lib/riskMatrix";
import { ArrowLeft, ShieldAlert, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function LaporanDetailPage() {
  const params = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [prob, setProb] = useState<number>(1);
  const [impact, setImpact] = useState<number>(1);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch('/api/laporan');
        const json = await res.json();
        if (json.data) {
          const found = json.data.find((r: any) => String(r.id) === String(params.id));
          setReport(found || null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [params.id]);

  const riskResult: RiskBand = calculateRisk(prob, impact);
  const score = prob * impact;

  const getBadgeColor = (risk: RiskBand) => {
    if (risk === 'MERAH') return 'var(--risk-red)';
    if (risk === 'KUNING') return 'var(--risk-yellow)';
    if (risk === 'HIJAU') return 'var(--risk-green)';
    return 'var(--risk-blue)';
  };

  const handleSaveGrading = () => {
    // Mock save logic
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <Link href="/dashboard/laporan" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--primary))', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: 500 }}>
        <ArrowLeft size={16} /> Kembali ke Daftar
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>Detail Laporan IKP</h1>
          <p style={{ color: 'hsl(var(--text-muted))' }}>Nomor Tiket: #{params.id}</p>
        </div>
        <div style={{ background: 'hsl(var(--bg-surface))', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Clock size={18} style={{ color: 'hsl(var(--text-muted))' }} />
          <div>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', display: 'block' }}>Dilaporkan Pada</span>
            <strong>{report?.tanggal || 'Sedang memuat...'}</strong>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Memuat data laporan...</div>
      ) : !report ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--risk-red))' }}>Laporan tidak ditemukan!</div>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        
        {/* Left Column: Data Insiden */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '0.75rem' }}>Informasi Pelapor</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Nama Pelapor</span><strong style={{ display: 'block' }}>{report.namaPelapor}</strong></div>
              <div><span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Unit / Ruang Pelapor</span><strong style={{ display: 'block' }}>{report.unitPelapor}</strong></div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '0.75rem' }}>Informasi Pasien</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Nama Pasien</span><strong style={{ display: 'block' }}>{report.pasien}</strong></div>
              <div><span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>No. Rekam Medis</span><strong style={{ display: 'block' }}>{report.noRm || report.rmRoom?.split('-')[0]?.trim() || '-'}</strong></div>
              <div style={{ gridColumn: 'span 2' }}><span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Lokasi Perawatan</span><strong style={{ display: 'block' }}>{report.ruanganPasien || report.rmRoom?.split('-')[1]?.trim() || '-'}</strong></div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '0.75rem' }}>Rincian Kejadian</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Jenis Insiden & Lokasi</span>
                <strong style={{ display: 'block', color: 'hsl(var(--risk-red))' }}>{report.jenis} di {report.lokasi}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Kronologi</span>
                <p style={{ marginTop: '0.25rem', padding: '1rem', background: 'hsl(var(--bg-body))', borderRadius: 'var(--radius-md)' }}>{report.kronologi}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Matriks Grading Risiko */}
        <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content', position: 'sticky', top: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <ShieldAlert size={20} style={{ color: 'hsl(var(--primary))' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Grading Risiko</h3>
          </div>
          
          <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))', marginBottom: '1.5rem' }}>Tentukan level risiko berdasarkan Dampak dan Probabilitas.</p>

          <div className="form-group">
            <label className="form-label">Probabilitas (P)</label>
            <select className="form-select" value={prob} onChange={(e) => setProb(Number(e.target.value))}>
              {[1,2,3,4,5].map(n => (
                <option key={n} value={n}>{n} - {PROBABILITY[n as keyof typeof PROBABILITY].label}</option>
              ))}
            </select>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>{PROBABILITY[prob as keyof typeof PROBABILITY].desc}</span>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Dampak Klinis (D)</label>
            <select className="form-select" value={impact} onChange={(e) => setImpact(Number(e.target.value))}>
              {[1,2,3,4,5].map(n => (
                <option key={n} value={n}>{n} - {IMPACT[n as keyof typeof IMPACT].label}</option>
              ))}
            </select>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>{IMPACT[impact as keyof typeof IMPACT].desc}</span>
          </div>

          <div style={{ marginTop: '2rem', padding: '1.5rem', background: `hsla(${getBadgeColor(riskResult)}, 0.1)`, border: `1px solid hsla(${getBadgeColor(riskResult)}, 0.3)`, borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>Hasil Kalkulasi Matriks</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: `hsl(${getBadgeColor(riskResult)})`, lineHeight: 1.2, margin: '0.5rem 0' }}>{riskResult}</div>
            <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))' }}>Skor Risiko: <strong>{score}</strong></div>
          </div>

          <button onClick={handleSaveGrading} className="btn btn-primary hover-lift" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}>
            {saved ? <><CheckCircle size={18}/> Disimpan</> : 'Simpan Verifikasi Grading'}
          </button>
        </div>

      </div>
      )}
    </div>
  );
}
