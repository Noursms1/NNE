import type { SavedWorkspaceRecord } from '../types';

const STORAGE_KEY = 'awesome_ai_architect_workspaces_v1';

export function loadSavedWorkspaces(): SavedWorkspaceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function upsertSavedWorkspace(record: SavedWorkspaceRecord): SavedWorkspaceRecord[] {
  const current = loadSavedWorkspaces();
  const idx = current.findIndex((item) => item.id === record.id);
  const next =
    idx >= 0
      ? current.map((item, i) => (i === idx ? { ...item, ...record } : item))
      : [record, ...current];
  const trimmed = next.slice(0, 30);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore storage quota errors cleanly
  }
  return trimmed;
}

export function deleteSavedWorkspace(id: string): SavedWorkspaceRecord[] {
  const next = loadSavedWorkspaces().filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors
  }
  return next;
}
