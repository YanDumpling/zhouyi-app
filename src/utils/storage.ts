import type { DivinationResult } from '../engine/divination';

const STORAGE_KEY = 'zhouyi-history';
const MAX_ENTRIES = 50;

export interface HistoryEntry {
  id: string;
  timestamp: number;
  result: DivinationResult;
}

function loadAll(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}

function saveAll(entries: HistoryEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function saveHistory(result: DivinationResult): HistoryEntry {
  const entries = loadAll();
  const entry: HistoryEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    timestamp: Date.now(),
    result,
  };
  entries.unshift(entry);

  // 保留最新 MAX_ENTRIES 条
  if (entries.length > MAX_ENTRIES) {
    entries.length = MAX_ENTRIES;
  }

  saveAll(entries);
  return entry;
}

export function loadHistory(): HistoryEntry[] {
  return loadAll();
}

export function deleteHistory(id: string): void {
  const entries = loadAll().filter(e => e.id !== id);
  saveAll(entries);
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
