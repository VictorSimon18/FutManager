import React, { useContext, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Avatar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../../context/AuthContext';
import { usePlayerStats } from '../../hooks/usePlayerStats';
import { useMatches } from '../../hooks/useMatches';
import { useTrainings } from '../../hooks/useTrainings';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { getPositionColor } from '../../utils/positionUtils';
import { EventBus, EVENTS } from '../../utils/eventBus';

export default function PlayerDashboardScreen({ navigation }) {
  const { user, roleData, equipoId } = useContext(AuthContext);
  const jugadorId = roleData?.id ?? null;

  const { seasonStats, loading: loadingStats, refresh: refreshStats } = usePlayerStats(jugadorId);
  const { upcomingMatches, loading: loadingMatches, refresh: refreshMatches } = useMatches(equipoId);
  const { upcomingTrainings, loading: loadingTrainings, refresh: refreshTrainings } = useTrainings(equipoId);

  useFocusEffect(
    useCallback(() => {
      refreshStats();
      refreshMatches();
      refreshTrainings();
    }, [refreshStats, refreshMatches, refreshTrainings])
  );

  // Suscripción a eventos del entrenador para actualización en tiempo real
  useEffect(() => {
    const u1 = EventBus.on(EVENTS.STATS_UPDATED, refreshStats);
    const u2 = EventBus.on(EVENTS.MATCH_CREATED, refreshMatches);
    const u3 = EventBus.on(EVENTS.TRAINING_CREATED, refreshTrainings);
    return () => { u1(); u2(); u3(); };
  }, [refreshStats, refreshMatches, refreshTrainings]);

  const isLoading = loadingStats || loadingMatches || loadingTrainings;

  const proximoEvento = useMemo(() => {
    const eventos = [];
    if (upcomingMatches.length > 0) {
      const p = upcomingMatches[0];
      eventos.push({
        tipo: 'partido',
        titulo: `Partido vs. ${p.rival}`,
        fecha: p.fecha,
        hora: p.hora,
        ubicacion: p.ubicacion,
      });
    }
    if (upcomingTrainings.length > 0) {
      const t = upcomingTrainings[0];
      eventos.push({
        tipo: 'entrenamiento',
        titulo: t.tipo || 'Entrenamiento',
        fecha: t.fecha,
        hora: t.hora_inicio,
        ubicacion: t.ubicacion,
      });
    }
    if (eventos.length === 0) return null;
    eventos.sort((a, b) => {
      const da = new Date(`${a.fecha}T${a.hora || '00:00'}`);
      const db = new Date(`${b.fecha}T${b.hora || '00:00'}`);
      return da - db;
    });
    return eventos[0];
  }, [upcomingMatches, upcomingTrainings]);

  const positionColor = getPositionColor(roleData?.posicion);
  const s = seasonStats ?? {};
  const valoracionMedia = s.valoracion_media != null ? Number(s.valoracion_media).toFixed(1) : '—';
  const nombreCorto = (user?.nombre || roleData?.nombre)?.split(' ')[0] || 'Jugador';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text variant="headlineSmall" style={styles.welcomeText}>
                Bienvenido, {nombreCorto}
              </Text>
              <Text variant="bodyMedium" style={styles.headerSubtext}>
                Panel del jugador
              </Text>
            </View>
            <Avatar.Icon
              size={56}
              icon="soccer"
              style={[styles.avatar, { backgroundColor: positionColor }]}
            />
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={PLAYER_ACCENT} style={styles.loader} />
        ) : (
          <>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, styles.greenCard]}>
                <Icon name="soccer" size={32} color={PLAYER_ACCENT} />
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {s.total_goles ?? 0}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>Goles</Text>
              </View>

              <View style={[styles.statCard, styles.blueCard]}>
                <Icon name="shoe-cleat" size={32} color="#1E88E5" />
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {s.total_asistencias ?? 0}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>Asistencias</Text>
              </View>

              <View style={[styles.statCard, styles.purpleCard]}>
                <Icon name="clipboard-list" size={32} color="#9C27B0" />
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {s.partidos_jugados ?? 0}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>Partidos</Text>
              </View>
            </View>

            {/* Rendimiento personal */}
            {(s.partidos_jugados ?? 0) > 0 && (
              <>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Rendimiento personal
                </Text>
                <View style={styles.glassCard}>
                  <View style={styles.teamStatsRow}>
                    <View style={styles.teamStatItem}>
                      <Text variant="headlineMedium" style={[styles.teamStatNum, { color: '#FF9800' }]}>
                        {s.total_minutos ?? 0}'
                      </Text>
                      <Text variant="bodySmall" style={styles.teamStatLabel}>Minutos</Text>
                    </View>
                    <View style={styles.teamStatItem}>
                      <Text variant="headlineMedium" style={[styles.teamStatNum, { color: '#FFC107' }]}>
                        {valoracionMedia}
                      </Text>
                      <Text variant="bodySmall" style={styles.teamStatLabel}>Valoración</Text>
                    </View>
                    <View style={styles.teamStatItem}>
                      <Text variant="headlineMedium" style={[styles.teamStatNum, { color: PLAYER_ACCENT }]}>
                        {s.veces_titular ?? 0}
                      </Text>
                      <Text variant="bodySmall" style={styles.teamStatLabel}>De titular</Text>
                    </View>
                  </View>

                  <View style={styles.teamStatsDivider} />

                  <View style={styles.teamStatsRow}>
                    <View style={styles.teamStatItem}>
                      <Text variant="titleLarge" style={[styles.teamStatNum, { color: '#FFC107' }]}>
                        {s.total_amarillas ?? 0}
                      </Text>
                      <Text variant="bodySmall" style={styles.teamStatLabel}>T. Amarillas</Text>
                    </View>
                    <View style={styles.teamStatItem}>
                      <Text variant="titleLarge" style={[styles.teamStatNum, { color: '#E53935' }]}>
                        {s.total_rojas ?? 0}
                      </Text>
                      <Text variant="bodySmall" style={styles.teamStatLabel}>T. Rojas</Text>
                    </View>
                    <View style={styles.teamStatItem}>
                      <Text variant="titleLarge" style={[styles.teamStatNum, { color: '#FFFFFF' }]}>
                        {s.total_entradas ?? 0}
                      </Text>
                      <Text variant="bodySmall" style={styles.teamStatLabel}>Entradas</Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Próximo Evento */}
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Próximo evento
            </Text>
            {proximoEvento ? (
              <TouchableOpacity
                style={styles.eventCardWrapper}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('PlayerCalendar')}
              >
                <View style={styles.glassCardInner}>
                  <View style={styles.eventHeader}>
                    <Chip icon="calendar" style={styles.eventChip} textStyle={styles.chipText}>
                      {formatDate(proximoEvento.fecha)}{proximoEvento.hora ? `, ${formatTime(proximoEvento.hora)}` : ''}
                    </Chip>
                    <Chip
                      icon={proximoEvento.tipo === 'partido' ? 'soccer' : 'whistle'}
                      mode="outlined"
                      style={styles.eventChipOutlined}
                      textStyle={styles.chipText}
                    >
                      {proximoEvento.tipo === 'partido' ? 'Partido' : 'Entrenamiento'}
                    </Chip>
                  </View>
                  <Text variant="titleLarge" style={styles.eventTitle} numberOfLines={2}>
                    {proximoEvento.titulo}
                  </Text>
                  {proximoEvento.ubicacion ? (
                    <Text variant="bodyMedium" style={styles.eventLocation} numberOfLines={1} ellipsizeMode="tail">
                      {proximoEvento.ubicacion}
                    </Text>
                  ) : null}
                  <View style={styles.eventFooter}>
                    <View style={styles.attendanceContainer}>
                      <Icon name="calendar-clock" size={20} color={PLAYER_ACCENT} />
                      <Text variant="bodyMedium" style={styles.attendanceText}>
                        Ver calendario completo
                      </Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="rgba(255,255,255,0.3)" />
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.glassCard}>
                <Text variant="bodyMedium" style={styles.noEventText}>
                  No hay eventos próximos programados
                </Text>
              </View>
            )}

            {/* Acciones rápidas */}
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Acciones rápidas
            </Text>
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('PlayerStats')}
              >
                <View style={styles.actionSurface}>
                  <Icon name="chart-bar" size={40} color={PLAYER_ACCENT} />
                  <Text variant="bodyMedium" style={styles.actionText}>
                    Mis estadísticas
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('PlayerCalendar')}
              >
                <View style={styles.actionSurface}>
                  <Icon name="calendar-month" size={40} color="#1E88E5" />
                  <Text variant="bodyMedium" style={styles.actionText}>
                    Calendario
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('PlayerTeam')}
              >
                <View style={styles.actionSurface}>
                  <Icon name="account-group" size={40} color="#9C27B0" />
                  <Text variant="bodyMedium" style={styles.actionText}>
                    Mi equipo
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('PlayerProfile')}
              >
                <View style={styles.actionSurface}>
                  <Icon name="account-circle" size={40} color="#FF9800" />
                  <Text variant="bodyMedium" style={styles.actionText}>
                    Mi perfil
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const GLASS_BG = 'rgba(255,255,255,0.08)';
const GLASS_BORDER = 'rgba(255,255,255,0.13)';
const PLAYER_ACCENT = '#00AA13';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },
  scrollContent: { paddingBottom: 40 },

  header: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: GLASS_BORDER,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtext: { color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  avatar: {},
  loader: { marginTop: 60 },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, gap: 12 },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  greenCard: { borderTopWidth: 3, borderTopColor: PLAYER_ACCENT },
  blueCard: { borderTopWidth: 3, borderTopColor: '#1E88E5' },
  purpleCard: { borderTopWidth: 3, borderTopColor: '#9C27B0' },
  statNumber: { fontWeight: 'bold', marginTop: 8, color: '#FFFFFF' },
  statLabel: { color: 'rgba(255,255,255,0.5)', marginTop: 4 },

  sectionTitle: {
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 12,
    color: '#FFFFFF',
  },

  glassCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  eventCardWrapper: { marginHorizontal: 20, marginBottom: 24 },
  glassCardInner: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },

  teamStatsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  teamStatItem: { alignItems: 'center' },
  teamStatNum: { fontWeight: 'bold' },
  teamStatLabel: { color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  teamStatsDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 8 },

  eventHeader: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  eventChip: { backgroundColor: 'rgba(0,170,19,0.2)' },
  eventChipOutlined: { borderColor: 'rgba(255,255,255,0.2)' },
  chipText: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  eventTitle: { fontWeight: 'bold', marginBottom: 8, color: '#FFFFFF' },
  eventLocation: { color: 'rgba(255,255,255,0.5)', marginBottom: 12 },
  eventFooter: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attendanceContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  attendanceText: { color: PLAYER_ACCENT, fontWeight: '600' },
  noEventText: { color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' },

  actionsContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  actionCard: { width: '48%' },
  actionSurface: {
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    height: 120,
  },
  actionText: { marginTop: 12, textAlign: 'center', color: '#FFFFFF' },
});
