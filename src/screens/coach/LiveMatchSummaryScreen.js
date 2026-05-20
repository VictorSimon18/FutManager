import React, { useState, useMemo } from 'react';
import {
  View, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { Text, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { createPlayerStats } from '../../database/services/statsService';
import { updateMatchResult } from '../../database/services/matchService';
import { clearLiveMatchState } from '../../utils/liveMatchStore';
import { EventBus, EVENTS } from '../../utils/eventBus';
import { sendLocalNotification } from '../../utils/notifications';

const COACH_COLOR = '#105E7A';
const GLASS_BG = 'rgba(255,255,255,0.08)';
const GLASS_BORDER = 'rgba(255,255,255,0.13)';

function compiledStats(liveState) {
  const { events, starters, onPitch, bench } = liveState;

  // All participants = starters + anyone who came in via sub
  const allPlayers = new Map();
  [...starters, ...onPitch, ...bench].forEach(p => {
    if (!allPlayers.has(p.id)) allPlayers.set(p.id, p);
  });

  // Players who participated (were on pitch at some point)
  const subInIds = new Set(events.filter(e => e.type === 'sub_in').map(e => e.playerId));
  const subOutIds = new Set(events.filter(e => e.type === 'sub_out').map(e => e.playerId));
  const starterIds = new Set(starters.map(p => p.id));

  const participantIds = new Set([...starterIds, ...subInIds]);

  const statsMap = {};
  participantIds.forEach(id => {
    const p = allPlayers.get(id);
    if (!p) return;
    const isStarter = starterIds.has(id);
    let minuteOn = isStarter ? 0 : null;
    let minuteOff = null;

    // Find minute on (sub_in)
    const subInEv = events.find(e => e.type === 'sub_in' && e.playerId === id);
    if (subInEv) minuteOn = subInEv.minute;

    // Find minute off (sub_out)
    const subOutEv = events.find(e => e.type === 'sub_out' && e.playerId === id);
    if (subOutEv) minuteOff = subOutEv.minute;

    // Minutes played
    const totalMinutes = minuteOff != null
      ? minuteOff - (minuteOn ?? 0)
      : 90 - (minuteOn ?? 0);

    statsMap[id] = {
      jugador_id: id,
      nombre: p.nombre,
      dorsal: p.dorsal,
      posicion: p.posicion,
      titular: isStarter ? 1 : 0,
      minutos_jugados: Math.max(0, totalMinutes),
      goles: 0,
      asistencias: 0,
      tarjetas_amarillas: 0,
      tarjetas_rojas: 0,
      tiros_puerta: 0,
      tiros_fuera: 0,
      entradas: 0,
      despejes: 0,
      paradas: 0,
      faltas_cometidas: 0,
      faltas_recibidas: 0,
      fueras_juego: 0,
      pases_clave: 0,
    };
  });

  events.forEach(ev => {
    const s = statsMap[ev.playerId];
    if (!s) return;
    switch (ev.type) {
      case 'goal':           s.goles++;             break;
      case 'assist':         s.asistencias++;        break;
      case 'yellow':         s.tarjetas_amarillas++; break;
      case 'red':            s.tarjetas_rojas++;     break;
      case 'shot_on':        s.tiros_puerta++;       break;
      case 'shot_off':       s.tiros_fuera++;        break;
      case 'tackle':         s.entradas++;           break;
      case 'clearance':      s.despejes++;           break;
      case 'save':           s.paradas++;            break;
      case 'foul_committed': s.faltas_cometidas++;   break;
      case 'foul_received':  s.faltas_recibidas++;   break;
      case 'offside':        s.fueras_juego++;       break;
    }
    // 2 yellows = auto red
    if (s.tarjetas_amarillas >= 2) s.tarjetas_rojas = Math.max(s.tarjetas_rojas, 1);
  });

  return Object.values(statsMap);
}

export default function LiveMatchSummaryScreen({ route, navigation }) {
  const { matchId, rival, liveState } = route.params;

  const stats = useMemo(() => compiledStats(liveState), [liveState]);
  const ourGoals = liveState.events.filter(e => e.type === 'goal').length;
  const rivalGoals = liveState.rivalGoals;
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateMatchResult(matchId, ourGoals, rivalGoals);
      for (const s of stats) {
        await createPlayerStats({
          jugador_id: s.jugador_id,
          partido_id: matchId,
          minutos_jugados: s.minutos_jugados,
          titular: s.titular,
          goles: s.goles,
          asistencias: s.asistencias,
          tarjetas_amarillas: s.tarjetas_amarillas,
          tarjetas_rojas: s.tarjetas_rojas,
          tiros_puerta: s.tiros_puerta,
          tiros_fuera: s.tiros_fuera,
          entradas: s.entradas,
          despejes: s.despejes,
          paradas: s.paradas,
          faltas_cometidas: s.faltas_cometidas,
          faltas_recibidas: s.faltas_recibidas,
          fueras_juego: s.fueras_juego,
          pases_clave: s.pases_clave,
        });
      }
      await clearLiveMatchState(matchId);
      EventBus.emit(EVENTS.STATS_UPDATED, { rival });
      sendLocalNotification(
        '✅ Partido finalizado',
        `Resultado registrado: Nosotros ${ourGoals} - ${rivalGoals} ${rival}`
      );
      // pop() goes back to MatchDetail (LiveMatch and LiveMatchSetup were both replace'd,
      // so LiveMatchSummary sits directly above MatchDetail in the stack)
      navigation.pop();
    } catch (e) {
      setSaving(false);
      Alert.alert('Error', 'No se pudo guardar el partido: ' + e.message);
    }
  }

  const resultColor = ourGoals > rivalGoals ? '#43A047' : ourGoals < rivalGoals ? '#E53935' : COACH_COLOR;
  const resultLabel = ourGoals > rivalGoals ? 'Victoria' : ourGoals < rivalGoals ? 'Derrota' : 'Empate';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Final Score */}
        <View style={[styles.scoreCard, { borderTopColor: resultColor }]}>
          <Text style={styles.vsLabel}>vs. {rival}</Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreBig, { color: resultColor }]}>{ourGoals}</Text>
            <Text style={styles.scoreSep}> - </Text>
            <Text style={[styles.scoreBig, { color: resultColor }]}>{rivalGoals}</Text>
          </View>
          <Text style={[styles.resultLabel, { color: resultColor }]}>{resultLabel}</Text>
        </View>

        {/* Event summary */}
        {liveState.events.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Cronología de eventos</Text>
            <Divider style={styles.divider} />
            {liveState.events.map(ev => {
              const icons = {
                goal: { name: 'soccer', color: '#43A047' },
                assist: { name: 'hand-okay', color: '#26C6DA' },
                yellow: { name: 'card-text', color: '#FDD835' },
                red: { name: 'card-text', color: '#E53935' },
                sub_in: { name: 'arrow-down-bold', color: '#00AA13' },
                sub_out: { name: 'arrow-up-bold', color: '#FF7043' },
                shot_on: { name: 'target', color: '#AB47BC' },
                shot_off: { name: 'close-circle-outline', color: '#78909C' },
                tackle: { name: 'shoe-cleat', color: '#8D6E63' },
                clearance: { name: 'arrow-up-bold', color: '#5C6BC0' },
                save: { name: 'hand-front-right', color: '#00ACC1' },
                foul_committed: { name: 'whistle', color: '#FF7043' },
                foul_received: { name: 'shield-check', color: '#66BB6A' },
                offside: { name: 'flag', color: '#FFA726' },
              };
              const ic = icons[ev.type] || { name: 'circle', color: '#888' };
              return (
                <View key={ev.id} style={styles.eventRow}>
                  <Text style={styles.eventMin}>{ev.minute}'</Text>
                  <Icon name={ic.name} size={16} color={ic.color} style={{ marginHorizontal: 6 }} />
                  <Text style={styles.eventText}>{ev.playerName}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Player stats */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Estadísticas de jugadores</Text>
          <Divider style={styles.divider} />
          {stats.map(s => (
            <View key={s.jugador_id} style={styles.statRow}>
              <View style={styles.statHeader}>
                <Text style={styles.statName}>{s.nombre}</Text>
                <Text style={styles.statMeta}>
                  {s.posicion || '—'}{s.dorsal != null ? `  #${s.dorsal}` : ''}  ·  {s.minutos_jugados}'
                  {s.titular ? '  ·  Titular' : '  ·  Suplente'}
                </Text>
              </View>
              <View style={styles.statBadges}>
                {s.goles > 0 && <StatBadge icon="soccer" value={s.goles} color="#43A047" label="Goles" />}
                {s.asistencias > 0 && <StatBadge icon="hand-okay" value={s.asistencias} color="#26C6DA" label="Asist." />}
                {s.tarjetas_amarillas > 0 && <StatBadge icon="card-text" value={s.tarjetas_amarillas} color="#FDD835" label="Amar." />}
                {s.tarjetas_rojas > 0 && <StatBadge icon="card-text" value={s.tarjetas_rojas} color="#E53935" label="Roja" />}
                {s.tiros_puerta > 0 && <StatBadge icon="target" value={s.tiros_puerta} color="#AB47BC" label="T.pta" />}
                {s.paradas > 0 && <StatBadge icon="hand-front-right" value={s.paradas} color="#00ACC1" label="Par." />}
                {s.entradas > 0 && <StatBadge icon="shoe-cleat" value={s.entradas} color="#8D6E63" label="Ent." />}
                {s.faltas_cometidas > 0 && <StatBadge icon="whistle" value={s.faltas_cometidas} color="#FF7043" label="Flt." />}
              </View>
            </View>
          ))}
        </View>

        <Button
          mode="contained"
          icon="content-save"
          onPress={handleSave}
          disabled={saving}
          buttonColor="#00AA13"
          style={styles.saveBtn}
          contentStyle={styles.saveBtnContent}
        >
          {saving ? 'Guardando…' : 'Guardar y finalizar'}
        </Button>

        <Button
          mode="outlined"
          icon="arrow-left"
          onPress={() => navigation.goBack()}
          textColor="rgba(255,255,255,0.5)"
          style={styles.backBtn}
        >
          Volver al partido
        </Button>

      </ScrollView>
    </View>
  );
}

function StatBadge({ icon, value, color, label }) {
  return (
    <View style={[badgeStyles.wrap, { borderColor: color + '55' }]}>
      <Icon name={icon} size={12} color={color} />
      <Text style={[badgeStyles.val, { color }]}>{value}</Text>
      {label && <Text style={badgeStyles.label}>{label}</Text>}
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    gap: 3,
    marginRight: 4,
    marginBottom: 4,
  },
  val: { fontSize: 12, fontWeight: 'bold' },
  label: { color: 'rgba(255,255,255,0.4)', fontSize: 10 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },
  content: { padding: 16, paddingBottom: 40 },

  scoreCard: {
    alignItems: 'center',
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: 16,
    borderTopWidth: 3,
    padding: 24,
    marginBottom: 12,
  },
  vsLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 12 },
  scoreRow: { flexDirection: 'row', alignItems: 'center' },
  scoreBig: { fontSize: 60, fontWeight: 'bold' },
  scoreSep: { color: 'rgba(255,255,255,0.3)', fontSize: 40, marginHorizontal: 8 },
  resultLabel: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },

  card: {
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  divider: { backgroundColor: GLASS_BORDER, marginBottom: 12 },

  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  eventMin: { color: COACH_COLOR, fontWeight: 'bold', width: 30, fontSize: 13 },
  eventText: { color: 'rgba(255,255,255,0.75)', fontSize: 13, flex: 1 },

  statRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  statHeader: { marginBottom: 6 },
  statName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  statMeta: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  statBadges: { flexDirection: 'row', flexWrap: 'wrap' },

  saveBtn: { borderRadius: 10, marginBottom: 8 },
  saveBtnContent: { paddingVertical: 6 },
  backBtn: { borderRadius: 10, borderColor: 'rgba(255,255,255,0.2)' },
});
