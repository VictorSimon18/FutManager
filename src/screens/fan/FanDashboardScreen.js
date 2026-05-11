import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Avatar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../../context/AuthContext';
import { useMatches } from '../../hooks/useMatches';
import { useTeamStats } from '../../hooks/useTeamStats';
import { getTeamById } from '../../database/services/teamService';
import { formatDate, formatTime } from '../../utils/dateUtils';

function rachaLabel(tipo, cantidad) {
  if (!tipo || cantidad === 0) return null;
  const nombre = tipo === 'V' ? 'victorias' : tipo === 'D' ? 'derrotas' : 'empates';
  return `${cantidad} ${nombre} consecutivas`;
}

export default function FanDashboardScreen({ navigation }) {
  const { user, equipoId } = useContext(AuthContext);

  const [team, setTeam] = useState(null);
  const { matches, upcomingMatches, loading: loadingMatches, refresh: refreshMatches } = useMatches(equipoId);
  const { stats: teamStats, loading: loadingTeamStats, refresh: refreshTeamStats } = useTeamStats(equipoId);

  useEffect(() => {
    if (equipoId) getTeamById(equipoId).then(setTeam).catch(() => {});
  }, [equipoId]);

  useFocusEffect(
    useCallback(() => {
      refreshMatches();
      refreshTeamStats();
    }, [refreshMatches, refreshTeamStats])
  );

  const isLoading = loadingMatches || loadingTeamStats;
  const proximoPartido = upcomingMatches[0] ?? null;

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
                Bienvenido, {user?.nombre?.split(' ')[0] || 'Aficionado'}
              </Text>
              <Text variant="bodyMedium" style={styles.headerSubtext}>
                Sigue a tu equipo
              </Text>
            </View>
            <Avatar.Icon size={56} icon="shield-star" style={styles.avatar} />
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={FAN_ACCENT} style={styles.loader} />
        ) : (
          <>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, styles.blueCard]}>
                <Icon name="trophy" size={32} color={FAN_ACCENT} />
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {matches.length}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>Partidos</Text>
              </View>

              <View style={[styles.statCard, styles.greenCard]}>
                <Icon name="check-circle" size={32} color="#43A047" />
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {teamStats?.ganados ?? 0}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>Victorias</Text>
              </View>

              <View style={[styles.statCard, styles.redCard]}>
                <Icon name="close-circle" size={32} color="#E53935" />
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {teamStats?.perdidos ?? 0}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>Derrotas</Text>
              </View>
            </View>

            {/* Rendimiento del equipo */}
            {teamStats && teamStats.partidos_jugados > 0 && (
              <>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Rendimiento del equipo
                </Text>
                <View style={styles.glassCard}>
                  <View style={styles.teamStatsRow}>
                    <View style={styles.teamStatItem}>
                      <Text variant="headlineMedium" style={[styles.teamStatNum, { color: '#FFFFFF' }]}>
                        {teamStats.partidos_jugados}
                      </Text>
                      <Text variant="bodySmall" style={styles.teamStatLabel}>Jugados</Text>
                    </View>
                    <View style={styles.teamStatItem}>
                      <Text variant="headlineMedium" style={[styles.teamStatNum, { color: '#43A047' }]}>
                        {teamStats.ganados}
                      </Text>
                      <Text variant="bodySmall" style={styles.teamStatLabel}>Victorias</Text>
                    </View>
                    <View style={styles.teamStatItem}>
                      <Text variant="headlineMedium" style={[styles.teamStatNum, { color: FAN_ACCENT }]}>
                        {teamStats.empatados}
                      </Text>
                      <Text variant="bodySmall" style={styles.teamStatLabel}>Empates</Text>
                    </View>
                    <View style={styles.teamStatItem}>
                      <Text variant="headlineMedium" style={[styles.teamStatNum, { color: '#E53935' }]}>
                        {teamStats.perdidos}
                      </Text>
                      <Text variant="bodySmall" style={styles.teamStatLabel}>Derrotas</Text>
                    </View>
                  </View>

                  <View style={styles.teamStatsDivider} />

                  <View style={styles.teamStatsRow}>
                    <View style={styles.teamStatItem}>
                      <Text variant="titleLarge" style={[styles.teamStatNum, { color: '#FFFFFF' }]}>
                        {teamStats.goles_favor}
                      </Text>
                      <Text variant="bodySmall" style={styles.teamStatLabel}>Goles a favor</Text>
                    </View>
                    <View style={styles.teamStatItem}>
                      <Text variant="titleLarge" style={[styles.teamStatNum, { color: '#D94865' }]}>
                        {teamStats.goles_contra}
                      </Text>
                      <Text variant="bodySmall" style={styles.teamStatLabel}>Goles en contra</Text>
                    </View>
                    <View style={styles.teamStatItem}>
                      <Text variant="titleLarge" style={[styles.teamStatNum, { color: '#43A047' }]}>
                        {teamStats.porcentaje_victorias}%
                      </Text>
                      <Text variant="bodySmall" style={styles.teamStatLabel}>% Victorias</Text>
                    </View>
                  </View>

                  {(teamStats.racha > 1 || teamStats.top_goleador) && (
                    <View style={styles.teamExtras}>
                      {teamStats.racha > 1 && (
                        <View style={styles.teamExtraRow}>
                          <Icon name="fire" size={16} color={FAN_ACCENT} />
                          <Text variant="bodySmall" style={styles.teamExtraText}>
                            Racha: {rachaLabel(teamStats.racha_tipo, teamStats.racha)}
                          </Text>
                        </View>
                      )}
                      {teamStats.top_goleador && teamStats.top_goleador_goles > 0 && (
                        <View style={styles.teamExtraRow}>
                          <Icon name="soccer" size={16} color="#43A047" />
                          <Text variant="bodySmall" style={styles.teamExtraText}>
                            Máximo goleador: {teamStats.top_goleador} ({teamStats.top_goleador_goles} goles)
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Próximo partido */}
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Próximo partido
            </Text>
            {proximoPartido ? (
              <TouchableOpacity
                style={styles.eventCardWrapper}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('FanMatches')}
              >
                <View style={styles.glassCardInner}>
                  <View style={styles.eventHeader}>
                    <Chip icon="calendar" style={styles.eventChip} textStyle={styles.chipText}>
                      {formatDate(proximoPartido.fecha)}{proximoPartido.hora ? `, ${formatTime(proximoPartido.hora)}` : ''}
                    </Chip>
                    <Chip
                      icon={proximoPartido.es_local ? 'home' : 'airplane'}
                      mode="outlined"
                      style={styles.eventChipOutlined}
                      textStyle={styles.chipText}
                    >
                      {proximoPartido.es_local ? 'Local' : 'Visitante'}
                    </Chip>
                  </View>
                  <Text variant="titleLarge" style={styles.eventTitle} numberOfLines={2}>
                    {team?.nombre || 'Nosotros'} vs. {proximoPartido.rival}
                  </Text>
                  {proximoPartido.ubicacion ? (
                    <Text variant="bodyMedium" style={styles.eventLocation} numberOfLines={1} ellipsizeMode="tail">
                      {proximoPartido.ubicacion}
                    </Text>
                  ) : null}
                  <View style={styles.eventFooter}>
                    <View style={styles.attendanceContainer}>
                      <Icon name="soccer" size={20} color={FAN_ACCENT} />
                      <Text variant="bodyMedium" style={styles.attendanceText}>
                        Ver todos los partidos
                      </Text>
                    </View>
                    <Icon name="chevron-right" size={20} color="rgba(255,255,255,0.3)" />
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.glassCard}>
                <Text variant="bodyMedium" style={styles.noEventText}>
                  No hay partidos próximos programados
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
                onPress={() => navigation.navigate('FanMatches')}
              >
                <View style={styles.actionSurface}>
                  <Icon name="soccer" size={40} color={FAN_ACCENT} />
                  <Text variant="bodyMedium" style={styles.actionText}>
                    Partidos
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('FanSquad')}
              >
                <View style={styles.actionSurface}>
                  <Icon name="account-group" size={40} color="#9C27B0" />
                  <Text variant="bodyMedium" style={styles.actionText}>
                    Plantilla
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('FanStandings')}
              >
                <View style={styles.actionSurface}>
                  <Icon name="trophy" size={40} color="#FF9800" />
                  <Text variant="bodyMedium" style={styles.actionText}>
                    Clasificación
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('FanStandings')}
              >
                <View style={styles.actionSurface}>
                  <Icon name="chart-bar" size={40} color="#43A047" />
                  <Text variant="bodyMedium" style={styles.actionText}>
                    Goleadores
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
const FAN_ACCENT = '#1E88E5';

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
  avatar: { backgroundColor: FAN_ACCENT },
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
  blueCard: { borderTopWidth: 3, borderTopColor: FAN_ACCENT },
  greenCard: { borderTopWidth: 3, borderTopColor: '#43A047' },
  redCard: { borderTopWidth: 3, borderTopColor: '#E53935' },
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
  teamExtras: { marginTop: 10, gap: 6 },
  teamExtraRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  teamExtraText: { color: 'rgba(255,255,255,0.65)' },

  eventHeader: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  eventChip: { backgroundColor: 'rgba(30,136,229,0.2)' },
  eventChipOutlined: { borderColor: 'rgba(255,255,255,0.2)' },
  chipText: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  eventTitle: { fontWeight: 'bold', marginBottom: 8, color: '#FFFFFF' },
  eventLocation: { color: 'rgba(255,255,255,0.5)', marginBottom: 12 },
  eventFooter: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attendanceContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  attendanceText: { color: FAN_ACCENT, fontWeight: '600' },
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
