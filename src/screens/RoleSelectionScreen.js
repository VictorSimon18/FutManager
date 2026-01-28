import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import AuroraBackground from '../components/AuroraBackground';

export default function RoleSelectionScreen({ navigation }) {
  const roles = [
    {
      id: 'coach',
      title: 'Entrenador',
      description: 'Gestiona tu equipo, planifica entrenamientos y partidos',
      icon: 'whistle',
      color: '#FF6F00',
      screen: 'HomeCoach',
    },
    {
      id: 'player',
      title: 'Jugador',
      description: 'Consulta tus entrenamientos, estadísticas y partidos',
      icon: 'run',
      color: '#00AA13',
      screen: 'HomePlayer',
    },
    {
      id: 'fan',
      title: 'Aficionado',
      description: 'Sigue a tu equipo favorito y mantente informado',
      icon: 'account-group',
      color: '#1E88E5',
      screen: 'HomeFan',
    },
  ];

  const handleRoleSelect = (screen) => {
    navigation.navigate(screen);
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
            Elige cómo quieres usar FutManager
          </Text>
        </View>

        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <TouchableRipple
              key={role.id}
              onPress={() => handleRoleSelect(role.screen)}
              borderless
              style={styles.roleCardWrapper}
            >
              <Surface style={[styles.roleCard, { borderLeftColor: role.color }]} elevation={0}>
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
                </View>
                <Icon name="chevron-right" size={32} color="rgba(255,255,255,0.5)" />
              </Surface>
            </TouchableRipple>
          ))}
        </View>
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
});
