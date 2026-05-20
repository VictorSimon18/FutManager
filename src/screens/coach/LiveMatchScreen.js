import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList,
} from 'react-native';
import {
  Text, Button, Portal, Dialog, Divider, Chip,
} from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { saveLiveMatchState } from '../../utils/liveMatchStore';

const COACH_COLOR = '#105E7A';
const GLASS_BG = 'rgba(255,255,255,0.08)';
const GLASS_BORDER = 'rgba(255,255,255,0.13)';

const EVENT_TYPES = [
  { key: 'goal',           label: 'Gol',              icon: 'soccer',                color: '#43A047' },
  { key: 'assist',         label: 'Asistencia',        icon: 'hand-okay',             color: '#26C6DA' },
  { key: 'yellow',         label: 'Amarilla',          icon: 'card-text',             color: '#FDD835' },
  { key: 'red',            label: 'Roja',              icon: 'card-text',             color: '#E53935' },
  { key: 'shot_on',        label: 'Tiro a puerta',     icon: 'target',                color: '#AB47BC' },
  { key: 'shot_off',       label: 'Tiro fuera',        icon: 'close-circle-outline',  color: '#78909C' },
  { key: 'tackle',         label: 'Entrada',           icon: 'shoe-cleat',            color: '#8D6E63' },
  { key: 'clearance',      label: 'Despeje',           icon: 'arrow-up-bold',         color: '#5C6BC0' },
  { key: 'save',           label: 'Parada',            icon: 'hand-front-right',      color: '#00ACC1' },
  { key: 'foul_committed', label: 'Falta cometida',    icon: 'whistle',               color: '#FF7043' },
  { key: 'foul_received',  label: 'Falta recibida',    icon: 'shield-check',          color: '#66BB6A' },
  { key: 'offside',        label: 'Fuera de juego',    icon: 'flag',                  color: '#FFA726' },
];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getMinute(phase, elapsed) {
  const m = Math.floor(elapsed / 60);
  if (phase === 'second_half') return 45 + m;
  return m;
}

export default function LiveMatchScreen({ route, navigation }) {
  const { matchId, rival, resumeState } = route.params;

  const [state, setState] = useState(resumeState);
  const timerRef = useRef(null);
  const stateRef = useRef(resumeState);

  // Keep ref in sync for timer callback
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Auto-save to SQLite every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveLiveMatchState(matchId, stateRef.current).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [matchId]);

  // Timer tick
  useEffect(() => {
    if (state.timerRunning) {
      timerRef.current = setInterval(() => {
        setState(prev => {
          if (!prev.timerRunning) return prev;
          const newElapsed = prev.elapsedSeconds + 1;
          // Auto-pause at 45 min per half (2700 s)
          if (newElapsed >= 2700) {
            return { ...prev, elapsedSeconds: 2700, timerRunning: false };
          }
          return { ...prev, elapsedSeconds: newElapsed };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.timerRunning]);

  // Player event dialog state
  const [eventType, setEventType] = useState(null);
  const [playerPickVisible, setPlayerPickVisible] = useState(false);
  const [subPickVisible, setSubPickVisible] = useState(false);
  const [subOutPlayer, setSubOutPlayer] = useState(null);
  const [rivalGoalDialog, setRivalGoalDialog] = useState(false);

  function toggleTimer() {
    setState(prev => ({ ...prev, timerRunning: !prev.timerRunning }));
  }

  function openEventPicker(type) {
    if (type === 'sub_out') {
      setSubPickVisible(true);
      return;
    }
    setEventType(type);
    setPlayerPickVisible(true);
  }

  function handlePlayerForEvent(player) {
    setPlayerPickVisible(false);
    const minute = getMinute(state.phase, state.elapsedSeconds);
    const event = {
      id: Date.now(),
      type: eventType,
      playerId: player.id,
      playerName: player.nombre,
      minute,
      half: state.phase === 'first_half' ? 1 : 2,
    };
    setState(prev => ({ ...prev, events: [...prev.events, event] }));
    saveLiveMatchState(matchId, { ...state, events: [...state.events, event] }).catch(() => {});
    setEventType(null);
  }

  function handleSubOut(player) {
    setSubPickVisible(false);
    setSubOutPlayer(player);
    // Now pick who comes in from bench
    setEventType('sub_in');
    setPlayerPickVisible(true);
  }

  function handleSubIn(playerIn) {
    setPlayerPickVisible(false);
    const minute = getMinute(state.phase, state.elapsedSeconds);
    const evOut = {
      id: Date.now(),
      type: 'sub_out',
      playerId: subOutPlayer.id,
      playerName: subOutPlayer.nombre,
      minute,
      half: state.phase === 'first_half' ? 1 : 2,
    };
    const evIn = {
      id: Date.now() + 1,
      type: 'sub_in',
      playerId: playerIn.id,
      playerName: playerIn.nombre,
      minute,
      half: state.phase === 'first_half' ? 1 : 2,
    };
    // Move players
    const newOnPitch = state.onPitch
      .filter(p => p.id !== subOutPlayer.id)
      .concat([{ ...playerIn, minuteOn: minute }]);
    const newBench = state.bench
      .filter(p => p.id !== playerIn.id)
      .concat([subOutPlayer]);

    setState(prev => ({
      ...prev,
      onPitch: newOnPitch,
      bench: newBench,
      events: [...prev.events, evOut, evIn],
    }));
    setSubOutPlayer(null);
    setEventType(null);
  }

  function handleRivalGoal(add) {
    setState(prev => ({
      ...prev,
      rivalGoals: Math.max(0, prev.rivalGoals + add),
    }));
  }

  function startSecondHalf() {
    Alert.alert('Segundo tiempo', '¿Iniciar el segundo tiempo?', [
      {
        text: 'Sí', onPress: () => {
          setState(prev => ({
            ...prev,
            phase: 'second_half',
            elapsedSeconds: 0,
            timerRunning: true,
          }));
        },
      },
      { text: 'No' },
    ]);
  }

  function endMatch() {
    Alert.alert('Finalizar partido', '¿Terminar el partido y ver el resumen?', [
      {
        text: 'Finalizar', onPress: () => {
          // Stop timer immediately via ref then navigate
          if (timerRef.current) clearInterval(timerRef.current);
          const finalState = {
            ...stateRef.current,
            timerRunning: false,
            phase: 'finished',
          };
          saveLiveMatchState(matchId, finalState).catch(() => {});
          navigation.replace('LiveMatchSummary', { matchId, rival, liveState: finalState });
        },
      },
      { text: 'Cancelar' },
    ]);
  }

  function cancelMatch() {
    Alert.alert(
      'Cancelar partido',
      'Se perderán todos los datos del partido en directo. ¿Continuar?',
      [
        {
          text: 'Sí, cancelar', style: 'destructive',
          onPress: () => navigation.goBack(),
        },
        { text: 'No' },
      ]
    );
  }

  const ourGoals = state.events.filter(e => e.type === 'goal').length;
  const elapsed = state.elapsedSeconds;
  const minute = getMinute(state.phase, elapsed);
  const phaseLabel = state.phase === 'first_half' ? '1ª PARTE' : state.phase === 'second_half' ? '2ª PARTE' : 'FIN';

  const benchPickPlayers = state.bench;
  const pitchPickPlayers = eventType === 'sub_out' ? state.onPitch : state.onPitch;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a1628', '#0f2340', '#162d4a']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Scoreboard */}
        <View style={styles.scoreboard}>
          <View style={styles.scoreTeam}>
            <Text style={styles.teamLabel}>Nosotros</Text>
            <Text style={styles.scoreNum}>{ourGoals}</Text>
          </View>
          <View style={styles.scoreCenter}>
            <Text style={styles.phaseLabel}>{phaseLabel}</Text>
            <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
            <Text style={styles.minuteText}>{minute}'</Text>
          </View>
          <View style={styles.scoreTeam}>
            <Text style={styles.teamLabel}>{rival}</Text>
            <Text style={styles.scoreNum}>{state.rivalGoals}</Text>
          </View>
        </View>

        {/* Rival goals buttons */}
        <View style={styles.rivalGoalRow}>
          <TouchableOpacity style={styles.rivalGoalBtn} onPress={() => handleRivalGoal(1)}>
            <Icon name="plus" size={16} color="#E53935" />
            <Text style={styles.rivalGoalBtnText}>Gol rival</Text>
          </TouchableOpacity>
          {state.rivalGoals > 0 && (
            <TouchableOpacity style={styles.rivalGoalBtnMinus} onPress={() => handleRivalGoal(-1)}>
              <Icon name="minus" size={16} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}
        </View>

        {/* Timer controls */}
        <View style={styles.timerRow}>
          <Button
            mode="contained"
            icon={state.timerRunning ? 'pause' : 'play'}
            onPress={toggleTimer}
            buttonColor={state.timerRunning ? '#E65100' : '#1B5E20'}
            style={styles.timerBtn}
            disabled={state.phase === 'finished'}
          >
            {state.timerRunning ? 'Pausar' : 'Reanudar'}
          </Button>
          {state.phase === 'first_half' && (
            <Button
              mode="outlined"
              icon="whistle"
              onPress={startSecondHalf}
              textColor={COACH_COLOR}
              style={styles.timerBtn}
            >
              2ª Parte
            </Button>
          )}
          {state.phase === 'second_half' && (
            <Button
              mode="contained"
              icon="flag-checkered"
              onPress={endMatch}
              buttonColor="#4A148C"
              style={styles.timerBtn}
            >
              Finalizar
            </Button>
          )}
        </View>

        {/* Event buttons grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Registrar evento</Text>
        </View>
        <View style={styles.eventsGrid}>
          {EVENT_TYPES.map(et => (
            <TouchableOpacity
              key={et.key}
              style={[styles.eventBtn, { borderColor: et.color + '55' }]}
              onPress={() => openEventPicker(et.key)}
              activeOpacity={0.7}
            >
              <Icon name={et.icon} size={20} color={et.color} />
              <Text style={styles.eventBtnLabel}>{et.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.eventBtn, { borderColor: '#00AA1355' }]}
            onPress={() => openEventPicker('sub_out')}
            activeOpacity={0.7}
          >
            <Icon name="swap-horizontal" size={20} color="#00AA13" />
            <Text style={styles.eventBtnLabel}>Sustitución</Text>
          </TouchableOpacity>
        </View>

        {/* Event log */}
        {state.events.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Eventos ({state.events.length})</Text>
            </View>
            <View style={styles.eventLog}>
              {[...state.events].reverse().map(ev => {
                const et = EVENT_TYPES.find(t => t.key === ev.type) ||
                  { label: ev.type, icon: 'circle', color: '#888' };
                return (
                  <View key={ev.id} style={styles.eventLogRow}>
                    <Text style={styles.eventLogMin}>{ev.minute}'</Text>
                    <Icon name={et.icon} size={16} color={et.color} style={{ marginHorizontal: 6 }} />
                    <Text style={styles.eventLogText}>
                      {et.label} — {ev.playerName}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* On pitch */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>En cancha ({state.onPitch.length})</Text>
        </View>
        <View style={styles.pitchList}>
          {state.onPitch.map(p => (
            <Chip
              key={p.id}
              style={styles.pitchChip}
              textStyle={styles.pitchChipText}
              icon="run"
            >
              {p.dorsal ? `#${p.dorsal} ` : ''}{p.nombre}
            </Chip>
          ))}
        </View>

        {state.bench.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Banquillo ({state.bench.length})</Text>
            </View>
            <View style={styles.pitchList}>
              {state.bench.map(p => (
                <Chip
                  key={p.id}
                  style={styles.benchChip}
                  textStyle={styles.benchChipText}
                  icon="seat"
                >
                  {p.dorsal ? `#${p.dorsal} ` : ''}{p.nombre}
                </Chip>
              ))}
            </View>
          </>
        )}

        <View style={styles.bottomActions}>
          {state.phase !== 'finished' && (
            <Button
              mode="contained"
              icon="flag-checkered"
              onPress={endMatch}
              buttonColor="#4A148C"
              style={styles.endBtn}
            >
              Finalizar y ver resumen
            </Button>
          )}
          <Button
            mode="outlined"
            icon="close"
            onPress={cancelMatch}
            textColor="#D32F2F"
            style={styles.cancelBtn}
          >
            Cancelar partido
          </Button>
        </View>

      </ScrollView>

      {/* Player picker dialog (for events on pitch) */}
      <Portal>
        <Dialog
          visible={playerPickVisible}
          onDismiss={() => { setPlayerPickVisible(false); setEventType(null); setSubOutPlayer(null); }}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>
            {eventType === 'sub_in' ? `¿Quién entra? (sale ${subOutPlayer?.nombre})` :
              eventType ? (EVENT_TYPES.find(t => t.key === eventType)?.label || eventType) : 'Seleccionar jugador'}
          </Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView>
              {(eventType === 'sub_in' ? benchPickPlayers : pitchPickPlayers).map((p, i) => (
                <View key={p.id}>
                  {i > 0 && <Divider style={{ backgroundColor: GLASS_BORDER }} />}
                  <TouchableOpacity
                    style={styles.dialogPlayerRow}
                    onPress={() => eventType === 'sub_in' ? handleSubIn(p) : handlePlayerForEvent(p)}
                  >
                    <Text style={styles.dialogPlayerName}>
                      {p.dorsal ? `#${p.dorsal}  ` : ''}{p.nombre}
                    </Text>
                    <Text style={styles.dialogPlayerPos}>{p.posicion || ''}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => { setPlayerPickVisible(false); setEventType(null); setSubOutPlayer(null); }} textColor="#D32F2F">
              Cancelar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Sub out picker */}
      <Portal>
        <Dialog
          visible={subPickVisible}
          onDismiss={() => setSubPickVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>¿Quién sale?</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView>
              {state.onPitch.map((p, i) => (
                <View key={p.id}>
                  {i > 0 && <Divider style={{ backgroundColor: GLASS_BORDER }} />}
                  <TouchableOpacity
                    style={styles.dialogPlayerRow}
                    onPress={() => handleSubOut(p)}
                  >
                    <Text style={styles.dialogPlayerName}>
                      {p.dorsal ? `#${p.dorsal}  ` : ''}{p.nombre}
                    </Text>
                    <Text style={styles.dialogPlayerPos}>{p.posicion || ''}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setSubPickVisible(false)} textColor="#D32F2F">Cancelar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },
  content: { padding: 16, paddingBottom: 40 },

  scoreboard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  scoreTeam: { flex: 1, alignItems: 'center' },
  teamLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: 6 },
  scoreNum: { color: '#fff', fontSize: 52, fontWeight: 'bold' },
  scoreCenter: { alignItems: 'center', paddingHorizontal: 12 },
  phaseLabel: { color: COACH_COLOR, fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  timerText: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginVertical: 4 },
  minuteText: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },

  rivalGoalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  rivalGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(229,57,53,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.35)',
  },
  rivalGoalBtnMinus: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    justifyContent: 'center',
  },
  rivalGoalBtnText: { color: '#E53935', fontSize: 13 },

  timerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  timerBtn: { flex: 1, borderRadius: 8 },

  sectionHeader: {
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  eventBtn: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    gap: 4,
  },
  eventBtnLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, textAlign: 'center' },

  eventLog: {
    backgroundColor: GLASS_BG,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    marginBottom: 16,
    paddingVertical: 4,
  },
  eventLogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  eventLogMin: { color: COACH_COLOR, fontWeight: 'bold', fontSize: 13, width: 30 },
  eventLogText: { color: 'rgba(255,255,255,0.75)', fontSize: 13, flex: 1 },

  pitchList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  pitchChip: { backgroundColor: 'rgba(16,94,122,0.3)', borderWidth: 1, borderColor: COACH_COLOR + '55' },
  pitchChipText: { color: '#fff', fontSize: 12 },
  benchChip: { backgroundColor: GLASS_BG, borderWidth: 1, borderColor: GLASS_BORDER },
  benchChipText: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },

  bottomActions: { gap: 8, marginTop: 8 },
  endBtn: { borderRadius: 8 },
  cancelBtn: { borderRadius: 8, borderColor: '#D32F2F' },

  dialog: { backgroundColor: '#1a2a3a', borderRadius: 12 },
  dialogTitle: { color: '#fff' },
  dialogScrollArea: { maxHeight: 320, paddingHorizontal: 0 },
  dialogPlayerRow: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dialogPlayerName: { color: '#fff', fontSize: 15 },
  dialogPlayerPos: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
});
