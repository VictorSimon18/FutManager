/**
 * MapScreen.js — Pantalla completa de selección de ubicación para partidos.
 * Envuelve MapPicker y devuelve la ubicación confirmada a MatchFormScreen
 * a través de route.params.selectedLocation.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapPicker from '../../components/MapPicker';

export default function MapScreen({ route, navigation }) {
  const {
    currentLatitude,
    currentLongitude,
    currentAddress,
    formData, // datos del formulario de origen para preservar al volver
  } = route.params ?? {};

  function handleLocationSelect(locationData) {
    // Devolver la ubicación y reenviar los datos del formulario para restaurarlos
    navigation.navigate('MatchForm', { selectedLocation: locationData, formData });
  }

  return (
    <View style={styles.container}>
      <MapPicker
        onLocationSelect={handleLocationSelect}
        initialLatitude={currentLatitude}
        initialLongitude={currentLongitude}
        initialAddress={currentAddress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
