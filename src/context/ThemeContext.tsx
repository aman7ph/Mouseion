import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { storage } from '../storage/mmkv';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { lightTheme, darkTheme, type Theme } from '../constants/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialMode(): ThemeMode {
  const saved = storage.getString(STORAGE_KEYS.THEME);
  if (saved === 'dark' || saved === 'light') {
    return saved;
  }
  return 'light';
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({
  children,
}: ThemeProviderProps): React.JSX.Element {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  const toggleTheme = useCallback(() => {
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      storage.set(STORAGE_KEYS.THEME, next);
      return next;
    });
  }, []);

  const value: ThemeContextValue = {
    theme: mode === 'dark' ? darkTheme : lightTheme,
    mode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
