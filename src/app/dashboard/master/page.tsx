"use client";

import { useState, useEffect } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertTriangle, Save, Search, Database } from "lucide-react";
import * as XLSX from "xlsx";

export default function MasterDataPage() {
  const [ruanganData, setRuanganData] = useState<any[]>([]);
  const [pegawaiData, setPegawaiData] = useState<any[]>([]);
  
  // Data yang sudah "disimpan" ke database (mock)
  const [savedRuangan, setSavedRuangan] = useState<any[]>([]);
  const [savedPegawai, setSavedPegawai] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'RUANGAN' | 'PEGAWAI'>('RUANGAN');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load dari localStorage saat komponen di-mount
  useEffect(() => {
    const localR = localStorage.getItem("ikp_master_ruangan");
    const localP = localStorage.getItem("ikp_master_pegawai");
    if (localR) setSavedRuangan(JSON.parse(localR));
    if (localP) setSavedPegawai(JSON.parse(localP));
    setIsLoaded(true);
  }, []);

  // Simpan ke localStorage setiap kali ada perubahan
  useEffect(() => {
    if (isLoaded) localStorage.setItem("ikp_master_ruangan", JSON.stringify(savedRuangan));
  }, [savedRuangan, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("ikp_master_pegawai", JSON.stringify(savedPegawai));
  }, [savedPegawai, isLoaded]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'RUANGAN' | 'PEGAWAI') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      if (type === 'RUANGAN') setRuanganData(data);
      if (type === 'PEGAWAI') setPegawaiData(data);
      setIsSaved(false);
    };
    reader.readAsBinaryString(file);
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      
      // Move uploaded data to saved data
      if (activeTab === 'RUANGAN' && ruanganData.length > 0) {
        setSavedRuangan(prev => [...prev, ...ruanganData]);
        setRuanganData([]);
      }
      if (activeTab === 'PEGAWAI' && pegawaiData.length > 0) {
        setSavedPegawai(prev => [...prev, ...pegawaiData]);
        setPegawaiData([]);
      }
      
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    }, 1000);
  };

  const currentSavedData = activeTab === 'RUANGAN' ? savedRuangan : savedPegawai;
  const filteredData = currentSavedData.filter(row => {
    if (!searchQuery) return true;
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>Data Master ({activeTab === 'RUANGAN' ? 'Ruangan/Unit' : 'Pegawai'})</h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>Kelola dan impor massal master data dari file Excel.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => setActiveTab('RUANGAN')} className={`btn ${activeTab === 'RUANGAN' ? 'btn-primary' : 'btn-outline'}`}>Master Ruangan & Unit</button>
        <button onClick={() => setActiveTab('PEGAWAI')} className={`btn ${activeTab === 'PEGAWAI' ? 'btn-primary' : 'btn-outline'}`}>Master Pegawai</button>
      </div>

      {/* Upload Section */}
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', border: '2px dashed hsl(var(--border))', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <UploadCloud size={40} style={{ color: 'hsl(var(--primary))' }} />
        </div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Unggah File Excel (.xlsx)</h3>
        <p style={{ color: 'hsl(var(--text-muted))', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Tambahkan data massal dengan mengunggah file spreadsheet.</p>
        
        <label style={{ display: 'inline-block', background: 'hsl(var(--primary))', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600 }} className="hover-lift">
          <input type="file" accept=".xlsx, .xls, .csv" onChange={(e) => handleFileUpload(e, activeTab)} style={{ display: 'none' }} />
          Pilih File Excel
        </label>
      </div>

      {/* Upload Preview */}
      {(activeTab === 'RUANGAN' ? ruanganData : pegawaiData).length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--risk-yellow))', marginBottom: '1rem', fontWeight: 600 }}>
            <AlertTriangle size={18} /> Berhasil membaca {(activeTab === 'RUANGAN' ? ruanganData : pegawaiData).length} baris data (Belum Disimpan).
          </div>
          <div className="glass-panel" style={{ overflow: 'auto', maxHeight: '300px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead style={{ background: 'hsl(var(--bg-body))', position: 'sticky', top: 0 }}>
                <tr>
                  {Object.keys((activeTab === 'RUANGAN' ? ruanganData : pegawaiData)[0] || {}).map(key => (
                    <th key={key} style={{ padding: '1rem', borderBottom: '1px solid hsl(var(--border))', fontWeight: 600 }}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'RUANGAN' ? ruanganData : pegawaiData).slice(0, 10).map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid hsl(var(--border))', opacity: 0.7 }}>
                    {Object.values(row).map((val: any, i) => (
                      <td key={i} style={{ padding: '1rem' }}>{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '1rem' }}>* Pratinjau 10 baris pertama. Klik <strong>Simpan ke Database</strong> di bawah.</p>
          
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button 
              onClick={handleSave} 
              disabled={isSaving || isSaved}
              className="btn btn-primary hover-lift" 
              style={{ padding: '0.875rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {isSaving ? "Menyimpan..." : isSaved ? <><CheckCircle size={18} /> Disimpan!</> : <><Save size={18} /> Simpan ke Database</>}
            </button>
          </div>
        </div>
      )}

      {/* Saved Database Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Database size={20} style={{ color: 'hsl(var(--primary))' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Data Tersimpan di Database</h2>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))', margin: 0 }}>Total: <strong>{currentSavedData.length}</strong> Data</p>
          <div style={{ position: 'relative', width: '350px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
            <input 
              type="text" 
              placeholder={`Cari nama ${activeTab === 'RUANGAN' ? 'ruangan' : 'pegawai'}...`} 
              className="form-input" 
              style={{ paddingLeft: '2.5rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredData.length > 0 ? (
          <div style={{ overflow: 'auto', maxHeight: '500px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead style={{ background: 'hsl(var(--bg-body))', position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th style={{ padding: '1rem', borderBottom: '1px solid hsl(var(--border))', fontWeight: 600, width: '50px' }}>No.</th>
                  {Object.keys(filteredData[0] || {}).map(key => (
                    <th key={key} style={{ padding: '1rem', borderBottom: '1px solid hsl(var(--border))', fontWeight: 600 }}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid hsl(var(--border))', transition: 'background 0.2s' }} className="hover-row">
                    <td style={{ padding: '1rem', color: 'hsl(var(--text-muted))' }}>{idx + 1}</td>
                    {Object.values(row).map((val: any, i) => (
                      <td key={i} style={{ padding: '1rem' }}>{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
            {currentSavedData.length === 0 
              ? `Belum ada data master ${activeTab === 'RUANGAN' ? 'ruangan' : 'pegawai'} yang tersimpan di database.` 
              : "Pencarian tidak menemukan hasil."}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hover-row:hover { background: hsla(var(--primary), 0.03); }
      `}} />
    </>
  );
}
