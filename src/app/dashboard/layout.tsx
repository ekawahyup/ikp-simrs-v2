import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { LogOut, Users, Activity, FileText } from "lucide-react";
import Link from "next/link";
import PushManager from "@/components/PushManager";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(var(--bg-body))', display: 'flex' }}>
      <aside style={{ width: '250px', background: 'hsl(var(--bg-surface))', borderRight: '1px solid hsl(var(--border))', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '1.125rem', color: 'hsl(var(--primary))' }}>
          <img src="/logo.png" alt="Logo" width={32} height={32} style={{ objectFit: 'contain' }} />
          <span>IKP Dashboard</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'hsl(var(--primary))', textDecoration: 'none', fontWeight: 500 }} className="hover-lift">
            <Activity size={20} /> Ikhtisar
          </Link>
          <Link href="/dashboard/laporan" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'hsl(var(--text-muted))', textDecoration: 'none', fontWeight: 500 }} className="hover-lift">
            <FileText size={20} /> Laporan Masuk
          </Link>
          
          {['ADMIN_IT', 'VERIFIKATOR'].includes(session?.user?.role) && (
            <Link href="/dashboard/tim" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'hsl(var(--text-muted))', textDecoration: 'none', fontWeight: 500 }} className="hover-lift">
              <Users size={20} /> Tim & Akses
            </Link>
          )}

          {session?.user?.role === 'ADMIN_IT' && (
            <>
              <div style={{ margin: '1rem 0', height: '1px', background: 'hsl(var(--border))' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '0.75rem' }}>Administrator</span>
              <Link href="/dashboard/master" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'hsl(var(--text-muted))', textDecoration: 'none', fontWeight: 500 }} className="hover-lift">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Data Master
              </Link>
              <Link href="/dashboard/pengaturan" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'hsl(var(--text-muted))', textDecoration: 'none', fontWeight: 500 }} className="hover-lift">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg> Integrasi SIMRS
              </Link>
            </>
          )}
        </nav>
        <form action={async () => { "use server"; await signOut(); }}>
          <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem', background: 'transparent', border: 'none', color: 'hsl(var(--risk-red))', cursor: 'pointer', fontWeight: 500 }} className="hover-lift">
            <LogOut size={20} /> Keluar
          </button>
        </form>
      </aside>
      <main style={{ flex: 1, padding: '3rem', overflowY: 'auto', height: '100vh' }}>
        {children}
      </main>
      <PushManager />
    </div>
  );
}
