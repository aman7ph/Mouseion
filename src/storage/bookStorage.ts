import { storage } from './mmkv';
import { STORAGE_KEYS } from '../constants/storage-keys';
import type { BookMeta } from '../types/book';

export function getBooks(): BookMeta[] {
  const raw = storage.getString(STORAGE_KEYS.LIBRARY_INDEX);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as BookMeta[];
  } catch {
    return [];
  }
}

export function saveBooks(books: BookMeta[]): void {
  storage.set(STORAGE_KEYS.LIBRARY_INDEX, JSON.stringify(books));
}

export function addBook(book: BookMeta): void {
  const books = getBooks();
  const exists = books.some(b => b.id === book.id);
  if (!exists) {
    books.unshift(book);
    saveBooks(books);
  }
}

export function removeBook(bookId: string): void {
  const books = getBooks().filter(b => b.id !== bookId);
  saveBooks(books);
}

export function updateLastOpened(bookId: string): void {
  const books = getBooks().map(b =>
    b.id === bookId ? { ...b, lastOpenedAt: Date.now() } : b,
  );
  saveBooks(books);
}
