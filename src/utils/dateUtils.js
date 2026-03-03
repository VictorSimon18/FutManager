/**
 * dateUtils.js — Funciones helper para formatear fechas y horas
 */

/**
 * Convierte una fecha de formato YYYY-MM-DD a DD-MM-YYYY.
 * @param {string} dateString Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha formateada como DD-MM-YYYY, o '—' si es nula
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  // Asegurar que el día y el mes van con cero inicial
  return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
}

/**
 * Convierte una hora de formato HH:MM a HH.MM (punto en vez de dos puntos).
 * @param {string} timeString Hora en formato HH:MM
 * @returns {string} Hora formateada como HH.MM, o '' si es nula
 */
export function formatTime(timeString) {
  if (!timeString) return '';
  return timeString.replace(':', '.');
}

/**
 * Convierte una fecha de formato DD-MM-YYYY a YYYY-MM-DD para guardar en SQLite.
 * @param {string} displayDate Fecha en formato DD-MM-YYYY
 * @returns {string} Fecha en formato YYYY-MM-DD, o '' si es nula o inválida
 */
export function parseDate(displayDate) {
  if (!displayDate) return '';
  const parts = displayDate.split('-');
  if (parts.length !== 3) return displayDate;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

/**
 * Convierte una hora de formato HH.MM a HH:MM para guardar en SQLite.
 * @param {string} displayTime Hora en formato HH.MM
 * @returns {string} Hora en formato HH:MM, o '' si es nula
 */
export function parseTime(displayTime) {
  if (!displayTime) return '';
  return displayTime.replace('.', ':');
}
