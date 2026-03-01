/**
 * FutManager - Football Team Management App
 * @format
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/theme/theme';
import { initDatabase } from './src/database/database';
import { seedDatabase } from './src/database/seed';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    async function setupDatabase() {
      try {
        await initDatabase();
        await seedDatabase();
        setDbReady(true);
      } catch (error) {
        console.error('[App] Error al inicializar la base de datos:', error);
        setDbError(error.message ?? 'Error desconocido al inicializar la BD.');
      }
    }

    setupDatabase();
  }, []);

  // Pantalla de carga mientras se inicializa la BD
  if (!dbReady && !dbError) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00AA13" />
          <Text style={styles.loadingText}>Iniciando FutManager...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // Pantalla de error si la BD no pudo iniciarse
  if (dbError) {
    return (
      <SafeAreaProvider>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error al iniciar la app</Text>
          <Text style={styles.errorMessage}>{dbError}</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="light" backgroundColor="#00AA13" />
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    gap: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    padding: 24,
    gap: 12,
  },
  errorTitle: {
    color: '#FF5252',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorMessage: {
    color: '#AAAAAA',
    fontSize: 14,
    textAlign: 'center',
  },
});
