/**
 * notifications.js — Utilidades para notificaciones locales con expo-notifications.
 * Permite mostrar avisos en la bandeja del sistema cuando el entrenador
 * realiza cambios relevantes para el jugador.
 */

import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Solicita permisos de notificación al usuario.
 * Debe llamarse al inicio de la app.
 * @returns {Promise<boolean>} true si los permisos fueron concedidos
 */
export async function requestNotificationPermissions() {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Envía una notificación local inmediata.
 * @param {string} title Título de la notificación
 * @param {string} body  Cuerpo del mensaje
 */
export async function sendLocalNotification(title, body) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    });
  } catch (e) {
    console.warn('[notifications] No se pudo enviar la notificación:', e?.message);
  }
}
