'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BellRing, Brain, Check, Clock3, Compass, LockKeyhole, Sparkles, Trash2, Zap } from 'lucide-react';

type Memory = { id: string; text: string; mode: 'signal' | 'pattern'; createdAt: string };

const examples = [
  { text: 'I keep forgetting why I chose the cheaper hosting plan.', tag: 'decision', when: 'When you compare hosting again' },
  { text: 'If I am still avoiding this task tomorrow, show me the smallest next move.', tag: 'moment', when: 'Tomorrow at 9:00' },
  { text: 'Before I buy another keyboard, remind me I already own two.', tag: 'pattern', when: 'Next time I shop for keyboards' }
];

export default function Home() {
  const [input, setInput] = useState('');
  const [captured, setCaptured] = useState(false);
  const [mode, setMode] = useState<'signal' | 'pattern'>('signal');
  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    try { setMemories(JSON.parse(localStorage.getItem('afterimage:memories') || '[]')); } catch { /* ignore malformed local data */ }
  }, []);

  const sample = useMemo(() => input.trim() || examples[0].text, [input]);

  function capture() {
    const memory: Memory = { id: crypto.randomUUID(), text: sample, mode, createdAt: new Date().toISOString() };
    const next = [memory, ...memories].slice(0, 20);
    setMemories(next);
    localStorage.setItem('afterimage:memories', JSON.stringify(next));
    setCaptured(true);
    setInput('');
  }

  function clearMemories() {
    setMemories([]);
    localStorage.removeItem('afterimage:memories');
  }

  return (
    <main className="shell">
      <nav className="nav"><div className="brand"><span className="mark"><Sparkles size={15}/></span> AFTERIMAGE</div><div className="navlink"><LockKeyhole size={12}/> Private by design</div></nav>

      <section className="hero">
        <div className="eyebrow"><span className="pulse"/> A new kind of personal software</div>
        <h1>Your apps remember<br/><em>the wrong things.</em></h1>
        <p className="lede">Afterimage remembers the tiny context that matters — then waits until the moment it becomes useful again.</p>

        <div className="capture">
          <div className="capture-top"><span>Leave an afterimage</span><span className="hint">No lists. No streaks. No feed.</span></div>
          <textarea aria-label="Memory for future you" value={input} onChange={e=>{setInput(e.target.value);setCaptured(false)}} placeholder="Tell future you something current-you knows…" />
          <div className="capture-bottom"><div className="chips"><button className={mode==='signal'?'active':''} onClick={()=>setMode('signal')}><Clock3 size={14}/> Find the right moment</button><button className={mode==='pattern'?'active':''} onClick={()=>setMode('pattern')}><Compass size={14}/> Find the next pattern</button></div><button className="send" aria-label="Store afterimage" onClick={capture}>{captured?<Check size={18}/>:<ArrowRight size={18}/>}</button></div>
        </div>

        {captured && <div className="preview" role="status"><div className="preview-icon"><BellRing size={18}/></div><div><b>Stored as a {mode === 'signal' ? 'context signal' : 'pattern trigger'}.</b><p>“{sample}”</p><small>Saved only in this browser for now. The future engine will match the return condition instead of firing a generic reminder.</small></div></div>}
      </section>

      <section className="why"><div className="section-kicker">THE DIFFERENCE</div><h2>Memory that moves through time.</h2><div className="grid"><Feature icon={<Brain/>} title="Context, not reminders" body="You don't schedule a notification. You teach the app what situation should bring a memory back."/><Feature icon={<Zap/>} title="One useful signal" body="Afterimage deliberately surfaces one thing instead of becoming another dashboard full of unread work."/><Feature icon={<Sparkles/>} title="Your patterns become visible" body="Over time, recurring choices, unfinished intentions and forgotten reasons connect into a private map."/></div></section>

      <section className="demo"><div><div className="section-kicker">HOW IT FEELS</div><h2>The app disappears.<br/>The moment doesn't.</h2><p>Imagine comparing a phone plan six months from now. Instead of searching old notes, Afterimage quietly says: “Last time you chose the 12‑month plan because you hated switching. You said to check roaming before deciding again.”</p></div><div className="timeline"><div className="node old"><span>JAN</span><b>Captured</b><p>“I chose this because switching costs hurt more than the extra ₹300.”</p></div><div className="line"/><div className="node now"><span>JUL</span><b>Context detected</b><p>You're comparing the same category again.</p></div><div className="line"/><div className="node reveal"><span>NOW</span><b>Afterimage</b><p>“Here’s what mattered to you last time.”</p></div></div></section>

      <section className="examples"><div className="section-kicker">TRY THE IDEA</div><h2>Three memories worth keeping.</h2><div className="cards">{examples.map((x,i)=><button key={i} className="example" onClick={()=>{setInput(x.text);setCaptured(false)}}><span className="tag">{x.tag}</span><p>{x.text}</p><small>{x.when}</small></button>)}</div></section>

      {memories.length > 0 && <section className="memory-wall"><div><div className="section-kicker">LOCAL MEMORY</div><h2>What you've left behind.</h2></div><button className="clear" onClick={clearMemories}><Trash2 size={14}/> Clear local memories</button><div className="memory-list">{memories.map(memory=><article className="memory" key={memory.id}><span>{memory.mode === 'signal' ? 'CONTEXT' : 'PATTERN'}</span><p>{memory.text}</p><small>Stored {new Date(memory.createdAt).toLocaleString()}</small></article>)}</div></section>}
      <footer><span>AFTERIMAGE / concept build 0.2</span><span>Not another productivity app.</span></footer>
    </main>
  );
}

function Feature({icon,title,body}:{icon:React.ReactNode;title:string;body:string}){return <article className="feature"><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{body}</p></article>}
