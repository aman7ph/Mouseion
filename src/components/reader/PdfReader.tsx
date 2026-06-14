import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Pdf, type PdfRef, type PageMeasurement } from 'react-native-pdf-light';
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
  const measurementsRef = useRef<PageMeasurement[]>([]);
  const hasRestoredPosition = useRef(false);
  const initialPageRef = useRef(initialPage);
  const initialIndexZeroBased = Math.max(0, initialPage - 1);

  // Start invisible if we need to restore a non-zero position.
  // This prevents the page-1 flash before scrolling to saved position.
  const opacity = useRef(
    new Animated.Value(initialIndexZeroBased > 0 ? 0 : 1),
  ).current;

  const fadeIn = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  const handleMeasurePages = useCallback(
    (measurements: PageMeasurement[]) => {
      measurementsRef.current = measurements;
      if (
        !hasRestoredPosition.current &&
        initialIndexZeroBased > 0 &&
        measurements.length > initialIndexZeroBased &&
        pdfRef.current
      ) {
        hasRestoredPosition.current = true;
        const targetOffset = measurements[initialIndexZeroBased].offset;
        setTimeout(() => {
          pdfRef.current?.scrollToOffset(targetOffset);
          // Fade in after scroll is applied
          setTimeout(fadeIn, 50);
        }, 100);
      }
    },
    [initialIndexZeroBased, fadeIn],
  );

  const handleLoadComplete = useCallback(
    (numberOfPages: number) => {
      setTotalPages(numberOfPages);
      onPageChange(initialPageRef.current, numberOfPages);
      // If opening from page 1, fade in immediately after load
      if (initialIndexZeroBased === 0) {
        fadeIn();
      }
    },
    [onPageChange, initialIndexZeroBased, fadeIn],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollY = event.nativeEvent.contentOffset.y;
      const measurements = measurementsRef.current;
      if (measurements.length === 0 || totalPages === 0) {
        return;
      }
      let currentZeroBasedPage = 0;
      for (let i = 0; i < measurements.length; i++) {
        if (measurements[i].offset <= scrollY) {
          currentZeroBasedPage = i;
        } else {
          break;
        }
      }
      const oneBasedPage = currentZeroBasedPage + 1;
      onPageChange(oneBasedPage, totalPages);
    },
    [onPageChange, totalPages],
  );

  const handleError = useCallback((error: Error) => {
    setErrorMessage(error.message);
  }, []);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.readerBackground }]}
    >
      {errorMessage ? (
        <>
          <Text style={[styles.errorTitle, { color: theme.text }]}>
            PDF Load Error
          </Text>
          <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>
            {errorMessage}
          </Text>
        </>
      ) : (
        <Animated.View style={[styles.pdfContainer, { opacity }]}>
          <Pdf
            ref={pdfRef}
            source={toFileUri(filePath)}
            onLoadComplete={handleLoadComplete}
            onMeasurePages={handleMeasurePages}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onError={handleError}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfContainer: {
    flex: 1,
    width: '100%',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  errorMessage: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
});

export default PdfReader;
