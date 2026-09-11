chrome.runtime.onMessage.addListener(async (message) => {
  if (message?.type !== 'AFTERIMAGE_USED' || !message.id) return;
  const result = await chrome.storage.local.get({ afterimages: [] });
  const afterimages = result.afterimages.map((memory) => memory.id === message.id
    ? { ...memory, resurfacedCount: (memory.resurfacedCount || 0) + 1, lastResurfacedAt: new Date().toISOString() }
    : memory);
  await chrome.storage.local.set({ afterimages });
});
