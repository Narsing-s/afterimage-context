const page=document.getElementById('page');
const send=document.getElementById('send');
let tab;
chrome.tabs.query({active:true,currentWindow:true},tabs=>{
  tab=tabs[0];
  const title=tab?.title||'Current page';
  let host='unknown site';
  try{host=new URL(tab.url||'').hostname||host}catch{}
  page.textContent=`${title} · ${host}`;
});
send.addEventListener('click',()=>{
  if(!tab?.url){page.textContent='No active page available.';return;}
  let host='current site';
  try{host=new URL(tab.url).hostname||host}catch{}
  const signal=encodeURIComponent(`Browser category: ${host}`);
  chrome.tabs.create({url:`http://localhost:3000/context-signals?browser=${signal}`});
  page.textContent='Context handed to your local Afterimage app.';
});
