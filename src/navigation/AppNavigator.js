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

// Pantallas del entrenador
import PlayerListScreen from '../screens/coach/PlayerListScreen';
import PlayerFormScreen from '../screens/coach/PlayerFormScreen';
import PlayerDetailScreen from '../screens/coach/PlayerDetailScreen';
import MatchListScreen from '../screens/coach/MatchListScreen';
import MatchFormScreen from '../screens/coach/MatchFormScreen';
import MatchDetailScreen from '../screens/coach/MatchDetailScreen';
import TrainingListScreen from '../screens/coach/TrainingListScreen';
import TrainingFormScreen from '../screens/coach/TrainingFormScreen';
import TrainingDetailScreen from '../screens/coach/TrainingDetailScreen';

const Stack = createNativeStackNavigator();

const COACH_COLOR = '#FF6F00';

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

/** Opciones de header comunes para el stack del entrenador */
const coachHeaderOptions = {
  headerStyle: { backgroundColor: COACH_COLOR },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

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
          // ── Stack del entrenador ─────────────────────────────────────────────
          <>
            <Stack.Screen
              name="HomeCoach"
              component={HomeCoachScreen}
              options={{
                title: 'Panel de Entrenador',
                ...coachHeaderOptions,
                headerBackVisible: false,
                headerRight: () => <LogoutButton />,
              }}
            />
            {/* Jugadores */}
            <Stack.Screen
              name="PlayerList"
              component={PlayerListScreen}
              options={{ title: 'Plantilla', ...coachHeaderOptions }}
            />
            <Stack.Screen
              name="PlayerForm"
              component={PlayerFormScreen}
              options={({ route }) => ({
                title: route.params?.playerId ? 'Editar jugador' : 'Nuevo jugador',
                ...coachHeaderOptions,
              })}
            />
            <Stack.Screen
              name="PlayerDetail"
              component={PlayerDetailScreen}
              options={{ title: 'Ficha del jugador', ...coachHeaderOptions }}
            />
            {/* Partidos */}
            <Stack.Screen
              name="MatchList"
              component={MatchListScreen}
              options={{ title: 'Partidos', ...coachHeaderOptions }}
            />
            <Stack.Screen
              name="MatchForm"
              component={MatchFormScreen}
              options={({ route }) => ({
                title: route.params?.matchId ? 'Editar partido' : 'Nuevo partido',
                ...coachHeaderOptions,
              })}
            />
            <Stack.Screen
              name="MatchDetail"
              component={MatchDetailScreen}
              options={{ title: 'Detalle del partido', ...coachHeaderOptions }}
            />
            {/* Entrenamientos */}
            <Stack.Screen
              name="TrainingList"
              component={TrainingListScreen}
              options={{ title: 'Entrenamientos', ...coachHeaderOptions }}
            />
            <Stack.Screen
              name="TrainingForm"
              component={TrainingFormScreen}
              options={({ route }) => ({
                title: route.params?.trainingId ? 'Editar entrenamiento' : 'Nuevo entrenamiento',
                ...coachHeaderOptions,
              })}
            />
            <Stack.Screen
              name="TrainingDetail"
              component={TrainingDetailScreen}
              options={{ title: 'Detalle del entrenamiento', ...coachHeaderOptions }}
            />
          </>
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
