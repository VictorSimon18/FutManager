/**
 * FanDashboardScreen.js — Pantalla "Inicio" del rol aficionado.
 * Muestra info del equipo, estadísticas de temporada, próximo partido y últimos resultados.
 */

import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Avatar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../../context/AuthContext';
import { useMatches } from '../../hooks/useMatches';
import { useTeamStats } from '../../hooks/useTeamStats';
import { getTeamById } from '../../database/services/teamService';
import { formatDate, formatTime } from '../../utils/dateUtils';

function resultInfo(gf, gc) {
  if (gf > gc) return { letra: 'V', color: '#43A047' };
  if (gf < gc) return { letra: 'D', color: '#E53935' };
  return { letra: 'E', color: 'rgba(255,255,255,0.35)' };
}

export default function FanDashboardScreen() {
  const { equipoId } = useContext(AuthContext);

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

  const ultimosResultados = useMemo(
    () => matches.filter((m) => m.estado === 'finalizado').slice(0, 3),
    [matches]
  );
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
        {/* Header del equipo */}
        <View style={styles.teamHeader}>
          <Avatar.Icon
            size={72}
            icon="shield-star"
            style={{ backgroundColor: FAN_ACCENT }}
            color="#FFFFFF"
          />
          <View style={styles.teamInfo}>
            <Text variant="titleLarge" style={styles.teamName} numberOfLines={2}>
              {team?.nombre || 'Mi equipo'}
            </Text>
            <View style={styles.teamMeta}>
              {team?.categoria ? (
                <Chip compact style={styles.teamChip} textStyle={styles.chipText}>
                  {team.categoria}
                </Chip>
              ) : null}
              {team?.modalidad ? (
                <Chip compact style={styles.teamChip} textStyle={styles.chipText}>
                  {team.modalidad}
                </Chip>
              ) : null}
            </View>
            {team?.temporada ? (
              <Text style={styles.teamSeason}>Temporada {team.temporada}</Text>
            ) : null}
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={FAN_ACCENT} style={styles.loader} />
        ) : (
          <>
            {/* Estadísticas de temporada */}
            {teamStats && teamStats.partidos_jugados > 0 ? (
              <>
                <Text variant="titleMedium" style={styles.sectionTitle}>TEMPORADA</Text>
                <View style={styles.glassCard}>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statNum, { color: '#FFFFFF' }]}>
                        {teamStats.partidos_jugados}
                      </Text>
                      <Text style={styles.statLabel}>Jugados</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statNum, { color: '#43A047' }]}>
                        {teamStats.ganados}
                      </Text>
                      <Text style={styles.statLabel}>Victorias</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statNum, { color: '#FFC107' }]}>
                        {teamStats.empatados}
                      </Text>
                      <Text style={styles.statLabel}>Empates</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statNum, { color: '#E53935' }]}>
                        {teamStats.perdidos}
                      </Text>
                      <Text style={styles.statLabel}>Derrotas</Text>
                    </View>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statNumSmall, { color: '#FFFFFF' }]}>
                        {teamStats.goles_favor}
                      </Text>
                      <Text style={styles.statLabel}>Goles a favor</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statNumSmall, { color: '#D94865' }]}>
                        {teamStats.goles_contra}
                      </Text>
                      <Text style={styles.statLabel}>En contra</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statNumSmall, { color: '#43A047' }]}>
                        {teamStats.porcentaje_victorias}%
                      </Text>
                      <Text style={styles.statLabel}>Victorias</Text>
                    </View>
                  </View>
                </View>
              </>
            ) : null}

            {/* Próximo partido */}
            <Text variant="titleMedium" style={styles.sectionTitle}>PRÓXIMO PARTIDO</Text>
            {proximoPartido ? (
              <View style={styles.glassCard}>
                <View style={styles.matchHeader}>
                  <Chip icon="calendar" style={styles.dateChip} textStyle={styles.chipText}>
                    {formatDate(proximoPartido.fecha)}{proximoPartido.hora ? `, ${formatTime(proximoPartido.hora)}` : ''}
                  </Chip>
                  <Chip
                    icon={proximoPartido.es_local ? 'home' : 'airplane'}
                    mode="outlined"
                    style={styles.outlinedChip}
                    textStyle={styles.chipText}
                  >
                    {proximoPartido.es_local ? 'Local' : 'Visitante'}
                  </Chip>
                </View>

                <View style={styles.matchup}>
                  <View style={styles.matchTeam}>
                    <Avatar.Icon
                      size={48}
                      icon="shield-star"
                      style={{ backgroundColor: FAN_ACCENT }}
                      color="#FFFFFF"
                    />
                    <Text style={styles.matchTeamName} numberOfLines={2}>
                      {team?.nombre || 'Nosotros'}
                    </Text>
                  </View>
                  <Text style={styles.vsText}>VS</Text>
                  <View style={styles.matchTeam}>
                    <Avatar.Icon
                      size={48}
                      icon="shield"
                      style={{ backgroundColor: '#D32F2F' }}
                      color="#FFFFFF"
                    />
                    <Text style={styles.matchTeamName} numberOfLines={2}>
                      {proximoPartido.rival}
                    </Text>
                  </View>
                </View>

                {proximoPartido.ubicacion ? (
                  <View style={styles.locationRow}>
                    <Icon name="map-marker" size={16} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {proximoPartido.ubicacion}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={styles.glassCard}>
                <Text style={styles.noDataText}>No hay partidos próximos programados</Text>
              </View>
            )}

            {/* Últimos resultados */}
            <Text variant="titleMedium" style={styles.sectionTitle}>ÚLTIMOS RESULTADOS</Text>
            {ultimosResultados.length > 0 ? (
              <View style={styles.glassCard}>
                {ultimosResultados.map((m, i) => {
                  const { letra, color } = resultInfo(m.goles_favor, m.goles_contra);
                  return (
                    <View key={m.id}>
                      {i > 0 && <View style={styles.divider} />}
                      <View style={styles.resultRow}>
                        <View style={[styles.resultBadge, { backgroundColor: `${color}33`, borderColor: color }]}>
                          <Text style={[styles.resultLetter, { color }]}>{letra}</Text>
                        </View>
                        <View style={styles.resultInfo}>
                          <Text style={styles.resultRival} numberOfLines={1}>
                            {m.es_local ? 'vs.' : '@'} {m.rival}
                          </Text>
                          <Text style={styles.resultDate}>{formatDate(m.fecha)}</Text>
                        </View>
                        <Text style={styles.resultScore}>
                          {m.goles_favor}-{m.goles_contra}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.glassCard}>
                <Text style={styles.noDataText}>Aún no hay resultados registrados</Text>
              </View>
            )}
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
  loader: { marginTop: 40 },

  teamHeader: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderTopWidth: 3,
    borderTopColor: FAN_ACCENT,
  },
  teamInfo: { flex: 1, gap: 6 },
  teamName: { color: '#FFFFFF', fontWeight: 'bold' },
  teamMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  teamChip: { backgroundColor: 'rgba(255,255,255,0.1)', height: 24 },
  chipText: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  teamSeason: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },

  sectionTitle: {
    color: FAN_ACCENT,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 10,
    letterSpacing: 0.5,
  },

  glassCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 6 },
  statItem: { alignItems: 'center', minWidth: 60 },
  statNum: { fontWeight: 'bold', fontSize: 22 },
  statNumSmall: { fontWeight: 'bold', fontSize: 18 },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 8 },

  matchHeader: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  dateChip: { backgroundColor: 'rgba(30,136,229,0.2)' },
  outlinedChip: { borderColor: 'rgba(255,255,255,0.2)' },

  matchup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 10,
  },
  matchTeam: { alignItems: 'center', gap: 6, flex: 1 },
  matchTeamName: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  vsText: { color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', fontSize: 18 },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  locationText: { color: 'rgba(255,255,255,0.55)', fontSize: 13, flex: 1 },

  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  resultBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultLetter: { fontWeight: 'bold', fontSize: 15 },
  resultInfo: { flex: 1, gap: 2 },
  resultRival: { color: '#FFFFFF', fontWeight: '600' },
  resultDate: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  resultScore: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },

  noDataText: {
    color: 'rgba(255,255,255,0.35)',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
