import React, { useContext, useState, useCallback } from 'react';
import {
  View, StyleSheet, FlatList, Alert,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../../context/AuthContext';
import { getTeamsByPlayerUserId } from '../../database/services/teamService';

const PLAYER_ACCENT = '#00AA13';
const GLASS_BG = 'rgba(255,255,255,0.08)';
const GLASS_BORDER = 'rgba(255,255,255,0.13)';

export default function PlayerTeamSelectionScreen() {
  const { user, selectPlayerTeam } = useContext(AuthContext);

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getTeamsByPlayerUserId(user.id);
      setTeams(result);
    } catch (e) {
      console.error('[PlayerTeamSelection] Error cargando equipos:', e);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useFocusEffect(useCallback(() => { loadTeams(); }, [loadTeams]));

  async function handleSelectTeam(team) {
    try {
      await selectPlayerTeam(team.id);
    } catch {
      Alert.alert('Error', 'No se pudo acceder al equipo.');
    }
  }

  const renderTeam = ({ item }) => (
    <TouchableOpacity
      style={styles.teamCard}
      onPress={() => handleSelectTeam(item)}
      activeOpacity={0.75}
    >
      <View style={styles.teamAccent} />
      <View style={styles.teamInfo}>
        <Text style={styles.teamName} numberOfLines={1}>{item.nombre}</Text>
        <View style={styles.teamMeta}>
          {item.categoria ? (
            <View style={styles.metaItem}>
              <Icon name="account-group" size={12} color="rgba(255,255,255,0.5)" />
              <Text style={styles.metaText}>{item.categoria}</Text>
            </View>
          ) : null}
          {item.modalidad ? (
            <View style={styles.metaItem}>
              <Icon name="soccer" size={12} color="rgba(255,255,255,0.5)" />
              <Text style={styles.metaText}>{item.modalidad}</Text>
            </View>
          ) : null}
          {item.temporada ? (
            <View style={styles.metaItem}>
              <Icon name="calendar" size={12} color="rgba(255,255,255,0.5)" />
              <Text style={styles.metaText}>{item.temporada}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Icon name="chevron-right" size={24} color={PLAYER_ACCENT} style={styles.chevron} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text variant="headlineSmall" style={styles.welcomeText}>Mis Equipos</Text>
            <Text variant="bodyMedium" style={styles.headerSubtext}>
              Selecciona el equipo al que acceder
            </Text>
          </View>
          <Avatar.Icon size={56} icon="run" style={styles.avatar} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={PLAYER_ACCENT} style={styles.loader} />
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTeam}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Icon name="shield-off-outline" size={72} color="rgba(255,255,255,0.12)" />
              <Text style={styles.emptyTitle}>Aún no perteneces a ningún equipo</Text>
              <Text style={styles.emptySubtitle}>
                Tu entrenador te añadirá al equipo cuando estés inscrito. Vuelve a comprobarlo más tarde.
              </Text>
              <View style={styles.emptyHint}>
                <Icon name="information-outline" size={16} color="rgba(255,255,255,0.35)" />
                <Text style={styles.emptyHintText}>
                  La inscripción la gestiona el entrenador desde su panel
                </Text>
              </View>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },

  header: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: GLASS_BORDER,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtext: { color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  avatar: { backgroundColor: PLAYER_ACCENT },
  loader: { marginTop: 60 },

  listContent: { padding: 16, paddingBottom: 40 },

  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  teamAccent: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: PLAYER_ACCENT,
  },
  teamInfo: { flex: 1, paddingVertical: 14, paddingHorizontal: 14 },
  teamName: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
  teamMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  chevron: { marginRight: 14 },

  emptyWrap: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  emptyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  emptyHintText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    flex: 1,
  },
});
