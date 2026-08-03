import Link from "next/link";
import { Shield, ArrowRight, Activity, FileCheck2, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'hsl(var(--bg-body))' }}>
      {/* Navigation */}
      <nav style={{ background: 'hsl(var(--bg-surface))', borderBottom: '1px solid hsl(var(--border))', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '1.25rem', color: 'hsl(var(--primary))' }}>
            <img src="/logo.png" alt="Logo RSD Gunung Jati" width={40} height={40} style={{ objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span>IKP RSD Gunung Jati</span>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 500 }}>Kota Cirebon</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/login" className="btn btn-outline hover-lift">Masuk / Login</Link>
            <Link href="/lapor" className="btn btn-primary hover-lift">Buat Laporan</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '6rem 0', textAlign: 'center', background: 'linear-gradient(135deg, hsl(var(--bg-body)) 0%, #e0f2fe 100%)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--primary))' }}></span>
            Medical Grade Security & Compliance
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.025em', color: 'hsl(var(--text-main))', marginBottom: '1.5rem' }}>
            Budaya Keselamatan, <br />
            <span style={{ color: 'hsl(var(--primary))' }}>Tanggung Jawab Bersama.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'hsl(var(--text-muted))', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Laporkan Insiden Keselamatan Pasien secara aman, rahasia, dan terintegrasi. Tindaklanjuti akar masalah untuk pelayanan kesehatan yang lebih baik.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link href="/lapor" className="btn btn-primary hover-lift" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
              Laporkan Insiden Sekarang <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 0', background: 'hsl(var(--bg-surface))' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="glass-panel hover-lift" style={{ padding: '2rem' }}>
              <Activity size={40} style={{ color: 'hsl(var(--risk-red))', marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Risk Grading Otomatis</h3>
              <p style={{ color: 'hsl(var(--text-muted))' }}>Sistem secara cerdas memetakan risiko insiden ke dalam pita warna (Biru, Hijau, Kuning, Merah) berdasarkan matriks probabilitas dan dampak.</p>
            </div>
            <div className="glass-panel hover-lift" style={{ padding: '2rem' }}>
              <FileCheck2 size={40} style={{ color: 'hsl(var(--primary))', marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Investigasi & RCA</h3>
              <p style={{ color: 'hsl(var(--text-muted))' }}>Modul investigasi komprehensif mendukung metode 5 Whys dan Fishbone untuk menemukan akar masalah (Root Cause Analysis).</p>
            </div>
            <div className="glass-panel hover-lift" style={{ padding: '2rem' }}>
              <BarChart3 size={40} style={{ color: 'hsl(var(--secondary))', marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Dashboard Eksekutif</h3>
              <p style={{ color: 'hsl(var(--text-muted))' }}>Pantau tren insiden, evaluasi unit, dan lacak kepatuhan Action Plan dengan visualisasi data real-time untuk Direksi.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
