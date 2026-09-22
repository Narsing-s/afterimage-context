'use client';

import { useEffect } from 'react';
import { getVaultStatus, lockMemoryVault, subscribeVaultState } from '../lib/encrypted-memory-store';

const IDLE_MS = 15 * 60 * 1000;

export default function VaultAutoLock() {
  useEffect(() => {
    let enabled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const clear = () => { if (timer) clearTimeout(timer); timer = undefined; };
    const arm = () => {
      clear();
      if (enabled) timer = setTimeout(() => lockMemoryVault(), IDLE_MS);
    };
    const refresh = async () => {
      const status = await getVaultStatus();
      enabled = status.enabled && status.unlocked;
      arm();
    };
    const onActivity = () => { if (enabled) arm(); };

    void refresh();
    const unsubscribe = subscribeVaultState(() => void refresh());
    const events = ['pointerdown','keydown','touchstart','scroll','mousemove'];
    events.forEach(event => window.addEventListener(event, onActivity, { passive: true }));
    return () => {
      clear();
      unsubscribe();
      events.forEach(event => window.removeEventListener(event, onActivity));
    };
  }, []);

  return null;
}
