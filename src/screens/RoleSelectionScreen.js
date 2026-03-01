import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Surface, TouchableRipple, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import AuroraBackground from '../components/AuroraBackground';
import { AuthContext } from '../context/AuthContext';
import { getUserRoles } from '../database/services/userService';

const ROLES_CONFIG = [
  {
    id: 'coach',
    title: 'Entrenador',
    description: 'Gestiona tu equipo, planifica entrenamientos y partidos',
    icon: 'whistle',
    color: '#FF6F00',
  },
  {
    id: 'player',
    title: 'Jugador',
    description: 'Consulta tus entrenamientos, estadísticas y partidos',
    icon: 'run',
    color: '#00AA13',
  },
  {
    id: 'fan',
    title: 'Aficionado',
    description: 'Sigue a tu equipo favorito y mantente informado',
    icon: 'account-group',
    color: '#1E88E5',
  },
];

export default function RoleSelectionScreen() {
  const { user, selectRole } = useContext(AuthContext);

  const [userRoles, setUserRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [error, setError] = useState('');

  // Cargar los roles que ya tiene el usuario en la BD
  useEffect(() => {
    async function loadUserRoles() {
      try {
        if (user?.id) {
          const roles = await getUserRoles(user.id);
          setUserRoles(roles);
        }
      } catch (err) {
        console.error('[RoleSelectionScreen] Error al cargar roles del usuario:', err);
      } finally {
        setLoadingRoles(false);
      }
    }
    loadUserRoles();
  }, [user]);

  const handleRoleSelect = async (roleId) => {
    setError('');
    setSelecting(true);
    try {
      // Reutilizar el equipoId si el usuario ya tiene ese rol asignado
      const existing = userRoles.find((r) => r.role === roleId);
      const equipoId = existing?.equipo_id ?? null;
      await selectRole(roleId, equipoId);
      // El cambio de `role` en AuthContext hace que AppNavigator muestre la pantalla correcta
    } catch (err) {
      setError(err.message);
    } finally {
      setSelecting(false);
    }
  };

  return (
    <AuroraBackground>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Icon name="soccer" size={60} color="#00FF4C" />
          <Text variant="headlineLarge" style={styles.title}>
            Selecciona tu rol
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {user ? `Hola, ${user.nombre}` : 'Elige cómo quieres usar FutManager'}
          </Text>
        </View>

        {loadingRoles ? (
          <ActivityIndicator size="large" color="#00FF4C" style={styles.loader} />
        ) : (
          <View style={styles.rolesContainer}>
            {ROLES_CONFIG.map((role) => {
              const hasRole = userRoles.some((r) => r.role === role.id);
              return (
                <TouchableRipple
                  key={role.id}
                  onPress={() => handleRoleSelect(role.id)}
                  disabled={selecting}
                  borderless
                  style={styles.roleCardWrapper}
                  rippleColor="rgba(255,255,255,0.1)"
                >
                  <Surface
                    style={[styles.roleCard, { borderLeftColor: role.color }]}
                    elevation={0}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: role.color + '30' }]}>
                      <Icon name={role.icon} size={48} color={role.color} />
                    </View>
                    <View style={styles.roleContent}>
                      <Text variant="headlineSmall" style={styles.roleTitle}>
                        {role.title}
                      </Text>
                      <Text variant="bodyMedium" style={styles.roleDescription}>
                        {role.description}
                      </Text>
                      {hasRole && (
                        <Text variant="bodySmall" style={[styles.assignedLabel, { color: role.color }]}>
                          ✓ Ya asignado
                        </Text>
                      )}
                    </View>
                    {selecting ? (
                      <ActivityIndicator size="small" color="rgba(255,255,255,0.4)" />
                    ) : (
                      <Icon name="chevron-right" size={32} color="rgba(255,255,255,0.4)" />
                    )}
                  </Surface>
                </TouchableRipple>
              );
            })}
          </View>
        )}

        {error ? (
          <HelperText type="error" visible style={styles.errorText}>
            {error}
          </HelperText>
        ) : null}
      </ScrollView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    marginTop: 16,
    color: '#fff',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  loader: {
    marginTop: 40,
  },
  rolesContainer: {
    gap: 16,
  },
  roleCardWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderLeftWidth: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  roleDescription: {
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  assignedLabel: {
    marginTop: 4,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF5252',
    marginTop: 16,
    textAlign: 'center',
  },
});
