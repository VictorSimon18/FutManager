/**
 * FanStandingsScreen.js — Clasificación del torneo y máximos goleadores/asistentes.
 */

import React, { useContext, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../../context/AuthContext';
import { useTeamTournament } from '../../hooks/usePlayerRole';
import { useTopScorers, useTopAssisters } from '../../hooks/useFanRole';
import { getPositionColor } from '../../utils/positionUtils';

function getInitials(nombre) {
  if (!nombre) return '?';
  const partes = nombre.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

export default function FanStandingsScreen() {
  const { equipoId } = useContext(AuthContext);

  const { data: tournamentData, loading: loadingT, refresh: refreshT } = useTeamTournament(equipoId);
  const { scorers, loading: loadingS, refresh: refreshS } = useTopScorers(equipoId, 10);
  const { assisters, loading: loadingA, refresh: refreshA } = useTopAssisters(equipoId, 5);

  useFocusEffect(
    useCallback(() => {
      refreshT();
      refreshS();
      refreshA();
    }, [refreshT, refreshS, refreshA])
  );

  const isLoading = loadingT || loadingS || loadingA;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color={FAN_ACCENT} style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Clasificación del torneo */}
          {tournamentData && tournamentData.standings.length > 0 ? (
            <>
              <Text variant="titleMedium" style={styles.sectionTitle}>CLASIFICACIÓN</Text>
              <Text style={styles.tournamentName}>
                {tournamentData.torneo?.nombre}
              </Text>
              <View style={styles.listCard}>
                <View style={styles.tableHeader}>
                  <Text style={styles.thPos}>#</Text>
                  <Text style={styles.thTeam}>Equipo</Text>
                  <Text style={styles.thCell}>PJ</Text>
                  <Text style={styles.thCell}>PG</Text>
                  <Text style={styles.thCell}>PE</Text>
                  <Text style={styles.thCell}>PP</Text>
                  <Text style={styles.thCell}>GF</Text>
                  <Text style={styles.thCell}>GC</Text>
                  <Text style={[styles.thCell, styles.thPts]}>Pts</Text>
                </View>
                {tournamentData.standings.map((row, idx) => {
                  const isMine = row.equipo_id === tournamentData.myEquipoId;
                  return (
                    <View
                      key={row.id}
                      style={[styles.tableRow, isMine && styles.tableRowMine]}
                    >
                      <Text style={[styles.tdPos, isMine && styles.tdMine]}>{idx + 1}</Text>
                      <Text
                        style={[styles.tdTeam, isMine && styles.tdMine]}
                        numberOfLines={1}
                      >
                        {row.equipo_nombre}
                      </Text>
                      <Text style={[styles.tdCell, isMine && styles.tdMine]}>{row.partidos_jugados}</Text>
                      <Text style={[styles.tdCell, isMine && styles.tdMine]}>{row.partidos_ganados}</Text>
                      <Text style={[styles.tdCell, isMine && styles.tdMine]}>{row.partidos_empatados}</Text>
                      <Text style={[styles.tdCell, isMine && styles.tdMine]}>{row.partidos_perdidos}</Text>
                      <Text style={[styles.tdCell, isMine && styles.tdMine]}>{row.goles_favor}</Text>
                      <Text style={[styles.tdCell, isMine && styles.tdMine]}>{row.goles_contra}</Text>
                      <Text style={[styles.tdCell, styles.tdPts, isMine && styles.tdMine]}>
                        {row.puntos}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : null}

          {/* Máximos goleadores */}
          <Text variant="titleMedium" style={styles.sectionTitle}>MÁXIMOS GOLEADORES</Text>
          <View style={styles.listCard}>
            {scorers.length === 0 ? (
              <Text style={styles.emptyText}>Aún no hay goles registrados</Text>
            ) : (
              scorers.map((p, idx) => {
                const positionColor = getPositionColor(p.posicion);
                return (
                  <View key={p.id}>
                    {idx > 0 && <View style={styles.divider} />}
                    <View style={styles.scorerRow}>
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankText}>{idx + 1}</Text>
                      </View>
                      {p.foto_url ? (
                        <Avatar.Image size={40} source={{ uri: p.foto_url }} />
                      ) : (
                        <Avatar.Text
                          size={40}
                          label={getInitials(p.nombre)}
                          style={{ backgroundColor: positionColor }}
                          labelStyle={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}
                        />
                      )}
                      <View style={styles.scorerInfo}>
                        <Text style={styles.scorerName} numberOfLines={1}>
                          {p.nombre}
                        </Text>
                        {p.posicion ? (
                          <Text style={[styles.scorerPosition, { color: positionColor }]}>
                            {p.posicion}{p.dorsal != null ? ` · #${p.dorsal}` : ''}
                          </Text>
                        ) : null}
                      </View>
                      <View style={styles.goalsWrap}>
                        <Text style={styles.goalsNum}>{p.total_goles}</Text>
                        <Icon name="soccer" size={18} color="#43A047" />
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Máximos asistentes */}
          {assisters.length > 0 ? (
            <>
              <Text variant="titleMedium" style={styles.sectionTitle}>MÁXIMOS ASISTENTES</Text>
              <View style={styles.listCard}>
                {assisters.map((p, idx) => {
                  const positionColor = getPositionColor(p.posicion);
                  return (
                    <View key={p.id}>
                      {idx > 0 && <View style={styles.divider} />}
                      <View style={styles.scorerRow}>
                        <View style={styles.rankBadge}>
                          <Text style={styles.rankText}>{idx + 1}</Text>
                        </View>
                        <Avatar.Text
                          size={40}
                          label={getInitials(p.nombre)}
                          style={{ backgroundColor: positionColor }}
                          labelStyle={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}
                        />
                        <View style={styles.scorerInfo}>
                          <Text style={styles.scorerName} numberOfLines={1}>
                            {p.nombre}
                          </Text>
                          {p.posicion ? (
                            <Text style={[styles.scorerPosition, { color: positionColor }]}>
                              {p.posicion}{p.dorsal != null ? ` · #${p.dorsal}` : ''}
                            </Text>
                          ) : null}
                        </View>
                        <View style={styles.goalsWrap}>
                          <Text style={[styles.goalsNum, { color: '#1E88E5' }]}>
                            {p.total_asistencias}
                          </Text>
                          <Icon name="shoe-cleat" size={18} color="#1E88E5" />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          ) : null}

          {!tournamentData && scorers.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Icon name="trophy-outline" size={56} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyText}>
                Aún no hay clasificación ni estadísticas
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const GLASS_BG = 'rgba(255,255,255,0.08)';
const GLASS_BORDER = 'rgba(255,255,255,0.13)';
const FAN_ACCENT = '#1E88E5';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },
  scrollContent: { paddingBottom: 40 },
  loader: { marginTop: 60 },

  sectionTitle: {
    color: FAN_ACCENT,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  tournamentName: {
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
    paddingHorizontal: 20,
    marginBottom: 8,
    fontSize: 13,
  },

  listCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 10,
    borderRadius: 14,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },

  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  tableRowMine: {
    backgroundColor: 'rgba(30,136,229,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(30,136,229,0.4)',
  },
  thPos: { width: 22, color: FAN_ACCENT, fontWeight: 'bold', fontSize: 11 },
  thTeam: { flex: 1, color: FAN_ACCENT, fontWeight: 'bold', fontSize: 11 },
  thCell: { width: 26, textAlign: 'center', color: FAN_ACCENT, fontWeight: 'bold', fontSize: 11 },
  thPts: { width: 32 },
  tdPos: { width: 22, color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  tdTeam: { flex: 1, color: '#FFFFFF', fontSize: 13 },
  tdCell: { width: 26, textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  tdPts: { width: 32, fontWeight: 'bold', color: '#FFFFFF' },
  tdMine: { color: '#FFFFFF', fontWeight: '600' },

  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 6 },
  scorerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(30,136,229,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { color: FAN_ACCENT, fontWeight: 'bold', fontSize: 13 },
  scorerInfo: { flex: 1, gap: 2 },
  scorerName: { color: '#FFFFFF', fontWeight: '600' },
  scorerPosition: { fontSize: 11, fontWeight: '600' },
  goalsWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  goalsNum: { color: '#43A047', fontWeight: 'bold', fontSize: 18 },

  emptyWrap: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
});
