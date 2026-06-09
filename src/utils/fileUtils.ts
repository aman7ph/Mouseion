import { Platform } from 'react-native';

export function getFileExtension(filePath: string): string {
  const parts = filePath.split('.');
  if (parts.length < 2) {
    return '';
  }
  return parts[parts.length - 1].toLowerCase();
}

export function isValidBookFile(filePath: string): boolean {
  const ext = getFileExtension(filePath);
  return ext === 'pdf' || ext === 'epub';
}

export function toFileUri(absolutePath: string): string {
  if (absolutePath.startsWith('file://')) {
    return absolutePath;
  }
  if (Platform.OS === 'android') {
    return 'file://' + absolutePath;
  }
  return absolutePath;
}

export function getFilenameFromPath(filePath: string): string {
  const parts = filePath.split('/');
  const filename = parts[parts.length - 1];
  return filename.replace(/\.[^/.]+$/, '');
}

export function generateBookId(filePath: string): string {
  let hash = 0;
  for (let i = 0; i < filePath.length; i++) {
    const char = filePath.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
