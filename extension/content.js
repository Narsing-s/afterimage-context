(() => {
  const pageText = () => document.body?.innerText?.slice(0, 12000) || '';

  const context = () => ({
    title: document.title,
    url: location.href,
    host: location.hostname,
    text: pageText(),
    selection: window.getSelection()?.toString()?.trim()?.slice(0, 500) || ''
  });

  const keyFor = (memory) => `afterimage-dismissed:${memory.id}:${location.hostname}`;

  const removeOverlay = () => document.getElementById('afterimage-context-overlay')?.remove();

  const showMemory = (memory, score = 0) => {
    removeOverlay();
    if (!memory?.text || localStorage.getItem(keyFor(memory)) === '1') return;

    const root = document.createElement('aside');
    root.id = 'afterimage-context-overlay';
    root.style.cssText = [
      'position:fixed','right:20px','bottom:20px','z-index:2147483647','width:min(390px,calc(100vw - 40px))',
      'padding:16px','border:1px solid rgba(215,255,98,.28)','border-radius:18px','background:rgba(10,11,14,.96)',
      'box-shadow:0 20px 60px rgba(0,0,0,.38)','color:#f4f1e9','font:14px system-ui,-apple-system,sans-serif',
      'backdrop-filter:blur(18px)'
    ].join(';');

    const label = document.createElement('div');
    label.textContent = 'AFTERIMAGE · THIS MAY MATTER NOW';
    label.style.cssText = 'font-size:10px;letter-spacing:.14em;font-weight:800;color:#d7ff62;margin-bottom:8px';

    const text = document.createElement('div');
    text.textContent = memory.text;
    text.style.cssText = 'line-height:1.55;font-weight:650';

    const why = document.createElement('div');
    why.textContent = memory.trigger ? `Return condition: ${memory.trigger}` : 'A past clue matched this context.';
    why.style.cssText = 'margin-top:9px;font-size:11px;color:#9a9da5;line-height:1.45';

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:8px;margin-top:13px';
    const keep = document.createElement('button');
    keep.textContent = 'Useful';
    const dismiss = document.createElement('button');
    dismiss.textContent = 'Not now';
    [keep, dismiss].forEach((button) => {
      button.style.cssText = 'border:1px solid #2b3038;border-radius:10px;background:#171a20;color:#f4f1e9;padding:8px 11px;cursor:pointer;font-weight:700';
    });
    keep.style.background = '#d7ff62';
    keep.style.color = '#090a0c';

    const reason = document.createElement('div');
    reason.textContent = `Match confidence ${Math.round(score * 100)}% · local only`;
    reason.style.cssText = 'margin-left:auto;align-self:center;font-size:10px;color:#626873';

    dismiss.onclick = () => { localStorage.setItem(keyFor(memory), '1'); removeOverlay(); };
    keep.onclick = () => { chrome.runtime.sendMessage({ type: 'AFTERIMAGE_USED', id: memory.id }); removeOverlay(); };

    actions.append(keep, dismiss, reason);
    root.append(label, text, why, actions);
    document.documentElement.appendChild(root);
  };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === 'AFTERIMAGE_GET_CONTEXT') {
      sendResponse(context());
      return true;
    }
    if (message?.type === 'AFTERIMAGE_SHOW_MEMORY') {
      showMemory(message.memory, message.score);
      sendResponse({ ok: true });
      return true;
    }
  });

  chrome.storage?.local?.get({ afterimages: [] }).then(({ afterimages }) => {
    const source = `${document.title} ${location.hostname} ${pageText()}`.toLowerCase();
    const matches = (afterimages || []).map((memory) => {
      const words = `${memory.text || ''} ${memory.trigger || ''}`.toLowerCase().match(/[a-z0-9]{4,}/g) || [];
      const unique = [...new Set(words)];
      const hits = unique.filter((word) => source.includes(word)).length;
      return { memory, score: unique.length ? hits / unique.length : 0 };
    }).filter((item) => item.score >= 0.34).sort((a, b) => b.score - a.score);
    if (matches[0]) showMemory(matches[0].memory, matches[0].score);
  }).catch(() => {});
})();
