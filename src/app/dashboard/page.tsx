import { auth } from "@/auth";
import { ShieldCheck, Calendar, Activity, CheckCircle, BarChart3, AlertTriangle, Stethoscope, Building, Wind, Users } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  // Mock Data Statistik
  const stats = {
    hariIni: 2,
    bulanIni: 45,
    tahunIni: 320,
    tertangani: 298, // 93% resolution rate
  };

  // Mock Data Kategori
  const categories = [
    { name: "Medis / Perawatan Pasien", count: 185, icon: <Stethoscope size={18} />, color: "hsl(var(--risk-red))", percent: 58 },
    { name: "Fasilitas & Sarpras", count: 80, icon: <Building size={18} />, color: "hsl(var(--risk-kuning, 48 96% 53%))", percent: 25 },
    { name: "Faktor Eksternal / Pihak Ke-3", count: 40, icon: <Users size={18} />, color: "hsl(var(--risk-biru, 217 91% 60%))", percent: 12 },
    { name: "Faktor Alam (Bencana, Cuaca)", count: 15, icon: <Wind size={18} />, color: "hsl(var(--risk-green))", percent: 5 },
  ];

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>Ikhtisar Keselamatan Pasien</h1>
          <p style={{ color: 'hsl(var(--text-muted))' }}>Ringkasan data pelaporan IKP RSD Gunung Jati Kota Cirebon.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'hsla(var(--risk-green), 0.1)', color: 'hsl(var(--risk-green))', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600 }}>
          <ShieldCheck size={18} /> Sistem Aktif
        </div>
      </header>

      {/* Baris 1: Rekapan Waktu & Penyelesaian */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))', fontWeight: 600, marginBottom: '0.5rem' }}>Laporan Hari Ini</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'hsl(var(--text-main))', lineHeight: 1 }}>{stats.hariIni}</h2>
            </div>
            <div style={{ padding: '0.75rem', background: 'hsla(var(--primary), 0.1)', borderRadius: '12px', color: 'hsl(var(--primary))' }}>
              <Activity size={24} />
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))', fontWeight: 600, marginBottom: '0.5rem' }}>Bulan Ini (Agustus)</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'hsl(var(--text-main))', lineHeight: 1 }}>{stats.bulanIni}</h2>
            </div>
            <div style={{ padding: '0.75rem', background: 'hsla(var(--primary), 0.05)', borderRadius: '12px', color: 'hsl(var(--text-muted))' }}>
              <Calendar size={24} />
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))', fontWeight: 600, marginBottom: '0.5rem' }}>Total Tahun 2026</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'hsl(var(--text-main))', lineHeight: 1 }}>{stats.tahunIni}</h2>
            </div>
            <div style={{ padding: '0.75rem', background: 'hsla(var(--primary), 0.05)', borderRadius: '12px', color: 'hsl(var(--text-muted))' }}>
              <BarChart3 size={24} />
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid hsla(var(--risk-green), 0.3)', background: 'linear-gradient(135deg, hsla(var(--risk-green), 0.05), transparent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'hsl(var(--risk-green))', fontWeight: 600, marginBottom: '0.5rem' }}>Selesai Tertangani</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'hsl(var(--text-main))', lineHeight: 1 }}>{stats.tertangani}</h2>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.5rem' }}>Tingkat Penyelesaian <strong>93%</strong></p>
            </div>
            <div style={{ padding: '0.75rem', background: 'hsla(var(--risk-green), 0.15)', borderRadius: '12px', color: 'hsl(var(--risk-green))' }}>
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

      </div>

      {/* Baris 2: Analitik Kategori & Grading */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        
        {/* Kolom Kiri: Kategori Insiden */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} style={{ color: 'hsl(var(--primary))' }} /> Kategori Sumber Insiden (Tahun Ini)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {categories.map((cat, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: cat.color }}>{cat.icon}</span> {cat.name}
                  </div>
                  <span>{cat.count} Kasus ({cat.percent}%)</span>
                </div>
                {/* Progress Bar */}
                <div style={{ width: '100%', height: '8px', background: 'hsl(var(--bg-body))', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${cat.percent}%`, height: '100%', background: cat.color, borderRadius: '999px', transition: 'width 1s ease-in-out' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Grading Pita */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Beban Grading (Aktif)</h3>
            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))', marginBottom: '2rem' }}>Laporan yang sedang ditangani saat ini.</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'hsla(var(--risk-red), 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid hsla(var(--risk-red), 0.2)' }}>
              <strong style={{ color: 'hsl(var(--risk-red))' }}>Pita Merah (RCA)</strong>
              <span style={{ fontWeight: 800 }}>2</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'hsla(var(--risk-kuning, 48 96% 53%), 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid hsla(var(--risk-kuning, 48 96% 53%), 0.2)' }}>
              <strong style={{ color: 'hsl(var(--risk-kuning, 48 96% 53%))' }}>Pita Kuning</strong>
              <span style={{ fontWeight: 800 }}>5</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'hsla(var(--risk-biru, 217 91% 60%), 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid hsla(var(--risk-biru, 217 91% 60%), 0.2)' }}>
              <strong style={{ color: 'hsl(var(--risk-biru, 217 91% 60%))' }}>Pita Biru</strong>
              <span style={{ fontWeight: 800 }}>12</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'hsla(var(--risk-green), 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid hsla(var(--risk-green), 0.2)' }}>
              <strong style={{ color: 'hsl(var(--risk-green))' }}>Pita Hijau</strong>
              <span style={{ fontWeight: 800 }}>3</span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
