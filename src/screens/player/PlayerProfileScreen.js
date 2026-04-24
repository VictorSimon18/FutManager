/**
 * PlayerProfileScreen.js — Ficha personal del jugador, asistencia y cierre de sesión.
 */

import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Avatar, Chip, Button, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../../context/AuthContext';
import { usePlayerAttendance } from '../../hooks/usePlayerAttendance';
import { getTeamById } from '../../database/services/teamService';
import { formatDate } from '../../utils/dateUtils';
import { getPositionColor } from '../../utils/positionUtils';

function getInitials(nombre) {
  if (!nombre) return '?';
  const partes = nombre.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

function InfoRow({ icon, label, value }) {
  if (value == null || value === '') return null;
  return (
    <View style={styles.infoRow}>
      <Icon name={icon} size={18} color="rgba(255,255,255,0.55)" />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function PlayerProfileScreen() {
  const { roleData, equipoId, logout } = useContext(AuthContext);
  const jugadorId = roleData?.id ?? null;

  const [team, setTeam] = useState(null);
  const { attendance, loading: loadingAttendance, refresh: refreshAttendance } = usePlayerAttendance(jugadorId, equipoId);

  useEffect(() => {
    if (equipoId) getTeamById(equipoId).then(setTeam).catch(() => {});
  }, [equipoId]);

  useFocusEffect(useCallback(() => { refreshAttendance(); }, [refreshAttendance]));

  const positionColor = getPositionColor(roleData?.posicion);
  const iniciales = getInitials(roleData?.nombre);

  const porcentaje = attendance?.porcentaje ?? 0;
  let attendanceLabel = 'Sin datos de asistencia';
  let attendanceColor = 'rgba(255,255,255,0.5)';
  if (attendance && attendance.total > 0) {
    if (porcentaje >= 80) {
      attendanceLabel = 'Buena asistencia';
      attendanceColor = '#43A047';
    } else if (porcentaje >= 50) {
      attendanceLabel = 'Asistencia regular';
      attendanceColor = '#FFC107';
    } else {
      attendanceLabel = 'Asistencia baja';
      attendanceColor = '#E53935';
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Ficha personal */}
        <View style={styles.profileCard}>
          <View style={[styles.avatarWrap, { borderColor: positionColor }]}>
            {roleData?.foto_url ? (
              <Avatar.Image size={88} source={{ uri: roleData.foto_url }} />
            ) : (
              <Avatar.Text
                size={88}
                label={iniciales}
                style={{ backgroundColor: positionColor }}
                labelStyle={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 32 }}
              />
            )}
          </View>
          <Text variant="headlineSmall" style={styles.playerName}>
            {roleData?.nombre || 'Jugador'}
          </Text>
          <View style={styles.playerMeta}>
            {roleData?.posicion ? (
              <Chip
                compact
                style={[styles.chip, { backgroundColor: `${positionColor}33` }]}
                textStyle={styles.chipText}
              >
                {roleData.posicion}
              </Chip>
            ) : null}
            {roleData?.dorsal != null ? (
              <Text style={[styles.dorsal, { color: positionColor }]}>
                #{roleData.dorsal}
              </Text>
            ) : null}
          </View>

          <View style={styles.infoGrid}>
            <InfoRow icon="cake-variant" label="Nacimiento" value={formatDate(roleData?.fecha_nacimiento)} />
            <InfoRow icon="human-male-height" label="Altura" value={roleData?.altura ? `${roleData.altura} m` : null} />
            <InfoRow icon="weight-kilogram" label="Peso" value={roleData?.peso ? `${roleData.peso} kg` : null} />
            <InfoRow icon="foot-print" label="Pie" value={roleData?.pie_dominante} />
            <InfoRow icon="account" label="Sexo" value={roleData?.sexo} />
          </View>
        </View>

        {/* Asistencia a entrenamientos */}
        <Text variant="titleMedium" style={styles.sectionTitle}>ASISTENCIA A ENTRENAMIENTOS</Text>
        <View style={styles.glassCard}>
          {loadingAttendance ? (
            <ActivityIndicator size="small" color={PLAYER_ACCENT} />
          ) : (
            <>
              <View style={styles.attendanceHeader}>
                <Text style={styles.attendanceBig}>{porcentaje}%</Text>
                <Text style={[styles.attendanceLabel, { color: attendanceColor }]}>
                  {attendanceLabel}
                </Text>
              </View>
              <ProgressBar
                progress={porcentaje / 100}
                color={attendanceColor}
                style={styles.progressBar}
              />
              <Text style={styles.attendanceDetail}>
                {attendance?.asistidos ?? 0} / {attendance?.total ?? 0} entrenamientos
              </Text>
            </>
          )}
        </View>

        {/* Información del equipo */}
        <Text variant="titleMedium" style={styles.sectionTitle}>INFORMACIÓN DEL EQUIPO</Text>
        <View style={styles.glassCard}>
          <InfoRow icon="shield-star" label="Equipo" value={team?.nombre} />
          <InfoRow icon="trophy" label="Categoría" value={team?.categoria} />
          <InfoRow icon="soccer-field" label="Modalidad" value={team?.modalidad} />
          <InfoRow icon="calendar" label="Temporada" value={team?.temporada} />
        </View>

        <Text style={styles.noteText}>
          Para modificar tus datos personales, contacta con tu entrenador
        </Text>

        <Button
          mode="outlined"
          icon="logout"
          onPress={logout}
          style={styles.logoutBtn}
          textColor="#E53935"
          theme={{ colors: { outline: 'rgba(229,57,53,0.5)' } }}
        >
          Cerrar sesión
        </Button>
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

  profileCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 10,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderTopWidth: 3,
    borderTopColor: PLAYER_ACCENT,
  },
  avatarWrap: {
    borderWidth: 3,
    borderRadius: 48,
    padding: 3,
  },
  playerName: { color: '#FFFFFF', fontWeight: 'bold', textAlign: 'center' },
  playerMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  chip: { height: 28 },
  chipText: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
  dorsal: { fontWeight: 'bold', fontSize: 20 },

  infoGrid: {
    width: '100%',
    gap: 8,
    marginTop: 4,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { color: 'rgba(255,255,255,0.5)', flex: 1, fontSize: 13 },
  infoValue: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },

  sectionTitle: {
    color: PLAYER_ACCENT,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 10,
    letterSpacing: 0.5,
  },

  glassCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    gap: 10,
  },

  attendanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attendanceBig: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold' },
  attendanceLabel: { fontWeight: '600', fontSize: 13 },
  progressBar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)' },
  attendanceDetail: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },

  noteText: {
    color: 'rgba(255,255,255,0.4)',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 30,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 14,
  },

  logoutBtn: {
    marginHorizontal: 20,
    borderColor: 'rgba(229,57,53,0.5)',
  },
});
