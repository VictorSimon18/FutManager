import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, Avatar, FAB, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import { usePlayers } from '../../hooks/usePlayers';
import { deletePlayer } from '../../database/services/playerService';
import { getPositionColor } from '../../utils/positionUtils';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';

const GLASS_BG = 'rgba(255,255,255,0.08)';
const GLASS_BORDER = 'rgba(255,255,255,0.13)';

function getInitials(nombre) {
  if (!nombre) return '?';
  const parts = nombre.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function PlayerCard({ player, onPress, onDelete }) {
  const color = getPositionColor(player.posicion);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.card, { borderLeftColor: color }]}>
        <View style={styles.cardContent}>
          <Avatar.Text
            size={48}
            label={getInitials(player.nombre)}
            style={{ backgroundColor: color }}
            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
          />
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
          {player.dorsal != null && (
            <View style={[styles.dorsalBadge, { backgroundColor: color + '20', borderColor: color + '60' }]}>
              <Text style={[styles.dorsalText, { color }]}>#{player.dorsal}</Text>
            </View>
          )}
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={8}>
            <Icon name="account-remove" size={22} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function PlayerListScreen({ navigation }) {
  const { equipoId } = useContext(AuthContext);
  const { players, loading, refresh } = usePlayers(equipoId);

  const [query, setQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

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
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />
      <View style={styles.header}>
        <Searchbar
          placeholder="Buscar jugador..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchbar}
          inputStyle={styles.searchbarInput}
          iconColor="rgba(255,255,255,0.5)"
          placeholderTextColor="rgba(255,255,255,0.4)"
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
  container: { flex: 1, backgroundColor: '#0f2027' },
  header: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: GLASS_BORDER,
  },
  searchbar: {
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  searchbarInput: { color: '#FFFFFF' },
  counter: { color: 'rgba(255,255,255,0.45)', marginTop: 8, textAlign: 'right' },
  list: { padding: 16, gap: 10, paddingBottom: 96 },
  card: {
    backgroundColor: GLASS_BG,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    padding: 12,
  },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardInfo: { flex: 1, minWidth: 0 },
  playerName: { fontWeight: 'bold', color: '#FFFFFF' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  posicion: { fontWeight: '600' },
  dorsalBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  dorsalText: { fontWeight: 'bold', fontSize: 13 },
  deleteBtn: { padding: 4, marginLeft: 4 },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#105E7A' },
});
