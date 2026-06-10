import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { BookMeta } from '../../types/book';
import type { ReadingProgress } from '../../types/progress';
import { getProgressPercentage } from '../../utils/epubUtils';

interface BookCardProps {
  book: BookMeta;
  progress: ReadingProgress | null;
  onPress: () => void;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getProgressText(progress: ReadingProgress | null): string {
  if (!progress) {
    return 'Not started';
  }
  if (progress.format === 'pdf') {
    if (progress.totalPages === 0) {
      return 'Not started';
    }
    const pct = Math.round((progress.currentPage / progress.totalPages) * 100);
    return `Page ${progress.currentPage} of ${progress.totalPages} · ${pct}%`;
  }
  return getProgressPercentage(progress.percentage) + ' complete';
}

function BookCard({
  book,
  progress,
  onPress,
}: BookCardProps): React.JSX.Element {
  const { theme } = useTheme();
  const isPdf = book.format === 'pdf';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderBottomColor: theme.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.formatBadge}>
        <Text
          style={[
            styles.formatText,
            {
              color: theme.accent,
              borderColor: theme.accent,
            },
          ]}
        >
          {isPdf ? 'PDF' : 'EPUB'}
        </Text>
      </View>
      <View style={styles.content}>
        <Text
          style={[styles.title, { color: theme.text }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {book.title}
        </Text>
        <Text style={[styles.progressText, { color: theme.textSecondary }]}>
          {getProgressText(progress)}
        </Text>
        <Text style={[styles.dateText, { color: theme.textSecondary }]}>
          {formatDate(book.lastOpenedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 16,
  },
  formatBadge: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  formatText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  progressText: {
    fontSize: 12,
    lineHeight: 16,
  },
  dateText: {
    fontSize: 11,
    lineHeight: 15,
  },
});

export default BookCard;
