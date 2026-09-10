'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BellRing, Brain, Check, Clock3, Compass, FlaskConical, LockKeyhole, Sparkles, Trash2, Zap } from 'lucide-react';
import { ContextMatch, ContextMemory, matchContext } from '../lib/context-engine';

type Memory = ContextMemory;
const STORAGE_KEY = 'afterimage:memories:v1';

const examples = [
  { text: 'I keep forgetting why I chose the cheaper hosting plan.', tag: 'decision', when: 'When you compare hosting again' },
  { text: 'If I am still avoiding this task tomorrow, show me the smallest next move.', tag: 'moment', when: 'Tomorrow at 9:00' },
  { text: 'Before I buy another keyboard, remind me I already own two.', tag: 'pattern', when: 'Next time I shop for keyboards' }
];

const simulations = [
  'I am comparing hosting providers and migration costs again',
  'I am shopping for another keyboard today',
  'I am deciding whether to switch my phone plan',
  'I am avoiding the same task again'
];

export default function Home() {
  const [input, setInput] = useState('');
  const [trigger, setTrigger] = useState('');
  const [captured, setCaptured] = useState(false);
  const [mode, setMode] = useState<'signal' | 'pattern'>('signal');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [context, setContext] = useState('');
  const [matches, setMatches] = useState<ContextMatch[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem('afterimage:memories') || '[]');
      if (Array.isArray(saved)) setMemories(saved);
    } catch { /* ignore malformed local data */ }
  }, []);

  const sample = useMemo(() => input.trim() || examples[0].text, [input]);

  function capture() {
    const memory: Memory = {
      id: crypto.randomUUID(),
      text: sample,
      mode,
      createdAt: new Date().toISOString(),
      trigger: trigger.trim() || undefined
    };
    const next = [memory, ...memories].slice(0, 50);
    setMemories(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    localStorage.removeItem('afterimage:memories');
    setCaptured(true);
    setInput('');
    setTrigger('');
  }

  function simulate(value = context) {
    setMatches(matchContext(memories, value));
  }

  function clearMemories() {
    setMemories([]);
    setMatches([]);
    localStorage.removeItem(STORAGE_KEY);
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
          <div className="return-condition"><span>RETURN CONDITION</span><input aria-label="Return condition" value={trigger} onChange={e=>{setTrigger(e.target.value);setCaptured(false)}} placeholder="When should this become useful again? e.g. When you compare hosting" /></div>
          <div className="capture-bottom"><div className="chips"><button className={mode==='signal'?'active':''} onClick={()=>setMode('signal')}><Clock3 size={14}/> Find the right moment</button><button className={mode==='pattern'?'active':''} onClick={()=>setMode('pattern')}><Compass size={14}/> Find the next pattern</button></div><button className="send" aria-label="Store afterimage" onClick={capture}>{captured?<Check size={18}/>:<ArrowRight size={18}/>}</button></div>
        </div>

        {captured && <div className="preview" role="status"><div className="preview-icon"><BellRing size={18}/></div><div><b>Stored with its return condition.</b><p>“{sample}”</p>{trigger && <small>Returns when: {trigger}</small>}<small>Saved only in this browser. Nothing was sent to a server.</small></div></div>}
      </section>

      <section className="why"><div className="section-kicker">THE DIFFERENCE</div><h2>Memory that moves through time.</h2><div className="grid"><Feature icon={<Brain/>} title="Context, not reminders" body="You don't schedule a notification. You teach the app what situation should bring a memory back."/><Feature icon={<Zap/>} title="One useful signal" body="Afterimage deliberately surfaces one thing instead of becoming another dashboard full of unread work."/><Feature icon={<Sparkles/>} title="Your patterns become visible" body="Over time, recurring choices, unfinished intentions and forgotten reasons connect into a private map."/></div></section>

      <section className="lab"><div className="section-kicker">AFTERIMAGE LAB / LIVE LOCAL EXPERIMENT</div><h2>Make the context return.</h2><p>Try a situation below. The matching engine runs in this browser against your local memories. No network request is required.</p><div className="sim-row">{simulations.map(s=><button key={s} onClick={()=>{setContext(s);simulate(s)}}>{s}</button>)}</div><div className="sim-input"><input aria-label="Simulate current context" value={context} onChange={e=>setContext(e.target.value)} placeholder="Simulate what you are doing right now…"/><button onClick={()=>simulate()}><FlaskConical size={16}/> Match context</button></div>{context && <div className="results" aria-live="polite">{matches.length===0?<div className="empty-match"><span>NO RESURFACING</span><b>Nothing looks relevant yet.</b><p>That is a feature. Afterimage should stay quiet when the context does not justify a memory.</p></div>:<>{matches.slice(0,3).map(match=><article className="match" key={match.memory.id}><div className="match-head"><span>AFTERIMAGE / {Math.round(match.score*100)}% MATCH</span><span>{match.memory.mode.toUpperCase()}</span></div><p>“{match.memory.text}”</p>{match.memory.trigger && <div className="match-trigger">RETURN CONDITION · {match.memory.trigger}</div>}<small>Why now? {match.reason}</small></article>)}</>}</div>}</section>

      <section className="demo"><div><div className="section-kicker">HOW IT FEELS</div><h2>The app disappears.<br/>The moment doesn't.</h2><p>Imagine comparing a phone plan six months from now. Instead of searching old notes, Afterimage quietly says: “Last time you chose the 12‑month plan because you hated switching. You said to check roaming before deciding again.”</p></div><div className="timeline"><div className="node old"><span>JAN</span><b>Captured</b><p>“I chose this because switching costs hurt more than the extra ₹300.”</p></div><div className="line"/><div className="node now"><span>JUL</span><b>Context detected</b><p>You're comparing the same category again.</p></div><div className="line"/><div className="node reveal"><span>NOW</span><b>Afterimage</b><p>“Here’s what mattered to you last time.”</p></div></div></section>

      <section className="examples"><div className="section-kicker">TRY THE IDEA</div><h2>Three memories worth keeping.</h2><div className="cards">{examples.map((x,i)=><button key={i} className="example" onClick={()=>{setInput(x.text);setTrigger(x.when);setCaptured(false)}}><span className="tag">{x.tag}</span><p>{x.text}</p><small>{x.when}</small></button>)}</div></section>

      {memories.length > 0 && <section className="memory-wall"><div><div className="section-kicker">LOCAL MEMORY / {memories.length}</div><h2>What you've left behind.</h2></div><button className="clear" onClick={clearMemories}><Trash2 size={14}/> Clear local memories</button><div className="memory-list">{memories.map(memory=><article className="memory" key={memory.id}><span>{memory.mode === 'signal' ? 'CONTEXT' : 'PATTERN'}</span><p>{memory.text}</p>{memory.trigger && <small>Returns when: {memory.trigger}</small>}<small>Stored {new Date(memory.createdAt).toLocaleString()}</small></article>)}</div></section>}
      <footer><span>AFTERIMAGE / concept build 0.4</span><span>Memory → Return condition → Context → Relevance → Resurface</span></footer>
    </main>
  );
}

function Feature({icon,title,body}:{icon:React.ReactNode;title:string;body:string}){return <article className="feature"><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{body}</p></article>}
