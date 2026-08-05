"use client";

import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface Report {
  id: string;
  tanggal: string;
  namaPelapor: string;
  unitPelapor: string;
  noRm: string;
  pasien: string;
  ruanganPasien: string;
  waktuInsiden: string;
  lokasi: string;
  jenis: string;
  kronologi: string;
  grading: string;
  status: string;
}

interface Props {
  reports: Report[];
}

// Colors for Pie Charts
const GRADING_COLORS: Record<string, string> = {
  MERAH: 'hsl(var(--risk-red))',
  KUNING: 'hsl(var(--risk-kuning, 48 96% 53%))', // Adjusted for yellow
  BIRU: 'hsl(var(--risk-biru, 217 91% 60%))',
  HIJAU: 'hsl(var(--risk-green))',
  'BELUM DIGRADING': 'hsl(var(--text-muted))'
};

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export default function DashboardCharts({ reports }: Props) {
  // 1. Data per Ruangan (Lokasi)
  const ruanganData = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach(r => {
      // Prioritize lokasi, fallback to ruanganPasien, then unitPelapor
      let loc = r.lokasi;
      if (!loc || loc === '-' || loc === 'Tidak diketahui') loc = r.ruanganPasien;
      if (!loc || loc === '-' || loc === 'Tidak diketahui') loc = r.unitPelapor;
      if (!loc || loc === '-') loc = 'Lainnya';
      
      map[loc] = (map[loc] || 0) + 1;
    });
    return Object.keys(map).map(k => ({ name: k, Total: map[k] })).sort((a, b) => b.Total - a.Total).slice(0, 10); // Top 10
  }, [reports]);

  // 2. Data per Tanggal (Tren Harian)
  const tanggalData = useMemo(() => {
    const map: Record<string, number> = {};
    // Sort reports by actual date? Since format is "dd MMM yyyy", we might need to just use it as categorical or parse it.
    // For simplicity, we just aggregate and rely on the string sorting or insertion order if it's already sorted.
    reports.forEach(r => {
      const tgl = r.tanggal || 'Unknown';
      map[tgl] = (map[tgl] || 0) + 1;
    });
    // We can try to sort by parsing date
    return Object.keys(map)
      .map(k => ({ date: k, Kasus: map[k], timestamp: new Date(k).getTime() }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(d => ({ name: d.date, Kasus: d.Kasus }));
  }, [reports]);

  // 3. Beban Grading
  const gradingData = useMemo(() => {
    const map: Record<string, number> = { MERAH: 0, KUNING: 0, BIRU: 0, HIJAU: 0 };
    reports.forEach(r => {
      const g = r.grading?.toUpperCase();
      if (['MERAH', 'KUNING', 'BIRU', 'HIJAU'].includes(g)) {
        map[g]++;
      } else {
        map['BELUM DIGRADING'] = (map['BELUM DIGRADING'] || 0) + 1;
      }
    });
    return Object.keys(map).map(k => ({ name: k, value: map[k] })).filter(d => d.value > 0);
  }, [reports]);

  // 4. Kategori Sumber Insiden (Jenis)
  const jenisData = useMemo(() => {
    const map: Record<string, number> = {};
    reports.forEach(r => {
      const jenis = r.jenis || 'Lainnya';
      map[jenis] = (map[jenis] || 0) + 1;
    });
    return Object.keys(map).map(k => ({ name: k, value: map[k] })).sort((a, b) => b.value - a.value);
  }, [reports]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
      
      {/* Chart 1: Data per Ruangan */}
      <div className="glass-panel" style={{ padding: '1.5rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'hsl(var(--text-main))' }}>
          Total Insiden per Ruangan
        </h3>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ruanganData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: 'hsl(var(--text-muted))' }} />
              <RechartsTooltip cursor={{ fill: 'hsla(var(--primary), 0.1)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="Total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Data per Tanggal */}
      <div className="glass-panel" style={{ padding: '1.5rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'hsl(var(--text-main))' }}>
          Tren Insiden Harian
        </h3>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tanggalData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--text-muted))' }} axisLine={false} tickLine={false} />
              <RechartsTooltip cursor={{ fill: 'hsla(var(--primary), 0.1)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="Kasus" fill="hsl(var(--risk-biru, 217 91% 60%))" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Kategori Insiden (Pie) */}
      <div className="glass-panel" style={{ padding: '1.5rem', height: '350px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'hsl(var(--text-main))', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} style={{ color: 'hsl(var(--primary))' }}/> Kategori Sumber Insiden
        </h3>
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={jenisData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {jenisData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Beban Grading (Pie) */}
      <div className="glass-panel" style={{ padding: '1.5rem', height: '350px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'hsl(var(--text-main))', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={18} style={{ color: 'hsl(var(--text-main))' }}/> Beban Grading (Risiko)
        </h3>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gradingData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={110}
                dataKey="value"
                stroke="hsl(var(--bg-body))"
                strokeWidth={2}
                label={({ name, value }) => `${name} (${value})`}
              >
                {gradingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={GRADING_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
