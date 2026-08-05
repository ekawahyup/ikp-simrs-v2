"use client";

import { useState, useEffect } from "react";
import { Filter, Download, FileSpreadsheet, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function LaporanPage() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGrading, setFilterGrading] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      let mergedReports: any[] = [];
      try {
        const res = await fetch('/api/laporan');
        const json = await res.json();
        
        if (!json.fallback && json.data) {
          mergedReports = [...json.data].reverse();
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

  const filteredReports = reports.filter((r) => {
    // Search across all variables by combining all values into a single string
    const allValues = Object.values(r).join(" ").toLowerCase();
    const matchSearch = allValues.includes(searchQuery.toLowerCase());
      
    const matchGrading = filterGrading ? r.grading === filterGrading : true;
    
    return matchSearch && matchGrading;
  });

  const exportToExcel = () => {
    if (filteredReports.length === 0) return alert("Tidak ada data untuk diekspor");
    const worksheet = XLSX.utils.json_to_sheet(filteredReports.map(r => ({
      "ID": r.id,
      "Tanggal Laporan": r.tanggal,
      "Waktu Insiden": r.waktuInsiden,
      "Nama Pelapor": r.namaPelapor,
      "Unit Pelapor": r.unitPelapor,
      "No RM": r.noRm,
      "Nama Pasien": r.pasien || r.pasienName,
      "Ruangan Pasien": r.ruanganPasien,
      "Lokasi Kejadian": r.lokasi,
      "Jenis Insiden": r.jenis,
      "Grading Risiko": r.grading,
      "Status": r.status,
      "Kronologi": r.kronologi
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data_IKP");
    XLSX.writeFile(workbook, `Data_Laporan_IKP_${new Date().getTime()}.xlsx`);
  };

  const exportToPDF = () => {
    if (filteredReports.length === 0) return alert("Tidak ada data untuk diekspor");
    const doc = new jsPDF('landscape');
    
    doc.text("Laporan Insiden Keselamatan Pasien (IKP)", 14, 15);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 22);

    const tableColumn = ["Tanggal", "Pelapor & Unit", "Pasien & Ruang", "Jenis", "Grading", "Status"];
    const tableRows = filteredReports.map(r => [
      r.tanggal,
      `${r.namaPelapor || 'Anonim'}\n${r.unitPelapor || '-'}`,
      `${r.pasien || r.pasienName}\n${r.noRm || '-'} - ${r.ruanganPasien || '-'}`,
      r.jenis,
      r.grading,
      r.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`Data_Laporan_IKP_${new Date().getTime()}.pdf`);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>Daftar Laporan Masuk</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={exportToExcel} className="btn btn-outline hover-lift" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderColor: 'hsl(var(--risk-green))', color: 'hsl(var(--risk-green))' }}>
            <FileSpreadsheet size={16}/> Excel
          </button>
          <button onClick={exportToPDF} className="btn btn-outline hover-lift" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderColor: 'hsl(var(--risk-red))', color: 'hsl(var(--risk-red))' }}>
            <FileText size={16}/> PDF
          </button>
          <button 
            onClick={() => setShowFilter(!showFilter)} 
            className="btn btn-primary hover-lift" 
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: showFilter ? 'hsl(var(--primary-dark))' : '' }}
          >
            <Filter size={16}/> Filter
          </button>
        </div>
      </div>

      {showFilter && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Cari Semua Variabel (Nama, Ruangan, Tanggal, dll)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ketik kata kunci apa saja..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ width: '250px', marginBottom: 0 }}>
            <label className="form-label">Filter Grading</label>
            <select className="form-select" value={filterGrading} onChange={(e) => setFilterGrading(e.target.value)}>
              <option value="">Semua Grading</option>
              <option value="MERAH">Pita Merah</option>
              <option value="KUNING">Pita Kuning</option>
              <option value="BIRU">Pita Biru</option>
              <option value="HIJAU">Pita Hijau</option>
              <option value="BELUM DIGRADING">Belum Di-grading</option>
            </select>
          </div>
        </div>
      )}

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
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                  Tidak ada laporan yang sesuai dengan filter.
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hover-row:hover { background: hsla(var(--primary), 0.03); cursor: pointer; }
      `}} />
    </>
  );
}
