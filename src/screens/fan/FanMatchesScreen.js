/**
 * FanMatchesScreen.js — Listado completo de partidos del equipo (solo lectura).
 */

import React, { useContext, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../../context/AuthContext';
import { useMatches } from '../../hooks/useMatches';
import { formatDate, formatTime } from '../../utils/dateUtils';

function resultChip(estado, gf, gc) {
  if (estado !== 'finalizado') return null;
  if (gf > gc) return { letra: 'V', color: '#43A047' };
  if (gf < gc) return { letra: 'D', color: '#E53935' };
  return { letra: 'E', color: 'rgba(255,255,255,0.35)' };
}

export default function FanMatchesScreen() {
  const { equipoId } = useContext(AuthContext);
  const { matches, loading, refresh } = useMatches(equipoId);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  // Próximos primero, luego pasados
  const sortedMatches = useMemo(() => {
    const copy = [...matches];
    copy.sort((a, b) => {
      const aUpcoming = a.estado === 'programado';
      const bUpcoming = b.estado === 'programado';
      if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
      if (aUpcoming) return a.fecha.localeCompare(b.fecha);
      return b.fecha.localeCompare(a.fecha);
    });
    return copy;
  }, [matches]);

  const renderItem = ({ item }) => {
    const result = resultChip(item.estado, item.goles_favor, item.goles_contra);
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
            <Text style={styles.scoreLabel}>
              {item.es_local ? 'En casa' : 'A domicilio'}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />

      {loading ? (
        <ActivityIndicator size="large" color={FAN_ACCENT} style={styles.loader} />
      ) : (
        <FlatList
          data={sortedMatches}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Icon name="calendar-blank" size={56} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyText}>No hay partidos registrados</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const GLASS_BG = 'rgba(255,255,255,0.08)';
const GLASS_BORDER = 'rgba(255,255,255,0.13)';
const FAN_ACCENT = '#1E88E5';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },
  loader: { marginTop: 40 },
  listContent: { padding: 16, paddingBottom: 40 },

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
  upcomingChip: { backgroundColor: 'rgba(30,136,229,0.2)' },
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
  scoreLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontStyle: 'italic' },

  emptyWrap: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' },
});
