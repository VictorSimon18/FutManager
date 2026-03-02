import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, Chip, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { useMatches } from '../../hooks/useMatches';
import { formatDate, formatTime } from '../../utils/dateUtils';
import EmptyState from '../../components/EmptyState';

function MatchCard({ match, onPress }) {
  const isFinished = match.estado === 'finalizado';
  const gF = match.goles_favor ?? 0;
  const gC = match.goles_contra ?? 0;
  let resultColor = '#9E9E9E';
  let resultLabel = null;
  if (isFinished) {
    if (gF > gC) { resultColor = '#43A047'; resultLabel = 'Victoria'; }
    else if (gF < gC) { resultColor = '#E53935'; resultLabel = 'Derrota'; }
    else { resultColor = '#FF6F00'; resultLabel = 'Empate'; }
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={[styles.card, { borderTopColor: resultColor }]}>
        <Card.Content>
          <View style={styles.cardTop}>
            <View style={styles.cardLeft}>
              <Text variant="titleMedium" style={styles.rival} numberOfLines={1}>
                vs. {match.rival}
              </Text>
              <View style={styles.metaRow}>
                <Icon name="calendar" size={14} color="#999" />
                <Text variant="bodySmall" style={styles.metaText}>
                  {formatDate(match.fecha)}
                  {match.hora ? `  ·  ${formatTime(match.hora)}` : ''}
                </Text>
              </View>
              {match.ubicacion ? (
                <View style={styles.metaRow}>
                  <Icon name="map-marker" size={14} color="#999" />
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
                <Icon name="clock-outline" size={32} color="#BDBDBD" />
              )}
            </View>
          </View>
          <View style={styles.chipsRow}>
            <Chip compact icon={match.es_local ? 'home' : 'airplane'} style={styles.chip}>
              {match.es_local ? 'Local' : 'Visitante'}
            </Chip>
            {match.tipo && <Chip compact style={styles.chip}>{match.tipo}</Chip>}
            {match.modalidad && <Chip compact style={styles.chip}>{match.modalidad}</Chip>}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

export default function MatchListScreen({ navigation }) {
  const { equipoId } = useContext(AuthContext);
  const { matches, loading, refresh } = useMatches(equipoId);
  const [tab, setTab] = useState('upcoming');

  // Refrescar cada vez que la pantalla recibe el foco
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
      <View style={styles.tabBar}>
        <SegmentedButtons
          value={tab}
          onValueChange={setTab}
          buttons={[
            { value: 'upcoming', label: `Próximos (${upcoming.length})` },
            { value: 'finished', label: `Jugados (${finished.length})` },
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
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  tabBar: { backgroundColor: '#fff', padding: 16, elevation: 2 },
  list: { padding: 16, gap: 10, paddingBottom: 96 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderTopWidth: 3 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  cardLeft: { flex: 1, minWidth: 0 },
  cardRight: { alignItems: 'center', minWidth: 72 },
  rival: { fontWeight: 'bold', color: '#1A1A1A', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  metaText: { color: '#888', flexShrink: 1 },
  score: { fontWeight: 'bold', lineHeight: 36 },
  chipsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  chip: { backgroundColor: '#F5F5F5', height: 26 },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#FF6F00' },
});
