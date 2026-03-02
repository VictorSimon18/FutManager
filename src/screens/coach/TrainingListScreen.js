import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { useTrainings } from '../../hooks/useTrainings';
import { formatDate, formatTime } from '../../utils/dateUtils';
import EmptyState from '../../components/EmptyState';

const TIPO_COLOR = {
  'Técnico': '#1E88E5',
  'Táctico': '#43A047',
  'Físico': '#E53935',
  'Técnico-táctico': '#9C27B0',
  'Preparación de partido': '#FF6F00',
  'Recuperación': '#00ACC1',
};

function TrainingCard({ training, onPress }) {
  const color = TIPO_COLOR[training.tipo] ?? '#757575';
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={[styles.card, { borderTopColor: color }]}>
        <Card.Content>
          <View style={styles.cardTop}>
            <View style={styles.iconWrap}>
              <Icon name="whistle" size={28} color={color} />
            </View>
            <View style={styles.cardInfo}>
              <Text variant="titleMedium" style={styles.tipo}>
                {training.tipo || 'Entrenamiento'}
              </Text>
              <View style={styles.metaRow}>
                <Icon name="calendar" size={14} color="#999" />
                <Text variant="bodySmall" style={styles.metaText}>
                  {formatDate(training.fecha)}
                </Text>
                {training.hora_inicio && (
                  <>
                    <Icon name="clock-outline" size={14} color="#999" />
                    <Text variant="bodySmall" style={styles.metaText}>
                      {formatTime(training.hora_inicio)}
                      {training.hora_fin ? ` – ${formatTime(training.hora_fin)}` : ''}
                    </Text>
                  </>
                )}
              </View>
              {training.ubicacion ? (
                <View style={styles.metaRow}>
                  <Icon name="map-marker" size={14} color="#999" />
                  <Text variant="bodySmall" style={styles.metaText} numberOfLines={1}>
                    {training.ubicacion}
                  </Text>
                </View>
              ) : null}
            </View>
            {/* Badge de estado 'realizado' */}
            {training.estado === 'realizado' && (
              <Icon name="check-circle" size={20} color="#00AA13" />
            )}
          </View>
          {training.descripcion ? (
            <Text variant="bodySmall" style={styles.descripcion} numberOfLines={2}>
              {training.descripcion}
            </Text>
          ) : null}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

export default function TrainingListScreen({ navigation }) {
  const { equipoId } = useContext(AuthContext);
  const { trainings, loading, refresh } = useTrainings(equipoId);
  const [tab, setTab] = useState('upcoming');

  // Refrescar cada vez que la pantalla recibe el foco
  useEffect(() => {
    const unsub = navigation.addListener('focus', refresh);
    return unsub;
  }, [navigation, refresh]);

  const today = new Date().toISOString().split('T')[0];

  // Próximos: programados con fecha >= hoy
  const upcoming = trainings
    .filter(t => t.estado !== 'realizado' && t.fecha >= today)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  // Pasados: fecha < hoy O ya marcados como 'realizado'
  const past = trainings
    .filter(t => t.estado === 'realizado' || t.fecha < today)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const data = tab === 'upcoming' ? upcoming : past;

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <SegmentedButtons
          value={tab}
          onValueChange={setTab}
          buttons={[
            { value: 'upcoming', label: `Próximos (${upcoming.length})` },
            { value: 'past', label: `Pasados (${past.length})` },
          ]}
        />
      </View>

      {!loading && data.length === 0 ? (
        <EmptyState
          icon="dumbbell"
          title={tab === 'upcoming' ? 'Sin entrenamientos próximos' : 'Sin entrenamientos pasados'}
          subtitle={tab === 'upcoming' ? 'Pulsa + para programar un entrenamiento.' : undefined}
          actionLabel={tab === 'upcoming' ? 'Programar entrenamiento' : undefined}
          onAction={tab === 'upcoming' ? () => navigation.navigate('TrainingForm') : undefined}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          onRefresh={refresh}
          refreshing={loading}
          renderItem={({ item }) => (
            <TrainingCard
              training={item}
              onPress={() => navigation.navigate('TrainingDetail', { trainingId: item.id })}
            />
          )}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => navigation.navigate('TrainingForm')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  tabBar: { backgroundColor: '#fff', padding: 16, elevation: 2 },
  list: { padding: 16, gap: 10, paddingBottom: 96 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderTopWidth: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, minWidth: 0 },
  tipo: { fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  metaText: { color: '#888', flexShrink: 1 },
  descripcion: { color: '#666', marginTop: 8, fontStyle: 'italic' },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#FF6F00' },
});
