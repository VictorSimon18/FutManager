import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

/**
 * Estado vacío genérico para listas sin datos.
 * @param {{ icon: string, title: string, subtitle?: string,
 *           actionLabel?: string, onAction?: Function }} props
 */
export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={64} color="#BDBDBD" />
      <Text variant="titleMedium" style={styles.title}>{title}</Text>
      {subtitle ? (
        <Text variant="bodyMedium" style={styles.subtitle}>{subtitle}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button mode="contained" onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  title: {
    color: '#757575',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#9E9E9E',
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#105E7A',
  },
});
