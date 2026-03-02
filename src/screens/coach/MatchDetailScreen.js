import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import {
  Text, Card, Button, Chip, Divider, ActivityIndicator,
  TextInput, Dialog, Portal, Switch,
} from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { getMatchById, updateMatchResult, deleteMatch } from '../../database/services/matchService';
import { getStatsByMatch, createPlayerStats } from '../../database/services/statsService';
import { getPlayersByTeam } from '../../database/services/playerService';
import { AuthContext } from '../../context/AuthContext';
import { formatDate, formatTime } from '../../utils/dateUtils';
import StatBadge from '../../components/StatBadge';
import ConfirmDialog from '../../components/ConfirmDialog';

// ─── Estilos compartidos para todos los Dialogs ───────────────────────────────
const DIALOG_STYLE = { borderRadius: 8 };

export default function MatchDetailScreen({ route, navigation }) {
  const { matchId } = route.params;
  const { equipoId } = useContext(AuthContext);

  const [match, setMatch] = useState(null);
  const [stats, setStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ── Modal resultado ──────────────────────────────────────────────────────────
  const [resultModal, setResultModal] = useState(false);
  const [golesFavor, setGolesFavor] = useState('');
  const [golesContra, setGolesContra] = useState('');
  const [savingResult, setSavingResult] = useState(false);

  // ── Modal estadísticas: paso 1 (lista de jugadores) ──────────────────────────
  const [statsListModal, setStatsListModal] = useState(false);
  // ── Modal estadísticas: paso 2 (formulario de stats) ─────────────────────────
  const [statsFormModal, setStatsFormModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [stMinutos, setStMinutos] = useState('90');
  const [stGoles, setStGoles] = useState('0');
  const [stAsistencias, setStAsistencias] = useState('0');
  const [stAmarillas, setStAmarillas] = useState('0');
  const [stRojas, setStRojas] = useState('0');
  const [stTitular, setStTitular] = useState(true);
  const [stValoracion, setStValoracion] = useState('');
  const [savingStats, setSavingStats] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [m, s, p] = await Promise.all([
        getMatchById(matchId),
        getStatsByMatch(matchId),
        getPlayersByTeam(equipoId),
      ]);
      setMatch(m);
      setStats(s);
      setPlayers(p);
    } catch (e) {
      Alert.alert('Error', 'No se pudo cargar el partido.');
    } finally {
      setLoading(false);
    }
  }, [matchId, equipoId]);

  useEffect(() => {
    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [load, navigation]);

  // ── Guardar resultado ────────────────────────────────────────────────────────
  async function handleSaveResult() {
    const gF = parseInt(golesFavor);
    const gC = parseInt(golesContra);
    if (isNaN(gF) || isNaN(gC) || gF < 0 || gC < 0) {
      Alert.alert('Error', 'Introduce goles válidos (números ≥ 0).');
      return;
    }
    setSavingResult(true);
    try {
      await updateMatchResult(matchId, gF, gC);
      setResultModal(false);
      load();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el resultado.');
    } finally {
      setSavingResult(false);
    }
  }

  // ── Seleccionar jugador para estadísticas ─────────────────────────────────────
  function handleSelectPlayer(player) {
    setSelectedPlayer(player);
    setStMinutos('90');
    setStGoles('0');
    setStAsistencias('0');
    setStAmarillas('0');
    setStRojas('0');
    setStTitular(true);
    setStValoracion('');
    setStatsListModal(false);
    setStatsFormModal(true);
  }

  // ── Guardar estadísticas del jugador seleccionado ─────────────────────────────
  async function handleSaveStats() {
    if (!selectedPlayer) return;
    setSavingStats(true);
    try {
      await createPlayerStats({
        jugador_id: selectedPlayer.id,
        partido_id: matchId,
        minutos_jugados: parseInt(stMinutos) || 0,
        goles: parseInt(stGoles) || 0,
        asistencias: parseInt(stAsistencias) || 0,
        tarjetas_amarillas: parseInt(stAmarillas) || 0,
        tarjetas_rojas: parseInt(stRojas) || 0,
        titular: stTitular ? 1 : 0,
        valoracion: stValoracion ? parseFloat(stValoracion) : null,
      });
      setStatsFormModal(false);
      setSelectedPlayer(null);
      load();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar las estadísticas.');
    } finally {
      setSavingStats(false);
    }
  }

  // ── Volver de stats form a stats list ────────────────────────────────────────
  function handleBackToList() {
    setStatsFormModal(false);
    setSelectedPlayer(null);
    setStatsListModal(true);
  }

  // ── Eliminar partido ──────────────────────────────────────────────────────────
  async function handleDelete() {
    try {
      await deleteMatch(matchId);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo eliminar el partido.');
    } finally {
      setConfirmDelete(false);
    }
  }

  if (loading || !match) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6F00" />
      </View>
    );
  }

  const isFinished = match.estado === 'finalizado';
  const gF = match.goles_favor ?? 0;
  const gC = match.goles_contra ?? 0;
  let resultColor = '#9E9E9E';
  let resultLabel = '—';
  if (isFinished) {
    if (gF > gC) { resultColor = '#43A047'; resultLabel = 'Victoria'; }
    else if (gF < gC) { resultColor = '#E53935'; resultLabel = 'Derrota'; }
    else { resultColor = '#FF6F00'; resultLabel = 'Empate'; }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Cabecera del partido */}
      <Card style={[styles.card, { borderTopColor: resultColor }]}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.rival}>vs. {match.rival}</Text>
          {isFinished ? (
            <View style={styles.scoreBlock}>
              <Text variant="displaySmall" style={[styles.score, { color: resultColor }]}>
                {gF} - {gC}
              </Text>
              <Text variant="titleMedium" style={[styles.resultLabel, { color: resultColor }]}>
                {resultLabel}
              </Text>
            </View>
          ) : (
            <Text variant="bodyLarge" style={styles.pendiente}>Partido pendiente</Text>
          )}
          <View style={styles.metaBlock}>
            <View style={styles.metaRow}>
              <Icon name="calendar" size={16} color="#999" />
              <Text variant="bodySmall" style={styles.metaText}>
                {formatDate(match.fecha)}{match.hora ? `  ·  ${formatTime(match.hora)}` : ''}
              </Text>
            </View>
            {match.ubicacion ? (
              <View style={styles.metaRow}>
                <Icon name="map-marker" size={16} color="#999" />
                <Text variant="bodySmall" style={styles.metaText}>{match.ubicacion}</Text>
              </View>
            ) : null}
            <View style={styles.chipsRow}>
              <Chip compact icon={match.es_local ? 'home' : 'airplane'}>
                {match.es_local ? 'Local' : 'Visitante'}
              </Chip>
              {match.tipo && <Chip compact>{match.tipo}</Chip>}
              {match.modalidad && <Chip compact>{match.modalidad}</Chip>}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Botón registrar resultado (solo si está pendiente) */}
      {!isFinished && (
        <Button
          mode="contained"
          icon="scoreboard"
          onPress={() => setResultModal(true)}
          buttonColor="#FF6F00"
          style={styles.actionBtn}
        >
          Registrar resultado
        </Button>
      )}

      {/* Estadísticas de jugadores (solo si está finalizado) */}
      {isFinished && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.statsHeader}>
              <Text variant="titleSmall" style={styles.sectionTitle}>Estadísticas de jugadores</Text>
              <Button compact mode="text" textColor="#FF6F00" onPress={() => setStatsListModal(true)}>
                + Añadir
              </Button>
            </View>
            {stats.length === 0 ? (
              <Text variant="bodySmall" style={styles.emptyText}>Sin estadísticas registradas.</Text>
            ) : stats.map(s => (
              <View key={s.id} style={styles.statRow}>
                <View style={styles.statPlayer}>
                  <Text variant="bodyMedium" style={styles.statName}>{s.nombre}</Text>
                  <Text variant="bodySmall" style={styles.statMeta}>
                    {s.posicion}  ·  #{s.dorsal}  ·  {s.minutos_jugados}'
                  </Text>
                </View>
                <View style={styles.statBadges}>
                  <StatBadge icon="soccer" value={s.goles} color="#43A047" />
                  <StatBadge icon="hand-okay" value={s.asistencias} color="#FF6F00" />
                  <StatBadge icon="card-text" value={s.tarjetas_amarillas} color="#FDD835" />
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Botones editar / eliminar / guardar */}
      <View style={styles.bottomActions}>
        <Button
          mode="outlined"
          icon="pencil"
          onPress={() => navigation.navigate('MatchForm', { matchId })}
          style={styles.bottomBtn}
          textColor="#FF6F00"
        >
          Editar
        </Button>
        <Button
          mode="outlined"
          icon="delete"
          onPress={() => setConfirmDelete(true)}
          style={styles.bottomBtn}
          textColor="#D32F2F"
        >
          Eliminar
        </Button>
      </View>

      {/* Botón Guardar partido */}
      <Button
        mode="contained"
        icon="content-save"
        onPress={() => navigation.goBack()}
        buttonColor="#00AA13"
        style={styles.saveBtn}
      >
        Guardar partido
      </Button>

      {/* ── Modal: Registrar resultado ───────────────────────────────────────── */}
      <Portal>
        <Dialog visible={resultModal} onDismiss={() => setResultModal(false)} style={DIALOG_STYLE}>
          <Dialog.Title>Registrar resultado</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 12 }}>vs. {match.rival}</Text>
            <View style={styles.goalRow}>
              <TextInput
                label="A favor"
                value={golesFavor}
                onChangeText={setGolesFavor}
                mode="outlined"
                keyboardType="numeric"
                style={styles.goalInput}
              />
              <Text variant="headlineMedium" style={styles.goalSep}>-</Text>
              <TextInput
                label="En contra"
                value={golesContra}
                onChangeText={setGolesContra}
                mode="outlined"
                keyboardType="numeric"
                style={styles.goalInput}
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setResultModal(false)} textColor="#D32F2F">Cancelar</Button>
            <Button onPress={handleSaveResult} loading={savingResult} textColor="#00AA13">Guardar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* ── Modal: Lista de jugadores para añadir estadísticas ──────────────── */}
      <Portal>
        <Dialog
          visible={statsListModal}
          onDismiss={() => setStatsListModal(false)}
          style={DIALOG_STYLE}
        >
          <Dialog.Title>Seleccionar jugador</Dialog.Title>
          <Dialog.ScrollArea style={styles.playerListArea}>
            <ScrollView>
              {players.length === 0 ? (
                <Text variant="bodySmall" style={styles.emptyText}>Sin jugadores en la plantilla.</Text>
              ) : players.map((p, idx) => (
                <View key={p.id}>
                  {idx > 0 && <Divider />}
                  <TouchableOpacity
                    style={styles.playerListItem}
                    onPress={() => handleSelectPlayer(p)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.playerListInfo}>
                      <Text variant="bodyMedium" style={styles.playerListName}>
                        {p.nombre}
                        {p.dorsal != null ? ` (#${p.dorsal})` : ''}
                      </Text>
                      {p.posicion ? (
                        <Text variant="bodySmall" style={styles.playerListMeta}>{p.posicion}</Text>
                      ) : null}
                    </View>
                    <Icon name="chevron-right" size={20} color="#BDBDBD" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setStatsListModal(false)} textColor="#D32F2F">Cancelar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* ── Modal: Formulario de estadísticas del jugador ───────────────────── */}
      <Portal>
        <Dialog
          visible={statsFormModal}
          onDismiss={handleBackToList}
          style={DIALOG_STYLE}
        >
          <Dialog.Title>
            {selectedPlayer?.nombre ?? 'Estadísticas'}
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodySmall" style={styles.fieldLabel}>Titular</Text>
            <View style={styles.switchRow}>
              <Text variant="bodyMedium">{stTitular ? 'Titular' : 'Suplente'}</Text>
              <Switch
                value={stTitular}
                onValueChange={setStTitular}
                trackColor={{ true: '#FF6F00', false: '#BDBDBD' }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.statsInputRow}>
              <TextInput label="Minutos" value={stMinutos} onChangeText={setStMinutos} mode="outlined" keyboardType="numeric" style={styles.miniInput} />
              <TextInput label="Goles" value={stGoles} onChangeText={setStGoles} mode="outlined" keyboardType="numeric" style={styles.miniInput} />
              <TextInput label="Asist." value={stAsistencias} onChangeText={setStAsistencias} mode="outlined" keyboardType="numeric" style={styles.miniInput} />
            </View>
            <View style={[styles.statsInputRow, { marginTop: 8 }]}>
              <TextInput label="Amarillas" value={stAmarillas} onChangeText={setStAmarillas} mode="outlined" keyboardType="numeric" style={styles.miniInput} />
              <TextInput label="Rojas" value={stRojas} onChangeText={setStRojas} mode="outlined" keyboardType="numeric" style={styles.miniInput} />
              <TextInput label="Valoración" value={stValoracion} onChangeText={setStValoracion} mode="outlined" keyboardType="decimal-pad" style={styles.miniInput} placeholder="1-10" />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleBackToList} textColor="#D32F2F">Cancelar</Button>
            <Button onPress={handleSaveStats} loading={savingStats} textColor="#00AA13">Guardar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <ConfirmDialog
        visible={confirmDelete}
        title="Eliminar partido"
        message="¿Eliminar este partido? Esta acción no se puede deshacer."
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
  card: { backgroundColor: '#fff', borderRadius: 12, borderTopWidth: 3 },
  rival: { fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },
  scoreBlock: { alignItems: 'center', marginVertical: 8 },
  score: { fontWeight: 'bold' },
  resultLabel: { fontWeight: 'bold' },
  pendiente: { color: '#999', fontStyle: 'italic', marginVertical: 8 },
  metaBlock: { marginTop: 12, gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { color: '#888', flexShrink: 1 },
  chipsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  actionBtn: { borderRadius: 8 },
  sectionTitle: { fontWeight: 'bold', color: '#FF6F00', textTransform: 'uppercase', letterSpacing: 0.5 },
  statsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  emptyText: { color: '#999', fontStyle: 'italic' },
  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  statPlayer: { flex: 1 },
  statName: { fontWeight: '600', color: '#1A1A1A' },
  statMeta: { color: '#999' },
  statBadges: { flexDirection: 'row', gap: 8 },
  bottomActions: { flexDirection: 'row', gap: 12 },
  bottomBtn: { flex: 1, borderRadius: 8 },
  saveBtn: { borderRadius: 8 },
  // Modal resultado
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  goalInput: { flex: 1, backgroundColor: '#fff' },
  goalSep: { fontWeight: 'bold', color: '#555' },
  // Modal lista jugadores
  playerListArea: { maxHeight: 320 },
  playerListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  playerListInfo: { flex: 1 },
  playerListName: { fontWeight: '600', color: '#1A1A1A' },
  playerListMeta: { color: '#999', marginTop: 2 },
  // Modal formulario stats
  fieldLabel: { color: '#555', marginBottom: 4 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  statsInputRow: { flexDirection: 'row', gap: 8 },
  miniInput: { flex: 1, backgroundColor: '#fff' },
});
