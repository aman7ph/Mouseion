import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Pdf, type PdfRef } from 'react-native-pdf-light';
import { useTheme } from '../../context/ThemeContext';
import { toFileUri } from '../../utils/fileUtils';

interface PdfReaderProps {
  filePath: string;
  initialPage: number;
  onPageChange: (currentPage: number, totalPages: number) => void;
}

const PdfReader = ({
  filePath,
  initialPage,
  onPageChange,
}: PdfReaderProps): React.JSX.Element => {
  const { theme } = useTheme();
  const pdfRef = useRef<PdfRef>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // react-native-pdf-light uses 0-indexed pages.
  // Our PdfProgress stores 1-based page numbers.
  // Subtract 1 when passing to the library, add 1 when receiving back.
  const initialIndexZeroBased = Math.max(0, initialPage - 1);

  const handleLoadComplete = useCallback(
    (numberOfPages: number) => {
      setTotalPages(numberOfPages);
      // Report initial page position after load
      onPageChange(initialPage, numberOfPages);
    },
    [initialPage, onPageChange],
  );

  const handleError = useCallback((error: Error) => {
    setErrorMessage(error.message);
  }, []);

  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      // Page tracking via scroll position is imprecise without page heights.
      // We use onMomentumScrollEnd for a stable page estimate.
      void event;
    },
    [],
  );
  void handleScroll;

  const handleMomentumScrollEnd = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      // Without exact page heights we cannot convert offset to page number
      // precisely here. Page tracking will be improved in Phase 8 using
      // onMeasurePages to build an offset map. For now we report progress
      // via onLoadComplete only, which saves the initial page correctly.
      void event;
      void totalPages;
    },
    [totalPages],
  );

  if (errorMessage) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: theme.readerBackground },
        ]}
      >
        <Text style={[styles.errorTitle, { color: theme.text }]}>
          PDF Load Error
        </Text>
        <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>
          {errorMessage}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.readerBackground }]}
    >
      <Pdf
        ref={pdfRef}
        source={toFileUri(filePath)}
        initialScrollIndex={initialIndexZeroBased}
        onLoadComplete={handleLoadComplete}
        onError={handleError}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PdfReader;
