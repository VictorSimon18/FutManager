import React, { useContext, useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Avatar, FAB, Chip } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { usePlayers } from '../hooks/usePlayers';
import { useTrainings } from '../hooks/useTrainings';
import { useMatches } from '../hooks/useMatches';
import { useTeamStats } from '../hooks/useTeamStats';
import { formatDate, formatTime } from '../utils/dateUtils';

export default function HomeCoachScreen({ navigation }) {
  const { user, equipoId } = useContext(AuthContext);

  const { players, loading: loadingPlayers } = usePlayers(equipoId);
  const { trainings, upcomingTrainings, loading: loadingTrainings } = useTrainings(equipoId);
  const { matches, upcomingMatches, loading: loadingMatches } = useMatches(equipoId);
  const { stats: teamStats, loading: loadingTeamStats } = useTeamStats(equipoId);

  const isLoading = loadingPlayers || loadingTrainings || loadingMatches;

  const proximoEvento = useMemo(() => {
    const eventos = [];

    if (upcomingMatches.length > 0) {
      const p = upcomingMatches[0];
      eventos.push({
        tipo: 'partido',
        titulo: `Partido vs. ${p.rival}`,
        fecha: p.fecha,
        hora: p.hora,
        ubicacion: p.ubicacion,
        modalidad: p.modalidad,
      });
    }

    if (upcomingTrainings.length > 0) {
      const t = upcomingTrainings[0];
      eventos.push({
        tipo: 'entrenamiento',
        titulo: t.tipo || 'Entrenamiento',
        fecha: t.fecha,
        hora: t.hora_inicio,
        ubicacion: t.ubicacion,
        modalidad: null,
      });
    }

    if (eventos.length === 0) return null;

    eventos.sort((a, b) => {
      const da = new Date(`${a.fecha}T${a.hora || '00:00'}`);
      const db = new Date(`${b.fecha}T${b.hora || '00:00'}`);
      return da - db;
    });

    return eventos[0];
  }, [upcomingMatches, upcomingTrainings]);

  function rachaLabel(tipo, cantidad) {
    if (!tipo || cantidad === 0) return null;
    const nombre = tipo === 'V' ? 'victorias' : tipo === 'D' ? 'derrotas' : 'empates';
    return `${cantidad} ${nombre} consecutivas`;
  }

  return (
    <View style={styles.container}>
      {/* Fondo gradiente oscuro premium */}
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text variant="headlineSmall" style={styles.welcomeText}>
                Bienvenido, {user?.nombre?.split(' ')[0] || 'Entrenador'}
              </Text>
              <Text variant="bodyMedium" style={styles.headerSubtext}>
                Panel de gestión del equipo
              </Text>
            </View>
            <Avatar.Icon size={56} icon="whistle" style={styles.avatar} />
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#105E7A" style={styles.loader} />
        ) : (
          <>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, styles.orangeCard]}>
                <Icon name="account-group" size={32} color="#D94865" />
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {players.length}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Jugadores
                </Text>
              </View>

              <View style={[styles.statCard, styles.greenCard]}>
                <Icon name="calendar-check" size={32} color="#00AA13" />
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {trainings.length}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Entrenamientos
                </Text>
              </View>

              <View style={[styles.statCard, styles.blueCard]}>
                <Icon name="trophy" size={32} color="#1E88E5" />
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {matches.length}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Partidos
                </Text>
              </View>
            </View>

            {/* Rendimiento del equipo */}
            {!loadingTeamStats && teamStats && teamStats.partidos_jugados > 0 && (
              <>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Rendimiento del equipo
                </Text>
                <View style={styles.glassCard}>
                  <View style={styles.teamStatsRow}>
                    <View style={styles.teamStatItem}>
                      <Text variant="headlineMedium" style={[styles.teamStatNum, { color: '#FFFFFF' }]}>
                        {teamStats.partidos_jugados}
                      </Text>
                      <Text variant="bodySmall" style={styles.teamStatLabel}>Jugados</Text>
                    </View>
                    <View style={styles.teamStatItem}>
                      <Text variant="headlineMedium" style={[styles.teamStatNum, { color: '#43A047' }]}>
                        {teamStats.ganados}
                      </Text>
                      <Text variant="bodySmall" style={styles.teamStatLabel}>Victorias</Text>
                    </View>
                    <View style={styles.teamStatItem}>
                      <Text variant="headlineMedium" style={[styles.teamStatNum, { color: '#105E7A' }]}>
                        {teamStats.empatados}
                      </Text>
                      <Text variant="bodySmall" style={styles.teamStatLabel}>Empates</Text>
                    </View>
                    <View style={styles.teamStatItem}>
                      <Text variant="headlineMedium" style={[styles.teamStatNum, { color: '#E53935' }]}>
                        {teamStats.perdidos}
                      </Text>
                      <Text variant="bodySmall" style={styles.teamStatLabel}>Derrotas</Text>
                    </View>
                  </View>

                  <View style={styles.teamStatsDivider} />

                  <View style={styles.teamStatsRow}>
                    <View style={styles.teamStatItem}>
                      <Text variant="titleLarge" style={[styles.teamStatNum, { color: '#FFFFFF' }]}>
                        {teamStats.goles_favor}
                      </Text>
                      <Text variant="bodySmall" style={styles.teamStatLabel}>Goles a favor</Text>
                    </View>
                    <View style={styles.teamStatItem}>
                      <Text variant="titleLarge" style={[styles.teamStatNum, { color: '#D94865' }]}>
                        {teamStats.goles_contra}
                      </Text>
                      <Text variant="bodySmall" style={styles.teamStatLabel}>En contra</Text>
                    </View>
                    <View style={styles.teamStatItem}>
                      <Text variant="titleLarge" style={[styles.teamStatNum, { color: '#43A047' }]}>
                        {teamStats.porcentaje_victorias}%
                      </Text>
                      <Text variant="bodySmall" style={styles.teamStatLabel}>% Victorias</Text>
                    </View>
                  </View>

                  {(teamStats.racha > 0 || teamStats.top_goleador) && (
                    <View style={styles.teamExtras}>
                      {teamStats.racha > 1 && (
                        <View style={styles.teamExtraRow}>
                          <Icon name="fire" size={16} color="#105E7A" />
                          <Text variant="bodySmall" style={styles.teamExtraText}>
                            Racha: {rachaLabel(teamStats.racha_tipo, teamStats.racha)}
                          </Text>
                        </View>
                      )}
                      {teamStats.top_goleador && teamStats.top_goleador_goles > 0 && (
                        <View style={styles.teamExtraRow}>
                          <Icon name="soccer" size={16} color="#43A047" />
                          <Text variant="bodySmall" style={styles.teamExtraText}>
                            Máximo goleador: {teamStats.top_goleador} ({teamStats.top_goleador_goles} goles)
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Próximo Evento */}
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Próximo evento
            </Text>
            {proximoEvento ? (
              <View style={styles.glassCard}>
                <View style={styles.eventHeader}>
                  <Chip icon="calendar" style={styles.eventChip} textStyle={styles.chipText}>
                    {formatDate(proximoEvento.fecha)}{proximoEvento.hora ? `, ${formatTime(proximoEvento.hora)}` : ''}
                  </Chip>
                  {proximoEvento.modalidad && (
                    <Chip icon="soccer-field" mode="outlined" style={styles.eventChipOutlined} textStyle={styles.chipText}>
                      {proximoEvento.modalidad}
                    </Chip>
                  )}
                </View>
                <Text variant="headlineSmall" style={styles.eventTitle}>
                  {proximoEvento.titulo}
                </Text>
                {proximoEvento.ubicacion ? (
                  <Text variant="bodyMedium" style={styles.eventLocation}>
                    {proximoEvento.ubicacion}
                  </Text>
                ) : null}
                <View style={styles.eventFooter}>
                  <View style={styles.attendanceContainer}>
                    <Icon name="account-check" size={20} color="#00AA13" />
                    <Text variant="bodyMedium" style={styles.attendanceText}>
                      {players.length} jugadores en plantilla
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.glassCard}>
                <Text variant="bodyMedium" style={styles.noEventText}>
                  No hay eventos próximos programados
                </Text>
              </View>
            )}

            {/* Acciones rápidas */}
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Acciones rápidas
            </Text>
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('TrainingForm')}
              >
                <View style={styles.actionSurface}>
                  <Icon name="calendar-plus" size={40} color="#105E7A" />
                  <Text variant="bodyMedium" style={styles.actionText}>
                    Programar entrenamiento
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('PlayerList')}
              >
                <View style={styles.actionSurface}>
                  <Icon name="clipboard-text" size={40} color="#00AA13" />
                  <Text variant="bodyMedium" style={styles.actionText}>
                    Ver plantilla
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('MatchList')}
              >
                <View style={styles.actionSurface}>
                  <Icon name="chart-line" size={40} color="#1E88E5" />
                  <Text variant="bodyMedium" style={styles.actionText}>
                    Partidos
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('TrainingList')}
              >
                <View style={styles.actionSurface}>
                  <Icon name="dumbbell" size={40} color="#9C27B0" />
                  <Text variant="bodyMedium" style={styles.actionText}>
                    Entrenamientos
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        color="#FFFFFF"
        label="Nuevo partido"
        onPress={() => navigation.navigate('MatchForm')}
      />
    </View>
  );
}

const GLASS_BG = 'rgba(255,255,255,0.08)';
const GLASS_BORDER = 'rgba(255,255,255,0.13)';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },
  scrollContent: { paddingBottom: 100 },

  // Header
  header: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: GLASS_BORDER,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtext: { color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  avatar: { backgroundColor: '#105E7A' },
  loader: { marginTop: 60 },

  // Stat cards
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, gap: 12 },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  orangeCard: { borderTopWidth: 3, borderTopColor: '#105E7A' },
  greenCard: { borderTopWidth: 3, borderTopColor: '#00AA13' },
  blueCard: { borderTopWidth: 3, borderTopColor: '#1E88E5' },
  statNumber: { fontWeight: 'bold', marginTop: 8, color: '#FFFFFF' },
  statLabel: { color: 'rgba(255,255,255,0.5)', marginTop: 4 },

  sectionTitle: {
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 12,
    color: '#FFFFFF',
  },

  // Glass card base (replaces Paper Card/Surface)
  glassCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },

  // Team stats
  teamStatsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  teamStatItem: { alignItems: 'center' },
  teamStatNum: { fontWeight: 'bold' },
  teamStatLabel: { color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  teamStatsDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 8 },
  teamExtras: { marginTop: 10, gap: 6 },
  teamExtraRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  teamExtraText: { color: 'rgba(255,255,255,0.65)' },

  // Event card
  eventHeader: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  eventChip: { backgroundColor: 'rgba(0,170,19,0.2)' },
  eventChipOutlined: { borderColor: 'rgba(255,255,255,0.2)' },
  chipText: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  eventTitle: { fontWeight: 'bold', marginBottom: 8, color: '#FFFFFF' },
  eventLocation: { color: 'rgba(255,255,255,0.5)', marginBottom: 12 },
  eventFooter: { marginTop: 8 },
  attendanceContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  attendanceText: { color: '#00AA13', fontWeight: '600' },
  noEventText: { color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' },

  // Action cards
  actionsContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  actionCard: { width: '48%' },
  actionSurface: {
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    height: 120,
  },
  actionText: { marginTop: 12, textAlign: 'center', color: '#FFFFFF' },

  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#105E7A' },
});
