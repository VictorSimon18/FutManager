/**
 * TacticalBoardScreen.js — Pantalla completa de la pizarra táctica
 *
 * Envuelve el componente TacticalBoard y gestiona el guardado de la imagen.
 * El header sigue la paleta naranja del entrenador.
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import TacticalBoard from '../../components/TacticalBoard';

export default function TacticalBoardScreen() {
  // Callback invocado cuando el WebView envía la imagen base64 al pulsar "Guardar"
  const handleSave = useCallback((base64Image) => {
    // En el prototipo mostramos confirmación. Aquí se podría persistir en SQLite.
    Alert.alert(
      'Pizarra guardada',
      'La imagen de la pizarra se ha generado correctamente.',
      [{ text: 'Aceptar' }]
    );
    // TODO (producción): guardar base64Image en SQLite o sistema de archivos
    console.log('[TacticalBoardScreen] Imagen capturada, longitud:', base64Image?.length ?? 0);
  }, []);

  return (
    <View style={styles.container}>
      <TacticalBoard onSave={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
});
