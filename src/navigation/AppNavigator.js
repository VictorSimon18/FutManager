import React, { useContext } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import HomeCoachScreen from '../screens/HomeCoachScreen';
import CoachTeamSelectionScreen from '../screens/coach/CoachTeamSelectionScreen';
import PlayerTeamSelectionScreen from '../screens/player/PlayerTeamSelectionScreen';

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
import LiveMatchSetupScreen from '../screens/coach/LiveMatchSetupScreen';
import LiveMatchScreen from '../screens/coach/LiveMatchScreen';
import LiveMatchSummaryScreen from '../screens/coach/LiveMatchSummaryScreen';
import TeamStatsScreen from '../screens/coach/TeamStatsScreen';

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
import FanTeamSearchScreen from '../screens/fan/FanTeamSearchScreen';

const Stack = createNativeStackNavigator();
const PLAYER_COLOR = '#00AA13';
const FAN_COLOR = '#1E88E5';
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

/**
 * Botón para cambiar de rol manteniendo la sesión iniciada.
 */
function ChangeRoleButton() {
  const { changeRole } = useContext(AuthContext);
  return (
    <TouchableOpacity onPress={changeRole} style={{ marginRight: 4, padding: 4 }}>
      <Icon name="account-switch" size={24} color="#fff" />
    </TouchableOpacity>
  );
}

/**
 * Conjunto de botones del header (cambiar rol + cerrar sesión) para las
 * pantallas principales de cada rol.
 */
function HeaderButtons() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <ChangeRoleButton />
      <LogoutButton />
    </View>
  );
}

function ChangeFanTeamButton() {
  const { clearFanTeam } = useContext(AuthContext);
  return (
    <TouchableOpacity onPress={clearFanTeam} style={{ marginRight: 4, padding: 4 }}>
      <Icon name="swap-horizontal" size={24} color="#fff" />
    </TouchableOpacity>
  );
}

function FanDashboardHeaderButtons() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <ChangeFanTeamButton />
      <ChangeRoleButton />
      <LogoutButton />
    </View>
  );
}

/** Opciones de header comunes para el stack del entrenador */
const coachHeaderOptions = {
  headerStyle: { backgroundColor: COACH_COLOR },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

/** Opciones de header comunes para el stack del jugador */
const playerHeaderOptions = {
  headerStyle: { backgroundColor: PLAYER_COLOR },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

/** Opciones de header comunes para el stack del aficionado */
const fanHeaderOptions = {
  headerStyle: { backgroundColor: FAN_COLOR },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

export default function AppNavigator() {
  const { isAuthenticated, role, equipoId, isLoading } = useContext(AuthContext);

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
        ) : role === 'coach' && !equipoId ? (
          // ── Entrenador sin equipo seleccionado → selección de equipo ─────────
          <Stack.Screen
            name="CoachTeamSelection"
            component={CoachTeamSelectionScreen}
            options={{
              title: 'Mis Equipos',
              ...coachHeaderOptions,
              headerBackVisible: false,
              headerRight: () => <HeaderButtons />,
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
                headerRight: () => <HeaderButtons />,
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
            {/* Estadísticas del equipo */}
            <Stack.Screen
              name="TeamStats"
              component={TeamStatsScreen}
              options={{ title: 'Estadísticas del equipo', ...coachHeaderOptions }}
            />
            {/* Partido en directo */}
            <Stack.Screen
              name="LiveMatchSetup"
              component={LiveMatchSetupScreen}
              options={{
                title: 'Alineación inicial',
                headerStyle: { backgroundColor: '#E65100' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            <Stack.Screen
              name="LiveMatch"
              component={LiveMatchScreen}
              options={{
                title: 'Partido en directo',
                headerStyle: { backgroundColor: '#E65100' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
                headerBackVisible: false,
              }}
            />
            <Stack.Screen
              name="LiveMatchSummary"
              component={LiveMatchSummaryScreen}
              options={{
                title: 'Resumen del partido',
                headerStyle: { backgroundColor: '#4A148C' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
                headerBackVisible: false,
              }}
            />
          </>
        ) : role === 'player' && !equipoId ? (
          // ── Jugador sin equipo seleccionado → selección de equipo ────────────
          <Stack.Screen
            name="PlayerTeamSelection"
            component={PlayerTeamSelectionScreen}
            options={{
              title: 'Mis Equipos',
              headerStyle: { backgroundColor: '#00AA13' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
              headerBackVisible: false,
              headerRight: () => <HeaderButtons />,
            }}
          />
        ) : role === 'player' ? (
          // ── Stack del jugador ────────────────────────────────────────────────
          <>
            <Stack.Screen
              name="PlayerDashboard"
              component={PlayerDashboardScreen}
              options={{
                title: 'Panel del Jugador',
                ...playerHeaderOptions,
                headerBackVisible: false,
                headerRight: () => <HeaderButtons />,
              }}
            />
            <Stack.Screen
              name="PlayerCalendar"
              component={PlayerCalendarScreen}
              options={{ title: 'Calendario', ...playerHeaderOptions }}
            />
            <Stack.Screen
              name="PlayerStats"
              component={PlayerStatsScreen}
              options={{ title: 'Estadísticas', ...playerHeaderOptions }}
            />
            <Stack.Screen
              name="PlayerTeam"
              component={PlayerTeamScreen}
              options={{ title: 'Mi Equipo', ...playerHeaderOptions }}
            />
            <Stack.Screen
              name="PlayerProfile"
              component={PlayerProfileScreen}
              options={{ title: 'Mi Perfil', ...playerHeaderOptions }}
            />
          </>
        ) : role === 'fan' && !equipoId ? (
          // ── Aficionado sin equipo → búsqueda de equipo ───────────────────────
          <Stack.Screen
            name="FanTeamSearch"
            component={FanTeamSearchScreen}
            options={{
              title: '¿A qué equipo sigues?',
              ...fanHeaderOptions,
              headerBackVisible: false,
              headerRight: () => <HeaderButtons />,
            }}
          />
        ) : (
          // ── Stack del aficionado ─────────────────────────────────────────────
          <>
            <Stack.Screen
              name="FanDashboard"
              component={FanDashboardScreen}
              options={{
                title: 'Panel del Aficionado',
                ...fanHeaderOptions,
                headerBackVisible: false,
                headerRight: () => <FanDashboardHeaderButtons />,
              }}
            />
            <Stack.Screen
              name="FanMatches"
              component={FanMatchesScreen}
              options={{ title: 'Partidos', ...fanHeaderOptions }}
            />
            <Stack.Screen
              name="FanSquad"
              component={FanSquadScreen}
              options={{ title: 'Plantilla', ...fanHeaderOptions }}
            />
            <Stack.Screen
              name="FanStandings"
              component={FanStandingsScreen}
              options={{ title: 'Clasificación', ...fanHeaderOptions }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
