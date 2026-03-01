import React, { useContext } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import HomeCoachScreen from '../screens/HomeCoachScreen';
import HomePlayerScreen from '../screens/HomePlayerScreen';
import HomeFanScreen from '../screens/HomeFanScreen';

const Stack = createNativeStackNavigator();

/**
 * Botón de cierre de sesión para el header de las pantallas Home.
 * Usa el AuthContext directamente para evitar pasar props por navegación.
 */
function LogoutButton() {
  const { logout } = useContext(AuthContext);
  return (
    <TouchableOpacity onPress={logout} style={{ marginRight: 4, padding: 4 }}>
      <Icon name="logout" size={24} color="#fff" />
    </TouchableOpacity>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, role, isLoading } = useContext(AuthContext);

  // Mientras se restaura la sesión, mostrar un indicador de carga
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' }}>
        <ActivityIndicator size="large" color="#00AA13" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#00AA13' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {!isAuthenticated ? (
          // ── Sin sesión → Login ───────────────────────────────────────────────
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : !role ? (
          // ── Autenticado pero sin rol → Selección de rol ──────────────────────
          <Stack.Screen
            name="RoleSelection"
            component={RoleSelectionScreen}
            options={{
              title: 'Selecciona tu rol',
              headerBackVisible: false,
              headerRight: () => <LogoutButton />,
            }}
          />
        ) : role === 'coach' ? (
          // ── Rol entrenador ───────────────────────────────────────────────────
          <Stack.Screen
            name="HomeCoach"
            component={HomeCoachScreen}
            options={{
              title: 'Panel de Entrenador',
              headerStyle: { backgroundColor: '#FF6F00' },
              headerBackVisible: false,
              headerRight: () => <LogoutButton />,
            }}
          />
        ) : role === 'player' ? (
          // ── Rol jugador ──────────────────────────────────────────────────────
          <Stack.Screen
            name="HomePlayer"
            component={HomePlayerScreen}
            options={{
              title: 'Mi Perfil',
              headerStyle: { backgroundColor: '#00AA13' },
              headerBackVisible: false,
              headerRight: () => <LogoutButton />,
            }}
          />
        ) : (
          // ── Rol aficionado ───────────────────────────────────────────────────
          <Stack.Screen
            name="HomeFan"
            component={HomeFanScreen}
            options={{
              title: 'Mi Equipo',
              headerStyle: { backgroundColor: '#1E88E5' },
              headerBackVisible: false,
              headerRight: () => <LogoutButton />,
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
