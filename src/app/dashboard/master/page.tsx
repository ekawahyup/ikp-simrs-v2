"use client";

import { useState, useEffect } from "react";
import { Database, Search, Plus, Trash2, Loader2, Save, RefreshCw } from "lucide-react";

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<'RUANGAN' | 'PEGAWAI'>('RUANGAN');
  
  const [ruanganData, setRuanganData] = useState<any[]>([]);
  const [pegawaiData, setPegawaiData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // States for Adding New Data
  const [isAdding, setIsAdding] = useState(false);
  const [newRowData, setNewRowData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resR = await fetch('/api/master/ruangan');
      const jsonR = await resR.json();
      if (jsonR.data) setRuanganData(jsonR.data);
      
      const resP = await fetch('/api/master/pegawai');
      const jsonP = await resP.json();
      if (jsonP.data) setPegawaiData(jsonP.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (index: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini? Aksi ini akan menghapus langsung dari Google Sheets.')) return;
    
    setIsLoading(true);
    const endpoint = activeTab === 'RUANGAN' ? '/api/master/ruangan' : '/api/master/pegawai';
    try {
      await fetch(`${endpoint}?index=${index}`, { method: 'DELETE' });
      await fetchData();
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const endpoint = activeTab === 'RUANGAN' ? '/api/master/ruangan' : '/api/master/pegawai';
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRowData)
      });
      setIsAdding(false);
      setNewRowData({});
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const currentData = activeTab === 'RUANGAN' ? ruanganData : pegawaiData;
  const filteredData = currentData.filter(row => {
    if (!searchQuery) return true;
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Ambil kolom dari data yang ada, atau gunakan default jika kosong
  let columns: string[] = [];
  if (currentData.length > 0) {
    columns = Object.keys(currentData[0]);
  } else {
    columns = activeTab === 'RUANGAN' ? ['Ruangan'] : ['Nama', 'NIP', 'Jabatan', 'Unit'];
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>Sinkronisasi Master Data Google Sheets</h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>Data ini terhubung langsung secara real-time dengan Google Sheets Anda.</p>
        </div>
        <button onClick={fetchData} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Segarkan Data
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => { setActiveTab('RUANGAN'); setIsAdding(false); setNewRowData({}); }} className={`btn ${activeTab === 'RUANGAN' ? 'btn-primary' : 'btn-outline'}`}>Master Ruangan & Unit</button>
        <button onClick={() => { setActiveTab('PEGAWAI'); setIsAdding(false); setNewRowData({}); }} className={`btn ${activeTab === 'PEGAWAI' ? 'btn-primary' : 'btn-outline'}`}>Master Pegawai</button>
      </div>

      {isAdding && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid hsl(var(--primary))' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', color: 'hsl(var(--primary))' }}>Tambah Data {activeTab === 'RUANGAN' ? 'Ruangan' : 'Pegawai'} Baru</h3>
          <form onSubmit={handleAddSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {columns.map(col => (
                <div key={col} className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{col}</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    value={newRowData[col] || ''} 
                    onChange={(e) => setNewRowData({...newRowData, [col]: e.target.value})}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsAdding(false)} className="btn btn-outline">Batal</button>
              <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />} Simpan ke Sheets
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Database size={20} style={{ color: 'hsl(var(--primary))' }} />
            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))', margin: 0 }}>Total: <strong>{currentData.length}</strong> Baris Data</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '500px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
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
            <button onClick={() => setIsAdding(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <Plus size={16} /> Tambah Data
            </button>
          </div>
        </div>

        {isLoading && currentData.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'hsl(var(--primary))' }}>
            <Loader2 size={32} className="spin" style={{ margin: '0 auto', marginBottom: '1rem' }} />
            <p>Menarik data dari Google Sheets...</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div style={{ overflow: 'auto', maxHeight: '600px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead style={{ background: 'hsl(var(--bg-body))', position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th style={{ padding: '1rem', borderBottom: '1px solid hsl(var(--border))', fontWeight: 600, width: '50px' }}>No.</th>
                  {columns.map(key => (
                    <th key={key} style={{ padding: '1rem', borderBottom: '1px solid hsl(var(--border))', fontWeight: 600 }}>{key}</th>
                  ))}
                  <th style={{ padding: '1rem', borderBottom: '1px solid hsl(var(--border))', fontWeight: 600, width: '80px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid hsl(var(--border))', transition: 'background 0.2s' }} className="hover-row">
                    <td style={{ padding: '1rem', color: 'hsl(var(--text-muted))' }}>{idx + 1}</td>
                    {columns.map((col, i) => (
                      <td key={i} style={{ padding: '1rem' }}>{String(row[col] || '-')}</td>
                    ))}
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button onClick={() => handleDelete(idx)} className="btn btn-outline" style={{ padding: '0.5rem', color: 'hsl(var(--risk-red))', borderColor: 'transparent' }} title="Hapus dari Google Sheets">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
            {currentData.length === 0 
              ? `Belum ada data ${activeTab === 'RUANGAN' ? 'ruangan' : 'pegawai'} di tab Google Sheets Anda. Silakan isi langsung di Google Sheets atau klik Tambah Data.` 
              : "Pencarian tidak menemukan hasil."}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hover-row:hover { background: hsla(var(--primary), 0.03); }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}} />
    </>
  );
}
