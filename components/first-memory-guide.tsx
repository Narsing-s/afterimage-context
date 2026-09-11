'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Lightbulb, X } from 'lucide-react';

const MEMORY_KEY = 'afterimage:memories:v2';
const GUIDE_KEY = 'afterimage:first-memory-guide:v1';

export default function FirstMemoryGuide() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      const memories = JSON.parse(localStorage.getItem(MEMORY_KEY) || '[]');
      const dismissed = localStorage.getItem(GUIDE_KEY) === 'dismissed';
      if (!dismissed && Array.isArray(memories) && memories.length === 0) setOpen(true);
    } catch {}
  }, []);
  if (!open) return null;
  const close = () => { localStorage.setItem(GUIDE_KEY, 'dismissed'); setOpen(false); };
  return <div className="first-memory-backdrop" role="dialog" aria-modal="true" aria-labelledby="first-memory-title">
    <section className="first-memory-card">
      <button className="first-memory-close" onClick={close} aria-label="Close first memory guide"><X size={17}/></button>
      <div className="first-memory-icon"><Lightbulb size={22}/></div>
      <div className="section-kicker">YOUR FIRST AFTERIMAGE</div>
      <h2 id="first-memory-title">Give future-you one useful piece of context.</h2>
      <p>Start with something you know now that you may forget later. The secret is the <strong>Return Condition</strong>: describe the situation that should bring it back.</p>
      <div className="first-memory-example"><span>EXAMPLE</span><b>“I chose this hosting plan because migration would cost more than the extra monthly price.”</b><small>Return when: I compare hosting again</small></div>
      <div className="first-memory-actions"><button className="first-memory-secondary" onClick={close}>I'll explore first</button><button className="first-memory-primary" onClick={() => { close(); setTimeout(() => document.querySelector<HTMLTextAreaElement>('textarea[aria-label="Memory for future you"]')?.focus(), 80); }}><span>Create my first memory</span><ArrowRight size={16}/></button></div>
    </section>
  </div>;
}
