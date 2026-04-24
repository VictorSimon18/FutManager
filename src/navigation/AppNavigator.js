import React, { useContext } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import HomeCoachScreen from '../screens/HomeCoachScreen';

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
import MapScreen from '../screens/coach/MapScreen';
import TacticalBoardScreen from '../screens/coach/TacticalBoardScreen';

// Pantallas del jugador (tab navigator)
import PlayerDashboardScreen from '../screens/player/PlayerDashboardScreen';
import PlayerCalendarScreen from '../screens/player/PlayerCalendarScreen';
import PlayerStatsScreen from '../screens/player/PlayerStatsScreen';
import PlayerTeamScreen from '../screens/player/PlayerTeamScreen';
import PlayerProfileScreen from '../screens/player/PlayerProfileScreen';

// Pantallas del aficionado (tab navigator)
import FanDashboardScreen from '../screens/fan/FanDashboardScreen';
import FanMatchesScreen from '../screens/fan/FanMatchesScreen';
import FanSquadScreen from '../screens/fan/FanSquadScreen';
import FanStandingsScreen from '../screens/fan/FanStandingsScreen';

const Stack = createNativeStackNavigator();
const PlayerTab = createBottomTabNavigator();
const FanTab = createBottomTabNavigator();

const PLAYER_COLOR = '#00AA13';
const FAN_COLOR = '#1E88E5';

/**
 * Bottom Tab Navigator para el rol jugador.
 * Cinco tabs: Inicio, Calendario, Estadísticas, Mi Equipo, Mi Perfil.
 */
function PlayerTabNavigator() {
  return (
    <PlayerTab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: PLAYER_COLOR },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarStyle: {
          backgroundColor: '#0f2027',
          borderTopColor: 'rgba(255,255,255,0.1)',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: PLAYER_COLOR,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <PlayerTab.Screen
        name="PlayerDashboard"
        component={PlayerDashboardScreen}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
          headerRight: () => <LogoutButton />,
        }}
      />
      <PlayerTab.Screen
        name="PlayerCalendar"
        component={PlayerCalendarScreen}
        options={{
          title: 'Calendario',
          tabBarIcon: ({ color, size }) => <Icon name="calendar" size={size} color={color} />,
        }}
      />
      <PlayerTab.Screen
        name="PlayerStats"
        component={PlayerStatsScreen}
        options={{
          title: 'Estadísticas',
          tabBarIcon: ({ color, size }) => <Icon name="chart-bar" size={size} color={color} />,
        }}
      />
      <PlayerTab.Screen
        name="PlayerTeam"
        component={PlayerTeamScreen}
        options={{
          title: 'Mi Equipo',
          tabBarIcon: ({ color, size }) => <Icon name="account-group" size={size} color={color} />,
        }}
      />
      <PlayerTab.Screen
        name="PlayerProfile"
        component={PlayerProfileScreen}
        options={{
          title: 'Mi Perfil',
          tabBarIcon: ({ color, size }) => <Icon name="account" size={size} color={color} />,
        }}
      />
    </PlayerTab.Navigator>
  );
}

/**
 * Bottom Tab Navigator para el rol aficionado.
 * Cuatro tabs: Inicio, Partidos, Plantilla, Clasificación.
 */
function FanTabNavigator() {
  return (
    <FanTab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: FAN_COLOR },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarStyle: {
          backgroundColor: '#0f2027',
          borderTopColor: 'rgba(255,255,255,0.1)',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: FAN_COLOR,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <FanTab.Screen
        name="FanDashboard"
        component={FanDashboardScreen}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
          headerRight: () => <LogoutButton />,
        }}
      />
      <FanTab.Screen
        name="FanMatches"
        component={FanMatchesScreen}
        options={{
          title: 'Partidos',
          tabBarIcon: ({ color, size }) => <Icon name="soccer" size={size} color={color} />,
        }}
      />
      <FanTab.Screen
        name="FanSquad"
        component={FanSquadScreen}
        options={{
          title: 'Plantilla',
          tabBarIcon: ({ color, size }) => <Icon name="account-group" size={size} color={color} />,
        }}
      />
      <FanTab.Screen
        name="FanStandings"
        component={FanStandingsScreen}
        options={{
          title: 'Clasificación',
          tabBarIcon: ({ color, size }) => <Icon name="trophy" size={size} color={color} />,
        }}
      />
    </FanTab.Navigator>
  );
}

const COACH_COLOR = '#105E7A';

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
            {/* Mapa de selección de ubicación */}
            <Stack.Screen
              name="MapScreen"
              component={MapScreen}
              options={{
                title: 'Seleccionar ubicación',
                headerStyle: { backgroundColor: '#FF6F00' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            {/* Pizarra táctica */}
            <Stack.Screen
              name="TacticalBoard"
              component={TacticalBoardScreen}
              options={{
                title: 'Pizarra táctica',
                headerStyle: { backgroundColor: '#FF6F00' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
          </>
        ) : role === 'player' ? (
          // ── Rol jugador (Bottom Tabs) ────────────────────────────────────────
          <Stack.Screen
            name="PlayerTabs"
            component={PlayerTabNavigator}
            options={{ headerShown: false, headerBackVisible: false }}
          />
        ) : (
          // ── Rol aficionado (Bottom Tabs) ─────────────────────────────────────
          <Stack.Screen
            name="FanTabs"
            component={FanTabNavigator}
            options={{ headerShown: false, headerBackVisible: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
