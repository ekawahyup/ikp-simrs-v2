"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, MoreVertical, ShieldCheck, UserCircle, ShieldAlert, X, Edit, Trash2, CheckSquare, Square, Loader2, Save } from "lucide-react";

type UserRole = "PELAPOR" | "VERIFIKATOR" | "KOMITE_MUTU" | "ADMIN_IT";

interface User {
  id: string; // using email as ID or index
  name: string;
  email: string;
  unit: string;
  role: UserRole;
  password?: string;
  index?: number;
}

// Multi-Select Dropdown Component
function MultiSearchableSelect({ options, values, onChange, placeholder }: { options: string[], values: string[], onChange: (vals: string[]) => void, placeholder: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  const toggleOption = (opt: string) => {
    if (values.includes(opt)) {
      onChange(values.filter(v => v !== opt));
    } else {
      onChange([...values, opt]);
    }
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div style={{ position: 'relative' }}>
      <div 
        className="form-input"
        style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', minHeight: '42px', alignItems: 'center', cursor: 'text' }}
        onClick={() => setIsOpen(true)}
      >
        {values.length > 0 ? (
          values.map(val => (
            <span key={val} style={{ background: 'hsl(var(--primary))', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {val}
              <button type="button" onClick={(e) => { e.stopPropagation(); toggleOption(val); }} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={12} /></button>
            </span>
          ))
        ) : (
          <span style={{ color: 'hsl(var(--text-muted))' }}>{placeholder}</span>
        )}
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'hsl(var(--bg-surface))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius-md)', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: 'var(--shadow-md)', marginTop: '4px', padding: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Cari ruangan..." 
            className="form-input" 
            style={{ marginBottom: '0.5rem', width: '100%', padding: '0.5rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filtered.length > 0 ? filtered.map(opt => (
              <div 
                key={opt} 
                onClick={() => toggleOption(opt)}
                style={{ padding: '0.5rem', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
                className="hover-menu"
              >
                {values.includes(opt) ? <CheckSquare size={16} style={{ color: 'hsl(var(--primary))' }}/> : <Square size={16} style={{ color: 'hsl(var(--text-muted))' }}/>}
                {opt}
              </div>
            )) : (
              <div style={{ padding: '0.5rem', color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>Tidak ditemukan</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Single-Select Searchable
function SearchableSelect({ options, value, onChange, placeholder }: { options: string[], value: string, onChange: (val: string) => void, placeholder: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ position: 'relative' }}>
      <input 
        type="text" 
        className="form-input" 
        placeholder={placeholder}
        value={isOpen ? search : (value || "")}
        onChange={(e) => { setSearch(e.target.value); setIsOpen(true); onChange(""); }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        style={{ width: '100%' }}
      />
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'hsl(var(--bg-surface))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius-md)', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: 'var(--shadow-md)', marginTop: '4px' }}>
          {filtered.length > 0 ? filtered.map(opt => (
            <div 
              key={opt} 
              onClick={() => { onChange(opt); setSearch(""); setIsOpen(false); }}
              style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid hsl(var(--border))', fontSize: '0.875rem' }}
              className="hover-menu"
            >
              {opt}
            </div>
          )) : (
            <div style={{ padding: '0.75rem 1rem', color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>Tidak ditemukan</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TimPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [activeUser, setActiveUser] = useState<Partial<User>>({});
  const [activeUnits, setActiveUnits] = useState<string[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [masterPegawai, setMasterPegawai] = useState<string[]>([]);
  const [masterUnit, setMasterUnit] = useState<string[]>([]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/master/akses');
      const json = await res.json();
      if (json.data) {
        setUsers(json.data.map((row: any, index: number) => ({
          id: row.Email || row.EMAIL || row.email,
          index: index,
          name: row.Nama || row.NAMA || row.nama,
          email: row.Email || row.EMAIL || row.email,
          password: row.Password || row.PASSWORD || row.password,
          role: row.Role || row.ROLE || row.role,
          unit: row.Unit || row.UNIT || row.unit
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    const fetchMasterData = async () => {
      try {
        const resR = await fetch('/api/master/ruangan');
        const jsonR = await resR.json();
        if (jsonR.data && jsonR.data.length > 0) {
          const units = jsonR.data.map((row: any) => Object.values(row)[0] as string);
          setMasterUnit(Array.from(new Set(units)));
        }

        const resP = await fetch('/api/master/pegawai');
        const jsonP = await resP.json();
        if (jsonP.data && jsonP.data.length > 0) {
          const employees = jsonP.data.map((row: any) => Object.values(row)[0] as string);
          setMasterPegawai(Array.from(new Set(employees)));
        }
      } catch (e) {
        console.error("Gagal menarik data master dari Google Sheets");
      }
    };
    fetchMasterData();
  }, []);

  const handleOpenAdd = () => {
    setModalMode("ADD");
    setActiveUser({ role: "PELAPOR", password: "user123" });
    setActiveUnits([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setModalMode("EDIT");
    setActiveUser(user);
    setActiveUnits(user.unit ? user.unit.split(',').map(s => s.trim()).filter(Boolean) : []);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleDelete = async (index?: number) => {
    if (index === undefined) return;
    if (confirm("Apakah Anda yakin ingin menghapus akun ini dari Google Sheets?")) {
      try {
        await fetch(`/api/master/akses?index=${index}`, { method: 'DELETE' });
        fetchUsers();
      } catch (e) {
        console.error(e);
      }
    }
    setActiveMenu(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const rowData = {
      NAMA: activeUser.name,
      EMAIL: activeUser.email,
      PASSWORD: activeUser.password,
      ROLE: activeUser.role,
      UNIT: activeUnits.join(', ')
    };

    try {
      if (modalMode === "ADD") {
        await fetch('/api/master/akses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rowData)
        });
      } else {
        // DELETE old and POST new since we only have POST and DELETE in our simple API
        // For a full implementation, we should have PUT, but for now we'll delete and add
        if (activeUser.index !== undefined) {
          await fetch(`/api/master/akses?index=${activeUser.index}`, { method: 'DELETE' });
        }
        await fetch('/api/master/akses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rowData)
        });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const renderRoleBadge = (role: string) => {
    if (role === "PELAPOR") return <span style={{ background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>Petugas Pelapor</span>;
    if (role === "VERIFIKATOR") return <span style={{ background: 'hsla(var(--risk-yellow), 0.2)', color: 'hsl(var(--risk-yellow))', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>Verifikator (Kepala Unit)</span>;
    if (role === "KOMITE_MUTU") return <span style={{ background: 'hsla(var(--risk-red), 0.1)', color: 'hsl(var(--risk-red))', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>Komite Mutu (KPRS)</span>;
    return <span style={{ background: 'hsla(var(--text-main), 0.1)', color: 'hsl(var(--text-main))', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>Administrator</span>;
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>Pengaturan Hak Akses</h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>Kelola daftar pengguna yang tersinkronisasi langsung dengan tab "akses" di Google Sheets Anda.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary hover-lift" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <UserPlus size={16}/> Tambah Pengguna
        </button>
      </div>

      {/* Stats/Categories */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid hsl(var(--primary))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <UserCircle size={20} style={{ color: 'hsl(var(--primary))' }}/>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Petugas Pelapor</h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Staf pelayanan (hanya bisa membuat Laporan Baru).</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid hsl(var(--risk-yellow))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <ShieldCheck size={20} style={{ color: 'hsl(var(--risk-yellow))' }}/>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Verifikator</h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Kepala Unit (bisa melakukan Grading Risiko Awal).</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid hsl(var(--risk-red))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <ShieldAlert size={20} style={{ color: 'hsl(var(--risk-red))' }}/>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Komite Mutu</h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Akses ke seluruh data & Investigasi RCA.</p>
        </div>
      </div>

      {/* User Table */}
      <div className="glass-panel" style={{ overflow: 'visible' }}>
        {isLoading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'hsl(var(--primary))' }}>
            <Loader2 size={32} className="spin" style={{ margin: '0 auto', marginBottom: '1rem' }} />
            <p>Menarik data dari Google Sheets...</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
            <p>Belum ada data di tab "akses". Tambahkan melalui tombol di atas atau langsung di Google Sheets.</p>
          </div>
        ) : (
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'hsl(var(--bg-body))', borderBottom: '1px solid hsl(var(--border))' }}>
                <tr>
                  <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>PENGGUNA</th>
                  <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>UNIT TUGAS</th>
                  <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>ROLE / LEVEL</th>
                  <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'hsl(var(--text-muted))', fontWeight: 600, textAlign: 'right' }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.index} style={{ borderBottom: '1px solid hsl(var(--border))', transition: 'background 0.2s' }} className="hover-row">
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      <strong style={{ display: 'block' }}>{user.name}</strong>
                      <span style={{color: 'hsl(var(--text-muted))'}}>{user.email}</span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {user.unit && user.unit.split(',').map((u, i) => (
                          <span key={i} style={{ background: 'hsl(var(--bg-body))', border: '1px solid hsl(var(--border))', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{u.trim()}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      {renderRoleBadge(user.role)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', position: 'relative' }}>
                      <button onClick={() => setActiveMenu(activeMenu === user.email ? null : user.email)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))', padding: '0.5rem' }}>
                        <MoreVertical size={18} />
                      </button>
                      {/* Dropdown Menu */}
                      {activeMenu === user.email && (
                        <div style={{ position: 'absolute', right: '2rem', top: '2.5rem', background: 'hsl(var(--bg-surface))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 10, width: '150px', textAlign: 'left', overflow: 'hidden' }}>
                          <button onClick={() => handleOpenEdit(user)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'transparent', border: 'none', borderBottom: '1px solid hsl(var(--border))', cursor: 'pointer', fontSize: '0.875rem', color: 'hsl(var(--text-main))' }} className="hover-menu">
                            <Edit size={14} /> Edit Data
                          </button>
                          <button onClick={() => handleDelete(user.index)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'hsl(var(--risk-red))' }} className="hover-menu">
                            <Trash2 size={14} /> Hapus Akun
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative', background: 'hsl(var(--bg-surface))', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>{modalMode === 'ADD' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}</h2>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nama Lengkap</label>
                <SearchableSelect 
                  options={masterPegawai} 
                  value={activeUser.name || ""} 
                  onChange={(val) => setActiveUser({...activeUser, name: val})}
                  placeholder="Ketik untuk mencari dari Master Pegawai..."
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email (Untuk Login)</label>
                <input type="email" className="form-input" required value={activeUser.email || ''} onChange={e => setActiveUser({...activeUser, email: e.target.value})} placeholder="Cth: budi@rsdgunungjati.id" />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Kata Sandi (Password)</label>
                <input type="text" className="form-input" required value={activeUser.password || ''} onChange={e => setActiveUser({...activeUser, password: e.target.value})} />
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>Password akan disimpan di Google Sheets.</span>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Peran / Level</label>
                <select className="form-select" required value={activeUser.role || 'PELAPOR'} onChange={e => setActiveUser({...activeUser, role: e.target.value as UserRole})}>
                  <option value="PELAPOR">Petugas Pelapor</option>
                  <option value="VERIFIKATOR">Verifikator</option>
                  <option value="KOMITE_MUTU">Komite Mutu (KPRS)</option>
                  <option value="ADMIN_IT">Administrator IT</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Unit Tugas (Bisa Pilih Lebih Dari Satu)</label>
                <MultiSearchableSelect 
                  options={masterUnit} 
                  values={activeUnits} 
                  onChange={(vals) => setActiveUnits(vals)}
                  placeholder="Pilih unit/ruangan..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>Batal</button>
                <button type="submit" disabled={isSaving} className="btn btn-primary hover-lift" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                  {modalMode === 'ADD' ? 'Simpan Pengguna' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .hover-row:hover { background: hsla(var(--primary), 0.03); }
        .hover-menu:hover { background: hsla(var(--primary), 0.05); }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}} />
    </>
  );
}
