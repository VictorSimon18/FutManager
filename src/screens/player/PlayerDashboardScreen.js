/**
 * PlayerDashboardScreen.js — Pantalla "Inicio" del rol jugador.
 * Muestra resumen del jugador: ficha, rendimiento, próximo evento y últimos partidos.
 */

import React, { useContext, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
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

// Devuelve iniciales a partir de un nombre completo
function getInitials(nombre) {
  if (!nombre) return '?';
  const partes = nombre.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

// Devuelve letra y color del resultado (V/E/D) desde el punto de vista del equipo
function resultInfo(stat) {
  if (stat.goles_favor > stat.goles_contra) return { letra: 'V', color: '#43A047' };
  if (stat.goles_favor < stat.goles_contra) return { letra: 'D', color: '#E53935' };
  return { letra: 'E', color: 'rgba(255,255,255,0.35)' };
}

export default function PlayerDashboardScreen() {
  const { roleData, equipoId } = useContext(AuthContext);
  const jugadorId = roleData?.id ?? null;

  const { stats, seasonStats, loading: loadingStats, refresh: refreshStats } = usePlayerStats(jugadorId);
  const { upcomingMatches, loading: loadingMatches, refresh: refreshMatches } = useMatches(equipoId);
  const { upcomingTrainings, loading: loadingTrainings, refresh: refreshTrainings } = useTrainings(equipoId);

  useFocusEffect(
    useCallback(() => {
      refreshStats();
      refreshMatches();
      refreshTrainings();
    }, [refreshStats, refreshMatches, refreshTrainings])
  );

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

  const ultimosPartidos = stats.slice(0, 3);
  const positionColor = getPositionColor(roleData?.posicion);
  const iniciales = getInitials(roleData?.nombre);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header del jugador */}
        <View style={styles.headerCard}>
          {roleData?.foto_url ? (
            <Avatar.Image size={64} source={{ uri: roleData.foto_url }} />
          ) : (
            <Avatar.Text
              size={64}
              label={iniciales}
              style={{ backgroundColor: positionColor }}
              labelStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
            />
          )}
          <View style={styles.headerInfo}>
            <Text variant="titleLarge" style={styles.playerName} numberOfLines={1}>
              {roleData?.nombre || 'Jugador'}
            </Text>
            <View style={styles.metaRow}>
              {roleData?.posicion ? (
                <Chip
                  compact
                  style={[styles.chip, { backgroundColor: `${positionColor}33` }]}
                  textStyle={styles.chipText}
                >
                  {roleData.posicion}
                </Chip>
              ) : null}
              {roleData?.dorsal != null ? (
                <Text variant="bodyMedium" style={[styles.dorsal, { color: positionColor }]}>
                  #{roleData.dorsal}
                </Text>
              ) : null}
            </View>
            {roleData?.pie_dominante ? (
              <Text variant="bodySmall" style={styles.metaText}>
                Pie {roleData.pie_dominante}
              </Text>
            ) : null}
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={PLAYER_ACCENT} style={styles.loader} />
        ) : (
          <>
            {/* Rendimiento */}
            <Text variant="titleMedium" style={styles.sectionTitle}>RENDIMIENTO</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Icon name="soccer" size={26} color={PLAYER_ACCENT} />
                <Text variant="headlineSmall" style={styles.statValue}>
                  {seasonStats?.total_goles ?? 0}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>Goles</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="shoe-cleat" size={26} color="#1E88E5" />
                <Text variant="headlineSmall" style={styles.statValue}>
                  {seasonStats?.total_asistencias ?? 0}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>Asistencias</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="clipboard-list" size={26} color="#9C27B0" />
                <Text variant="headlineSmall" style={styles.statValue}>
                  {seasonStats?.partidos_jugados ?? 0}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>Partidos</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="clock-outline" size={26} color="#FF9800" />
                <Text variant="headlineSmall" style={styles.statValue}>
                  {seasonStats?.total_minutos ?? 0}'
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>Minutos</Text>
              </View>
            </View>

            {/* Próximo evento */}
            <Text variant="titleMedium" style={styles.sectionTitle}>PRÓXIMO EVENTO</Text>
            {proximoEvento ? (
              <View style={styles.glassCard}>
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
                <Text variant="titleMedium" style={styles.eventTitle} numberOfLines={2}>
                  {proximoEvento.titulo}
                </Text>
                {proximoEvento.ubicacion ? (
                  <View style={styles.locationRow}>
                    <Icon name="map-marker" size={16} color="rgba(255,255,255,0.5)" />
                    <Text variant="bodyMedium" style={styles.eventLocation} numberOfLines={1}>
                      {proximoEvento.ubicacion}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={styles.glassCard}>
                <Text variant="bodyMedium" style={styles.noDataText}>
                  No hay eventos próximos programados
                </Text>
              </View>
            )}

            {/* Últimos partidos */}
            <Text variant="titleMedium" style={styles.sectionTitle}>ÚLTIMOS PARTIDOS</Text>
            {ultimosPartidos.length > 0 ? (
              <View style={styles.glassCard}>
                {ultimosPartidos.map((stat, i) => {
                  const { letra, color } = resultInfo(stat);
                  return (
                    <View key={stat.id ?? i}>
                      {i > 0 && <View style={styles.divider} />}
                      <View style={styles.matchRow}>
                        <View style={[styles.resultBadge, { backgroundColor: `${color}33`, borderColor: color }]}>
                          <Text style={[styles.resultLetter, { color }]}>{letra}</Text>
                        </View>
                        <View style={styles.matchInfo}>
                          <Text variant="bodyMedium" style={styles.matchRival} numberOfLines={1}>
                            vs. {stat.rival}
                          </Text>
                          <Text variant="bodySmall" style={styles.matchDate}>
                            {formatDate(stat.fecha)} · {stat.goles_favor}-{stat.goles_contra}
                          </Text>
                          <View style={styles.matchStats}>
                            <View style={styles.statMini}>
                              <Icon name="soccer" size={14} color={PLAYER_ACCENT} />
                              <Text style={styles.statMiniText}>{stat.goles ?? 0}</Text>
                            </View>
                            <View style={styles.statMini}>
                              <Icon name="shoe-cleat" size={14} color="#1E88E5" />
                              <Text style={styles.statMiniText}>{stat.asistencias ?? 0}</Text>
                            </View>
                            <View style={styles.statMini}>
                              <Icon name="clock-outline" size={14} color="rgba(255,255,255,0.5)" />
                              <Text style={styles.statMiniText}>{stat.minutos_jugados ?? 0}'</Text>
                            </View>
                            {stat.valoracion != null ? (
                              <View style={styles.statMini}>
                                <Icon name="star" size={14} color="#FFC107" />
                                <Text style={styles.statMiniText}>{Number(stat.valoracion).toFixed(1)}</Text>
                              </View>
                            ) : null}
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.glassCard}>
                <Text variant="bodyMedium" style={styles.noDataText}>
                  Aún no hay partidos registrados
                </Text>
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
const PLAYER_ACCENT = '#00AA13';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },
  scrollContent: { paddingBottom: 40 },
  loader: { marginTop: 60 },

  headerCard: {
    margin: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderTopWidth: 3,
    borderTopColor: PLAYER_ACCENT,
  },
  headerInfo: { flex: 1, gap: 6 },
  playerName: { color: '#FFFFFF', fontWeight: 'bold' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chip: { height: 26 },
  chipText: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  dorsal: { fontWeight: 'bold' },
  metaText: { color: 'rgba(255,255,255,0.5)' },

  sectionTitle: {
    color: PLAYER_ACCENT,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 10,
    letterSpacing: 0.5,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 8,
  },
  statCard: {
    width: '48%',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderTopWidth: 3,
    borderTopColor: PLAYER_ACCENT,
  },
  statValue: { color: '#FFFFFF', fontWeight: 'bold', marginTop: 6 },
  statLabel: { color: 'rgba(255,255,255,0.5)', marginTop: 2 },

  glassCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  eventHeader: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  eventChip: { backgroundColor: 'rgba(0,170,19,0.2)' },
  eventChipOutlined: { borderColor: 'rgba(255,255,255,0.2)' },
  eventTitle: { color: '#FFFFFF', fontWeight: 'bold', marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eventLocation: { color: 'rgba(255,255,255,0.55)', flex: 1 },
  noDataText: { color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', textAlign: 'center' },

  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 10 },
  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  resultBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultLetter: { fontWeight: 'bold', fontSize: 18 },
  matchInfo: { flex: 1, gap: 3 },
  matchRival: { color: '#FFFFFF', fontWeight: '600' },
  matchDate: { color: 'rgba(255,255,255,0.5)' },
  matchStats: { flexDirection: 'row', gap: 12, marginTop: 4 },
  statMini: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statMiniText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
});
