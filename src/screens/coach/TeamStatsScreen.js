import React, { useState, useCallback, useContext, useEffect } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Text, ActivityIndicator, Divider } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import {
  getTeamSeasonStats,
  getTeamOffensiveStats,
  getTeamDefensiveStats,
  getPlayerRankings,
} from '../../database/services/teamStatsService';

const GLASS_BG = 'rgba(255,255,255,0.07)';
const GLASS_BORDER = 'rgba(255,255,255,0.12)';
const ACCENT = '#105E7A';

const TABS = [
  { key: 'general',   label: 'General',   icon: 'chart-bar' },
  { key: 'attack',    label: 'Ataque',    icon: 'soccer' },
  { key: 'defense',   label: 'Defensa',   icon: 'shield-half-full' },
  { key: 'rankings',  label: 'Rankings',  icon: 'trophy' },
];

export default function TeamStatsScreen() {
  const { equipoId } = useContext(AuthContext);

  const [tab, setTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [season, setSeason] = useState(null);
  const [offensive, setOffensive] = useState(null);
  const [defensive, setDefensive] = useState(null);
  const [rankings, setRankings] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!equipoId) return;
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [s, o, d, r] = await Promise.all([
        getTeamSeasonStats(equipoId),
        getTeamOffensiveStats(equipoId),
        getTeamDefensiveStats(equipoId),
        getPlayerRankings(equipoId),
      ]);
      setSeason(s);
      setOffensive(o);
      setDefensive(d);
      setRankings(r);
    } catch (e) {
      console.error('[TeamStatsScreen] load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [equipoId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  const pj = season?.partidos_jugados ?? 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />

      {/* Record hero */}
      <View style={styles.hero}>
        <View style={styles.recordRow}>
          <RecordBadge value={season?.ganados ?? 0} label="V" color="#43A047" />
          <RecordBadge value={season?.empatados ?? 0} label="E" color={ACCENT} />
          <RecordBadge value={season?.perdidos ?? 0} label="D" color="#E53935" />
        </View>
        <Text style={styles.heroSub}>
          {pj} {pj === 1 ? 'partido' : 'partidos'} · {season?.porcentaje_victorias ?? 0}% victorias
        </Text>
        {season?.racha_tipo && (
          <View style={[styles.rachaBadge, { borderColor: rachaColor(season.racha_tipo) }]}>
            <Text style={[styles.rachaText, { color: rachaColor(season.racha_tipo) }]}>
              Racha: {season.racha}× {season.racha_tipo === 'V' ? 'victorias' : season.racha_tipo === 'D' ? 'derrotas' : 'empates'}
            </Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Icon name={t.icon} size={16} color={tab === t.key ? '#fff' : 'rgba(255,255,255,0.4)'} />
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={ACCENT} />
        }
      >
        {tab === 'general' && <GeneralTab season={season} />}
        {tab === 'attack' && <AttackTab offensive={offensive} />}
        {tab === 'defense' && <DefenseTab defensive={defensive} />}
        {tab === 'rankings' && <RankingsTab rankings={rankings} />}
      </ScrollView>
    </View>
  );
}

// ─── Tabs ───────────────────────────────────────────────────────────────────

function GeneralTab({ season }) {
  const pj = season?.partidos_jugados ?? 0;
  const ganados = season?.ganados ?? 0;
  const empatados = season?.empatados ?? 0;
  const perdidos = season?.perdidos ?? 0;
  const gf = season?.goles_favor ?? 0;
  const gc = season?.goles_contra ?? 0;

  return (
    <>
      <StatCard title="Resultados" icon="scoreboard">
        <ResultBar label="Victorias" value={ganados} total={pj} color="#43A047" />
        <ResultBar label="Empates"   value={empatados} total={pj} color={ACCENT} />
        <ResultBar label="Derrotas"  value={perdidos} total={pj} color="#E53935" />
      </StatCard>

      <StatCard title="Goles" icon="soccer">
        <View style={styles.goalsCompare}>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.goalBig}>{gf}</Text>
            <Text style={styles.goalLabel}>A favor</Text>
          </View>
          <Text style={styles.goalSep}>—</Text>
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.goalBig, { color: '#E53935' }]}>{gc}</Text>
            <Text style={styles.goalLabel}>En contra</Text>
          </View>
        </View>
        <Divider style={styles.divider} />
        <InfoRow icon="calculator" label="Promedio de goles" value={season?.promedio_goles ?? '0.0'} />
        <InfoRow icon="plus-minus" label="Diferencia de goles" value={(gf - gc >= 0 ? '+' : '') + (gf - gc)} />
      </StatCard>

      <StatCard title="Disciplina" icon="card-text">
        <View style={styles.cardsRow}>
          <CardStat value={season?.total_amarillas ?? 0} color="#FDD835" label="Amarillas" />
          <CardStat value={season?.total_rojas ?? 0}     color="#E53935" label="Rojas" />
          <CardStat
            value={pj > 0 ? ((season?.total_amarillas ?? 0) / pj).toFixed(1) : '0.0'}
            color="#FDD835"
            label="Amar./partido"
          />
        </View>
      </StatCard>
    </>
  );
}

function AttackTab({ offensive }) {
  const totalGoles = offensive?.total_goles ?? 0;
  const totalTiros = (offensive?.total_tiros_puerta ?? 0) + (offensive?.total_tiros_fuera ?? 0);

  return (
    <>
      <StatCard title="Estadísticas ofensivas" icon="soccer">
        <InfoRow icon="soccer"          label="Goles totales"    value={totalGoles} />
        <InfoRow icon="hand-okay"       label="Asistencias"      value={offensive?.total_asistencias ?? 0} />
        <InfoRow icon="target"          label="Tiros a puerta"   value={offensive?.total_tiros_puerta ?? 0} />
        <InfoRow icon="close-circle-outline" label="Tiros fuera" value={offensive?.total_tiros_fuera ?? 0} />
        <InfoRow icon="chart-pie"       label="Efectividad"
          value={totalTiros > 0 ? `${Math.round((totalGoles / totalTiros) * 100)}%` : '—'} />
        <InfoRow icon="key-variant"     label="Pases clave"      value={offensive?.total_pases_clave ?? 0} />
        <InfoRow icon="flag"            label="Fueras de juego"  value={offensive?.total_fueras_juego ?? 0} />
      </StatCard>

      {(offensive?.goles_casa != null || offensive?.goles_fuera != null) && (
        <StatCard title="Casa vs Fuera" icon="home-city">
          <View style={styles.homeAwayRow}>
            <View style={{ alignItems: 'center' }}>
              <Icon name="home" size={20} color="#26C6DA" />
              <Text style={styles.goalBig}>{offensive?.goles_casa ?? 0}</Text>
              <Text style={styles.goalLabel}>En casa</Text>
            </View>
            <Text style={styles.goalSep}>vs</Text>
            <View style={{ alignItems: 'center' }}>
              <Icon name="airplane" size={20} color="#AB47BC" />
              <Text style={styles.goalBig}>{offensive?.goles_fuera ?? 0}</Text>
              <Text style={styles.goalLabel}>Fuera</Text>
            </View>
          </View>
        </StatCard>
      )}

      {offensive?.goleadores?.length > 0 && (
        <StatCard title="Top goleadores" icon="podium-gold">
          {offensive.goleadores.map((p, i) => (
            <RankRow
              key={i}
              rank={i + 1}
              name={p.nombre}
              dorsal={p.dorsal}
              value={p.goles}
              valueLabel="goles"
              maxValue={offensive.goleadores[0].goles}
              color="#43A047"
            />
          ))}
        </StatCard>
      )}
    </>
  );
}

function DefenseTab({ defensive }) {
  return (
    <>
      <StatCard title="Estadísticas defensivas" icon="shield-half-full">
        <InfoRow icon="shield-check"    label="Porterías a cero"         value={defensive?.porterias_cero ?? 0} />
        <InfoRow icon="numeric"         label="Goles en contra / partido" value={defensive?.goles_contra_por_partido ?? '0.0'} />
        <InfoRow icon="numeric"         label="Goles en contra total"     value={defensive?.total_goles_contra ?? 0} />
      </StatCard>
      <StatCard title="Acciones defensivas" icon="shoe-cleat">
        <InfoRow icon="shoe-cleat"          label="Entradas"   value={defensive?.total_entradas ?? 0} />
        <InfoRow icon="arrow-up-bold"       label="Despejes"   value={defensive?.total_despejes ?? 0} />
        <InfoRow icon="hand-front-right"    label="Paradas"    value={defensive?.total_paradas ?? 0} />
      </StatCard>
    </>
  );
}

function RankingsTab({ rankings }) {
  if (!rankings) return null;
  return (
    <>
      {rankings.goleadores.length > 0 && (
        <StatCard title="Tabla de goleadores" icon="soccer">
          {rankings.goleadores.map((p, i) => (
            <RankRow key={i} rank={i + 1} name={p.nombre} dorsal={p.dorsal}
              value={p.goles} valueLabel="⚽" maxValue={rankings.goleadores[0].goles} color="#43A047" />
          ))}
        </StatCard>
      )}

      {rankings.asistentes.length > 0 && (
        <StatCard title="Tabla de asistencias" icon="hand-okay">
          {rankings.asistentes.map((p, i) => (
            <RankRow key={i} rank={i + 1} name={p.nombre} dorsal={p.dorsal}
              value={p.asistencias} valueLabel="🅰️" maxValue={rankings.asistentes[0].asistencias} color="#26C6DA" />
          ))}
        </StatCard>
      )}

      {rankings.minutos.length > 0 && (
        <StatCard title="Más minutos jugados" icon="timer">
          {rankings.minutos.map((p, i) => (
            <RankRow key={i} rank={i + 1} name={p.nombre} dorsal={p.dorsal}
              value={p.minutos} valueLabel="'" maxValue={rankings.minutos[0].minutos} color="#1E88E5" />
          ))}
        </StatCard>
      )}

      {rankings.disciplina.length > 0 && (
        <StatCard title="Disciplina" icon="card-text">
          {rankings.disciplina.map((p, i) => (
            <View key={i} style={styles.rankRow}>
              <Text style={styles.rankNum}>{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rankName} numberOfLines={1}>{p.nombre}</Text>
                {p.dorsal != null && <Text style={styles.rankMeta}>#{p.dorsal}</Text>}
              </View>
              <View style={styles.rankCards}>
                {p.amarillas > 0 && (
                  <View style={[styles.cardChip, { backgroundColor: '#FDD835' }]}>
                    <Text style={styles.cardChipTxt}>{p.amarillas}</Text>
                  </View>
                )}
                {p.rojas > 0 && (
                  <View style={[styles.cardChip, { backgroundColor: '#E53935' }]}>
                    <Text style={styles.cardChipTxt}>{p.rojas}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </StatCard>
      )}

      {rankings.goleadores.length === 0 && rankings.asistentes.length === 0 && (
        <View style={styles.emptyState}>
          <Icon name="chart-bar" size={48} color="rgba(255,255,255,0.15)" />
          <Text style={styles.emptyText}>Aún no hay estadísticas</Text>
          <Text style={styles.emptyHint}>Registra partidos en directo para ver los rankings</Text>
        </View>
      )}
    </>
  );
}

// ─── Shared components ───────────────────────────────────────────────────────

function StatCard({ title, icon, children }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon name={icon} size={16} color="rgba(255,255,255,0.4)" />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Divider style={styles.divider} />
      {children}
    </View>
  );
}

function RecordBadge({ value, label, color }) {
  return (
    <View style={[styles.recordBadge, { borderColor: color }]}>
      <Text style={[styles.recordValue, { color }]}>{value}</Text>
      <Text style={[styles.recordLabel, { color }]}>{label}</Text>
    </View>
  );
}

function ResultBar({ label, value, total, color }) {
  const pct = total > 0 ? value / total : 0;
  return (
    <View style={styles.resultBarRow}>
      <Text style={styles.resultBarLabel}>{label}</Text>
      <View style={styles.resultBarTrack}>
        <View style={[styles.resultBarFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.resultBarValue, { color }]}>{value}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Icon name={icon} size={16} color="rgba(255,255,255,0.35)" style={{ width: 22 }} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function CardStat({ value, color, label }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View style={[styles.cardIcon, { borderColor: color }]}>
        <Text style={[styles.cardIconVal, { color }]}>{value}</Text>
      </View>
      <Text style={styles.cardIconLabel}>{label}</Text>
    </View>
  );
}

function RankRow({ rank, name, dorsal, value, valueLabel, maxValue, color }) {
  const pct = maxValue > 0 ? value / maxValue : 0;
  return (
    <View style={styles.rankRow}>
      <Text style={styles.rankNum}>{rank}</Text>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.rankName} numberOfLines={1}>{name}</Text>
          {dorsal != null && <Text style={styles.rankMeta}>#{dorsal}</Text>}
        </View>
        <View style={styles.rankBarTrack}>
          <View style={[styles.rankBarFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
        </View>
      </View>
      <Text style={[styles.rankValue, { color }]}>{value}{valueLabel}</Text>
    </View>
  );
}

function rachaColor(tipo) {
  if (tipo === 'V') return '#43A047';
  if (tipo === 'D') return '#E53935';
  return ACCENT;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 40, gap: 12 },

  hero: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16 },
  recordRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  recordBadge: {
    alignItems: 'center', borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  recordValue: { fontSize: 32, fontWeight: 'bold' },
  recordLabel: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  heroSub: { color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 8 },
  rachaBadge: {
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4,
  },
  rachaText: { fontSize: 12, fontWeight: '600' },

  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 10,
  },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: ACCENT },
  tabLabel: { fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: '600' },
  tabLabelActive: { color: '#fff' },

  card: {
    backgroundColor: GLASS_BG, borderWidth: 1, borderColor: GLASS_BORDER,
    borderRadius: 12, padding: 14,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardTitle: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.7 },
  divider: { backgroundColor: GLASS_BORDER, marginBottom: 12 },

  goalsCompare: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  goalBig: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  goalLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 2 },
  goalSep: { fontSize: 24, color: 'rgba(255,255,255,0.2)', alignSelf: 'center' },

  homeAwayRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },

  cardsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  cardIcon: { width: 52, height: 52, borderRadius: 8, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  cardIconVal: { fontSize: 22, fontWeight: 'bold' },
  cardIconLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },

  resultBarRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  resultBarLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 13, width: 70 },
  resultBarTrack: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4 },
  resultBarFill: { height: 8, borderRadius: 4 },
  resultBarValue: { fontWeight: 'bold', fontSize: 15, width: 24, textAlign: 'right' },

  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  infoLabel: { flex: 1, color: 'rgba(255,255,255,0.65)', fontSize: 13 },
  infoValue: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  rankNum: { color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: 'bold', width: 18, textAlign: 'center' },
  rankName: { color: '#fff', fontSize: 13, fontWeight: '600' },
  rankMeta: { color: 'rgba(255,255,255,0.35)', fontSize: 11 },
  rankBarTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, marginTop: 4 },
  rankBarFill: { height: 5, borderRadius: 3 },
  rankValue: { fontWeight: 'bold', fontSize: 14, minWidth: 40, textAlign: 'right' },
  rankCards: { flexDirection: 'row', gap: 4 },
  cardChip: { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2, justifyContent: 'center', alignItems: 'center' },
  cardChipTxt: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyText: { color: 'rgba(255,255,255,0.35)', fontSize: 15, fontWeight: '600' },
  emptyHint: { color: 'rgba(255,255,255,0.2)', fontSize: 12, textAlign: 'center' },
});
