"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        setIsSubscribed(true);
      } else {
        // Not subscribed yet, check if permission is granted
        if (Notification.permission === 'granted') {
          // If granted but no subscription, try to subscribe silently
          subscribe();
        } else if (Notification.permission === 'default') {
          // Ask user
          setShowBanner(true);
        }
      }
    } catch (e) {
      console.error('SW Registration Error', e);
    }
  };

  const subscribe = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const res = await fetch('/api/push/vapidPublic');
      const { publicKey } = await res.json();
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
      
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
      
      setIsSubscribed(true);
      setShowBanner(false);
      
      // Optional: show local notification to confirm
      new Notification("Notifikasi Aktif!", {
        body: "Anda akan menerima pemberitahuan setiap ada insiden baru.",
        icon: "/logo.png"
      });
      
    } catch (e) {
      console.error('Subscription failed', e);
      if (Notification.permission === 'denied') {
        alert("Notifikasi telah diblokir oleh browser. Silakan izinkan melalui pengaturan browser Anda.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported || !showBanner || isSubscribed) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      background: 'hsl(var(--surface))',
      padding: '1.25rem',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-xl)',
      border: '1px solid hsl(var(--border))',
      zIndex: 50,
      maxWidth: '350px',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      animation: 'slideUp 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', padding: '0.5rem', borderRadius: '50%' }}>
            <Bell size={20} />
          </div>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Nyalakan Notifikasi</h4>
        </div>
        <button onClick={() => setShowBanner(false)} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'hsl(var(--text-muted))', lineHeight: 1.5 }}>
        Terima pemberitahuan secara *real-time* setiap kali ada insiden keselamatan pasien baru di unit Anda.
      </p>
      <button 
        onClick={subscribe}
        disabled={isLoading}
        className="btn btn-primary"
        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
      >
        {isLoading ? "Mengaktifkan..." : "Aktifkan Sekarang"}
      </button>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
}
