/**
 * positionUtils.js — Helpers para color, orden y grupo por posición de jugador
 */

// Orden numérico de cada posición (para sorting)
const POSITION_ORDER = {
  'Portero':               1,
  'Defensa Central':      10,
  'Lateral Derecho':      11,
  'Lateral Izquierdo':    12,
  'Carrilero Derecho':    13,
  'Carrilero Izquierdo':  14,
  'Líbero':               19,
  'Mediocentro Defensivo':20,
  'Mediocentro':          21,
  'Mediapunta':           22,
  'Extremo Izquierdo':    30,
  'Extremo Derecho':      31,
  'Delantero':            32,
};

// Color por posición
const POSITION_COLOR = {
  'Portero':               '#105E7A',
  'Defensa Central':       '#D32F2F',
  'Lateral Derecho':       '#D32F2F',
  'Lateral Izquierdo':     '#D32F2F',
  'Carrilero Derecho':     '#D32F2F',
  'Carrilero Izquierdo':   '#D32F2F',
  'Líbero':                '#FFC107',
  'Mediocentro Defensivo': '#00AA13',
  'Mediocentro':           '#00AA13',
  'Mediapunta':            '#00AA13',
  'Extremo Izquierdo':     '#1E88E5',
  'Extremo Derecho':       '#1E88E5',
  'Delantero':             '#1E88E5',
};

// Grupo/línea de cada posición
const POSITION_GROUP = {
  'Portero':               'Portero',
  'Defensa Central':       'Defensa',
  'Lateral Derecho':       'Defensa',
  'Lateral Izquierdo':     'Defensa',
  'Carrilero Derecho':     'Defensa',
  'Carrilero Izquierdo':   'Defensa',
  'Líbero':                'Líbero',
  'Mediocentro Defensivo': 'Mediocentro',
  'Mediocentro':           'Mediocentro',
  'Mediapunta':            'Mediocentro',
  'Extremo Izquierdo':     'Delantero',
  'Extremo Derecho':       'Delantero',
  'Delantero':             'Delantero',
};

/**
 * Devuelve el color asociado a una posición.
 * @param {string} posicion
 * @returns {string} Color hexadecimal
 */
export function getPositionColor(posicion) {
  return POSITION_COLOR[posicion] ?? '#757575';
}

/**
 * Devuelve el orden numérico de una posición para sorting.
 * @param {string} posicion
 * @returns {number}
 */
export function getPositionOrder(posicion) {
  return POSITION_ORDER[posicion] ?? 99;
}

/**
 * Devuelve el grupo/línea de una posición.
 * @param {string} posicion
 * @returns {string} 'Portero' | 'Defensa' | 'Líbero' | 'Mediocentro' | 'Delantero' | 'Sin posición'
 */
export function getPositionGroup(posicion) {
  return POSITION_GROUP[posicion] ?? 'Sin posición';
}
