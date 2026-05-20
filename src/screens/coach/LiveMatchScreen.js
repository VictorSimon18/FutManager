import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Portal, Dialog, Divider, Button, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { saveLiveMatchState } from '../../utils/liveMatchStore';

const COACH_COLOR = '#105E7A';
const BG = '#0A0E12';
const GLASS_BG = 'rgba(255,255,255,0.05)';
const GLASS_BORDER = 'rgba(255,255,255,0.1)';

const EVENT_TYPES = [
  { key: 'goal',           label: 'Gol',         icon: 'soccer',               color: '#00AA13' },
  { key: 'assist',         label: 'Asistencia',   icon: 'hand-okay',            color: '#9CA3AF' },
  { key: 'yellow',         label: 'Amarilla',     icon: 'card-text',            color: '#FFC107' },
  { key: 'red',            label: 'Roja',         icon: 'card-text',            color: '#DC2626' },
  { key: 'shot_on',        label: 'T. Puerta',    icon: 'target',               color: '#9CA3AF' },
  { key: 'shot_off',       label: 'T. Fuera',     icon: 'close-circle-outline', color: '#9CA3AF' },
  { key: 'tackle',         label: 'Entrada',      icon: 'shoe-cleat',           color: '#9CA3AF' },
  { key: 'clearance',      label: 'Despeje',      icon: 'arrow-up-bold',        color: '#9CA3AF' },
  { key: 'save',           label: 'Parada',       icon: 'hand-front-right',     color: '#9CA3AF' },
  { key: 'foul_committed', label: 'Flt. Com.',    icon: 'whistle',              color: '#9CA3AF' },
  { key: 'foul_received',  label: 'Flt. Rec.',    icon: 'shield-check',         color: '#9CA3AF' },
  { key: 'offside',        label: 'Fuera Juego',  icon: 'flag',                 color: '#9CA3AF' },
  { key: 'substitution',   label: 'Sustitución',  icon: 'swap-horizontal',      color: '#00AA13' },
];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getMinute(phase, elapsed) {
  const m = Math.floor(elapsed / 60);
  return phase === 'second_half' ? 45 + m : m;
}

// Calcula el color del indicador de evento para un jugador
function computeDotColor(playerId, events) {
  const pEvs = events.filter(e => e.playerId === playerId);
  const yellows = pEvs.filter(e => e.type === 'yellow').length;
  if (pEvs.some(e => e.type === 'red') || yellows >= 2) return '#DC2626';
  if (yellows === 1) return '#FFC107';
  if (pEvs.some(e => e.type === 'goal')) return '#00AA13';
  return null;
}

// Genera el HTML completo del campo táctico (campo cenital + banquillo)
function buildFieldHtml(onPitch, bench) {
  const playersData = JSON.stringify(onPitch.map(p => ({
    id: p.id,
    dorsal: p.dorsal ?? null,
    apellido: (p.nombre || '').split(' ').slice(-1)[0] || p.nombre,
    posicion: p.posicion || '',
  })));
  const benchData = JSON.stringify(bench.map(p => ({
    id: p.id,
    dorsal: p.dorsal ?? null,
    apellido: (p.nombre || '').split(' ').slice(-1)[0] || p.nombre,
  })));

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;touch-action:none;}
html,body{width:100%;height:100%;overflow:hidden;background:#0A0E12;font-family:-apple-system,sans-serif;}
#root{display:flex;flex-direction:column;width:100%;height:100%;}
#pitch-wrap{flex:1;position:relative;overflow:hidden;}
#bench-strip{
  background:rgba(0,0,0,0.55);border-top:1px solid rgba(255,255,255,0.08);
  display:flex;align-items:center;padding:5px 10px;gap:10px;
  overflow-x:auto;flex-shrink:0;height:54px;
}
#bench-label{font-size:9px;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:0.8px;flex-shrink:0;}
.player{
  position:absolute;display:flex;flex-direction:column;align-items:center;
  transform:translate(-50%,-50%);cursor:pointer;
}
.pcircle{
  width:38px;height:38px;border-radius:50%;
  background:#105E7A;border:2px solid rgba(255,255,255,0.7);
  display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:bold;color:#fff;
  position:relative;transition:box-shadow 0.15s,border-color 0.15s;
}
.player.sel .pcircle{border:2.5px solid #00D9FF;box-shadow:0 0 14px rgba(0,217,255,0.6),0 0 5px #00D9FF;}
.pname{font-size:9px;color:rgba(255,255,255,0.8);margin-top:2px;max-width:50px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;text-shadow:0 1px 3px rgba(0,0,0,0.95);}
.dot{position:absolute;top:-2px;right:-2px;width:11px;height:11px;border-radius:50%;border:1.5px solid #0A0E12;}
.bplayer{display:flex;flex-direction:column;align-items:center;flex-shrink:0;}
.bcircle{width:26px;height:26px;border-radius:50%;background:rgba(16,94,122,0.3);border:1.5px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:bold;color:rgba(255,255,255,0.4);}
.bname{font-size:7px;color:rgba(255,255,255,0.3);margin-top:2px;max-width:32px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;}
</style>
</head>
<body>
<div id="root">
  <div id="pitch-wrap">
    <svg style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;" viewBox="0 0 100 160" preserveAspectRatio="none">
      <rect x="0" y="0" width="100" height="160" fill="#1B4D26"/>
      <rect x="0" y="0" width="100" height="20" fill="rgba(255,255,255,0.015)"/>
      <rect x="0" y="40" width="100" height="20" fill="rgba(255,255,255,0.015)"/>
      <rect x="0" y="80" width="100" height="20" fill="rgba(255,255,255,0.015)"/>
      <rect x="0" y="120" width="100" height="20" fill="rgba(255,255,255,0.015)"/>
      <rect x="3" y="3" width="94" height="154" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="0.8"/>
      <line x1="3" y1="80" x2="97" y2="80" stroke="rgba(255,255,255,0.18)" stroke-width="0.5"/>
      <circle cx="50" cy="80" r="12" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.5"/>
      <circle cx="50" cy="80" r="0.8" fill="rgba(255,255,255,0.3)"/>
      <rect x="22" y="3" width="56" height="22" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
      <rect x="22" y="135" width="56" height="22" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
      <rect x="35" y="3" width="30" height="8" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="0.5"/>
      <rect x="35" y="149" width="30" height="8" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="0.5"/>
      <rect x="40" y="1" width="20" height="3" fill="rgba(255,255,255,0.2)" rx="0.5"/>
      <rect x="40" y="156" width="20" height="3" fill="rgba(255,255,255,0.2)" rx="0.5"/>
    </svg>
    <div id="players"></div>
  </div>
  <div id="bench-strip">
    <span id="bench-label">Banquillo</span>
    <div id="bench-players" style="display:flex;gap:10px;align-items:center;"></div>
  </div>
</div>
<script>
var PLAYERS = ${playersData};
var BENCH = ${benchData};
var ROW_Y = {"Portero":87,"Defensa":66,"Centrocampista":43,"Delantero":16};
var ORDER = ["Delantero","Centrocampista","Defensa","Portero"];
var selectedId = null;
var eventDots = {};

function getY(pos){ return ROW_Y[pos] || 43; }

function render(){
  var rows = {};
  PLAYERS.forEach(function(p){
    var pos = ORDER.indexOf(p.posicion) >= 0 ? p.posicion : "Centrocampista";
    if(!rows[pos]) rows[pos] = [];
    rows[pos].push(p);
  });
  var container = document.getElementById("players");
  container.innerHTML = "";
  Object.keys(rows).forEach(function(pos){
    var players = rows[pos];
    var y = getY(pos);
    var xStep = 100 / (players.length + 1);
    players.forEach(function(p, i){
      var x = xStep * (i + 1);
      var el = document.createElement("div");
      el.className = "player" + (p.id === selectedId ? " sel" : "");
      el.dataset.pid = p.id;
      el.style.left = x + "%";
      el.style.top = y + "%";
      el.addEventListener("click", function(){ onTap(p.id); });
      var dot = eventDots[p.id] ? '<div class="dot" style="background:' + eventDots[p.id] + '"></div>' : "";
      el.innerHTML = '<div class="pcircle">' + (p.dorsal != null ? p.dorsal : "?") + dot + "</div>" +
                     '<div class="pname">' + p.apellido + "</div>";
      container.appendChild(el);
    });
  });
  var bc = document.getElementById("bench-players");
  bc.innerHTML = "";
  BENCH.forEach(function(p){
    var el = document.createElement("div");
    el.className = "bplayer";
    el.innerHTML = '<div class="bcircle">' + (p.dorsal != null ? p.dorsal : "?") + "</div>" +
                   '<div class="bname">' + p.apellido + "</div>";
    bc.appendChild(el);
  });
}

function onTap(id){
  selectedId = (selectedId === id) ? null : id;
  document.querySelectorAll(".player").forEach(function(el){
    el.classList.toggle("sel", parseInt(el.dataset.pid) === selectedId);
  });
  window.ReactNativeWebView.postMessage(JSON.stringify({type:"playerSelected",playerId:selectedId}));
}

function setSelection(id){
  selectedId = id;
  document.querySelectorAll(".player").forEach(function(el){
    el.classList.toggle("sel", id !== null && parseInt(el.dataset.pid) === id);
  });
}

function setEventDot(pid, color){
  if(color) eventDots[pid] = color; else delete eventDots[pid];
  var circle = document.querySelector('[data-pid="' + pid + '"] .pcircle');
  if(!circle) return;
  var existing = circle.querySelector(".dot");
  if(color){
    if(!existing){ existing = document.createElement("div"); existing.className = "dot"; circle.appendChild(existing); }
    existing.style.background = color;
  } else if(existing){
    existing.remove();
  }
}

render();
</script>
</body>
</html>`;
}

export default function LiveMatchScreen({ route, navigation }) {
  const { matchId, rival, resumeState } = route.params;

  const [state, setState] = useState(resumeState);
  const timerRef = useRef(null);
  const stateRef = useRef(resumeState);
  const webViewRef = useRef(null);

  // Mantiene la ref sincronizada para el callback del timer
  useEffect(() => { stateRef.current = state; }, [state]);

  // Auto-guardado en SQLite cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      saveLiveMatchState(matchId, stateRef.current).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [matchId]);

  // Tick del cronómetro
  useEffect(() => {
    if (state.timerRunning) {
      timerRef.current = setInterval(() => {
        setState(prev => {
          if (!prev.timerRunning) return prev;
          const newElapsed = prev.elapsedSeconds + 1;
          if (newElapsed >= 2700) return { ...prev, elapsedSeconds: 2700, timerRunning: false };
          return { ...prev, elapsedSeconds: newElapsed };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.timerRunning]);

  // Jugador seleccionado en el campo
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  // Dialog para elegir quién entra en una sustitución
  const [subInPickVisible, setSubInPickVisible] = useState(false);
  // Snackbar de confirmación de evento
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  // HTML del campo — solo se reconstruye cuando cambia la plantilla (sustitución)
  const rosterKey = useMemo(
    () => state.onPitch.map(p => p.id).sort().join('-'),
    [state.onPitch]
  );
  const fieldHtml = useMemo(
    () => buildFieldHtml(state.onPitch, state.bench),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rosterKey]
  );

  // Botón [Fin] en el header — useCallback con deps vacíos porque solo usa refs estables
  const endMatch = useCallback(() => {
    Alert.alert('Finalizar partido', '¿Terminar el partido y ver el resumen?', [
      {
        text: 'Finalizar', onPress: () => {
          if (timerRef.current) clearInterval(timerRef.current);
          const finalState = { ...stateRef.current, timerRunning: false, phase: 'finished' };
          saveLiveMatchState(matchId, finalState).catch(() => {});
          navigation.replace('LiveMatchSummary', { matchId, rival, liveState: finalState });
        },
      },
      { text: 'Cancelar' },
    ]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={endMatch} style={styles.headerFinBtn}>
          <Text style={styles.headerFinText}>Fin</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, endMatch]);

  // Al cargar/recargar el WebView: reinyecta dots y selección actuales
  function onWebViewReady() {
    const evs = stateRef.current.events;
    const seen = new Set();
    evs.forEach(ev => {
      if (seen.has(ev.playerId)) return;
      seen.add(ev.playerId);
      const color = computeDotColor(ev.playerId, evs);
      if (color) {
        webViewRef.current?.injectJavaScript(`setEventDot(${ev.playerId},'${color}');true;`);
      }
    });
    if (selectedPlayer) {
      webViewRef.current?.injectJavaScript(`setSelection(${selectedPlayer.id});true;`);
    }
  }

  // Mensaje recibido del WebView (tap sobre jugador)
  function onWebViewMessage(event) {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'playerSelected') {
        const pid = msg.playerId;
        if (!pid) {
          setSelectedPlayer(null);
        } else {
          const player = stateRef.current.onPitch.find(p => p.id === pid);
          setSelectedPlayer(player || null);
        }
      }
    } catch { /* mensaje inesperado */ }
  }

  function toggleTimer() {
    setState(prev => ({ ...prev, timerRunning: !prev.timerRunning }));
  }

  function handleRivalGoal(add) {
    setState(prev => ({ ...prev, rivalGoals: Math.max(0, prev.rivalGoals + add) }));
  }

  function startSecondHalf() {
    Alert.alert('Segundo tiempo', '¿Iniciar el segundo tiempo?', [
      {
        text: 'Sí', onPress: () => {
          setState(prev => ({ ...prev, phase: 'second_half', elapsedSeconds: 0, timerRunning: true }));
        },
      },
      { text: 'No' },
    ]);
  }

  function cancelMatch() {
    Alert.alert(
      'Cancelar partido',
      'Se perderán todos los datos del partido en directo. ¿Continuar?',
      [
        { text: 'Sí, cancelar', style: 'destructive', onPress: () => navigation.goBack() },
        { text: 'No' },
      ]
    );
  }

  // Registra un evento para el jugador seleccionado
  function handleEventButton(eventKey) {
    if (!selectedPlayer) return;

    if (eventKey === 'substitution') {
      // El jugador seleccionado es quien SALE; abrimos picker para quien ENTRA
      setSubInPickVisible(true);
      return;
    }

    const minute = getMinute(stateRef.current.phase, stateRef.current.elapsedSeconds);
    const event = {
      id: Date.now(),
      type: eventKey,
      playerId: selectedPlayer.id,
      playerName: selectedPlayer.nombre,
      minute,
      half: stateRef.current.phase === 'first_half' ? 1 : 2,
    };

    const newEvents = [...stateRef.current.events, event];
    setState(prev => ({ ...prev, events: newEvents }));
    saveLiveMatchState(matchId, { ...stateRef.current, events: newEvents }).catch(() => {});

    // Actualizar dot en el campo
    const dotColor = computeDotColor(selectedPlayer.id, newEvents);
    webViewRef.current?.injectJavaScript(
      `setEventDot(${selectedPlayer.id},${dotColor ? `'${dotColor}'` : 'null'});true;`
    );

    // Snackbar
    const label = EVENT_TYPES.find(e => e.key === eventKey)?.label || eventKey;
    const tag = selectedPlayer.dorsal ? `#${selectedPlayer.dorsal}` : '';
    const apellido = selectedPlayer.nombre.split(' ').slice(-1)[0];
    setSnackbarMsg(`${label} · ${tag} ${apellido} (${minute}')`);
    setSnackbarVisible(true);

    // Limpiar selección
    setSelectedPlayer(null);
    webViewRef.current?.injectJavaScript(`setSelection(null);true;`);
  }

  // Sustitución: el jugador seleccionado sale, playerIn entra
  function handleSubInPicked(playerIn) {
    setSubInPickVisible(false);
    const playerOut = selectedPlayer;
    const minute = getMinute(stateRef.current.phase, stateRef.current.elapsedSeconds);

    const evOut = {
      id: Date.now(),
      type: 'sub_out',
      playerId: playerOut.id,
      playerName: playerOut.nombre,
      minute,
      half: stateRef.current.phase === 'first_half' ? 1 : 2,
      relatedPlayerId: playerIn.id,
    };
    const evIn = {
      id: Date.now() + 1,
      type: 'sub_in',
      playerId: playerIn.id,
      playerName: playerIn.nombre,
      minute,
      half: stateRef.current.phase === 'first_half' ? 1 : 2,
      relatedPlayerId: playerOut.id,
    };

    const newOnPitch = stateRef.current.onPitch
      .filter(p => p.id !== playerOut.id)
      .concat([{ ...playerIn, minuteOn: minute }]);
    const newBench = stateRef.current.bench
      .filter(p => p.id !== playerIn.id)
      .concat([playerOut]);

    setState(prev => ({
      ...prev,
      onPitch: newOnPitch,
      bench: newBench,
      events: [...prev.events, evOut, evIn],
    }));

    const apellidoIn = playerIn.nombre.split(' ').slice(-1)[0];
    const apellidoOut = playerOut.nombre.split(' ').slice(-1)[0];
    setSnackbarMsg(`Sust. · entra ${apellidoIn}, sale ${apellidoOut} (${minute}')`);
    setSnackbarVisible(true);
    setSelectedPlayer(null);
  }

  const ourGoals = state.events.filter(e => e.type === 'goal').length;
  const elapsed = state.elapsedSeconds;
  const minute = getMinute(state.phase, elapsed);
  const phaseLabel = state.phase === 'first_half' ? '1ª PARTE' : state.phase === 'second_half' ? '2ª PARTE' : 'FIN';

  return (
    <View style={styles.container}>

      {/* ── Marcador ── */}
      <View style={styles.scoreboard}>
        <View style={styles.scoreRow}>
          <Text style={styles.teamName} numberOfLines={1}>Nosotros</Text>
          <Text style={styles.scoreDigit}>{ourGoals}</Text>
          <Text style={styles.scoreSep}>-</Text>
          <TouchableOpacity onPress={() => handleRivalGoal(1)} onLongPress={() => handleRivalGoal(-1)}>
            <Text style={styles.scoreDigit}>{state.rivalGoals}</Text>
          </TouchableOpacity>
          <Text style={styles.teamName} numberOfLines={1}>{rival}</Text>
        </View>
        <View style={styles.controlRow}>
          <Text style={styles.phaseTimer}>{phaseLabel} · {formatTime(elapsed)}  {minute}'</Text>
          <View style={styles.controlBtns}>
            <TouchableOpacity style={styles.ctrlBtn} onPress={toggleTimer} disabled={state.phase === 'finished'}>
              <Icon name={state.timerRunning ? 'pause' : 'play'} size={18} color="#fff" />
            </TouchableOpacity>
            {state.phase === 'first_half' && (
              <TouchableOpacity style={styles.ctrlBtn} onPress={startSecondHalf}>
                <Text style={styles.ctrlBtnText}>2ª</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.ctrlBtn, styles.ctrlBtnRival]} onPress={() => handleRivalGoal(1)}>
              <Text style={styles.ctrlBtnText}>+Rival</Text>
            </TouchableOpacity>
            {state.rivalGoals > 0 && (
              <TouchableOpacity style={styles.ctrlBtn} onPress={() => handleRivalGoal(-1)}>
                <Icon name="minus" size={14} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* ── Campo táctico ── */}
      <View style={styles.fieldWrap}>
        <WebView
          ref={webViewRef}
          key={rosterKey}
          source={{ html: fieldHtml }}
          onLoadEnd={onWebViewReady}
          onMessage={onWebViewMessage}
          style={styles.webview}
          javaScriptEnabled
          scrollEnabled={false}
          originWhitelist={['*']}
          mixedContentMode="always"
        />
        {/* Indicador de jugador seleccionado */}
        {selectedPlayer && (
          <View style={styles.selectionBadge}>
            <Icon name="cursor-default-click" size={13} color="#00D9FF" />
            <Text style={styles.selectionText}>
              {selectedPlayer.dorsal ? `#${selectedPlayer.dorsal} ` : ''}
              {selectedPlayer.nombre.split(' ').slice(-1)[0]}
            </Text>
          </View>
        )}
      </View>

      {/* ── Barra de eventos (scroll horizontal) ── */}
      <View style={styles.eventBarWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.eventBarContent}
        >
          {EVENT_TYPES.map(et => {
            const active = !!selectedPlayer;
            return (
              <TouchableOpacity
                key={et.key}
                style={[styles.eventBtn, !active && styles.eventBtnDisabled]}
                onPress={() => handleEventButton(et.key)}
                disabled={!active}
                activeOpacity={0.7}
              >
                <Icon name={et.icon} size={22} color={active ? et.color : 'rgba(255,255,255,0.3)'} />
                <Text style={[styles.eventBtnLabel, !active && styles.eventBtnLabelDisabled]}>
                  {et.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          {/* Botón cancelar partido */}
          <TouchableOpacity style={[styles.eventBtn, styles.cancelEventBtn]} onPress={cancelMatch}>
            <Icon name="close" size={22} color="#DC2626" />
            <Text style={[styles.eventBtnLabel, { color: '#DC2626' }]}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── Snackbar de confirmación ── */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={styles.snackbar}
        action={{ label: '✓', onPress: () => setSnackbarVisible(false) }}
      >
        {snackbarMsg}
      </Snackbar>

      {/* ── Dialog: elegir quién entra (sustitución) ── */}
      <Portal>
        <Dialog
          visible={subInPickVisible}
          onDismiss={() => setSubInPickVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>
            {`¿Quién entra? (sale ${selectedPlayer?.nombre?.split(' ').slice(-1)[0]})`}
          </Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView>
              {state.bench.map((p, i) => (
                <View key={p.id}>
                  {i > 0 && <Divider style={{ backgroundColor: GLASS_BORDER }} />}
                  <TouchableOpacity
                    style={styles.dialogPlayerRow}
                    onPress={() => handleSubInPicked(p)}
                  >
                    <Text style={styles.dialogPlayerName}>
                      {p.dorsal ? `#${p.dorsal}  ` : ''}{p.nombre}
                    </Text>
                    <Text style={styles.dialogPlayerPos}>{p.posicion || ''}</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {state.bench.length === 0 && (
                <Text style={styles.dialogEmpty}>No hay jugadores en el banquillo.</Text>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setSubInPickVisible(false)} textColor="#DC2626">Cancelar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // Header
  headerFinBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  headerFinText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  // Marcador
  scoreboard: {
    backgroundColor: GLASS_BG,
    borderBottomWidth: 1,
    borderBottomColor: GLASS_BORDER,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  teamName: { color: '#9CA3AF', fontSize: 11, flex: 1, textAlign: 'center' },
  scoreDigit: { color: '#fff', fontSize: 32, fontWeight: 'bold', minWidth: 36, textAlign: 'center' },
  scoreSep: { color: 'rgba(255,255,255,0.25)', fontSize: 24, marginHorizontal: 4 },
  controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  phaseTimer: { color: COACH_COLOR, fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
  controlBtns: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  ctrlBtn: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    alignItems: 'center', justifyContent: 'center', minWidth: 32,
  },
  ctrlBtnRival: { backgroundColor: 'rgba(220,38,38,0.12)', borderColor: 'rgba(220,38,38,0.3)' },
  ctrlBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  // Campo
  fieldWrap: { flex: 1, position: 'relative' },
  webview: { flex: 1, backgroundColor: BG },
  selectionBadge: {
    position: 'absolute',
    top: 8, left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,217,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0,217,255,0.4)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectionText: { color: '#00D9FF', fontSize: 12, fontWeight: 'bold' },

  // Barra de eventos
  eventBarWrap: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderTopWidth: 1,
    borderTopColor: GLASS_BORDER,
    height: 88,
  },
  eventBarContent: { paddingHorizontal: 8, paddingVertical: 6, gap: 6, alignItems: 'center' },
  eventBtn: {
    width: 64,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    gap: 4,
  },
  eventBtnDisabled: { opacity: 0.35 },
  eventBtnLabel: { color: '#fff', fontSize: 9, textAlign: 'center', fontWeight: '500' },
  eventBtnLabelDisabled: { color: 'rgba(255,255,255,0.4)' },
  cancelEventBtn: { borderColor: 'rgba(220,38,38,0.3)', backgroundColor: 'rgba(220,38,38,0.06)' },

  // Snackbar
  snackbar: { backgroundColor: '#1a2a3a', marginBottom: 8 },

  // Dialog
  dialog: { backgroundColor: '#1a2a3a', borderRadius: 12 },
  dialogTitle: { color: '#fff' },
  dialogScrollArea: { maxHeight: 320, paddingHorizontal: 0 },
  dialogPlayerRow: {
    paddingVertical: 14, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  dialogPlayerName: { color: '#fff', fontSize: 15 },
  dialogPlayerPos: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  dialogEmpty: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 20 },
});
