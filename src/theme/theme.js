import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#00AA13', // Verde campo de fútbol
    secondary: '#1E88E5', // Azul deportivo
    tertiary: '#FF6F00', // Naranja energético
    background: '#F5F5F5',
    surface: '#FFFFFF',
    surfaceVariant: '#E8F5E9',
    error: '#D32F2F',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#1A1A1A',
    onSurface: '#1A1A1A',
    outline: '#C8C8C8',
    // Colores personalizados para roles
    coach: '#FF6F00', // Naranja para entrenador
    player: '#00AA13', // Verde para jugador
    fan: '#1E88E5', // Azul para aficionado
  },
  roundness: 12,
  fonts: {
    ...DefaultTheme.fonts,
  },
};
