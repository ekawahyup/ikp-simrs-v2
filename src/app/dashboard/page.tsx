import { auth } from "@/auth";
import { ShieldCheck, Calendar, Activity, CheckCircle, BarChart3 } from "lucide-react";
import { getAllLaporan } from "@/lib/googleSheets";
import DashboardCharts from "@/components/DashboardCharts";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await auth();
  
  // Fetch Real Data from Google Sheets
  const reports = await getAllLaporan();
  
  // Helper to parse dates assuming format "dd MMM yyyy"
  const today = new Date();
  const currentMonthStr = today.toLocaleDateString('id-ID', { month: 'short' });
  const currentYearStr = today.toLocaleDateString('id-ID', { year: 'numeric' });
  const todayStr = today.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  let hariIni = 0;
  let bulanIni = 0;
  let tahunIni = 0;
  let tertangani = 0;

  let countMerah = 0;
  let countKuning = 0;
  let countBiru = 0;
  let countHijau = 0;

  reports.forEach((r: any) => {
    if (r.tanggal === todayStr) hariIni++;
    if (r.tanggal?.includes(currentMonthStr) && r.tanggal?.includes(currentYearStr)) bulanIni++;
    if (r.tanggal?.includes(currentYearStr)) tahunIni++;
    
    if (r.status?.toLowerCase().includes("selesai") || r.status?.toLowerCase().includes("tutup")) tertangani++;

    if (r.grading === 'MERAH') countMerah++;
    if (r.grading === 'KUNING') countKuning++;
    if (r.grading === 'BIRU') countBiru++;
    if (r.grading === 'HIJAU') countHijau++;
  });

  const totalReports = reports.length;
  const resolutionRate = totalReports > 0 ? Math.round((tertangani / totalReports) * 100) : 0;

  const stats = {
    hariIni,
    bulanIni,
    tahunIni,
    tertangani,
    resolutionRate
  };

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
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.5rem' }}>Tingkat Penyelesaian <strong>{stats.resolutionRate}%</strong></p>
            </div>
            <div style={{ padding: '0.75rem', background: 'hsla(var(--risk-green), 0.15)', borderRadius: '12px', color: 'hsl(var(--risk-green))' }}>
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

      </div>

      {/* Baris 2: Analitik Visual (Charts) */}
      <DashboardCharts reports={reports} />
      
    </>
  );
}
