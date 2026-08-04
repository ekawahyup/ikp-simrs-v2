"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import React from "react";

export default function MobileSidebarWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="mobile-menu-btn" 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 50,
          background: 'hsl(var(--bg-surface))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(var(--primary))'
        }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40
          }}
        />
      )}

      <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        {children}
      </div>
    </>
  );
}
