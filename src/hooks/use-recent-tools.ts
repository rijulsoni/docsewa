"use client"

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'docsewa:recent-tools';
const MAX_ITEMS = 12;
const EVENT_NAME = 'docsewa:recent-tools-changed';

function readStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

function writeStorage(slugs: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    // ignore quota / private-mode failures
  }
}

export function useRecentTools() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(readStorage());
    const refresh = () => setRecent(readStorage());
    window.addEventListener(EVENT_NAME, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(EVENT_NAME, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const addRecent = useCallback((slug: string) => {
    if (!slug) return;
    const current = readStorage();
    const next = [slug, ...current.filter((s) => s !== slug)].slice(0, MAX_ITEMS);
    writeStorage(next);
  }, []);

  const clearRecent = useCallback(() => writeStorage([]), []);

  return { recent, addRecent, clearRecent };
}
