"use client";

import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LaporanPage() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      let mergedReports: any[] = [];
      try {
        const res = await fetch('/api/laporan');
        const json = await res.json();
        
        if (!json.fallback && json.data) {
          mergedReports = [...json.data];
        }
      } catch (e) {
        console.error(e);
      }

      setReports(mergedReports);
    };

    fetchData();
  }, []);

  const getBadgeClass = (grading: string) => {
    if (grading === "MERAH") return "badge-merah";
    if (grading === "KUNING") return "badge-kuning";
    if (grading === "BIRU") return "badge-biru";
    if (grading === "HIJAU") return "badge-hijau";
    return "";
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>Daftar Laporan Masuk</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline hover-lift" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Filter size={16}/> Filter & Cari</button>
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'hsl(var(--bg-body))', borderBottom: '1px solid hsl(var(--border))' }}>
            <tr>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>TANGGAL</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>PELAPOR & UNIT</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>PASIEN & RUANG</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>JENIS</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>GRADING (PITA)</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} onClick={() => router.push(`/dashboard/laporan/${report.id}`)} style={{ borderBottom: '1px solid hsl(var(--border))', transition: 'background 0.2s' }} className="hover-row">
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{report.tanggal}</td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                  <strong style={{ display: 'block', textTransform: 'capitalize' }}>{report.namaPelapor || 'Anonim'}</strong>
                  <span style={{color: 'hsl(var(--text-muted))'}}>{report.unitPelapor || '-'}</span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                  <strong style={{ display: 'block', textTransform: 'capitalize' }}>{report.pasien || report.pasienName}</strong>
                  <span style={{color: 'hsl(var(--text-muted))'}}>{report.noRm || '-'} - {report.ruanganPasien || '-'}</span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{report.jenis}</td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                  {report.grading === "BELUM DIGRADING" ? (
                    <span style={{ background: 'hsl(var(--bg-body))', border: '1px solid hsl(var(--border))', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-muted))' }}>
                      Belum Di-grading
                    </span>
                  ) : (
                    <span className={`badge ${getBadgeClass(report.grading)}`} style={{ textTransform: 'capitalize' }}>
                      {report.grading.toLowerCase()}
                    </span>
                  )}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                  {report.status === "Laporan Baru" ? (
                    <strong style={{ color: 'hsl(var(--primary))' }}>{report.status}</strong>
                  ) : (
                    report.status
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hover-row:hover { background: hsla(var(--primary), 0.03); cursor: pointer; }
      `}} />
    </>
  );
}
