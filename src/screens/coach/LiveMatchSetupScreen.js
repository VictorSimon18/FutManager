import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image,
} from 'react-native';
import {
  Text, Button, ActivityIndicator, Portal, Dialog, Divider,
} from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { AuthContext } from '../../context/AuthContext';
import { getPlayersByTeam } from '../../database/services/playerService';
import { loadLiveMatchState } from '../../utils/liveMatchStore';

const COACH_COLOR = '#105E7A';
const GLASS_BG = 'rgba(255,255,255,0.05)';
const GLASS_BORDER = 'rgba(255,255,255,0.1)';
const BG = '#0A0E12';

// Formaciones disponibles por tipo de partido
const FORMATIONS = {
  '11': [
    {
      id: '4-4-2', label: '4-4-2',
      positions: [
        { slot: 'gk',  x: 50, y: 87 },
        { slot: 'lb',  x: 12, y: 70 }, { slot: 'cb1', x: 35, y: 70 },
        { slot: 'cb2', x: 65, y: 70 }, { slot: 'rb',  x: 88, y: 70 },
        { slot: 'lm',  x: 12, y: 49 }, { slot: 'cm1', x: 36, y: 47 },
        { slot: 'cm2', x: 64, y: 47 }, { slot: 'rm',  x: 88, y: 49 },
        { slot: 'cf1', x: 34, y: 22 }, { slot: 'cf2', x: 66, y: 22 },
      ],
    },
    {
      id: '4-3-3', label: '4-3-3',
      positions: [
        { slot: 'gk',  x: 50, y: 87 },
        { slot: 'lb',  x: 12, y: 70 }, { slot: 'cb1', x: 35, y: 70 },
        { slot: 'cb2', x: 65, y: 70 }, { slot: 'rb',  x: 88, y: 70 },
        { slot: 'cm1', x: 24, y: 50 }, { slot: 'cm2', x: 50, y: 47 }, { slot: 'cm3', x: 76, y: 50 },
        { slot: 'lw',  x: 15, y: 22 }, { slot: 'cf',  x: 50, y: 18 }, { slot: 'rw',  x: 85, y: 22 },
      ],
    },
    {
      id: '4-2-3-1', label: '4-2-3-1',
      positions: [
        { slot: 'gk',  x: 50, y: 87 },
        { slot: 'lb',  x: 12, y: 72 }, { slot: 'cb1', x: 35, y: 72 },
        { slot: 'cb2', x: 65, y: 72 }, { slot: 'rb',  x: 88, y: 72 },
        { slot: 'dm1', x: 36, y: 58 }, { slot: 'dm2', x: 64, y: 58 },
        { slot: 'lam', x: 18, y: 40 }, { slot: 'cam', x: 50, y: 38 }, { slot: 'ram', x: 82, y: 40 },
        { slot: 'st',  x: 50, y: 20 },
      ],
    },
    {
      id: '3-5-2', label: '3-5-2',
      positions: [
        { slot: 'gk',  x: 50, y: 87 },
        { slot: 'cb1', x: 25, y: 72 }, { slot: 'cb2', x: 50, y: 72 }, { slot: 'cb3', x: 75, y: 72 },
        { slot: 'lm',  x: 10, y: 52 }, { slot: 'cm1', x: 30, y: 48 },
        { slot: 'cm2', x: 50, y: 46 }, { slot: 'cm3', x: 70, y: 48 }, { slot: 'rm',  x: 90, y: 52 },
        { slot: 'cf1', x: 34, y: 22 }, { slot: 'cf2', x: 66, y: 22 },
      ],
    },
    {
      id: '5-3-2', label: '5-3-2',
      positions: [
        { slot: 'gk',  x: 50, y: 87 },
        { slot: 'lwb', x: 10, y: 72 }, { slot: 'cb1', x: 28, y: 74 },
        { slot: 'cb2', x: 50, y: 74 }, { slot: 'cb3', x: 72, y: 74 }, { slot: 'rwb', x: 90, y: 72 },
        { slot: 'cm1', x: 25, y: 50 }, { slot: 'cm2', x: 50, y: 48 }, { slot: 'cm3', x: 75, y: 50 },
        { slot: 'cf1', x: 34, y: 22 }, { slot: 'cf2', x: 66, y: 22 },
      ],
    },
  ],
  '7': [
    {
      id: '2-3-1', label: '2-3-1',
      positions: [
        { slot: 'gk',  x: 50, y: 87 },
        { slot: 'cb1', x: 30, y: 68 }, { slot: 'cb2', x: 70, y: 68 },
        { slot: 'lm',  x: 15, y: 48 }, { slot: 'cm',  x: 50, y: 45 }, { slot: 'rm',  x: 85, y: 48 },
        { slot: 'cf',  x: 50, y: 22 },
      ],
    },
    {
      id: '3-2-1', label: '3-2-1',
      positions: [
        { slot: 'gk',  x: 50, y: 87 },
        { slot: 'lb',  x: 20, y: 68 }, { slot: 'cb',  x: 50, y: 68 }, { slot: 'rb',  x: 80, y: 68 },
        { slot: 'cm1', x: 32, y: 48 }, { slot: 'cm2', x: 68, y: 48 },
        { slot: 'cf',  x: 50, y: 22 },
      ],
    },
    {
      id: '1-3-2', label: '1-3-2',
      positions: [
        { slot: 'gk',  x: 50, y: 87 },
        { slot: 'cb',  x: 50, y: 68 },
        { slot: 'lm',  x: 20, y: 48 }, { slot: 'cm',  x: 50, y: 46 }, { slot: 'rm',  x: 80, y: 48 },
        { slot: 'cf1', x: 32, y: 22 }, { slot: 'cf2', x: 68, y: 22 },
      ],
    },
  ],
  '5': [
    {
      id: '1-2-1', label: '1-2-1',
      positions: [
        { slot: 'gk',  x: 50, y: 87 },
        { slot: 'cb',  x: 50, y: 68 },
        { slot: 'cm1', x: 30, y: 46 }, { slot: 'cm2', x: 70, y: 46 },
        { slot: 'cf',  x: 50, y: 22 },
      ],
    },
    {
      id: '2-1-1', label: '2-1-1',
      positions: [
        { slot: 'gk',  x: 50, y: 87 },
        { slot: 'cb1', x: 30, y: 68 }, { slot: 'cb2', x: 70, y: 68 },
        { slot: 'cm',  x: 50, y: 48 },
        { slot: 'cf',  x: 50, y: 22 },
      ],
    },
  ],
};

// "Juan García López" → "Juan García"   |   "Juan García" → "Juan García"
function getDisplayLabel(nombre) {
  const parts = (nombre || '').trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).join(' ');
}

// Determina el tipo de partido a partir del campo modalidad
function getModalidadType(modalidad) {
  if (!modalidad) return '11';
  const m = String(modalidad).toLowerCase().trim();
  if (m === '5' || m.includes('sala') || m.includes('futsal')) return '5';
  if (m === '7' || m.includes('7')) return '7';
  return '11';
}

// Genera el HTML del campo con los círculos de posición
function buildSetupFieldHtml(formation) {
  const posJson = JSON.stringify(
    formation.positions.map((p, i) => ({ index: i, x: p.x, y: p.y }))
  );

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;touch-action:none;}
html,body{width:100%;height:100%;overflow:hidden;background:#0A0E12;font-family:-apple-system,sans-serif;}
#wrap{position:relative;width:100%;height:100%;}
.slot{position:absolute;display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-50%);cursor:pointer;}
.circle{
  width:42px;height:42px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-weight:bold;color:#fff;position:relative;
  transition:transform 0.12s;
}
.slot:active .circle{transform:scale(0.88);}
.circle.empty{
  background:rgba(255,255,255,0.07);
  border:2px dashed rgba(255,255,255,0.32);
  font-size:24px;color:rgba(255,255,255,0.45);
}
.circle.filled{
  background:#105E7A;
  border:2.5px solid rgba(255,255,255,0.75);
  font-size:14px;
}
.slotlabel{
  font-size:9px;color:rgba(255,255,255,0.7);margin-top:3px;
  max-width:52px;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap;text-align:center;
  text-shadow:0 1px 3px rgba(0,0,0,0.95);
}
</style>
</head>
<body>
<div id="wrap">
<svg style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;"
     viewBox="0 0 100 160" preserveAspectRatio="none">
  <rect x="0" y="0" width="100" height="160" fill="#1B4D26"/>
  <rect x="0" y="0"   width="100" height="20" fill="rgba(255,255,255,0.015)"/>
  <rect x="0" y="40"  width="100" height="20" fill="rgba(255,255,255,0.015)"/>
  <rect x="0" y="80"  width="100" height="20" fill="rgba(255,255,255,0.015)"/>
  <rect x="0" y="120" width="100" height="20" fill="rgba(255,255,255,0.015)"/>
  <rect x="3" y="3" width="94" height="154" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="0.8"/>
  <line x1="3" y1="80" x2="97" y2="80" stroke="rgba(255,255,255,0.18)" stroke-width="0.5"/>
  <circle cx="50" cy="80" r="12" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.5"/>
  <circle cx="50" cy="80" r="0.8" fill="rgba(255,255,255,0.3)"/>
  <rect x="22" y="3"   width="56" height="22" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
  <rect x="22" y="135" width="56" height="22" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
  <rect x="35" y="3"   width="30" height="8"  fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="0.5"/>
  <rect x="35" y="149" width="30" height="8"  fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="0.5"/>
  <rect x="40" y="1"   width="20" height="3" fill="rgba(255,255,255,0.2)" rx="0.5"/>
  <rect x="40" y="156" width="20" height="3" fill="rgba(255,255,255,0.2)" rx="0.5"/>
</svg>
<div id="slots"></div>
</div>
<script>
var POS = ${posJson};
function render(){
  var c = document.getElementById("slots");
  c.innerHTML = "";
  POS.forEach(function(p){
    var el = document.createElement("div");
    el.className = "slot";
    el.dataset.idx = p.index;
    el.style.left = p.x + "%";
    el.style.top  = p.y + "%";
    el.innerHTML = '<div class="circle empty">+</div><div class="slotlabel"></div>';
    el.addEventListener("click", function(){
      window.ReactNativeWebView.postMessage(
        JSON.stringify({type:"slotTapped",slotIndex:p.index})
      );
    });
    c.appendChild(el);
  });
}
function assignPlayer(idx, dorsal, apellido){
  var el = document.querySelector('[data-idx="'+idx+'"]');
  if(!el) return;
  var circle = el.querySelector(".circle");
  var label  = el.querySelector(".slotlabel");
  circle.className  = "circle filled";
  circle.textContent = dorsal !== null ? String(dorsal) : "?";
  label.textContent  = apellido || "";
}
function clearSlot(idx){
  var el = document.querySelector('[data-idx="'+idx+'"]');
  if(!el) return;
  var circle = el.querySelector(".circle");
  var label  = el.querySelector(".slotlabel");
  circle.className  = "circle empty";
  circle.textContent = "+";
  label.textContent  = "";
}
render();
</script>
</body>
</html>`;
}

export default function LiveMatchSetupScreen({ route, navigation }) {
  const { matchId, rival, modalidad } = route.params;
  const { equipoId } = useContext(AuthContext);

  const modType = getModalidadType(modalidad);
  const availableFormations = FORMATIONS[modType] || FORMATIONS['11'];

  const [players, setPlayers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [formation, setFormation]   = useState(availableFormations[0]);
  // { [slotIndex]: playerId }
  const [assignments, setAssignments] = useState({});
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeSlot, setActiveSlot]   = useState(null);

  const webViewRef = useRef(null);

  const requiredCount = formation.positions.length;
  const filledCount   = Object.keys(assignments).length;
  const canStart      = filledCount === requiredCount;

  // IDs asignados a otros slots (excluyendo el slot activo)
  const otherAssignedIds = useMemo(() => new Set(
    Object.entries(assignments)
      .filter(([idx]) => parseInt(idx) !== activeSlot)
      .map(([, pid]) => pid)
  ), [assignments, activeSlot]);

  // Jugadores disponibles en el picker (no asignados a otro slot)
  const pickerPlayers = useMemo(
    () => players.filter(p => !otherAssignedIds.has(p.id)),
    [players, otherAssignedIds]
  );

  // Jugador actualmente asignado al slot activo (para mostrar "Quitar")
  const slotCurrentPlayer = useMemo(() => {
    if (activeSlot === null) return null;
    const pid = assignments[activeSlot];
    return pid !== undefined ? players.find(p => p.id === pid) ?? null : null;
  }, [activeSlot, assignments, players]);

  useEffect(() => {
    (async () => {
      try {
        const ps = await getPlayersByTeam(equipoId);
        setPlayers(ps);

        // Ofrecer reanudar si hay estado guardado
        const saved = await loadLiveMatchState(matchId);
        if (saved) {
          Alert.alert(
            'Partido en curso',
            'Hay un partido en directo guardado. ¿Deseas retomarlo?',
            [
              {
                text: 'Retomar',
                onPress: () =>
                  navigation.replace('LiveMatch', { matchId, rival, resumeState: saved }),
              },
              { text: 'Nuevo partido', style: 'destructive' },
            ]
          );
        }
      } catch {
        Alert.alert('Error', 'No se pudo cargar la plantilla.');
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // HTML del campo — solo se reconstruye cuando cambia la formación
  const fieldHtml = useMemo(
    () => buildSetupFieldHtml(formation),
    [formation.id] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Al recargar el WebView (cambio de formación) reinyectar asignaciones actuales
  function onWebViewReady() {
    Object.entries(assignments).forEach(([slotIdx, playerId]) => {
      const player = players.find(p => p.id === playerId);
      if (!player) return;
      const label = getDisplayLabel(player.nombre);
      webViewRef.current?.injectJavaScript(
        `assignPlayer(${slotIdx},${player.dorsal ?? 'null'},'${label.replace(/'/g, "\\'")}');true;`
      );
    });
  }

  // Mensaje desde el WebView: tap sobre un círculo
  function onWebViewMessage(event) {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'slotTapped') {
        setActiveSlot(msg.slotIndex);
        setPickerVisible(true);
      }
    } catch { /* mensaje inesperado */ }
  }

  // Cambio de formación: limpia asignaciones y recarga WebView via key
  function handleFormationChange(f) {
    if (f.id === formation.id) return;
    setFormation(f);
    setAssignments({});
  }

  // Asignar un jugador al slot activo
  function handleAssignPlayer(player) {
    setPickerVisible(false);

    const newAssignments = { ...assignments };

    // Si el jugador ya estaba en otro slot, liberar ese slot
    const prevEntry = Object.entries(newAssignments).find(
      ([idx, pid]) => pid === player.id && parseInt(idx) !== activeSlot
    );
    if (prevEntry) {
      const prevIdx = parseInt(prevEntry[0]);
      delete newAssignments[prevIdx];
      webViewRef.current?.injectJavaScript(`clearSlot(${prevIdx});true;`);
    }

    newAssignments[activeSlot] = player.id;
    setAssignments(newAssignments);

    const label = getDisplayLabel(player.nombre);
    webViewRef.current?.injectJavaScript(
      `assignPlayer(${activeSlot},${player.dorsal ?? 'null'},'${label.replace(/'/g, "\\'")}');true;`
    );
    setActiveSlot(null);
  }

  // Quitar la asignación del slot activo
  function handleClearSlot() {
    setPickerVisible(false);
    const newAssignments = { ...assignments };
    delete newAssignments[activeSlot];
    setAssignments(newAssignments);
    webViewRef.current?.injectJavaScript(`clearSlot(${activeSlot});true;`);
    setActiveSlot(null);
  }

  // Construir el estado inicial e iniciar el partido
  function handleStart() {
    if (!canStart) return;

    const assignedIds = new Set(Object.values(assignments));
    const onPitch = formation.positions.map((_, idx) => {
      const playerId = assignments[idx];
      const p = players.find(pl => pl.id === playerId);
      return { id: p.id, nombre: p.nombre, dorsal: p.dorsal, posicion: p.posicion, minuteOn: 0 };
    });
    const bench = players
      .filter(p => !assignedIds.has(p.id))
      .map(p => ({ id: p.id, nombre: p.nombre, dorsal: p.dorsal, posicion: p.posicion }));

    const initialState = {
      matchId,
      rival,
      phase: 'first_half',
      elapsedSeconds: 0,
      timerRunning: false,
      rivalGoals: 0,
      onPitch,
      bench,
      starters: onPitch.map(p => ({ ...p })),
      events: [],
    };

    navigation.replace('LiveMatch', { matchId, rival, resumeState: initialState });
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COACH_COLOR} />
      </View>
    );
  }

  const enoughPlayers = players.length >= requiredCount;

  return (
    <View style={styles.container}>

      {/* ── Cabecera: rival + selector de formación ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.rivalText}>vs. {rival}</Text>
          {!enoughPlayers && (
            <Text style={styles.warningText}>
              ⚠ Necesitas {requiredCount} jugadores · tienes {players.length}
            </Text>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.formationsRow}
        >
          {availableFormations.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[styles.formChip, f.id === formation.id && styles.formChipActive]}
              onPress={() => handleFormationChange(f)}
            >
              <Text style={[styles.formChipText, f.id === formation.id && styles.formChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Campo táctico con círculos ── */}
      <View style={styles.fieldWrap}>
        <WebView
          ref={webViewRef}
          key={formation.id}
          source={{ html: fieldHtml }}
          onLoadEnd={onWebViewReady}
          onMessage={onWebViewMessage}
          style={styles.webview}
          javaScriptEnabled
          scrollEnabled={false}
          originWhitelist={['*']}
          mixedContentMode="always"
        />
      </View>

      {/* ── Footer: contador + botón iniciar ── */}
      <View style={styles.footer}>
        <View style={styles.counterWrap}>
          <Text style={styles.counterLabel}>Titulares</Text>
          <Text style={styles.counterValue}>
            <Text style={{ color: canStart ? '#00AA13' : COACH_COLOR }}>
              {filledCount}
            </Text>
            /{requiredCount}
          </Text>
        </View>
        <Button
          mode="contained"
          icon="whistle"
          onPress={handleStart}
          disabled={!canStart}
          buttonColor={COACH_COLOR}
          style={styles.startBtn}
          contentStyle={styles.startBtnContent}
        >
          Iniciar partido
        </Button>
      </View>

      {/* ── Dialog: picker de jugadores ── */}
      <Portal>
        <Dialog
          visible={pickerVisible}
          onDismiss={() => { setPickerVisible(false); setActiveSlot(null); }}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>
            {slotCurrentPlayer
              ? `Cambiar: ${getDisplayLabel(slotCurrentPlayer.nombre)}`
              : 'Elegir jugador'}
          </Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView>
              {pickerPlayers.length === 0 ? (
                <Text style={styles.dialogEmpty}>No hay jugadores disponibles.</Text>
              ) : pickerPlayers.map((p, i) => (
                <View key={p.id}>
                  {i > 0 && <Divider style={{ backgroundColor: 'rgba(255,255,255,0.07)' }} />}
                  <TouchableOpacity
                    style={styles.dialogPlayerRow}
                    onPress={() => handleAssignPlayer(p)}
                  >
                    <PlayerAvatar player={p} />
                    <View style={styles.dialogPlayerInfo}>
                      <Text style={styles.dialogPlayerName}>{getDisplayLabel(p.nombre)}</Text>
                      <Text style={styles.dialogPlayerMeta}>
                        {p.posicion || '—'}{p.dorsal != null ? `  ·  #${p.dorsal}` : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            {slotCurrentPlayer && (
              <Button onPress={handleClearSlot} textColor="#DC2626">Quitar</Button>
            )}
            <Button onPress={() => { setPickerVisible(false); setActiveSlot(null); }} textColor="#9CA3AF">
              Cancelar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },

  header: {
    backgroundColor: GLASS_BG,
    borderBottomWidth: 1,
    borderBottomColor: GLASS_BORDER,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerTop: { paddingHorizontal: 16, marginBottom: 8 },
  rivalText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  warningText: { color: '#FFC107', fontSize: 12, marginTop: 4 },

  formationsRow: { paddingHorizontal: 12, gap: 8, alignItems: 'center' },
  formChip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
  },
  formChipActive: {
    backgroundColor: 'rgba(16,94,122,0.4)',
    borderColor: COACH_COLOR,
  },
  formChipText:       { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '600' },
  formChipTextActive: { color: '#fff' },

  fieldWrap: { flex: 1 },
  webview:   { flex: 1, backgroundColor: BG },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderTopWidth: 1,
    borderTopColor: GLASS_BORDER,
  },
  counterWrap:  { flex: 1 },
  counterLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 },
  counterValue: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 1 },
  startBtn:        { borderRadius: 10 },
  startBtnContent: { paddingVertical: 4, paddingHorizontal: 8 },

  dialog:            { backgroundColor: '#1a2a3a', borderRadius: 12 },
  dialogTitle:       { color: '#fff' },
  dialogScrollArea:  { maxHeight: 380, paddingHorizontal: 0 },
  dialogPlayerRow:   {
    paddingVertical: 13, paddingHorizontal: 18,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  dialogPlayerInfo: { flex: 1, justifyContent: 'center' },
  dialogPlayerName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  dialogPlayerMeta: { color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 2 },
  dialogEmpty:      { color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 24 },

  avatar:           { width: 40, height: 40, borderRadius: 20, marginRight: 12, overflow: 'hidden' },
  avatarImg:        { width: 40, height: 40, borderRadius: 20 },
  avatarFallback:   {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COACH_COLOR,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials:   { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});

function PlayerAvatar({ player }) {
  const initials = (player.nombre || '?')
    .trim().split(/\s+/).filter(Boolean)
    .slice(0, 2).map(w => w[0].toUpperCase()).join('');

  if (player.foto_url) {
    return (
      <Image
        source={{ uri: player.foto_url }}
        style={styles.avatarImg}
      />
    );
  }
  return (
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarInitials}>{initials}</Text>
    </View>
  );
}
