import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import {
  Text, Button, Chip, Divider, ActivityIndicator,
  TextInput, Dialog, Portal, Switch, Snackbar,
} from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { getMatchById, updateMatchResult, deleteMatch } from '../../database/services/matchService';
import { getStatsByMatch, createPlayerStats } from '../../database/services/statsService';
import { getPlayersByTeam } from '../../database/services/playerService';
import { AuthContext } from '../../context/AuthContext';
import { formatDate, formatTime } from '../../utils/dateUtils';
import StatBadge from '../../components/StatBadge';
import ConfirmDialog from '../../components/ConfirmDialog';

const GLASS_BG = 'rgba(255,255,255,0.08)';
const GLASS_BORDER = 'rgba(255,255,255,0.13)';
const DIALOG_STYLE = { borderRadius: 8 };

// Foco blanco: borde + label activo en blanco
const INPUT_THEME = {
  colors: {
    primary: '#FFFFFF',
    onSurfaceVariant: '#FFFFFF',
    outline: 'rgba(255,255,255,0.15)',
  },
};

/**
 * Construye el HTML del mini mapa estático (solo visualización, sin interacción).
 */
function buildMiniMapHtml(lat, lng, address) {
  const popup = address ? JSON.stringify(address) : '""';
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      attributionControl: false,
    }).setView([${lat}, ${lng}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    var m = L.marker([${lat}, ${lng}]).addTo(map);
    var addr = ${popup};
    if (addr) m.bindPopup(addr).openPopup();
  <\/script>
</body>
</html>`;
}

function StatsSection({ title }) {
  return (
    <View style={styles.statsSection}>
      <Text variant="labelSmall" style={styles.statsSectionTitle}>{title}</Text>
      <Divider style={styles.statsSectionDivider} />
    </View>
  );
}

export default function MatchDetailScreen({ route, navigation }) {
  const { matchId } = route.params;
  const { equipoId } = useContext(AuthContext);

  const [match, setMatch] = useState(null);
  const [stats, setStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [resultModal, setResultModal] = useState(false);
  const [golesFavor, setGolesFavor] = useState('');
  const [golesContra, setGolesContra] = useState('');
  const [savingResult, setSavingResult] = useState(false);

  const [statsListModal, setStatsListModal] = useState(false);
  const [statsFormModal, setStatsFormModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [stMinutos, setStMinutos] = useState('');
  const [stTitular, setStTitular] = useState(true);
  const [stPasesClave, setStPasesClave] = useState('');
  const [stValoracion, setStValoracion] = useState('');
  const [stGoles, setStGoles] = useState('');
  const [stAsistencias, setStAsistencias] = useState('');
  const [stTirosPuerta, setStTirosPuerta] = useState('');
  const [stTirosFuera, setStTirosFuera] = useState('');
  const [stFuerasJuego, setStFuerasJuego] = useState('');
  const [stEntradas, setStEntradas] = useState('');
  const [stDespejes, setStDespejes] = useState('');
  const [stParadas, setStParadas] = useState('');
  const [stAmarillas, setStAmarillas] = useState('');
  const [stRojas, setStRojas] = useState('');
  const [stFaltasCometidas, setStFaltasCometidas] = useState('');
  const [stFaltasRecibidas, setStFaltasRecibidas] = useState('');

  const [savingStats, setSavingStats] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

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

  function handleSelectPlayer(player) {
    setSelectedPlayer(player);
    setStMinutos(''); setStTitular(true); setStPasesClave(''); setStValoracion('');
    setStGoles(''); setStAsistencias(''); setStTirosPuerta(''); setStTirosFuera('');
    setStFuerasJuego(''); setStEntradas(''); setStDespejes(''); setStParadas('');
    setStAmarillas(''); setStRojas(''); setStFaltasCometidas(''); setStFaltasRecibidas('');
    setStatsListModal(false);
    setStatsFormModal(true);
  }

  async function handleSaveStats() {
    if (!selectedPlayer) return;
    setSavingStats(true);
    try {
      const amarillas = parseInt(stAmarillas) || 0;
      let rojas = parseInt(stRojas) || 0;
      if (amarillas >= 2) rojas = Math.max(rojas, 1);

      await createPlayerStats({
        jugador_id: selectedPlayer.id,
        partido_id: matchId,
        minutos_jugados: parseInt(stMinutos) || 0,
        titular: stTitular ? 1 : 0,
        pases_clave: parseInt(stPasesClave) || 0,
        valoracion: stValoracion ? parseFloat(stValoracion) : null,
        goles: parseInt(stGoles) || 0,
        asistencias: parseInt(stAsistencias) || 0,
        tiros_puerta: parseInt(stTirosPuerta) || 0,
        tiros_fuera: parseInt(stTirosFuera) || 0,
        fueras_juego: parseInt(stFuerasJuego) || 0,
        entradas: parseInt(stEntradas) || 0,
        despejes: parseInt(stDespejes) || 0,
        paradas: parseInt(stParadas) || 0,
        tarjetas_amarillas: amarillas,
        tarjetas_rojas: rojas,
        faltas_cometidas: parseInt(stFaltasCometidas) || 0,
        faltas_recibidas: parseInt(stFaltasRecibidas) || 0,
      });
      setStatsFormModal(false);
      setSelectedPlayer(null);
      load();
      if (amarillas >= 2) {
        setSnackbarMsg('2 amarillas = expulsión (roja automática añadida)');
        setSnackbarVisible(true);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar las estadísticas.');
    } finally {
      setSavingStats(false);
    }
  }

  function handleBackToList() {
    setStatsFormModal(false);
    setSelectedPlayer(null);
    setStatsListModal(true);
  }

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
        <LinearGradient
          colors={['#0f2027', '#203a43', '#2c5364']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.4, y: 1 }}
        />
        <ActivityIndicator size="large" color="#105E7A" />
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
    else { resultColor = '#105E7A'; resultLabel = 'Empate'; }
  }

  const isPortero = selectedPlayer?.posicion === 'Portero';
  const amarillasNum = parseInt(stAmarillas) || 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />
      <ScrollView contentContainerStyle={styles.content}>

        {/* Cabecera del partido */}
        <View style={[styles.card, { borderTopColor: resultColor }]}>
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
              <Icon name="calendar" size={16} color="rgba(255,255,255,0.4)" />
              <Text variant="bodySmall" style={styles.metaText}>
                {formatDate(match.fecha)}{match.hora ? `  ·  ${formatTime(match.hora)}` : ''}
              </Text>
            </View>

            {/* Mini mapa si hay coordenadas, o solo texto de ubicación */}
            {match.latitud && match.longitud ? (
              <View style={styles.miniMapContainer}>
                <WebView
                  source={{ html: buildMiniMapHtml(match.latitud, match.longitud, match.ubicacion) }}
                  style={styles.miniMapWebview}
                  javaScriptEnabled
                  scrollEnabled={false}
                  pointerEvents="none"
                  originWhitelist={['*']}
                  mixedContentMode="always"
                />
                {match.ubicacion ? (
                  <View style={[styles.metaRow, { marginTop: 6 }]}>
                    <Icon name="map-marker" size={14} color="rgba(255,255,255,0.4)" />
                    <Text variant="bodySmall" style={styles.metaText}>{match.ubicacion}</Text>
                  </View>
                ) : null}
              </View>
            ) : match.ubicacion ? (
              <View style={styles.metaRow}>
                <Icon name="map-marker" size={16} color="rgba(255,255,255,0.4)" />
                <Text variant="bodySmall" style={styles.metaText}>{match.ubicacion}</Text>
              </View>
            ) : null}

            <View style={styles.chipsRow}>
              <Chip compact icon={match.es_local ? 'home' : 'airplane'} style={styles.chip} textStyle={styles.chipText}>
                {match.es_local ? 'Local' : 'Visitante'}
              </Chip>
              {match.tipo && <Chip compact style={styles.chip} textStyle={styles.chipText}>{match.tipo}</Chip>}
              {match.modalidad && <Chip compact style={styles.chip} textStyle={styles.chipText}>{match.modalidad}</Chip>}
            </View>
          </View>
        </View>

        {!isFinished && (
          <Button
            mode="contained"
            icon="scoreboard"
            onPress={() => setResultModal(true)}
            buttonColor="#105E7A"
            style={styles.actionBtn}
          >
            Registrar resultado
          </Button>
        )}

        {isFinished && (
          <View style={styles.card}>
            <View style={styles.statsHeader}>
              <Text variant="titleSmall" style={styles.sectionTitle}>Estadísticas de jugadores</Text>
              <Button compact mode="text" textColor="#105E7A" onPress={() => setStatsListModal(true)}>
                + Añadir
              </Button>
            </View>
            {stats.length === 0 ? (
              <Text variant="bodySmall" style={styles.emptyText}>Sin estadísticas registradas.</Text>
            ) : stats.map(s => {
              const mostrarRoja = s.tarjetas_rojas > 0 || s.tarjetas_amarillas >= 2;
              return (
                <View key={s.id} style={styles.statRow}>
                  <View style={styles.statPlayer}>
                    <Text variant="bodyMedium" style={styles.statName}>{s.nombre}</Text>
                    <Text variant="bodySmall" style={styles.statMeta}>
                      {s.posicion}  ·  #{s.dorsal}  ·  {s.minutos_jugados}'
                    </Text>
                  </View>
                  <View style={styles.statBadges}>
                    <StatBadge icon="soccer" value={s.goles} color="#43A047" />
                    <StatBadge icon="hand-okay" value={s.asistencias} color="#105E7A" />
                    {s.tarjetas_amarillas > 0 && (
                      <StatBadge icon="card-text" value={s.tarjetas_amarillas} color="#FDD835" />
                    )}
                    {mostrarRoja && (
                      <StatBadge icon="card-text" value={1} color="#E53935" />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.bottomActions}>
          <Button
            mode="outlined"
            icon="pencil"
            onPress={() => navigation.navigate('MatchForm', { matchId })}
            style={styles.bottomBtn}
            textColor="#105E7A"
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

        <Button
          mode="contained"
          icon="content-save"
          onPress={() => navigation.goBack()}
          buttonColor="#00AA13"
          style={styles.saveBtn}
        >
          Guardar partido
        </Button>

        {/* Modal: Registrar resultado */}
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
                  theme={INPUT_THEME}
                  keyboardType="numeric"
                  style={styles.goalInput}
                />
                <Text variant="headlineMedium" style={styles.goalSep}>-</Text>
                <TextInput
                  label="En contra"
                  value={golesContra}
                  onChangeText={setGolesContra}
                  mode="outlined"
                  theme={INPUT_THEME}
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

        {/* Modal: Lista de jugadores */}
        <Portal>
          <Dialog visible={statsListModal} onDismiss={() => setStatsListModal(false)} style={DIALOG_STYLE}>
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
                          {p.nombre}{p.dorsal != null ? ` (#${p.dorsal})` : ''}
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

        {/* Modal: Formulario de estadísticas */}
        <Portal>
          <Dialog visible={statsFormModal} onDismiss={handleBackToList} style={DIALOG_STYLE}>
            <Dialog.Title>{selectedPlayer?.nombre ?? 'Estadísticas'}</Dialog.Title>
            <Dialog.ScrollArea style={styles.statsScrollArea}>
              <ScrollView>
                <StatsSection title="GENERAL" />
                <View style={styles.switchRow}>
                  <Text variant="bodyMedium">{stTitular ? 'Titular' : 'Suplente'}</Text>
                  <Switch value={stTitular} onValueChange={setStTitular} trackColor={{ true: '#105E7A', false: '#BDBDBD' }} thumbColor="#fff" />
                </View>
                <View style={styles.statsInputRow}>
                  <TextInput label="Minutos" value={stMinutos} onChangeText={setStMinutos} mode="outlined" keyboardType="numeric" theme={INPUT_THEME} style={styles.miniInput} placeholder="Ej: 90" />
                  <TextInput label="Pases clave" value={stPasesClave} onChangeText={setStPasesClave} mode="outlined" keyboardType="numeric" theme={INPUT_THEME} style={styles.miniInput} placeholder="Ej: 2" />
                  <TextInput label="Valoración" value={stValoracion} onChangeText={setStValoracion} mode="outlined" keyboardType="decimal-pad" theme={INPUT_THEME} style={styles.miniInput} placeholder="Ej: 7.5" />
                </View>

                <StatsSection title="ATAQUE" />
                <View style={styles.statsInputRow}>
                  <TextInput label="Goles" value={stGoles} onChangeText={setStGoles} mode="outlined" keyboardType="numeric" theme={INPUT_THEME} style={styles.miniInput} placeholder="Ej: 0" />
                  <TextInput label="Asistencias" value={stAsistencias} onChangeText={setStAsistencias} mode="outlined" keyboardType="numeric" theme={INPUT_THEME} style={styles.miniInput} placeholder="Ej: 1" />
                </View>
                <View style={[styles.statsInputRow, { marginTop: 8 }]}>
                  <TextInput label="Tiros puerta" value={stTirosPuerta} onChangeText={setStTirosPuerta} mode="outlined" keyboardType="numeric" theme={INPUT_THEME} style={styles.miniInput} placeholder="Ej: 3" />
                  <TextInput label="Tiros fuera" value={stTirosFuera} onChangeText={setStTirosFuera} mode="outlined" keyboardType="numeric" theme={INPUT_THEME} style={styles.miniInput} placeholder="Ej: 1" />
                  <TextInput label="Fuera de juego" value={stFuerasJuego} onChangeText={setStFuerasJuego} mode="outlined" keyboardType="numeric" theme={INPUT_THEME} style={styles.miniInput} placeholder="Ej: 0" />
                </View>

                <StatsSection title="DEFENSA" />
                <View style={styles.statsInputRow}>
                  <TextInput label="Entradas" value={stEntradas} onChangeText={setStEntradas} mode="outlined" keyboardType="numeric" theme={INPUT_THEME} style={styles.miniInput} placeholder="Ej: 2" />
                  <TextInput label="Despejes" value={stDespejes} onChangeText={setStDespejes} mode="outlined" keyboardType="numeric" theme={INPUT_THEME} style={styles.miniInput} placeholder="Ej: 4" />
                  {isPortero && (
                    <TextInput label="Paradas" value={stParadas} onChangeText={setStParadas} mode="outlined" keyboardType="numeric" theme={INPUT_THEME} style={styles.miniInput} placeholder="Ej: 5" />
                  )}
                </View>

                <StatsSection title="DISCIPLINA" />
                <View style={styles.statsInputRow}>
                  <TextInput label="Amarillas" value={stAmarillas} onChangeText={setStAmarillas} mode="outlined" keyboardType="numeric" theme={INPUT_THEME} style={styles.miniInput} placeholder="Ej: 0" />
                  <TextInput label="Rojas" value={stRojas} onChangeText={setStRojas} mode="outlined" keyboardType="numeric" theme={INPUT_THEME} style={styles.miniInput} placeholder="Ej: 0" />
                </View>
                {amarillasNum >= 2 && (
                  <Text variant="bodySmall" style={styles.warningText}>
                    ⚠️ 2 amarillas = expulsión (roja automática al guardar)
                  </Text>
                )}
                <View style={[styles.statsInputRow, { marginTop: 8 }]}>
                  <TextInput label="Faltas comet." value={stFaltasCometidas} onChangeText={setStFaltasCometidas} mode="outlined" keyboardType="numeric" theme={INPUT_THEME} style={styles.miniInput} placeholder="Ej: 2" />
                  <TextInput label="Faltas recib." value={stFaltasRecibidas} onChangeText={setStFaltasRecibidas} mode="outlined" keyboardType="numeric" theme={INPUT_THEME} style={styles.miniInput} placeholder="Ej: 3" />
                </View>
              </ScrollView>
            </Dialog.ScrollArea>
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

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}
        >
          {snackbarMsg}
        </Snackbar>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f2027' },
  card: {
    backgroundColor: GLASS_BG,
    borderRadius: 12,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    padding: 16,
  },
  rival: { fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  scoreBlock: { alignItems: 'center', marginVertical: 8 },
  score: { fontWeight: 'bold' },
  resultLabel: { fontWeight: 'bold' },
  pendiente: { color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginVertical: 8 },
  metaBlock: { marginTop: 12, gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { color: 'rgba(255,255,255,0.5)', flexShrink: 1 },
  chipsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  chip: { backgroundColor: 'rgba(255,255,255,0.1)' },
  chipText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  actionBtn: { borderRadius: 8 },
  sectionTitle: { fontWeight: 'bold', color: '#105E7A', textTransform: 'uppercase', letterSpacing: 0.5 },
  statsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  emptyText: { color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' },
  statRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  statPlayer: { flex: 1 },
  statName: { fontWeight: '600', color: '#FFFFFF' },
  statMeta: { color: 'rgba(255,255,255,0.45)' },
  statBadges: { flexDirection: 'row', gap: 8 },
  bottomActions: { flexDirection: 'row', gap: 12 },
  bottomBtn: { flex: 1, borderRadius: 8 },
  saveBtn: { borderRadius: 8 },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  goalInput: { flex: 1 },
  goalSep: { fontWeight: 'bold', color: '#555' },
  playerListArea: { maxHeight: 320 },
  playerListItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4 },
  playerListInfo: { flex: 1 },
  playerListName: { fontWeight: '600', color: '#1A1A1A' },
  playerListMeta: { color: '#999', marginTop: 2 },
  statsScrollArea: { maxHeight: 420 },
  statsSection: { marginTop: 16, marginBottom: 4 },
  statsSectionTitle: { color: '#105E7A', fontWeight: 'bold', letterSpacing: 1 },
  statsSectionDivider: { marginTop: 4, backgroundColor: '#105E7A30' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  statsInputRow: { flexDirection: 'row', gap: 8 },
  miniInput: { flex: 1 },
  warningText: { color: '#E65100', marginTop: 6, marginBottom: 4 },
  snackbar: { backgroundColor: '#333' },
  miniMapContainer: {
    marginTop: 4,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  miniMapWebview: {
    height: 200,
    borderRadius: 10,
  },
});
