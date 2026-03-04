import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Avatar, Button, Divider, ActivityIndicator, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import { getPlayerById, deletePlayer } from '../../database/services/playerService';
import { getSeasonStats, getStatsByPlayer } from '../../database/services/statsService';
import { formatDate } from '../../utils/dateUtils';
import { getPositionColor } from '../../utils/positionUtils';
import { usePlayerAttendance } from '../../hooks/usePlayerAttendance';
import StatBadge from '../../components/StatBadge';
import ConfirmDialog from '../../components/ConfirmDialog';

const GLASS_BG = 'rgba(255,255,255,0.08)';
const GLASS_BORDER = 'rgba(255,255,255,0.13)';

function matchResult(gF, gC) {
  if (gF > gC) return { label: 'V', color: '#43A047' };
  if (gF < gC) return { label: 'D', color: '#E53935' };
  return { label: 'E', color: '#105E7A' };
}

export default function PlayerDetailScreen({ route, navigation }) {
  const { playerId } = route.params;
  const { equipoId } = useContext(AuthContext);

  const [player, setPlayer] = useState(null);
  const [seasonStats, setSeasonStats] = useState(null);
  const [matchStats, setMatchStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { attendance } = usePlayerAttendance(playerId, equipoId);

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

  const posColor = getPositionColor(player.posicion);

  const initials = player.nombre
    ? player.nombre.trim().split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Cabecera jugador */}
        <View style={[styles.headerCard, { borderTopColor: posColor }]}>
          <View style={styles.headerContent}>
            <Avatar.Text
              size={72}
              label={initials}
              style={[styles.avatar, { backgroundColor: posColor }]}
              labelStyle={styles.avatarLabel}
            />
            <View style={styles.headerInfo}>
              <Text variant="headlineSmall" style={styles.nombre}>{player.nombre}</Text>
              {player.posicion ? (
                <Text variant="bodyMedium" style={[styles.posicion, { color: posColor }]}>
                  {player.posicion}
                </Text>
              ) : null}
              <View style={styles.chips}>
                {player.dorsal != null && (
                  <View style={styles.chip}>
                    <Icon name="tshirt-crew" size={14} color={posColor} />
                    <Text variant="bodySmall" style={styles.chipText}>#{player.dorsal}</Text>
                  </View>
                )}
                {player.pie_dominante && (
                  <View style={styles.chip}>
                    <Icon name="shoe-sneaker" size={14} color={posColor} />
                    <Text variant="bodySmall" style={styles.chipText}>{player.pie_dominante}</Text>
                  </View>
                )}
                {player.sexo && (
                  <View style={styles.chip}>
                    <Icon name="account" size={14} color={posColor} />
                    <Text variant="bodySmall" style={styles.chipText}>{player.sexo}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Datos personales */}
        <View style={styles.card}>
          <Text variant="titleSmall" style={styles.sectionTitle}>Datos personales</Text>
          <View style={styles.dataRow}>
            <Icon name="cake" size={18} color="rgba(255,255,255,0.35)" />
            <Text variant="bodyMedium" style={styles.dataText}>
              {formatDate(player.fecha_nacimiento)}
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Icon name="human-male-height" size={18} color="rgba(255,255,255,0.35)" />
            <Text variant="bodyMedium" style={styles.dataText}>
              {player.altura ? `${player.altura} m` : '—'}
              {'  '}·{'  '}
              {player.peso ? `${player.peso} kg` : '—'}
            </Text>
          </View>
        </View>

        {/* Estadísticas de temporada */}
        <View style={styles.card}>
          <Text variant="titleSmall" style={styles.sectionTitle}>Estadísticas de temporada</Text>
          <View style={styles.statsRow}>
            <StatBadge icon="soccer-field" value={seasonStats?.partidos_jugados ?? 0} label="Partidos" color="#1E88E5" />
            <StatBadge icon="soccer" value={seasonStats?.total_goles ?? 0} label="Goles" color="#43A047" />
            <StatBadge icon="hand-okay" value={seasonStats?.total_asistencias ?? 0} label="Asist." color="#105E7A" />
            <StatBadge icon="timer" value={seasonStats?.total_minutos ?? 0} label="Minutos" color="#757575" />
          </View>
          <Divider style={styles.divider} />
          <View style={styles.statsRow}>
            <StatBadge icon="card-text" value={seasonStats?.total_amarillas ?? 0} label="Amarillas" color="#FDD835" />
            <StatBadge icon="card-text" value={seasonStats?.total_rojas ?? 0} label="Rojas" color="#E53935" />
            <StatBadge icon="shield-account" value={seasonStats?.total_entradas ?? 0} label="Entradas" color="#1E88E5" />
            <StatBadge icon="star-circle" value={
              seasonStats?.valoracion_media != null
                ? Number(seasonStats.valoracion_media).toFixed(1)
                : '—'
            } label="Valoración" color="#105E7A" />
          </View>
        </View>

        {/* Asistencia a entrenamientos */}
        <View style={styles.card}>
          <Text variant="titleSmall" style={styles.sectionTitle}>Asistencia a entrenamientos</Text>
          {attendance ? (
            <>
              <View style={styles.attendanceRow}>
                <Icon name="calendar-check" size={18} color="#00AA13" />
                <Text variant="bodyMedium" style={styles.attendanceText}>
                  {attendance.asistidos} / {attendance.total} entrenamientos — {attendance.porcentaje}%
                </Text>
              </View>
              <ProgressBar
                progress={attendance.total > 0 ? attendance.asistidos / attendance.total : 0}
                color="#00AA13"
                style={styles.progressBar}
              />
              <Text variant="bodySmall" style={styles.attendanceHint}>
                {attendance.porcentaje >= 80
                  ? 'Buena asistencia'
                  : attendance.porcentaje >= 50
                  ? 'Asistencia regular'
                  : 'Asistencia baja'}
              </Text>
            </>
          ) : (
            <Text variant="bodySmall" style={styles.emptyText}>Sin datos de asistencia.</Text>
          )}
        </View>

        {/* Historial de partidos */}
        {matchStats.length > 0 && (
          <View style={styles.card}>
            <Text variant="titleSmall" style={styles.sectionTitle}>Últimos partidos</Text>
            {matchStats.slice(0, 5).map(stat => {
              const res = matchResult(stat.goles_favor, stat.goles_contra);
              const mostrarRoja = stat.tarjetas_rojas > 0 || stat.tarjetas_amarillas >= 2;
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
                    {(stat.tarjetas_amarillas > 0 || mostrarRoja) && (
                      <Text variant="bodySmall" style={styles.matchStatText}>
                        {stat.tarjetas_amarillas > 0 ? `🟨 ${stat.tarjetas_amarillas}` : ''}
                        {mostrarRoja ? '  🟥 1' : ''}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Acciones */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="pencil"
            onPress={() => navigation.navigate('PlayerForm', { playerId })}
            buttonColor="#105E7A"
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f2027' },
  headerCard: {
    backgroundColor: GLASS_BG,
    borderRadius: 12,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    padding: 16,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {},
  avatarLabel: { color: '#fff', fontWeight: 'bold', fontSize: 24 },
  headerInfo: { flex: 1 },
  nombre: { fontWeight: 'bold', color: '#FFFFFF' },
  posicion: { fontWeight: '600', marginTop: 2 },
  chips: { flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chipText: { color: 'rgba(255,255,255,0.6)' },
  card: {
    backgroundColor: GLASS_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    padding: 16,
  },
  sectionTitle: { fontWeight: 'bold', color: '#105E7A', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  dataRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  dataText: { color: 'rgba(255,255,255,0.65)' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  divider: { marginVertical: 8, backgroundColor: 'rgba(255,255,255,0.08)' },
  attendanceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  attendanceText: { color: '#FFFFFF', fontWeight: '600' },
  progressBar: { height: 8, borderRadius: 4, marginBottom: 6 },
  attendanceHint: { color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' },
  emptyText: { color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' },
  matchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  resultBadge: { width: 28, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  resultLabel: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  matchInfo: { flex: 1 },
  matchRival: { fontWeight: '600', color: '#FFFFFF' },
  matchDate: { color: 'rgba(255,255,255,0.45)' },
  matchStats: {},
  matchStatText: { color: 'rgba(255,255,255,0.55)' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  actionBtn: { flex: 1, borderRadius: 8 },
  deleteBtn: { borderColor: '#D32F2F' },
});
