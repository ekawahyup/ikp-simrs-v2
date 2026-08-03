"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, MoreVertical, ShieldCheck, UserCircle, ShieldAlert, X, Edit, Trash2 } from "lucide-react";

type UserRole = "PELAPOR" | "VERIFIKATOR" | "KOMITE_MUTU";

interface User {
  id: string;
  name: string;
  email: string;
  unit: string;
  role: UserRole;
}

const DUMMY_USERS: User[] = [
  { id: "1", name: "Dr. Andi Setiawan", email: "andi.setiawan@rsdgunungjati.id", unit: "Instalasi Gawat Darurat (IGD)", role: "PELAPOR" },
  { id: "2", name: "Ns. Rina Kartika, S.Kep", email: "rina.kartika@rsdgunungjati.id", unit: "Rawat Inap - Melati", role: "VERIFIKATOR" },
  { id: "3", name: "Drg. Maya Larasati, MARS", email: "maya.mutu@rsdgunungjati.id", unit: "Manajemen / Komite", role: "KOMITE_MUTU" },
];

// Hardcoded fallback data in case no Excel uploaded
const FALLBACK_PEGAWAI = [
  "Dr. Budi Setiawan", "Dr. Siti Aminah", "Ns. Joko Anwar", "Ns. Rini Sugiarti", 
  "Drg. Ahmad Dahlan", "Bidan Sari", "Apoteker Linda", "Radiografer Tono"
];

const FALLBACK_UNIT = [
  "Manajemen / Komite", "Instalasi Gawat Darurat (IGD)", "ICU / HCU", 
  "Rawat Inap - Melati", "Rawat Inap - Mawar", "Instalasi Farmasi", 
  "Radiologi", "Laboratorium", "Instalasi Gizi"
];

// Custom Searchable Dropdown Component
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
  const [users, setUsers] = useState<User[]>(DUMMY_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [activeUser, setActiveUser] = useState<Partial<User>>({});
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [masterPegawai, setMasterPegawai] = useState<string[]>(FALLBACK_PEGAWAI);
  const [masterUnit, setMasterUnit] = useState<string[]>(FALLBACK_UNIT);

  useEffect(() => {
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
    setActiveUser({ role: "PELAPOR", unit: "IGD" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setModalMode("EDIT");
    setActiveUser(user);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus akun ini?")) {
      setUsers(users.filter(u => u.id !== id));
    }
    setActiveMenu(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "ADD") {
      const newUser = { ...activeUser, id: Math.random().toString() } as User;
      setUsers([...users, newUser]);
    } else {
      setUsers(users.map(u => u.id === activeUser.id ? (activeUser as User) : u));
    }
    setIsModalOpen(false);
  };

  const renderRoleBadge = (role: UserRole) => {
    if (role === "PELAPOR") return <span style={{ background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>Petugas Pelapor</span>;
    if (role === "VERIFIKATOR") return <span style={{ background: 'hsla(var(--risk-yellow), 0.2)', color: 'hsl(var(--risk-yellow))', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>Verifikator (Kepala Unit)</span>;
    return <span style={{ background: 'hsla(var(--risk-red), 0.1)', color: 'hsl(var(--risk-red))', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>Komite Mutu (KPRS)</span>;
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>Pengaturan Akun & Akses Pengguna</h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>Kelola pendataan login untuk Pelapor, Verifikator, dan Komite Mutu.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary hover-lift" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <UserPlus size={16}/> Tambah Pengguna
        </button>
      </div>

      {/* Stats/Categories */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid hsl(var(--primary))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <UserCircle size={20} style={{ color: 'hsl(var(--primary))' }}/>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Petugas Pelapor</h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Staf kesehatan di unit pelayanan.</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid hsl(var(--risk-kuning, 48 96% 53%))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <ShieldCheck size={20} style={{ color: 'hsl(var(--risk-kuning, 48 96% 53%))' }}/>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Verifikator (Kepala Unit)</h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Membawahi ruangan & melakukan grading.</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid hsl(var(--risk-red))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <ShieldAlert size={20} style={{ color: 'hsl(var(--risk-red))' }}/>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Komite Mutu (KPRS)</h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Akses seluruh data insiden & RCA.</p>
        </div>
      </div>

      {/* User Table */}
      <div className="glass-panel" style={{ overflow: 'visible' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
            <input type="text" placeholder="Cari nama, email, atau unit..." className="form-input" style={{ paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }} />
          </div>
        </div>
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
              <tr key={user.id} style={{ borderBottom: '1px solid hsl(var(--border))', transition: 'background 0.2s' }} className="hover-row">
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                  <strong style={{ display: 'block' }}>{user.name}</strong>
                  <span style={{color: 'hsl(var(--text-muted))'}}>{user.email}</span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{user.unit}</td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                  {renderRoleBadge(user.role)}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', position: 'relative' }}>
                  <button onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))', padding: '0.5rem' }}>
                    <MoreVertical size={18} />
                  </button>
                  {/* Dropdown Menu */}
                  {activeMenu === user.id && (
                    <div style={{ position: 'absolute', right: '2rem', top: '2.5rem', background: 'hsl(var(--bg-surface))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 10, width: '150px', textAlign: 'left', overflow: 'hidden' }}>
                      <button onClick={() => handleOpenEdit(user)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'transparent', border: 'none', borderBottom: '1px solid hsl(var(--border))', cursor: 'pointer', fontSize: '0.875rem', color: 'hsl(var(--text-main))' }} className="hover-menu">
                        <Edit size={14} /> Edit Data
                      </button>
                      <button onClick={() => handleDelete(user.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'hsl(var(--risk-red))' }} className="hover-menu">
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

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative', background: 'hsl(var(--bg-surface))' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>{modalMode === 'ADD' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}</h2>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nama Lengkap (Cari dari Master Pegawai)</label>
                <SearchableSelect 
                  options={masterPegawai} 
                  value={activeUser.name || ""} 
                  onChange={(val) => setActiveUser({...activeUser, name: val})}
                  placeholder="Ketik untuk mencari nama pegawai..."
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email (Untuk Login)</label>
                <input type="email" className="form-input" required value={activeUser.email || ''} onChange={e => setActiveUser({...activeUser, email: e.target.value})} placeholder="Cth: budi@rsdgunungjati.id" />
              </div>

              {modalMode === 'ADD' && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Kata Sandi Default</label>
                  <input type="text" className="form-input" required defaultValue="RSDGJ2026!" />
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>Kata sandi otomatis untuk pengguna baru.</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Peran / Level</label>
                  <select className="form-select" required value={activeUser.role || 'PELAPOR'} onChange={e => setActiveUser({...activeUser, role: e.target.value as UserRole})}>
                    <option value="PELAPOR">Petugas Pelapor</option>
                    <option value="VERIFIKATOR">Verifikator</option>
                    <option value="KOMITE_MUTU">Komite Mutu (KPRS)</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Unit Tugas (Cari dari Master Unit)</label>
                  <SearchableSelect 
                    options={masterUnit} 
                    value={activeUser.unit || ""} 
                    onChange={(val) => setActiveUser({...activeUser, unit: val})}
                    placeholder="Ketik untuk mencari unit..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>Batal</button>
                <button type="submit" className="btn btn-primary hover-lift" style={{ padding: '0.75rem 1.5rem' }}>{modalMode === 'ADD' ? 'Simpan Pengguna' : 'Simpan Perubahan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .hover-row:hover { background: hsla(var(--primary), 0.03); }
        .hover-menu:hover { background: hsla(var(--primary), 0.05); }
      `}} />
    </>
  );
}
