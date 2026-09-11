'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';

type Memory = { id:string; text:string; trigger?:string; why?:string; state?:string; confidence?:number; createdAt:string; resurfacedCount?:number };
const KEY = 'afterimage:memories:v2';

export default function FutureSelfLauncher() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY) || '[]';
      const memories = JSON.parse(raw) as Memory[];
      const active = memories.filter(m => m.state !== 'archived' && m.state !== 'outdated');
      setCount(active.length);
    } catch { setCount(0); }
  }, []);

  return (
    <Link className="future-launcher" href="/future-self" aria-label="Open Future Self inbox">
      <span className="future-launcher-icon"><Sparkles size={14}/></span>
      <span><b>Future Self</b><small>{count} active {count === 1 ? 'memory' : 'memories'}</small></span>
      <ArrowUpRight size={15}/>
    </Link>
  );
}
