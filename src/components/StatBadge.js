import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

/**
 * Badge pequeño que muestra un icono + valor numérico.
 * @param {{ icon: string, value: number|string, color?: string, label?: string }} props
 */
export default function StatBadge({ icon, value, color = '#FF6F00', label }) {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={18} color={color} />
      <Text variant="titleSmall" style={[styles.value, { color }]}>
        {value ?? 0}
      </Text>
      {label ? (
        <Text variant="bodySmall" style={styles.label}>{label}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 2,
    minWidth: 48,
  },
  value: {
    fontWeight: 'bold',
  },
  label: {
    color: '#9E9E9E',
    fontSize: 10,
    textAlign: 'center',
  },
});
