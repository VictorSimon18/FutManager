import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import {
  View, StyleSheet, FlatList, TouchableOpacity, Image,
  TextInput, Alert,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from '../../context/AuthContext';
import { getAllTeams } from '../../database/services/teamService';

const FAN_COLOR = '#1E88E5';
const GLASS_BG = 'rgba(255,255,255,0.07)';
const GLASS_BORDER = 'rgba(255,255,255,0.12)';
const FAV_KEY = 'fan_favorite_team_ids';

async function loadFavIds() {
  try {
    const raw = await SecureStore.getItemAsync(FAV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveFavIds(ids) {
  await SecureStore.setItemAsync(FAV_KEY, JSON.stringify(ids));
}

export default function FanTeamSearchScreen() {
  const { selectFanTeam } = useContext(AuthContext);

  const [teams, setTeams] = useState([]);
  const [favIds, setFavIds] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(null);

  const load = useCallback(async () => {
    try {
      const [allTeams, ids] = await Promise.all([getAllTeams(), loadFavIds()]);
      setTeams(allTeams);
      setFavIds(ids);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los equipos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleFav = useCallback(async (teamId) => {
    setFavIds(prev => {
      const next = prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId];
      saveFavIds(next);
      return next;
    });
  }, []);

  const handleSelect = useCallback(async (team) => {
    setSelecting(team.id);
    try {
      await selectFanTeam(team.id);
    } catch (e) {
      Alert.alert('Error', e.message);
      setSelecting(null);
    }
  }, [selectFanTeam]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter(t =>
      t.nombre?.toLowerCase().includes(q) ||
      t.categoria?.toLowerCase().includes(q)
    );
  }, [teams, query]);

  const favTeams = useMemo(
    () => teams.filter(t => favIds.includes(t.id)),
    [teams, favIds]
  );

  const showFavs = favTeams.length > 0 && !query.trim();

  if (loading) {
    return (
      <View style={styles.centered}>
        <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={FAN_COLOR} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Icon name="magnify" size={20} color="rgba(255,255,255,0.4)" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar equipo..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
            <Icon name="close-circle" size={18} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          showFavs ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="star" size={15} color="#FFC107" />
                <Text style={styles.sectionTitle}>Favoritos</Text>
              </View>
              {favTeams.map(team => (
                <TeamCard
                  key={team.id}
                  team={team}
                  isFav
                  selecting={selecting === team.id}
                  onSelect={() => handleSelect(team)}
                  onToggleFav={() => toggleFav(team.id)}
                />
              ))}
              <View style={[styles.sectionHeader, { marginTop: 16 }]}>
                <Icon name="account-group" size={15} color="rgba(255,255,255,0.4)" />
                <Text style={styles.sectionTitle}>Todos los equipos</Text>
              </View>
            </View>
          ) : (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="account-group" size={15} color="rgba(255,255,255,0.4)" />
                <Text style={styles.sectionTitle}>
                  {query.trim() ? `Resultados (${filtered.length})` : 'Todos los equipos'}
                </Text>
              </View>
            </View>
          )
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="soccer" size={48} color="rgba(255,255,255,0.15)" />
            <Text style={styles.emptyText}>No se encontraron equipos</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TeamCard
            team={item}
            isFav={favIds.includes(item.id)}
            selecting={selecting === item.id}
            onSelect={() => handleSelect(item)}
            onToggleFav={() => toggleFav(item.id)}
          />
        )}
      />
    </View>
  );
}

function TeamCard({ team, isFav, selecting, onSelect, onToggleFav }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={onSelect}
      disabled={!!selecting}
    >
      {/* Shield / avatar */}
      <View style={styles.shieldWrap}>
        {team.escudo_url ? (
          <Image source={{ uri: team.escudo_url }} style={styles.shield} />
        ) : (
          <View style={styles.shieldPlaceholder}>
            <Icon name="shield-half-full" size={28} color={FAN_COLOR} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.teamName} numberOfLines={1}>{team.nombre}</Text>
        <View style={styles.metaRow}>
          {team.categoria && (
            <Text style={styles.metaText}>{team.categoria}</Text>
          )}
          {team.categoria && team.temporada && (
            <Text style={styles.metaDot}>·</Text>
          )}
          {team.temporada && (
            <Text style={styles.metaText}>{team.temporada}</Text>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onToggleFav} hitSlop={8} style={styles.favBtn}>
          <Icon
            name={isFav ? 'star' : 'star-outline'}
            size={22}
            color={isFav ? '#FFC107' : 'rgba(255,255,255,0.25)'}
          />
        </TouchableOpacity>
        {selecting ? (
          <ActivityIndicator size={20} color={FAN_COLOR} />
        ) : (
          <Icon name="chevron-right" size={22} color="rgba(255,255,255,0.25)" />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: GLASS_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    padding: 0,
  },

  list: { paddingHorizontal: 16, paddingBottom: 40 },

  section: { marginBottom: 4 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  shieldWrap: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  shield: { width: 48, height: 48, borderRadius: 8 },
  shieldPlaceholder: {
    width: 48, height: 48, borderRadius: 8,
    backgroundColor: 'rgba(30,136,229,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  info: { flex: 1 },
  teamName: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  metaText: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  metaDot: { color: 'rgba(255,255,255,0.2)', fontSize: 12 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  favBtn: { padding: 2 },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyText: { color: 'rgba(255,255,255,0.35)', fontSize: 15 },
});
