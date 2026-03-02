import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Avatar, FAB, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { usePlayers } from '../../hooks/usePlayers';
import { deletePlayer } from '../../database/services/playerService';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';

const POSICION_COLOR = {
  'Portero': '#1E88E5',
  'Defensa Central': '#43A047',
  'Lateral Derecho': '#43A047',
  'Lateral Izquierdo': '#43A047',
  'Carrilero Derecho': '#43A047',
  'Carrilero Izquierdo': '#43A047',
  'Mediocentro Defensivo': '#FF6F00',
  'Mediocentro': '#FF6F00',
  'Mediapunta': '#FF6F00',
  'Extremo Derecho': '#E53935',
  'Extremo Izquierdo': '#E53935',
  'Delantero': '#E53935',
  'Líbero': '#9C27B0',
};

function getInitials(nombre) {
  if (!nombre) return '?';
  const parts = nombre.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function PlayerCard({ player, onPress, onDelete }) {
  const color = POSICION_COLOR[player.posicion] ?? '#757575';
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          {/* Avatar con iniciales */}
          <Avatar.Text
            size={48}
            label={getInitials(player.nombre)}
            style={{ backgroundColor: color }}
            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
          />
          {/* Info del jugador */}
          <View style={styles.cardInfo}>
            <Text variant="titleMedium" style={styles.playerName} numberOfLines={1}>
              {player.nombre}
            </Text>
            <View style={styles.cardMeta}>
              {player.posicion ? (
                <Text variant="bodySmall" style={[styles.posicion, { color }]} numberOfLines={1}>
                  {player.posicion}
                </Text>
              ) : null}
            </View>
          </View>
          {/* Dorsal con tamaño fijo para evitar solapamientos */}
          {player.dorsal != null && (
            <View style={styles.dorsalBadge}>
              <Text style={styles.dorsalText}>#{player.dorsal}</Text>
            </View>
          )}
          {/* Botón eliminar */}
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={8}>
            <Icon name="account-remove" size={22} color="#BDBDBD" />
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

export default function PlayerListScreen({ navigation }) {
  const { equipoId } = useContext(AuthContext);
  const { players, loading, refresh } = usePlayers(equipoId);

  const [query, setQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Refrescar la lista cada vez que la pantalla recibe el foco
  useEffect(() => {
    const unsub = navigation.addListener('focus', refresh);
    return unsub;
  }, [navigation, refresh]);

  const filtered = players.filter(p =>
    p.nombre.toLowerCase().includes(query.toLowerCase())
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deletePlayer(deleteTarget.id);
      refresh();
    } catch (e) {
      Alert.alert('Error', 'No se pudo dar de baja al jugador.');
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Buscar jugador..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchbar}
        />
        <Text variant="bodySmall" style={styles.counter}>
          {filtered.length} jugador{filtered.length !== 1 ? 'es' : ''} en plantilla
        </Text>
      </View>

      {loading ? null : filtered.length === 0 ? (
        <EmptyState
          icon="account-group-outline"
          title="Sin jugadores"
          subtitle={query ? 'No hay resultados para tu búsqueda.' : 'Pulsa + para añadir el primer jugador.'}
          actionLabel={query ? undefined : 'Añadir jugador'}
          onAction={query ? undefined : () => navigation.navigate('PlayerForm')}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <PlayerCard
              player={item}
              onPress={() => navigation.navigate('PlayerDetail', { playerId: item.id })}
              onDelete={() => setDeleteTarget(item)}
            />
          )}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => navigation.navigate('PlayerForm')}
      />

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Dar de baja"
        message={`¿Dar de baja a ${deleteTarget?.nombre}? Dejará de aparecer en la plantilla.`}
        confirmLabel="Dar de baja"
        destructive
        onConfirm={handleDelete}
        onDismiss={() => setDeleteTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#fff', padding: 16, elevation: 2 },
  searchbar: { backgroundColor: '#F5F5F5' },
  counter: { color: '#999', marginTop: 8, textAlign: 'right' },
  list: { padding: 16, gap: 10, paddingBottom: 96 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderTopWidth: 3,
    borderTopColor: '#FF6F00',
  },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardInfo: { flex: 1, minWidth: 0 },
  playerName: { fontWeight: 'bold', color: '#1A1A1A' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  posicion: { fontWeight: '600' },
  dorsalBadge: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  dorsalText: {
    color: '#FF6F00',
    fontWeight: 'bold',
    fontSize: 13,
  },
  deleteBtn: { padding: 4, marginLeft: 4 },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#FF6F00' },
});
