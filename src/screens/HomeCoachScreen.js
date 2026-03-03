import React, { useContext, useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Surface, Card, Avatar, FAB, Chip } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
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

  // Calcular el próximo evento (partido o entrenamiento, el que sea antes)
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

  // Etiqueta de racha actual
  function rachaLabel(tipo, cantidad) {
    if (!tipo || cantidad === 0) return null;
    const nombre = tipo === 'V' ? 'victorias' : tipo === 'D' ? 'derrotas' : 'empates';
    return `${cantidad} ${nombre} consecutivas`;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Surface style={styles.header} elevation={2}>
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
        </Surface>

        {/* Indicador de carga */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#FF6F00" style={styles.loader} />
        ) : (
          <>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <Surface style={[styles.statCard, styles.orangeCard]} elevation={1}>
                <Icon name="account-group" size={32} color="#FF6F00" />
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {players.length}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Jugadores
                </Text>
              </Surface>

              <Surface style={[styles.statCard, styles.greenCard]} elevation={1}>
                <Icon name="calendar-check" size={32} color="#00AA13" />
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {trainings.length}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Entrenamientos
                </Text>
              </Surface>

              <Surface style={[styles.statCard, styles.blueCard]} elevation={1}>
                <Icon name="trophy" size={32} color="#1E88E5" />
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {matches.length}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Partidos
                </Text>
              </Surface>
            </View>

            {/* Resumen del equipo (estadísticas reales) */}
            {!loadingTeamStats && teamStats && teamStats.partidos_jugados > 0 && (
              <>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Rendimiento del equipo
                </Text>
                <Card style={styles.teamStatsCard}>
                  <Card.Content>
                    {/* Fila principal de resultados */}
                    <View style={styles.teamStatsRow}>
                      <View style={styles.teamStatItem}>
                        <Text variant="headlineMedium" style={[styles.teamStatNum, { color: '#1A1A1A' }]}>
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
                        <Text variant="headlineMedium" style={[styles.teamStatNum, { color: '#FF6F00' }]}>
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

                    {/* Goles y % victorias */}
                    <View style={styles.teamStatsRow}>
                      <View style={styles.teamStatItem}>
                        <Text variant="titleLarge" style={[styles.teamStatNum, { color: '#1A1A1A' }]}>
                          {teamStats.goles_favor}
                        </Text>
                        <Text variant="bodySmall" style={styles.teamStatLabel}>Goles a favor</Text>
                      </View>
                      <View style={styles.teamStatItem}>
                        <Text variant="titleLarge" style={[styles.teamStatNum, { color: '#757575' }]}>
                          {teamStats.goles_contra}
                        </Text>
                        <Text variant="bodySmall" style={styles.teamStatLabel}>Goles en contra</Text>
                      </View>
                      <View style={styles.teamStatItem}>
                        <Text variant="titleLarge" style={[styles.teamStatNum, { color: '#43A047' }]}>
                          {teamStats.porcentaje_victorias}%
                        </Text>
                        <Text variant="bodySmall" style={styles.teamStatLabel}>% Victorias</Text>
                      </View>
                    </View>

                    {/* Racha y top goleador */}
                    {(teamStats.racha > 0 || teamStats.top_goleador) && (
                      <View style={styles.teamExtras}>
                        {teamStats.racha > 1 && (
                          <View style={styles.teamExtraRow}>
                            <Icon name="fire" size={16} color="#FF6F00" />
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
                  </Card.Content>
                </Card>
              </>
            )}

            {/* Próximo Evento */}
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Próximo evento
            </Text>
            {proximoEvento ? (
              <Card style={styles.eventCard}>
                <Card.Content>
                  <View style={styles.eventHeader}>
                    <Chip icon="calendar" style={styles.eventChip}>
                      {formatDate(proximoEvento.fecha)}{proximoEvento.hora ? `, ${formatTime(proximoEvento.hora)}` : ''}
                    </Chip>
                    {proximoEvento.modalidad && (
                      <Chip icon="soccer-field" mode="outlined">
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
                </Card.Content>
              </Card>
            ) : (
              <Card style={styles.eventCard}>
                <Card.Content>
                  <Text variant="bodyMedium" style={styles.noEventText}>
                    No hay eventos próximos programados
                  </Text>
                </Card.Content>
              </Card>
            )}

            {/* Quick Actions */}
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Acciones rápidas
            </Text>
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('TrainingForm')}
              >
                <Surface style={styles.actionSurface} elevation={1}>
                  <Icon name="calendar-plus" size={40} color="#FF6F00" />
                  <Text variant="bodyMedium" style={styles.actionText}>
                    Programar entrenamiento
                  </Text>
                </Surface>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('PlayerList')}
              >
                <Surface style={styles.actionSurface} elevation={1}>
                  <Icon name="clipboard-text" size={40} color="#00AA13" />
                  <Text variant="bodyMedium" style={styles.actionText}>
                    Ver plantilla
                  </Text>
                </Surface>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('MatchList')}
              >
                <Surface style={styles.actionSurface} elevation={1}>
                  <Icon name="chart-line" size={40} color="#1E88E5" />
                  <Text variant="bodyMedium" style={styles.actionText}>
                    Partidos
                  </Text>
                </Surface>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('TrainingList')}
              >
                <Surface style={styles.actionSurface} elevation={1}>
                  <Icon name="dumbbell" size={40} color="#9C27B0" />
                  <Text variant="bodyMedium" style={styles.actionText}>
                    Entrenamientos
                  </Text>
                </Surface>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* FAB */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContent: { paddingBottom: 100 },
  header: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { fontWeight: 'bold', color: '#1A1A1A' },
  headerSubtext: { color: '#666', marginTop: 4 },
  avatar: { backgroundColor: '#FF6F00' },
  loader: { marginTop: 60 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, gap: 12 },
  statCard: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#FFFFFF' },
  orangeCard: { borderTopWidth: 3, borderTopColor: '#FF6F00' },
  greenCard: { borderTopWidth: 3, borderTopColor: '#00AA13' },
  blueCard: { borderTopWidth: 3, borderTopColor: '#1E88E5' },
  statNumber: { fontWeight: 'bold', marginTop: 8, color: '#1A1A1A' },
  statLabel: { color: '#666', marginTop: 4 },
  sectionTitle: { fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 12, color: '#1A1A1A' },
  // Rendimiento del equipo
  teamStatsCard: { marginHorizontal: 20, marginBottom: 24, backgroundColor: '#FFFFFF' },
  teamStatsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  teamStatItem: { alignItems: 'center' },
  teamStatNum: { fontWeight: 'bold' },
  teamStatLabel: { color: '#888', marginTop: 2 },
  teamStatsDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 8 },
  teamExtras: { marginTop: 8, gap: 4 },
  teamExtraRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  teamExtraText: { color: '#555' },
  // Próximo evento
  eventCard: { marginHorizontal: 20, marginBottom: 24, backgroundColor: '#FFFFFF' },
  eventHeader: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  eventChip: { backgroundColor: '#E8F5E9' },
  eventTitle: { fontWeight: 'bold', marginBottom: 8, color: '#1A1A1A' },
  eventLocation: { color: '#666', marginBottom: 12 },
  eventFooter: { marginTop: 8 },
  attendanceContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  attendanceText: { color: '#00AA13', fontWeight: '600' },
  noEventText: { color: '#999', fontStyle: 'italic' },
  // Acciones rápidas
  actionsContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  actionCard: { width: '48%' },
  actionSurface: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    minHeight: 110,
  },
  actionText: { marginTop: 12, textAlign: 'center', color: '#1A1A1A' },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#FF6F00' },
});
