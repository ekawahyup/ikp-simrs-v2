"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Email atau kata sandi salah.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, hsl(var(--bg-body)) 0%, #e0f2fe 100%)', padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
        
        {/* Background Decoration */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'hsla(var(--primary), 0.1)', borderRadius: '50%', filter: 'blur(30px)', zIndex: -1 }}></div>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <img src="/logo.png" alt="Logo RSD Gunung Jati" width={80} height={80} style={{ objectFit: 'contain', margin: '0 auto' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(var(--text-main))', letterSpacing: '-0.025em' }}>Masuk Portal IKP</h1>
          <p style={{ color: 'hsl(var(--text-muted))', marginTop: '0.5rem', fontSize: '0.875rem' }}>Silakan masuk menggunakan akun kepegawaian Anda.</p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', background: 'hsla(var(--risk-red), 0.1)', border: '1px solid hsla(var(--risk-red), 0.2)', borderRadius: 'var(--radius-md)', color: 'hsl(var(--risk-red))', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email / NIP</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }}>
                <Mail size={18} />
              </div>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rsdgunungjati.id" 
                className="form-input" 
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Kata Sandi</span>
              <a href="#" style={{ color: 'hsl(var(--primary))', fontSize: '0.75rem', textDecoration: 'none' }}>Lupa Sandi?</a>
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }}>
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="form-input" 
                style={{ paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary hover-lift" style={{ padding: '0.875rem', fontSize: '1rem', marginTop: '0.5rem', width: '100%' }} disabled={loading}>
            {loading ? 'Memverifikasi...' : <><ArrowRight size={18} /> Masuk ke Dashboard</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'hsl(var(--text-muted))' }}>
          <Link href="/" style={{ color: 'hsl(var(--primary))', textDecoration: 'none', fontWeight: 500 }}>&larr; Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  );
}
