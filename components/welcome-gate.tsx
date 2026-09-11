'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Brain, ShieldCheck, X } from 'lucide-react';

const KEY = 'afterimage:welcome:v1';

export default function WelcomeGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) !== 'seen') setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(KEY, 'seen'); } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="welcome-backdrop" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <section className="welcome-card">
        <button className="welcome-close" onClick={dismiss} aria-label="Close welcome message">
          <X size={18} />
        </button>
        <div className="welcome-kicker"><span className="welcome-dot" /> AFTERIMAGE</div>
        <div className="welcome-icon"><Brain size={25} /></div>
        <h2 id="welcome-title">Welcome to your future self.</h2>
        <p className="welcome-lead">Afterimage remembers what mattered before — then brings it back when it becomes useful again.</p>
        <div className="welcome-grid">
          <div><strong>Capture</strong><span>Save a thought with the moment it should return.</span></div>
          <div><strong>Resurface</strong><span>Get context back when a similar situation appears.</span></div>
          <div><strong>Stay in control</strong><span>Your memories stay local and can be changed or removed.</span></div>
        </div>
        <div className="welcome-privacy"><ShieldCheck size={16} /> Local-first. No account. No ads. No silent browsing history.</div>
        <div className="welcome-actions">
          <button className="welcome-primary" onClick={dismiss}>Start remembering <ArrowRight size={16} /></button>
          <Link href="/future-self" className="welcome-secondary" onClick={dismiss}>See Future Self</Link>
        </div>
        <p className="welcome-hint">You will only see this welcome once on this browser. You can return to the product anytime.</p>
      </section>
    </div>
  );
}
