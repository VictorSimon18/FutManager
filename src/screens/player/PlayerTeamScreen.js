/**
 * PlayerTeamScreen.js — Pantalla "Mi Equipo": info del equipo, plantilla y clasificación.
 */

import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Avatar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../../context/AuthContext';
import { usePlayers } from '../../hooks/usePlayers';
import { useTeamTournament } from '../../hooks/usePlayerRole';
import { getTeamById } from '../../database/services/teamService';
import { getPositionColor } from '../../utils/positionUtils';

function getInitials(nombre) {
  if (!nombre) return '?';
  const partes = nombre.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

export default function PlayerTeamScreen() {
  const { roleData, equipoId } = useContext(AuthContext);
  const jugadorId = roleData?.id ?? null;

  const [team, setTeam] = useState(null);
  const { players, loading: loadingPlayers, refresh: refreshPlayers } = usePlayers(equipoId);
  const { data: tournamentData, loading: loadingTournament, refresh: refreshTournament } = useTeamTournament(equipoId);

  useEffect(() => {
    if (equipoId) getTeamById(equipoId).then(setTeam).catch(() => {});
  }, [equipoId]);

  useFocusEffect(
    useCallback(() => {
      refreshPlayers();
      refreshTournament();
    }, [refreshPlayers, refreshTournament])
  );

  const isLoading = loadingPlayers || loadingTournament;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header del equipo */}
        <View style={styles.teamHeader}>
          <Avatar.Icon
            size={64}
            icon="shield-star"
            style={{ backgroundColor: PLAYER_ACCENT }}
            color="#FFFFFF"
          />
          <View style={styles.teamInfo}>
            <Text variant="titleLarge" style={styles.teamName} numberOfLines={2}>
              {team?.nombre || 'Mi equipo'}
            </Text>
            <View style={styles.teamMeta}>
              {team?.categoria ? (
                <Chip compact style={styles.teamChip} textStyle={styles.chipText}>
                  {team.categoria}
                </Chip>
              ) : null}
              {team?.modalidad ? (
                <Chip compact style={styles.teamChip} textStyle={styles.chipText}>
                  {team.modalidad}
                </Chip>
              ) : null}
            </View>
            {team?.temporada ? (
              <Text style={styles.teamSeason}>Temporada {team.temporada}</Text>
            ) : null}
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={PLAYER_ACCENT} style={styles.loader} />
        ) : (
          <>
            {/* Plantilla */}
            <Text variant="titleMedium" style={styles.sectionTitle}>
              PLANTILLA ({players.length})
            </Text>
            <View style={styles.listCard}>
              {players.map((p, i) => {
                const positionColor = getPositionColor(p.posicion);
                const isSelf = p.id === jugadorId;
                return (
                  <View key={p.id}>
                    {i > 0 && <View style={styles.divider} />}
                    <View style={[styles.playerRow, isSelf && styles.playerRowSelf]}>
                      {p.foto_url ? (
                        <Avatar.Image size={44} source={{ uri: p.foto_url }} />
                      ) : (
                        <Avatar.Text
                          size={44}
                          label={getInitials(p.nombre)}
                          style={{ backgroundColor: positionColor }}
                          labelStyle={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}
                        />
                      )}
                      <View style={styles.playerInfo}>
                        <View style={styles.playerNameRow}>
                          <Text style={styles.playerName} numberOfLines={1}>
                            {p.nombre}
                          </Text>
                          {isSelf ? (
                            <View style={styles.selfBadge}>
                              <Text style={styles.selfBadgeText}>Tú</Text>
                            </View>
                          ) : null}
                        </View>
                        {p.posicion ? (
                          <Text style={[styles.playerPosition, { color: positionColor }]}>
                            {p.posicion}
                          </Text>
                        ) : null}
                      </View>
                      {p.dorsal != null ? (
                        <Text style={[styles.playerDorsal, { color: positionColor }]}>
                          #{p.dorsal}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
              {players.length === 0 ? (
                <Text style={styles.emptyText}>No hay jugadores en la plantilla</Text>
              ) : null}
            </View>

            {/* Clasificación */}
            {tournamentData && tournamentData.standings.length > 0 ? (
              <>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  CLASIFICACIÓN
                </Text>
                <Text style={styles.tournamentName}>{tournamentData.torneo?.nombre}</Text>
                <View style={styles.listCard}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.thPos]}>#</Text>
                    <Text style={[styles.thTeam]}>Equipo</Text>
                    <Text style={styles.thCell}>PJ</Text>
                    <Text style={styles.thCell}>PG</Text>
                    <Text style={styles.thCell}>PE</Text>
                    <Text style={styles.thCell}>PP</Text>
                    <Text style={styles.thCell}>GF</Text>
                    <Text style={styles.thCell}>GC</Text>
                    <Text style={[styles.thCell, styles.thPts]}>Pts</Text>
                  </View>
                  {tournamentData.standings.map((row, idx) => {
                    const isMine = row.equipo_id === tournamentData.myEquipoId;
                    return (
                      <View
                        key={row.id}
                        style={[styles.tableRow, isMine && styles.tableRowMine]}
                      >
                        <Text style={[styles.tdPos, isMine && styles.tdMine]}>{idx + 1}</Text>
                        <Text
                          style={[styles.tdTeam, isMine && styles.tdMine]}
                          numberOfLines={1}
                        >
                          {row.equipo_nombre}
                        </Text>
                        <Text style={[styles.tdCell, isMine && styles.tdMine]}>{row.partidos_jugados}</Text>
                        <Text style={[styles.tdCell, isMine && styles.tdMine]}>{row.partidos_ganados}</Text>
                        <Text style={[styles.tdCell, isMine && styles.tdMine]}>{row.partidos_empatados}</Text>
                        <Text style={[styles.tdCell, isMine && styles.tdMine]}>{row.partidos_perdidos}</Text>
                        <Text style={[styles.tdCell, isMine && styles.tdMine]}>{row.goles_favor}</Text>
                        <Text style={[styles.tdCell, isMine && styles.tdMine]}>{row.goles_contra}</Text>
                        <Text style={[styles.tdCell, styles.tdPts, isMine && styles.tdMine]}>
                          {row.puntos}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const GLASS_BG = 'rgba(255,255,255,0.08)';
const GLASS_BORDER = 'rgba(255,255,255,0.13)';
const PLAYER_ACCENT = '#00AA13';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f2027' },
  scrollContent: { paddingBottom: 40 },
  loader: { marginTop: 40 },

  teamHeader: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderTopWidth: 3,
    borderTopColor: PLAYER_ACCENT,
  },
  teamInfo: { flex: 1, gap: 6 },
  teamName: { color: '#FFFFFF', fontWeight: 'bold' },
  teamMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  teamChip: { backgroundColor: 'rgba(255,255,255,0.1)', height: 24 },
  chipText: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  teamSeason: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },

  sectionTitle: {
    color: PLAYER_ACCENT,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 10,
    letterSpacing: 0.5,
  },

  listCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 10,
    borderRadius: 14,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 6 },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 10,
  },
  playerRowSelf: { backgroundColor: 'rgba(0,170,19,0.12)' },
  playerInfo: { flex: 1, gap: 2 },
  playerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  playerName: { color: '#FFFFFF', fontWeight: '600', flexShrink: 1 },
  playerPosition: { fontSize: 12, fontWeight: '600' },
  playerDorsal: { fontWeight: 'bold', fontSize: 16 },
  selfBadge: {
    backgroundColor: PLAYER_ACCENT,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  selfBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },

  tournamentName: {
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
    paddingHorizontal: 20,
    marginTop: -4,
    marginBottom: 8,
    fontSize: 13,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  tableRowMine: {
    backgroundColor: 'rgba(0,170,19,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0,170,19,0.4)',
  },
  thPos: { width: 22, color: PLAYER_ACCENT, fontWeight: 'bold', fontSize: 11 },
  thTeam: { flex: 1, color: PLAYER_ACCENT, fontWeight: 'bold', fontSize: 11 },
  thCell: { width: 26, textAlign: 'center', color: PLAYER_ACCENT, fontWeight: 'bold', fontSize: 11 },
  thPts: { width: 32 },
  tdPos: { width: 22, color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  tdTeam: { flex: 1, color: '#FFFFFF', fontSize: 13 },
  tdCell: { width: 26, textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  tdPts: { width: 32, fontWeight: 'bold', color: '#FFFFFF' },
  tdMine: { color: '#FFFFFF', fontWeight: '600' },

  emptyText: { color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', textAlign: 'center', padding: 16 },
});
