import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/context/ThemeContext';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <></>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
