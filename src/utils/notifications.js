/**
 * notifications.js — Utilidades para notificaciones locales con expo-notifications.
 * Permite mostrar avisos en la bandeja del sistema cuando el entrenador
 * realiza cambios relevantes para el jugador.
 *
 * En Expo Go (SDK 53+) las notificaciones remotas en Android fueron eliminadas,
 * por lo que importar `expo-notifications` provoca un error de runtime. Para
 * evitarlo, detectamos el entorno y, si estamos en Expo Go, las funciones
 * pasan a ser no-ops. Para usar notificaciones reales hay que generar un
 * development build (https://docs.expo.dev/develop/development-builds/introduction/).
 */

// Detecta si la app se ejecuta dentro de Expo Go.
const isExpoGo = (() => {
  try {
    const Constants = require('expo-constants').default;
    return (
      Constants?.appOwnership === 'expo' ||
      Constants?.executionEnvironment === 'storeClient'
    );
  } catch {
    return false;
  }
})();

// Carga perezosa del módulo: solo lo importamos si NO estamos en Expo Go,
// porque su mera importación puede registrar listeners de push que fallan
// en Expo Go con SDK 53+.
let Notifications = null;
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    console.warn('[notifications] expo-notifications no disponible:', e?.message);
    Notifications = null;
  }
}

/**
 * Solicita permisos de notificación al usuario.
 * Debe llamarse al inicio de la app.
 * @returns {Promise<boolean>} true si los permisos fueron concedidos
 */
export async function requestNotificationPermissions() {
  if (!Notifications) return false;
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
  if (!Notifications) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    });
  } catch (e) {
    console.warn('[notifications] No se pudo enviar la notificación:', e?.message);
  }
}
