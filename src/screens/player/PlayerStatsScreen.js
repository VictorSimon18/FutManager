/**
 * PlayerStatsScreen.js — Estadísticas del jugador: resumen de temporada e historial por partido.
 */

import React, { useContext, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../../context/AuthContext';
import { usePlayerStats } from '../../hooks/usePlayerStats';
import { formatDate } from '../../utils/dateUtils';

function resultInfo(goles_favor, goles_contra) {
  if (goles_favor > goles_contra) return { letra: 'V', color: '#43A047' };
  if (goles_favor < goles_contra) return { letra: 'D', color: '#E53935' };
  return { letra: 'E', color: 'rgba(255,255,255,0.35)' };
}

function StatTile({ icon, value, label, color = '#FFFFFF' }) {
  return (
    <View style={styles.statTile}>
      <Icon name={icon} size={22} color={color} />
      <Text style={[styles.statTileValue, { color }]}>{value}</Text>
      <Text style={styles.statTileLabel}>{label}</Text>
    </View>
  );
}

export default function PlayerStatsScreen() {
  const { roleData } = useContext(AuthContext);
  const jugadorId = roleData?.id ?? null;
  const isPortero = roleData?.posicion === 'Portero';

  const { stats, seasonStats, loading, refresh } = usePlayerStats(jugadorId);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const s = seasonStats ?? {};
  const partidosJugados = s.partidos_jugados ?? 0;
  const valoracionMedia = s.valoracion_media != null ? Number(s.valoracion_media).toFixed(1) : '—';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />

      {loading ? (
        <ActivityIndicator size="large" color={PLAYER_ACCENT} style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text variant="titleMedium" style={styles.sectionTitle}>RESUMEN DE TEMPORADA</Text>

          {partidosJugados === 0 ? (
            <View style={styles.emptyCard}>
              <Icon name="chart-bar" size={56} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyTitle}>Aún no hay estadísticas registradas</Text>
              <Text style={styles.emptySubtitle}>
                Tus datos aparecerán aquí cuando el entrenador registre los partidos
              </Text>
            </View>
          ) : (
            <View style={styles.glassCard}>
              <View style={styles.statsRow}>
                <StatTile icon="clipboard-list" value={partidosJugados} label="Partidos" />
                <StatTile icon="soccer" value={s.total_goles ?? 0} label="Goles" color="#43A047" />
                <StatTile icon="shoe-cleat" value={s.total_asistencias ?? 0} label="Asistencias" color="#1E88E5" />
                <StatTile icon="clock-outline" value={`${s.total_minutos ?? 0}'`} label="Minutos" color="#FF9800" />
              </View>

              <View style={styles.divider} />

              <View style={styles.statsRow}>
                <StatTile icon="card" value={s.total_amarillas ?? 0} label="T. amarillas" color="#FFC107" />
                <StatTile icon="card" value={s.total_rojas ?? 0} label="T. rojas" color="#E53935" />
                <StatTile icon="karate" value={s.total_entradas ?? 0} label="Entradas" />
                <StatTile icon="shield" value={s.total_despejes ?? 0} label="Despejes" />
              </View>

              <View style={styles.divider} />

              <View style={styles.statsRow}>
                {isPortero ? (
                  <StatTile icon="hand-back-right" value={s.total_paradas ?? 0} label="Paradas" color="#9C27B0" />
                ) : (
                  <StatTile icon="target" value={s.total_tiros_puerta ?? 0} label="Tiros puerta" color="#43A047" />
                )}
                <StatTile icon="close-circle-outline" value={s.total_tiros_fuera ?? 0} label="Tiros fuera" />
                <StatTile icon="account-voice" value={s.total_pases_clave ?? 0} label="Pases clave" color="#1E88E5" />
                <StatTile icon="star" value={valoracionMedia} label="Valoración" color="#FFC107" />
              </View>
            </View>
          )}

          <Text variant="titleMedium" style={styles.sectionTitle}>HISTORIAL POR PARTIDO</Text>

          {stats.length === 0 ? (
            <View style={styles.emptyCard}>
              <Icon name="history" size={40} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptySubtitle}>No hay partidos registrados</Text>
            </View>
          ) : (
            stats.map((stat, i) => {
              const { letra, color } = resultInfo(stat.goles_favor, stat.goles_contra);
              return (
                <View key={stat.id ?? i} style={styles.matchCard}>
                  <View style={styles.matchHeader}>
                    <View style={[styles.resultBadge, { backgroundColor: `${color}33`, borderColor: color }]}>
                      <Text style={[styles.resultLetter, { color }]}>{letra}</Text>
                    </View>
                    <View style={styles.matchInfoHeader}>
                      <Text style={styles.matchRival} numberOfLines={1}>
                        vs. {stat.rival}
                      </Text>
                      <Text style={styles.matchDate}>
                        {formatDate(stat.fecha)} · {stat.goles_favor}-{stat.goles_contra}
                      </Text>
                    </View>
                    {stat.valoracion != null ? (
                      <View style={styles.ratingChip}>
                        <Icon name="star" size={14} color="#FFC107" />
                        <Text style={styles.ratingText}>{Number(stat.valoracion).toFixed(1)}</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.matchStatsGrid}>
                    <View style={styles.matchStat}>
                      <Icon name="soccer" size={14} color="#43A047" />
                      <Text style={styles.matchStatText}>{stat.goles ?? 0} G</Text>
                    </View>
                    <View style={styles.matchStat}>
                      <Icon name="shoe-cleat" size={14} color="#1E88E5" />
                      <Text style={styles.matchStatText}>{stat.asistencias ?? 0} A</Text>
                    </View>
                    <View style={styles.matchStat}>
                      <Icon name="clock-outline" size={14} color="rgba(255,255,255,0.6)" />
                      <Text style={styles.matchStatText}>{stat.minutos_jugados ?? 0}'</Text>
                    </View>
                    {stat.titular === 1 ? (
                      <View style={styles.matchStat}>
                        <Icon name="star-circle" size={14} color={PLAYER_ACCENT} />
                        <Text style={styles.matchStatText}>Titular</Text>
                      </View>
                    ) : null}
                    {(stat.tarjetas_amarillas ?? 0) > 0 ? (
                      <View style={styles.matchStat}>
                        <Icon name="card" size={14} color="#FFC107" />
                        <Text style={styles.matchStatText}>{stat.tarjetas_amarillas}</Text>
                      </View>
                    ) : null}
                    {(stat.tarjetas_rojas ?? 0) > 0 ? (
                      <View style={styles.matchStat}>
                        <Icon name="card" size={14} color="#E53935" />
                        <Text style={styles.matchStatText}>{stat.tarjetas_rojas}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
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

  sectionTitle: {
    color: PLAYER_ACCENT,
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
    borderRadius: 16,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 6 },
  statTile: { alignItems: 'center', gap: 2, minWidth: 60 },
  statTileValue: { fontWeight: 'bold', fontSize: 18, marginTop: 2 },
  statTileLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, textAlign: 'center' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 8 },

  emptyCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 10,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  emptyTitle: { color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', textAlign: 'center' },
  emptySubtitle: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontStyle: 'italic' },

  matchCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    gap: 10,
  },
  matchHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  resultBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultLetter: { fontWeight: 'bold', fontSize: 16 },
  matchInfoHeader: { flex: 1, gap: 2 },
  matchRival: { color: '#FFFFFF', fontWeight: '600' },
  matchDate: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255,193,7,0.15)',
  },
  ratingText: { color: '#FFC107', fontWeight: 'bold', fontSize: 12 },

  matchStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  matchStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  matchStatText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
});
