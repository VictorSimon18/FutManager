import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Card, Avatar, FAB, Chip } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

export default function HomeCoachScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Surface style={styles.header} elevation={2}>
          <View style={styles.headerContent}>
            <View>
              <Text variant="headlineSmall" style={styles.welcomeText}>
                Bienvenido, Entrenador
              </Text>
              <Text variant="bodyMedium" style={styles.headerSubtext}>
                Panel de gestión del equipo
              </Text>
            </View>
            <Avatar.Icon size={56} icon="whistle" style={styles.avatar} />
          </View>
        </Surface>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Surface style={[styles.statCard, styles.orangeCard]} elevation={1}>
            <Icon name="account-group" size={32} color="#FF6F00" />
            <Text variant="headlineMedium" style={styles.statNumber}>
              24
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Jugadores
            </Text>
          </Surface>

          <Surface style={[styles.statCard, styles.greenCard]} elevation={1}>
            <Icon name="calendar-check" size={32} color="#00AA13" />
            <Text variant="headlineMedium" style={styles.statNumber}>
              12
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Entrenamientos
            </Text>
          </Surface>

          <Surface style={[styles.statCard, styles.blueCard]} elevation={1}>
            <Icon name="trophy" size={32} color="#1E88E5" />
            <Text variant="headlineMedium" style={styles.statNumber}>
              8
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Partidos
            </Text>
          </Surface>
        </View>

        {/* Próximo Evento */}
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Próximo evento
        </Text>
        <Card style={styles.eventCard}>
          <Card.Content>
            <View style={styles.eventHeader}>
              <Chip icon="calendar" style={styles.eventChip}>
                Mañana, 18:00
              </Chip>
              <Chip icon="soccer-field" mode="outlined">
                Fútbol 11
              </Chip>
            </View>
            <Text variant="headlineSmall" style={styles.eventTitle}>
              Partido vs. Real Madrid CF
            </Text>
            <Text variant="bodyMedium" style={styles.eventLocation}>
              Estadio Santiago Bernabéu
            </Text>
            <View style={styles.eventFooter}>
              <View style={styles.attendanceContainer}>
                <Icon name="account-check" size={20} color="#00AA13" />
                <Text variant="bodyMedium" style={styles.attendanceText}>
                  22/24 confirmados
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Acciones rápidas
        </Text>
        <View style={styles.actionsContainer}>
          <Surface style={styles.actionCard} elevation={1}>
            <Icon name="calendar-plus" size={40} color="#FF6F00" />
            <Text variant="bodyMedium" style={styles.actionText}>
              Programar entrenamiento
            </Text>
          </Surface>

          <Surface style={styles.actionCard} elevation={1}>
            <Icon name="clipboard-text" size={40} color="#00AA13" />
            <Text variant="bodyMedium" style={styles.actionText}>
              Ver alineación
            </Text>
          </Surface>

          <Surface style={styles.actionCard} elevation={1}>
            <Icon name="chart-line" size={40} color="#1E88E5" />
            <Text variant="bodyMedium" style={styles.actionText}>
              Estadísticas
            </Text>
          </Surface>

          <Surface style={styles.actionCard} elevation={1}>
            <Icon name="message-text" size={40} color="#9C27B0" />
            <Text variant="bodyMedium" style={styles.actionText}>
              Mensajes
            </Text>
          </Surface>
        </View>
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        color="#FFFFFF"
        label="Nueva tarea"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  headerSubtext: {
    color: '#666',
    marginTop: 4,
  },
  avatar: {
    backgroundColor: '#FF6F00',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  orangeCard: {
    borderTopWidth: 3,
    borderTopColor: '#FF6F00',
  },
  greenCard: {
    borderTopWidth: 3,
    borderTopColor: '#00AA13',
  },
  blueCard: {
    borderTopWidth: 3,
    borderTopColor: '#1E88E5',
  },
  statNumber: {
    fontWeight: 'bold',
    marginTop: 8,
    color: '#1A1A1A',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 12,
    color: '#1A1A1A',
  },
  eventCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  eventHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  eventChip: {
    backgroundColor: '#E8F5E9',
  },
  eventTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1A1A1A',
  },
  eventLocation: {
    color: '#666',
    marginBottom: 12,
  },
  eventFooter: {
    marginTop: 8,
  },
  attendanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attendanceText: {
    color: '#00AA13',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  actionText: {
    marginTop: 12,
    textAlign: 'center',
    color: '#1A1A1A',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#FF6F00',
  },
});
