const DEFAULT_APP_URL = 'https://afterimage-context.vercel.app';
const appUrl = document.getElementById('appUrl');
const status = document.getElementById('status');

function normalize(value) {
  try {
    const url = new URL(String(value || '').trim());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('invalid protocol');
    return url.origin;
  } catch {
    return '';
  }
}

chrome.storage.local.get({ afterimageAppUrl: DEFAULT_APP_URL }, ({ afterimageAppUrl }) => {
  appUrl.value = normalize(afterimageAppUrl) || DEFAULT_APP_URL;
});

document.getElementById('save').addEventListener('click', async () => {
  const value = normalize(appUrl.value);
  if (!value) {
    status.textContent = 'Enter a valid Afterimage app URL.';
    return;
  }
  await chrome.storage.local.set({ afterimageAppUrl: value });
  appUrl.value = value;
  status.textContent = 'Saved. Future syncs will use this app.';
});

document.getElementById('reset').addEventListener('click', async () => {
  await chrome.storage.local.set({ afterimageAppUrl: DEFAULT_APP_URL });
  appUrl.value = DEFAULT_APP_URL;
  status.textContent = 'Default Afterimage app restored.';
});
