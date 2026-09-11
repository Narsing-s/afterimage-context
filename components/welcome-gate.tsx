'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Brain, Compass, Lightbulb, ShieldCheck, X } from 'lucide-react';

const KEY = 'afterimage:welcome:v1';

const STEPS = [
  {
    eyebrow: '01 · CAPTURE',
    title: 'Give your future self the missing context.',
    body: 'Save a decision, lesson, or thought while it is fresh — with the situation that makes it useful later.',
    icon: Lightbulb,
    label: 'Capture what matters',
  },
  {
    eyebrow: '02 · RESURFACE',
    title: 'Let the right memory find its moment.',
    body: 'Afterimage looks for meaningful context instead of relying only on dates. When a similar situation returns, your past can return with it.',
    icon: Compass,
    label: 'Resurface when useful',
  },
  {
    eyebrow: '03 · YOUR CONTROL',
    title: 'Your memory stays yours.',
    body: 'Start local-first. Review, change, archive, or remove memories whenever you want. Afterimage is designed to stay quiet until it has something useful to say.',
    icon: ShieldCheck,
    label: 'Stay in control',
  },
];

export default function WelcomeGate() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

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

  const current = STEPS[step];
  const Icon = current.icon;
  const last = step === STEPS.length - 1;

  return (
    <div className="welcome-backdrop" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <section className="welcome-card">
        <button className="welcome-close" onClick={dismiss} aria-label="Close welcome message">
          <X size={18} />
        </button>

        <div className="welcome-topline">
          <div className="welcome-kicker"><span className="welcome-dot" /> AFTERIMAGE</div>
          <div className="welcome-progress" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((_, index) => <span key={index} className={index === step ? 'active' : ''} />)}
          </div>
        </div>

        <div className="welcome-icon"><Icon size={25} /></div>
        <div className="welcome-eyebrow">{current.eyebrow}</div>
        <h2 id="welcome-title">{current.title}</h2>
        <p className="welcome-lead">{current.body}</p>

        <div className="welcome-step-card">
          <div className="welcome-step-number">{String(step + 1).padStart(2, '0')}</div>
          <div>
            <strong>{current.label}</strong>
            <span>{step === 0 ? 'A memory is more useful when it remembers why it mattered.' : step === 1 ? 'Context is the trigger — not another notification to dismiss.' : 'No account required. No ads. No silent browsing history.'}</span>
          </div>
        </div>

        <div className="welcome-actions">
          {step > 0 ? (
            <button className="welcome-secondary welcome-back" onClick={() => setStep((value) => value - 1)}>
              <ArrowLeft size={16} /> Back
            </button>
          ) : <span />}
          {last ? (
            <Link href="/future-self" className="welcome-primary" onClick={dismiss}>Enter Afterimage <ArrowRight size={16} /></Link>
          ) : (
            <button className="welcome-primary" onClick={() => setStep((value) => value + 1)}>Next <ArrowRight size={16} /></button>
          )}
        </div>

        <p className="welcome-hint">A short introduction. You can revisit your Future Self anytime.</p>
      </section>
    </div>
  );
}
