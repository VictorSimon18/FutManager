import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, FAB, Chip, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import { useMatches } from '../../hooks/useMatches';
import { formatDate, formatTime } from '../../utils/dateUtils';
import EmptyState from '../../components/EmptyState';

const GLASS_BG = 'rgba(255,255,255,0.08)';
const GLASS_BORDER = 'rgba(255,255,255,0.13)';

function MatchCard({ match, onPress }) {
  const isFinished = match.estado === 'finalizado';
  const gF = match.goles_favor ?? 0;
  const gC = match.goles_contra ?? 0;
  let resultColor = '#9E9E9E';
  let resultLabel = null;
  if (isFinished) {
    if (gF > gC) { resultColor = '#43A047'; resultLabel = 'Victoria'; }
    else if (gF < gC) { resultColor = '#E53935'; resultLabel = 'Derrota'; }
    else { resultColor = '#105E7A'; resultLabel = 'Empate'; }
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.card, { borderTopColor: resultColor }]}>
        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            <Text variant="titleMedium" style={styles.rival} numberOfLines={1}>
              vs. {match.rival}
            </Text>
            <View style={styles.metaRow}>
              <Icon name="calendar" size={14} color="rgba(255,255,255,0.4)" />
              <Text variant="bodySmall" style={styles.metaText}>
                {formatDate(match.fecha)}
                {match.hora ? `  ·  ${formatTime(match.hora)}` : ''}
              </Text>
            </View>
            {match.ubicacion ? (
              <View style={styles.metaRow}>
                <Icon name="map-marker" size={14} color="rgba(255,255,255,0.4)" />
                <Text variant="bodySmall" style={styles.metaText} numberOfLines={1}>
                  {match.ubicacion}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.cardRight}>
            {isFinished ? (
              <>
                <Text variant="headlineMedium" style={[styles.score, { color: resultColor }]}>
                  {gF} - {gC}
                </Text>
                <Text variant="bodySmall" style={{ color: resultColor, fontWeight: '600' }}>
                  {resultLabel}
                </Text>
              </>
            ) : (
              <Icon name="clock-outline" size={32} color="rgba(255,255,255,0.3)" />
            )}
          </View>
        </View>
        <View style={styles.chipsRow}>
          <Chip compact icon={match.es_local ? 'home' : 'airplane'} style={styles.chip} textStyle={styles.chipText}>
            {match.es_local ? 'Local' : 'Visitante'}
          </Chip>
          {match.tipo && <Chip compact style={styles.chip} textStyle={styles.chipText}>{match.tipo}</Chip>}
          {match.modalidad && <Chip compact style={styles.chip} textStyle={styles.chipText}>{match.modalidad}</Chip>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MatchListScreen({ navigation }) {
  const { equipoId } = useContext(AuthContext);
  const { matches, loading, refresh } = useMatches(equipoId);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    const unsub = navigation.addListener('focus', refresh);
    return unsub;
  }, [navigation, refresh]);

  const upcoming = matches.filter(m => m.estado === 'programado').sort(
    (a, b) => new Date(a.fecha) - new Date(b.fecha)
  );
  const finished = matches.filter(m => m.estado === 'finalizado').sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );

  const data = tab === 'upcoming' ? upcoming : finished;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />
      <View style={styles.tabBar}>
        <SegmentedButtons
          value={tab}
          onValueChange={setTab}
          buttons={[
            { value: 'upcoming', label: `Próximos (${upcoming.length})`, labelStyle: { color: '#FFFFFF' } },
            { value: 'finished', label: `Jugados (${finished.length})`, labelStyle: { color: '#FFFFFF' } },
          ]}
        />
      </View>

      {!loading && data.length === 0 ? (
        <EmptyState
          icon="soccer"
          title={tab === 'upcoming' ? 'Sin partidos próximos' : 'Sin partidos jugados'}
          subtitle={tab === 'upcoming' ? 'Pulsa + para programar un partido.' : undefined}
          actionLabel={tab === 'upcoming' ? 'Programar partido' : undefined}
          onAction={tab === 'upcoming' ? () => navigation.navigate('MatchForm') : undefined}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          onRefresh={refresh}
          refreshing={loading}
          renderItem={({ item }) => (
            <MatchCard
              match={item}
              onPress={() => navigation.navigate('MatchDetail', { matchId: item.id })}
            />
          )}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => navigation.navigate('MatchForm')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },
  tabBar: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: GLASS_BORDER,
  },
  list: { padding: 16, gap: 10, paddingBottom: 96 },
  card: {
    backgroundColor: GLASS_BG,
    borderRadius: 12,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  cardLeft: { flex: 1, minWidth: 0 },
  cardRight: { alignItems: 'center', minWidth: 72 },
  rival: { fontWeight: 'bold', color: '#FFFFFF', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  metaText: { color: 'rgba(255,255,255,0.5)', flexShrink: 1 },
  score: { fontWeight: 'bold', lineHeight: 36 },
  chipsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  chip: { backgroundColor: 'rgba(255,255,255,0.1)' },
  chipText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#105E7A' },
});
