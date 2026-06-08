import { storage } from './mmkv';
import { PROGRESS_KEY_PREFIX } from '../constants/storage-keys';
import type { ReadingProgress } from '../types/progress';

export function getProgress(bookId: string): ReadingProgress | null {
  const key = PROGRESS_KEY_PREFIX + bookId;
  const raw = storage.getString(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as ReadingProgress;
  } catch {
    return null;
  }
}

export function saveProgress(bookId: string, progress: ReadingProgress): void {
  const key = PROGRESS_KEY_PREFIX + bookId;
  storage.set(key, JSON.stringify(progress));
}

export function clearProgress(bookId: string): void {
  const key = PROGRESS_KEY_PREFIX + bookId;
  storage.remove(key);
}
