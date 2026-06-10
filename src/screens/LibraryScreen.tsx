import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { pick, types } from '@react-native-documents/picker';
import * as RNFS from '@dr.pogodin/react-native-fs';
import { useTheme } from '../context/ThemeContext';
import { getBooks, addBook, updateLastOpened } from '../storage/bookStorage';
import { getProgress } from '../storage/progressStorage';
import type { BookMeta } from '../types/book';
import type { BookFormat } from '../types/book';
import type { ReadingProgress } from '../types/progress';
import type { RootStackParamList } from '../types/navigation';
import {
  generateBookId,
  getFilenameFromPath,
  isValidBookFile,
} from '../utils/fileUtils';
import BookCard from '../components/library/BookCard';
import EmptyLibrary from '../components/library/EmptyLibrary';

type LibraryNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface BookWithProgress {
  book: BookMeta;
  progress: ReadingProgress | null;
}

function LibraryScreen(): React.JSX.Element {
  const { theme } = useTheme();
  const navigation = useNavigation<LibraryNavigationProp>();
  const [books, setBooks] = useState<BookWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadBooks = useCallback(() => {
    const stored = getBooks();
    const withProgress: BookWithProgress[] = stored.map(book => ({
      book,
      progress: getProgress(book.id),
    }));
    setBooks(withProgress);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks]),
  );

  const handleAddBook = useCallback(async () => {
    try {
      const results = await pick({
        type: [types.pdf, 'application/epub+zip'],
        allowMultiSelection: false,
      });

      if (!results || results.length === 0) {
        return;
      }

      const picked = results[0];
      const sourceUri = picked.uri;
      const displayName = picked.name ?? 'Unknown Book';

      if (!isValidBookFile(displayName)) {
        Alert.alert('Unsupported file', 'Please select a PDF or EPUB file.');
        return;
      }

      setIsLoading(true);

      const booksDir = RNFS.CachesDirectoryPath + '/mouseion_books';
      const dirExists = await RNFS.exists(booksDir);
      if (!dirExists) {
        await RNFS.mkdir(booksDir);
      }

      const safeFilename = displayName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const destPath = booksDir + '/' + safeFilename;
      const fileExists = await RNFS.exists(destPath);

      if (!fileExists) {
        await RNFS.copyFile(sourceUri, destPath);
      }

      const bookId = generateBookId(destPath);
      const title = getFilenameFromPath(destPath);
      const extension = displayName.split('.').pop()?.toLowerCase();
      const format: BookFormat = extension === 'epub' ? 'epub' : 'pdf';
      const now = Date.now();

      const newBook: BookMeta = {
        id: bookId,
        title,
        filePath: destPath,
        format,
        lastOpenedAt: now,
        addedAt: now,
      };

      addBook(newBook);
      loadBooks();
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err?.code === 'DOCUMENT_PICKER_CANCELED') {
        return;
      }
      Alert.alert('Error', 'Could not add the book. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [loadBooks]);

  const handleOpenBook = useCallback(
    (bookId: string) => {
      updateLastOpened(bookId);
      navigation.navigate('Reader', { bookId });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: BookWithProgress }) => (
      <BookCard
        book={item.book}
        progress={item.progress}
        onPress={() => handleOpenBook(item.book.id)}
      />
    ),
    [handleOpenBook],
  );

  const keyExtractor = useCallback(
    (item: BookWithProgress) => item.book.id,
    [],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Mouseion
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddBook}
          disabled={isLoading}
        >
          <Text style={[styles.addButtonText, { color: theme.accent }]}>
            {isLoading ? '...' : '+'}
          </Text>
        </TouchableOpacity>
      </View>

      {books.length === 0 ? (
        <EmptyLibrary />
      ) : (
        <FlatList
          data={books}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  addButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  listContent: {
    flexGrow: 1,
  },
});

export default LibraryScreen;
