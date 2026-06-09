export function isValidCfi(cfi: string): boolean {
  return typeof cfi === 'string' && cfi.startsWith('epubcfi(');
}

export function getProgressPercentage(percentage: number): string {
  const clamped = Math.max(0, Math.min(1, percentage));
  return Math.round(clamped * 100) + '%';
}
