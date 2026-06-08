export interface Theme {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  readerBackground: string;
  toolbar: string;
  toolbarIcon: string;
}

export const lightTheme: Theme = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  border: '#E0E0E0',
  accent: '#C5A059',
  readerBackground: '#FFFDF7',
  toolbar: '#FFFFFF',
  toolbarIcon: '#1A1A1A',
};

export const darkTheme: Theme = {
  background: '#121212',
  surface: '#1E1E1E',
  text: '#F0F0F0',
  textSecondary: '#9E9E9E',
  border: '#2C2C2C',
  accent: '#C5A059',
  readerBackground: '#F5F0E8',
  toolbar: '#1E1E1E',
  toolbarIcon: '#F0F0F0',
};
