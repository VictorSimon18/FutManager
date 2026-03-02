import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Avatar, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { getPlayerById, deletePlayer } from '../../database/services/playerService';
import { getSeasonStats, getStatsByPlayer } from '../../database/services/statsService';
import { formatDate } from '../../utils/dateUtils';
import StatBadge from '../../components/StatBadge';
import ConfirmDialog from '../../components/ConfirmDialog';

function matchResult(gF, gC) {
  if (gF > gC) return { label: 'V', color: '#43A047' };
  if (gF < gC) return { label: 'D', color: '#E53935' };
  return { label: 'E', color: '#FF6F00' };
}

export default function PlayerDetailScreen({ route, navigation }) {
  const { playerId } = route.params;
  const [player, setPlayer] = useState(null);
  const [seasonStats, setSeasonStats] = useState(null);
  const [matchStats, setMatchStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [p, season, matches] = await Promise.all([
        getPlayerById(playerId),
        getSeasonStats(playerId),
        getStatsByPlayer(playerId),
      ]);
      setPlayer(p);
      setSeasonStats(season);
      setMatchStats(matches);
    } catch (e) {
      Alert.alert('Error', 'No se pudo cargar el jugador.');
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [load, navigation]);

  async function handleDelete() {
    try {
      await deletePlayer(playerId);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo dar de baja al jugador.');
    } finally {
      setConfirmDelete(false);
    }
  }

  if (loading || !player) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6F00" />
      </View>
    );
  }

  const initials = player.nombre
    ? player.nombre.trim().split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Cabecera jugador */}
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <Avatar.Text size={72} label={initials} style={styles.avatar} labelStyle={styles.avatarLabel} />
          <View style={styles.headerInfo}>
            <Text variant="headlineSmall" style={styles.nombre}>{player.nombre}</Text>
            {player.posicion ? (
              <Text variant="bodyMedium" style={styles.posicion}>{player.posicion}</Text>
            ) : null}
            <View style={styles.chips}>
              {player.dorsal != null && (
                <View style={styles.chip}>
                  <Icon name="tshirt-crew" size={14} color="#FF6F00" />
                  <Text variant="bodySmall" style={styles.chipText}>#{player.dorsal}</Text>
                </View>
              )}
              {player.pie_dominante && (
                <View style={styles.chip}>
                  <Icon name="shoe-sneaker" size={14} color="#FF6F00" />
                  <Text variant="bodySmall" style={styles.chipText}>{player.pie_dominante}</Text>
                </View>
              )}
              {player.sexo && (
                <View style={styles.chip}>
                  <Icon name="account" size={14} color="#FF6F00" />
                  <Text variant="bodySmall" style={styles.chipText}>{player.sexo}</Text>
                </View>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Datos personales */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.sectionTitle}>Datos personales</Text>
          <View style={styles.dataRow}>
            <Icon name="cake" size={18} color="#9E9E9E" />
            <Text variant="bodyMedium" style={styles.dataText}>
              {formatDate(player.fecha_nacimiento)}
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Icon name="human-male-height" size={18} color="#9E9E9E" />
            <Text variant="bodyMedium" style={styles.dataText}>
              {player.altura ? `${player.altura} m` : '—'}
              {'  '}·{'  '}
              {player.peso ? `${player.peso} kg` : '—'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Estadísticas de temporada */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.sectionTitle}>Estadísticas de temporada</Text>
          <View style={styles.statsRow}>
            <StatBadge icon="soccer-field" value={seasonStats?.partidos_jugados ?? 0} label="Partidos" color="#1E88E5" />
            <StatBadge icon="soccer" value={seasonStats?.total_goles ?? 0} label="Goles" color="#43A047" />
            <StatBadge icon="hand-okay" value={seasonStats?.total_asistencias ?? 0} label="Asistencias" color="#FF6F00" />
            <StatBadge icon="timer" value={seasonStats?.total_minutos ?? 0} label="Minutos" color="#757575" />
          </View>
          <Divider style={styles.divider} />
          <View style={styles.statsRow}>
            <StatBadge icon="card-text" value={seasonStats?.total_amarillas ?? 0} label="Amarillas" color="#FDD835" />
            <StatBadge icon="card-text" value={seasonStats?.total_rojas ?? 0} label="Rojas" color="#E53935" />
            <StatBadge icon="star-circle" value={
              seasonStats?.valoracion_media != null
                ? Number(seasonStats.valoracion_media).toFixed(1)
                : '—'
            } label="Valoración" color="#FF6F00" />
          </View>
        </Card.Content>
      </Card>

      {/* Historial de partidos */}
      {matchStats.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.sectionTitle}>Últimos partidos</Text>
            {matchStats.slice(0, 5).map(stat => {
              const res = matchResult(stat.goles_favor, stat.goles_contra);
              return (
                <View key={stat.id} style={styles.matchRow}>
                  <View style={[styles.resultBadge, { backgroundColor: res.color }]}>
                    <Text style={styles.resultLabel}>{res.label}</Text>
                  </View>
                  <View style={styles.matchInfo}>
                    <Text variant="bodyMedium" style={styles.matchRival}>vs. {stat.rival}</Text>
                    <Text variant="bodySmall" style={styles.matchDate}>{formatDate(stat.fecha)}</Text>
                  </View>
                  <View style={styles.matchStats}>
                    <Text variant="bodySmall" style={styles.matchStatText}>
                      ⚽ {stat.goles}  🅰️ {stat.asistencias}  ⏱ {stat.minutos_jugados}'
                    </Text>
                  </View>
                </View>
              );
            })}
          </Card.Content>
        </Card>
      )}

      {/* Acciones */}
      <View style={styles.actions}>
        <Button
          mode="contained"
          icon="pencil"
          onPress={() => navigation.navigate('PlayerForm', { playerId })}
          buttonColor="#FF6F00"
          style={styles.actionBtn}
        >
          Editar
        </Button>
        <Button
          mode="outlined"
          icon="account-remove"
          onPress={() => setConfirmDelete(true)}
          textColor="#D32F2F"
          style={[styles.actionBtn, styles.deleteBtn]}
        >
          Dar de baja
        </Button>
      </View>

      <ConfirmDialog
        visible={confirmDelete}
        title="Dar de baja"
        message={`¿Dar de baja a ${player.nombre}? Dejará de aparecer en la plantilla.`}
        confirmLabel="Dar de baja"
        destructive
        onConfirm={handleDelete}
        onDismiss={() => setConfirmDelete(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: { backgroundColor: '#fff', borderRadius: 12, borderTopWidth: 3, borderTopColor: '#FF6F00' },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { backgroundColor: '#FF6F00' },
  avatarLabel: { color: '#fff', fontWeight: 'bold', fontSize: 24 },
  headerInfo: { flex: 1 },
  nombre: { fontWeight: 'bold', color: '#1A1A1A' },
  posicion: { color: '#FF6F00', fontWeight: '600', marginTop: 2 },
  chips: { flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chipText: { color: '#666' },
  card: { backgroundColor: '#fff', borderRadius: 12 },
  sectionTitle: { fontWeight: 'bold', color: '#FF6F00', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  dataRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  dataText: { color: '#444' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  divider: { marginVertical: 8 },
  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  resultBadge: { width: 28, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  resultLabel: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  matchInfo: { flex: 1 },
  matchRival: { fontWeight: '600', color: '#1A1A1A' },
  matchDate: { color: '#999' },
  matchStats: {},
  matchStatText: { color: '#555' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  actionBtn: { flex: 1, borderRadius: 8 },
  deleteBtn: { borderColor: '#D32F2F' },
});
