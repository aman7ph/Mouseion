import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';
import { getBooks } from '../storage/bookStorage';
import { getProgress, saveProgress } from '../storage/progressStorage';
import type { BookMeta } from '../types/book';
import type {
  ReadingProgress,
  PdfProgress,
  EpubProgress,
} from '../types/progress';
import PdfReader from '../components/reader/PdfReader';

type Props = NativeStackScreenProps<RootStackParamList, 'Reader'>;

function ReaderScreen({ route }: Props): React.JSX.Element {
  const { theme } = useTheme();
  const { bookId } = route.params;

  const [book, setBook] = useState<BookMeta | null>(null);
  const [initialProgress, setInitialProgress] =
    useState<ReadingProgress | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const books = getBooks();
    const found = books.find(b => b.id === bookId) ?? null;
    const progress = getProgress(bookId);

    setBook(found);
    setInitialProgress(progress);
    setIsLoading(false);
  }, [bookId]);

  const handlePdfProgressChange = useCallback(
    (currentPage: number, totalPages: number) => {
      const progress: PdfProgress = {
        format: 'pdf',
        currentPage,
        totalPages,
      };
      saveProgress(bookId, progress);
    },
    [bookId],
  );
  const handleEpubProgressChange = useCallback(
    (cfi: string, percentage: number) => {
      const progress: EpubProgress = {
        format: 'epub',
        cfi,
        percentage,
      };
      saveProgress(bookId, progress);
    },
    [bookId],
  );

  void handleEpubProgressChange;
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.message, { color: theme.textSecondary }]}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.message, { color: theme.text }]}>
          Book Not found
        </Text>
      </View>
    );
  }

  if (book.format === 'pdf') {
    const pdfProgress =
      initialProgress?.format === 'pdf' ? initialProgress : null;
    return (
      <View
        style={[styles.container, { backgroundColor: theme.readerBackground }]}
      >
        <PdfReader
          filePath={book.filePath}
          initialPage={pdfProgress?.currentPage ?? 1}
          onPageChange={handlePdfProgressChange}
        />
      </View>
    );
  }

  const epubProgress =
    initialProgress?.format === 'epub' ? initialProgress : null;
  return (
    <View
      style={[styles.container, { backgroundColor: theme.readerBackground }]}
    >
      <Text style={[styles.message, { color: theme.text }]}>
        EPUB Reader placeholder — {book.title}
      </Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>
        Initial CFI: {epubProgress?.cfi ?? 'none (start from beginning)'}
      </Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>
        File: {book.filePath}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ReaderScreen;
