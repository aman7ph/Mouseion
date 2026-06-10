import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

function EmptyLibrary(): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        Your library is empty
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Tap the + button to add your first book
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EmptyLibrary;
