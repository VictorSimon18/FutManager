/**
 * PlayerCalendarScreen.js — Calendario del jugador.
 * Muestra partidos y entrenamientos del equipo con tabs Partidos/Entrenamientos.
 */

import React, { useContext, useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Text, SegmentedButtons, Chip } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../../context/AuthContext';
import { useMatches } from '../../hooks/useMatches';
import { useTrainings } from '../../hooks/useTrainings';
import { usePlayerStats } from '../../hooks/usePlayerStats';
import { usePlayerTrainingHistory } from '../../hooks/usePlayerRole';
import { formatDate, formatTime } from '../../utils/dateUtils';

function resultChip(estado, golesFavor, golesContra) {
  if (estado !== 'finalizado') return null;
  if (golesFavor > golesContra) return { letra: 'V', color: '#43A047' };
  if (golesFavor < golesContra) return { letra: 'D', color: '#E53935' };
  return { letra: 'E', color: 'rgba(255,255,255,0.35)' };
}

export default function PlayerCalendarScreen() {
  const { roleData, equipoId } = useContext(AuthContext);
  const jugadorId = roleData?.id ?? null;

  const [tab, setTab] = useState('partidos');

  const { matches, loading: loadingMatches, refresh: refreshMatches } = useMatches(equipoId);
  const { trainings, loading: loadingTrainings, refresh: refreshTrainings } = useTrainings(equipoId);
  const { stats, refresh: refreshStats } = usePlayerStats(jugadorId);
  const { trainings: attendance, refresh: refreshAttendance } = usePlayerTrainingHistory(jugadorId);

  useFocusEffect(
    useCallback(() => {
      refreshMatches();
      refreshTrainings();
      refreshStats();
      refreshAttendance();
    }, [refreshMatches, refreshTrainings, refreshStats, refreshAttendance])
  );

  // Set de IDs de partidos donde participó el jugador
  const playedMatchIds = useMemo(() => {
    const set = new Set();
    for (const s of stats) if (s.partido_id) set.add(s.partido_id);
    return set;
  }, [stats]);

  // Mapa partidoId → stats del jugador (para mostrar contribución)
  const statsByMatch = useMemo(() => {
    const map = {};
    for (const s of stats) map[s.partido_id] = s;
    return map;
  }, [stats]);

  // Mapa entrenamientoId → registro de asistencia
  const attendanceByTraining = useMemo(() => {
    const map = {};
    for (const a of attendance) map[a.entrenamiento_id] = a;
    return map;
  }, [attendance]);

  // Partidos ordenados: próximos primero, luego pasados
  const sortedMatches = useMemo(() => {
    const copy = [...matches];
    copy.sort((a, b) => {
      const aUpcoming = a.estado === 'programado';
      const bUpcoming = b.estado === 'programado';
      if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
      // Próximos: ascendente; pasados: descendente
      if (aUpcoming) return a.fecha.localeCompare(b.fecha);
      return b.fecha.localeCompare(a.fecha);
    });
    return copy;
  }, [matches]);

  const sortedTrainings = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const copy = [...trainings];
    copy.sort((a, b) => {
      const aUpcoming = a.fecha >= today;
      const bUpcoming = b.fecha >= today;
      if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
      if (aUpcoming) return a.fecha.localeCompare(b.fecha);
      return b.fecha.localeCompare(a.fecha);
    });
    return copy;
  }, [trainings]);

  const renderMatch = ({ item }) => {
    const result = resultChip(item.estado, item.goles_favor, item.goles_contra);
    const played = playedMatchIds.has(item.id);
    const myStats = statsByMatch[item.id];
    const finalizado = item.estado === 'finalizado';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.cardTitle} numberOfLines={1}>
            {item.es_local ? 'vs.' : '@'} {item.rival}
          </Text>
          {result ? (
            <View style={[styles.resultBadge, { backgroundColor: `${result.color}33`, borderColor: result.color }]}>
              <Text style={[styles.resultLetter, { color: result.color }]}>{result.letra}</Text>
            </View>
          ) : (
            <Chip compact style={styles.upcomingChip} textStyle={styles.chipText}>Próximo</Chip>
          )}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="calendar" size={14} color="rgba(255,255,255,0.55)" />
            <Text style={styles.metaText}>
              {formatDate(item.fecha)}{item.hora ? ` · ${formatTime(item.hora)}` : ''}
            </Text>
          </View>
          {item.ubicacion ? (
            <View style={styles.metaItem}>
              <Icon name="map-marker" size={14} color="rgba(255,255,255,0.55)" />
              <Text style={styles.metaText} numberOfLines={1}>{item.ubicacion}</Text>
            </View>
          ) : null}
          {item.tipo ? (
            <Chip compact style={styles.typeChip} textStyle={styles.chipTextSmall}>
              {item.tipo}
            </Chip>
          ) : null}
        </View>

        {finalizado ? (
          <View style={styles.scoreRow}>
            <Text style={styles.scoreText}>{item.goles_favor} - {item.goles_contra}</Text>
            {played ? (
              <View style={styles.participationBadge}>
                <Icon name="check-circle" size={14} color="#43A047" />
                <Text style={styles.participationText}>Participaste</Text>
              </View>
            ) : (
              <View style={styles.noParticipationBadge}>
                <Icon name="minus-circle" size={14} color="rgba(255,255,255,0.4)" />
                <Text style={styles.noParticipationText}>No convocado</Text>
              </View>
            )}
          </View>
        ) : null}

        {played && myStats && finalizado ? (
          <View style={styles.contribRow}>
            <View style={styles.statMini}>
              <Icon name="soccer" size={14} color="#43A047" />
              <Text style={styles.statMiniText}>{myStats.goles ?? 0}</Text>
            </View>
            <View style={styles.statMini}>
              <Icon name="shoe-cleat" size={14} color="#1E88E5" />
              <Text style={styles.statMiniText}>{myStats.asistencias ?? 0}</Text>
            </View>
            <View style={styles.statMini}>
              <Icon name="clock-outline" size={14} color="rgba(255,255,255,0.6)" />
              <Text style={styles.statMiniText}>{myStats.minutos_jugados ?? 0}'</Text>
            </View>
            {myStats.valoracion != null ? (
              <View style={styles.statMini}>
                <Icon name="star" size={14} color="#FFC107" />
                <Text style={styles.statMiniText}>{Number(myStats.valoracion).toFixed(1)}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  };

  const renderTraining = ({ item }) => {
    const record = attendanceByTraining[item.id];
    let attendanceBadge = null;
    if (record) {
      if (record.asistio === 1) {
        attendanceBadge = { text: '✓ Asistí', color: '#43A047' };
      } else {
        attendanceBadge = { text: '✗ No asistí', color: '#E53935' };
      }
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.cardTitle} numberOfLines={1}>
            {item.tipo || 'Entrenamiento'}
          </Text>
          {attendanceBadge ? (
            <View style={[styles.attendanceBadge, { backgroundColor: `${attendanceBadge.color}33`, borderColor: attendanceBadge.color }]}>
              <Text style={[styles.attendanceText, { color: attendanceBadge.color }]}>
                {attendanceBadge.text}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="calendar" size={14} color="rgba(255,255,255,0.55)" />
            <Text style={styles.metaText}>{formatDate(item.fecha)}</Text>
          </View>
          {item.hora_inicio ? (
            <View style={styles.metaItem}>
              <Icon name="clock" size={14} color="rgba(255,255,255,0.55)" />
              <Text style={styles.metaText}>
                {formatTime(item.hora_inicio)}{item.hora_fin ? ` - ${formatTime(item.hora_fin)}` : ''}
              </Text>
            </View>
          ) : null}
        </View>

        {item.ubicacion ? (
          <View style={styles.metaItem}>
            <Icon name="map-marker" size={14} color="rgba(255,255,255,0.55)" />
            <Text style={styles.metaText} numberOfLines={1}>{item.ubicacion}</Text>
          </View>
        ) : null}

        {item.descripcion ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.descripcion}
          </Text>
        ) : null}
      </View>
    );
  };

  const isLoading = loadingMatches || loadingTrainings;
  const data = tab === 'partidos' ? sortedMatches : sortedTrainings;
  const renderItem = tab === 'partidos' ? renderMatch : renderTraining;
  const emptyLabel = tab === 'partidos'
    ? 'No hay partidos registrados'
    : 'No hay entrenamientos programados';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />

      <View style={styles.tabsContainer}>
        <SegmentedButtons
          value={tab}
          onValueChange={setTab}
          theme={{ colors: { secondaryContainer: 'rgba(0,170,19,0.25)', onSecondaryContainer: '#FFFFFF' } }}
          buttons={[
            {
              value: 'partidos',
              label: `Partidos (${matches.length})`,
              icon: 'soccer',
              style: { borderColor: 'rgba(255,255,255,0.2)' },
            },
            {
              value: 'entrenamientos',
              label: `Entrenos (${trainings.length})`,
              icon: 'whistle',
              style: { borderColor: 'rgba(255,255,255,0.2)' },
            },
          ]}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={PLAYER_ACCENT} style={styles.loader} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Icon name="calendar-blank" size={56} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyText}>{emptyLabel}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const GLASS_BG = 'rgba(255,255,255,0.08)';
const GLASS_BORDER = 'rgba(255,255,255,0.13)';
const PLAYER_ACCENT = '#00AA13';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },
  tabsContainer: { padding: 16 },
  loader: { marginTop: 40 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },

  card: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: { color: '#FFFFFF', fontWeight: 'bold', flex: 1 },
  resultBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultLetter: { fontWeight: 'bold', fontSize: 15 },
  upcomingChip: { backgroundColor: 'rgba(0,170,19,0.2)' },
  chipText: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  chipTextSmall: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  typeChip: { backgroundColor: 'rgba(255,255,255,0.1)', height: 24 },

  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: 'rgba(255,255,255,0.55)', fontSize: 12 },

  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  scoreText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 },
  participationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  participationText: { color: '#43A047', fontWeight: '600', fontSize: 12 },
  noParticipationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  noParticipationText: { color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', fontSize: 12 },

  contribRow: {
    flexDirection: 'row',
    gap: 14,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  statMini: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statMiniText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },

  attendanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  attendanceText: { fontWeight: '600', fontSize: 12 },
  description: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontStyle: 'italic' },

  emptyWrap: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' },
});
