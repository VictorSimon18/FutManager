import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Divider, Switch } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import {
  getTrainingById,
  deleteTraining,
  updateTrainingStatus,
  registerAttendance,
  getAttendance,
} from '../../database/services/trainingService';
import { getPlayersByTeam } from '../../database/services/playerService';
import { formatDate, formatTime } from '../../utils/dateUtils';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function TrainingDetailScreen({ route, navigation }) {
  const { trainingId } = route.params;
  const { equipoId } = useContext(AuthContext);

  const [training, setTraining] = useState(null);
  const [players, setPlayers] = useState([]);
  const [attendance, setAttendance] = useState({}); // jugadorId → asistio (bool)
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null); // jugadorId cuya asistencia se está guardando
  const [savingFinal, setSavingFinal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [t, p, att] = await Promise.all([
        getTrainingById(trainingId),
        getPlayersByTeam(equipoId),
        getAttendance(trainingId),
      ]);
      setTraining(t);
      setPlayers(p);
      // Construir mapa jugadorId → asistio
      const attMap = {};
      att.forEach(a => { attMap[a.jugador_id] = !!a.asistio; });
      setAttendance(attMap);
    } catch (e) {
      Alert.alert('Error', 'No se pudo cargar el entrenamiento.');
    } finally {
      setLoading(false);
    }
  }, [trainingId, equipoId]);

  useEffect(() => {
    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [load, navigation]);

  // ── Marcar/desmarcar asistencia con actualización optimista ──────────────────
  async function toggleAttendance(jugadorId, currentValue) {
    const newValue = !currentValue;
    setAttendance(prev => ({ ...prev, [jugadorId]: newValue }));
    setSavingId(jugadorId);
    try {
      await registerAttendance(trainingId, jugadorId, newValue ? 1 : 0);
    } catch (e) {
      setAttendance(prev => ({ ...prev, [jugadorId]: currentValue }));
      Alert.alert('Error', 'No se pudo registrar la asistencia.');
    } finally {
      setSavingId(null);
    }
  }

  // ── Guardar entrenamiento como 'realizado' y volver ──────────────────────────
  async function handleSaveTraining() {
    setSavingFinal(true);
    try {
      await updateTrainingStatus(trainingId, 'realizado');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el entrenamiento.');
    } finally {
      setSavingFinal(false);
    }
  }

  // ── Eliminar entrenamiento ────────────────────────────────────────────────────
  async function handleDelete() {
    try {
      await deleteTraining(trainingId);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo eliminar el entrenamiento.');
    } finally {
      setConfirmDelete(false);
    }
  }

  if (loading || !training) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6F00" />
      </View>
    );
  }

  const isRealizado = training.estado === 'realizado';
  const asistieronCount = players.filter(p => attendance[p.id]).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Cabecera */}
      <Card style={[styles.headerCard, isRealizado && styles.headerCardRealizado]}>
        <Card.Content>
          <View style={styles.tipoRow}>
            <Text variant="headlineSmall" style={styles.tipo}>
              {training.tipo || 'Entrenamiento'}
            </Text>
            {isRealizado && (
              <View style={styles.realizadoBadge}>
                <Icon name="check-circle" size={16} color="#00AA13" />
                <Text variant="bodySmall" style={styles.realizadoText}>Realizado</Text>
              </View>
            )}
          </View>
          <View style={styles.metaBlock}>
            <View style={styles.metaRow}>
              <Icon name="calendar" size={16} color="#999" />
              <Text variant="bodyMedium" style={styles.metaText}>
                {formatDate(training.fecha)}
              </Text>
            </View>
            {training.hora_inicio && (
              <View style={styles.metaRow}>
                <Icon name="clock-outline" size={16} color="#999" />
                <Text variant="bodyMedium" style={styles.metaText}>
                  {formatTime(training.hora_inicio)}
                  {training.hora_fin ? ` – ${formatTime(training.hora_fin)}` : ''}
                </Text>
              </View>
            )}
            {training.ubicacion && (
              <View style={styles.metaRow}>
                <Icon name="map-marker" size={16} color="#999" />
                <Text variant="bodyMedium" style={styles.metaText}>{training.ubicacion}</Text>
              </View>
            )}
          </View>
          {training.descripcion ? (
            <>
              <Divider style={styles.divider} />
              <Text variant="bodyMedium" style={styles.descripcion}>{training.descripcion}</Text>
            </>
          ) : null}
        </Card.Content>
      </Card>

      {/* Lista de asistencia */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.attHeader}>
            <Text variant="titleSmall" style={styles.sectionTitle}>Lista de asistencia</Text>
            <View style={styles.attCounter}>
              <Icon name="account-check" size={18} color="#00AA13" />
              <Text variant="bodyMedium" style={styles.attCount}>
                {asistieronCount}/{players.length}
              </Text>
            </View>
          </View>

          {players.length === 0 ? (
            <Text variant="bodySmall" style={styles.emptyText}>
              No hay jugadores en la plantilla.
            </Text>
          ) : players.map((player, idx) => (
            <View key={player.id}>
              {idx > 0 && <Divider style={styles.rowDivider} />}
              <View style={styles.playerRow}>
                <View style={styles.playerInfo}>
                  <Text variant="bodyMedium" style={styles.playerName}>{player.nombre}</Text>
                  <Text variant="bodySmall" style={styles.playerMeta}>
                    {player.posicion ?? '—'}
                    {player.dorsal != null ? `  ·  #${player.dorsal}` : ''}
                  </Text>
                </View>
                <Switch
                  value={!!attendance[player.id]}
                  onValueChange={() => toggleAttendance(player.id, !!attendance[player.id])}
                  disabled={savingId === player.id}
                  trackColor={{ true: '#00AA13', false: '#BDBDBD' }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Botones secundarios: editar / eliminar */}
      <View style={styles.secondaryActions}>
        <Button
          mode="outlined"
          icon="pencil"
          onPress={() => navigation.navigate('TrainingForm', { trainingId })}
          style={styles.secondaryBtn}
          textColor="#FF6F00"
        >
          Editar
        </Button>
        <Button
          mode="outlined"
          icon="delete"
          onPress={() => setConfirmDelete(true)}
          style={styles.secondaryBtn}
          textColor="#D32F2F"
        >
          Eliminar
        </Button>
      </View>

      {/* Botón principal: Guardar entrenamiento */}
      {!isRealizado && (
        <Button
          mode="contained"
          icon="content-save"
          onPress={handleSaveTraining}
          loading={savingFinal}
          disabled={savingFinal}
          buttonColor="#00AA13"
          style={styles.saveBtn}
        >
          Guardar entrenamiento
        </Button>
      )}

      <ConfirmDialog
        visible={confirmDelete}
        title="Eliminar entrenamiento"
        message="¿Eliminar este entrenamiento? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
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
  headerCardRealizado: { borderTopColor: '#00AA13' },
  tipoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  tipo: { fontWeight: 'bold', color: '#1A1A1A', flex: 1 },
  realizadoBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  realizadoText: { color: '#00AA13', fontWeight: '600' },
  metaBlock: { gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { color: '#555', flexShrink: 1 },
  divider: { marginVertical: 12 },
  descripcion: { color: '#444', fontStyle: 'italic' },
  card: { backgroundColor: '#fff', borderRadius: 12 },
  attHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontWeight: 'bold', color: '#FF6F00', textTransform: 'uppercase', letterSpacing: 0.5 },
  attCounter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  attCount: { fontWeight: 'bold', color: '#00AA13' },
  emptyText: { color: '#999', fontStyle: 'italic' },
  rowDivider: { marginVertical: 0 },
  playerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  playerInfo: { flex: 1 },
  playerName: { fontWeight: '600', color: '#1A1A1A' },
  playerMeta: { color: '#999', marginTop: 2 },
  secondaryActions: { flexDirection: 'row', gap: 12 },
  secondaryBtn: { flex: 1, borderRadius: 8 },
  saveBtn: { borderRadius: 8 },
});
