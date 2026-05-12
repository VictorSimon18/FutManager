/**
 * EventBus — Sistema de eventos interno para sincronización en tiempo real
 * entre las pantallas del entrenador y del jugador (mismo dispositivo).
 */

const handlers = {};

export const EventBus = {
  on(event, fn) {
    if (!handlers[event]) handlers[event] = [];
    handlers[event].push(fn);
    return () => {
      if (handlers[event]) {
        handlers[event] = handlers[event].filter(h => h !== fn);
      }
    };
  },
  emit(event, data) {
    (handlers[event] || []).forEach(fn => {
      try { fn(data); } catch (e) { /* ignorar errores en listeners */ }
    });
  },
};

export const EVENTS = {
  STATS_UPDATED: 'STATS_UPDATED',
  MATCH_CREATED: 'MATCH_CREATED',
  TRAINING_CREATED: 'TRAINING_CREATED',
};
