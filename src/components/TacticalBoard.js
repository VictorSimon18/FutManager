/**
 * TacticalBoard.js — Pizarra táctica interactiva con WebView + HTML5 Canvas
 *
 * Renderiza un campo de fútbol con herramientas de dibujo libre y fichas
 * de jugadores arrastrables. La comunicación canvas → RN se hace mediante
 * window.ReactNativeWebView.postMessage().
 */

import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const TACTICAL_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; touch-action: none; }
    html, body { width: 100%; height: 100%; background: #1a1a2e; overflow: hidden; font-family: sans-serif; }

    #wrapper { display: flex; flex-direction: column; width: 100%; height: 100%; }

    /* ── Toolbar ── */
    #toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      background: rgba(0,0,0,0.82);
      border-bottom: 1px solid rgba(255,255,255,0.12);
      flex-shrink: 0;
    }
    .tool-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.1);
      border: 1.5px solid rgba(255,255,255,0.18);
      border-radius: 8px;
      width: 44px;
      height: 44px;
      cursor: pointer;
      transition: background 0.15s;
      font-size: 18px;
      color: #fff;
      user-select: none;
      -webkit-user-select: none;
    }
    .tool-btn.active { background: rgba(255,255,255,0.28); border-color: #fff; }
    .tool-btn span { font-size: 9px; margin-top: 2px; }

    /* Selector de colores */
    #color-row { display: flex; gap: 5px; align-items: center; }
    .color-dot {
      width: 26px; height: 26px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
    }
    .color-dot.selected { border-color: #fff; transform: scale(1.25); }

    /* Selector de grosor */
    #thick-row { display: flex; gap: 5px; align-items: center; }
    .thick-btn {
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.1);
      border: 1.5px solid rgba(255,255,255,0.18);
      border-radius: 6px;
      width: 34px; height: 34px;
      cursor: pointer; color: #fff; font-weight: bold;
    }
    .thick-btn.active { background: rgba(255,255,255,0.28); border-color: #fff; }

    /* ── Canvas ── */
    #canvas-container {
      flex: 1;
      position: relative;
      overflow: hidden;
    }
    #field-canvas, #draw-canvas {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
    }
    #draw-canvas { z-index: 2; }

    /* ── Fichas de jugadores ── */
    .player-token {
      position: absolute;
      z-index: 3;
      width: 36px; height: 36px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: bold;
      font-size: 13px;
      color: #fff;
      cursor: grab;
      user-select: none;
      -webkit-user-select: none;
      box-shadow: 0 3px 8px rgba(0,0,0,0.6);
      border: 2px solid rgba(255,255,255,0.5);
      touch-action: none;
    }
    .player-token.dragging { cursor: grabbing; opacity: 0.85; z-index: 10; }

    /* ── Ficha del balón ── */
    .ball-token {
      position: absolute;
      z-index: 15;
      width: 30px; height: 30px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: #FFFFFF;
      border: 2px solid #222;
      cursor: grab;
      user-select: none;
      -webkit-user-select: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.7);
      touch-action: none;
      font-size: 18px;
      line-height: 1;
    }
    .ball-token.dragging { cursor: grabbing; opacity: 0.9; z-index: 20; }
  </style>
</head>
<body>
<div id="wrapper">

  <!-- Barra de herramientas -->
  <div id="toolbar">
    <!-- Herramientas de dibujo -->
    <button class="tool-btn active" id="btn-pencil" onclick="setTool('pencil')">✏️<span>Lápiz</span></button>
    <button class="tool-btn" id="btn-arrow" onclick="setTool('arrow')">➡️<span>Flecha</span></button>
    <button class="tool-btn" id="btn-eraser" onclick="setTool('eraser')">🧽<span>Borrar</span></button>
    <button class="tool-btn" id="btn-undo" onclick="undo()">↩️<span>Deshacer</span></button>
    <button class="tool-btn" id="btn-clear" onclick="clearAll()">🗑️<span>Limpiar</span></button>
    <button class="tool-btn" id="btn-save" onclick="saveImage()">💾<span>Guardar</span></button>
    <button class="tool-btn" id="btn-reset-ball" onclick="resetBall()" title="Centrar balón">⚽<span>Balón</span></button>

    <!-- Separador -->
    <div style="flex:1;min-width:4px;"></div>

    <!-- Selector de colores -->
    <div id="color-row">
      <div class="color-dot selected" style="background:#FFFFFF;" onclick="setColor('#FFFFFF',this)"></div>
      <div class="color-dot" style="background:#F44336;" onclick="setColor('#F44336',this)"></div>
      <div class="color-dot" style="background:#2196F3;" onclick="setColor('#2196F3',this)"></div>
      <div class="color-dot" style="background:#FFEB3B;" onclick="setColor('#FFEB3B',this)"></div>
      <div class="color-dot" style="background:#111111;border:1px solid #555;" onclick="setColor('#111111',this)"></div>
    </div>

    <!-- Separador -->
    <div style="width:4px;"></div>

    <!-- Selector de grosor -->
    <div id="thick-row">
      <div class="thick-btn active" id="th-2" onclick="setThickness(2,this)" style="font-size:10px;">─</div>
      <div class="thick-btn" id="th-4" onclick="setThickness(4,this)" style="font-size:13px;">─</div>
      <div class="thick-btn" id="th-7" onclick="setThickness(7,this)" style="font-size:16px;">─</div>
    </div>
  </div>

  <!-- Área de canvas -->
  <div id="canvas-container">
    <canvas id="field-canvas"></canvas>
    <canvas id="draw-canvas"></canvas>
    <!-- Fichas de jugadores se insertan aquí por JS -->
  </div>
</div>

<script>
// ─── Estado ───────────────────────────────────────────────────────────────────
var currentTool   = 'pencil';
var currentColor  = '#FFFFFF';
var currentThickness = 2;
var isDrawing     = false;
var startX = 0, startY = 0;
var strokes = [];        // historial de trazos para deshacer
var currentPath = null;  // trazo actual en progreso

// ─── Referencias ──────────────────────────────────────────────────────────────
var fieldCanvas  = document.getElementById('field-canvas');
var drawCanvas   = document.getElementById('draw-canvas');
var fieldCtx     = fieldCanvas.getContext('2d');
var drawCtx      = drawCanvas.getContext('2d');
var container    = document.getElementById('canvas-container');

// ─── Redimensionar ────────────────────────────────────────────────────────────
function resize() {
  var W = container.clientWidth;
  var H = container.clientHeight;
  fieldCanvas.width  = W; fieldCanvas.height  = H;
  drawCanvas.width   = W; drawCanvas.height   = H;
  drawField();
  redrawStrokes();
}

// ─── Dibujar campo ────────────────────────────────────────────────────────────
function drawField() {
  var W = fieldCanvas.width;
  var H = fieldCanvas.height;
  var ctx = fieldCtx;

  // Fondo verde
  ctx.fillStyle = '#2E7D32';
  ctx.fillRect(0, 0, W, H);

  // Rayas de césped
  ctx.fillStyle = 'rgba(0,0,0,0.07)';
  var stripeW = W / 10;
  for (var i = 0; i < 10; i += 2) {
    ctx.fillRect(i * stripeW, 0, stripeW, H);
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth   = 1.5;
  ctx.lineCap     = 'round';

  var m = 10; // margen

  // Borde exterior del campo
  ctx.strokeRect(m, m, W - 2*m, H - 2*m);

  // Línea de centro
  ctx.beginPath();
  ctx.moveTo(m, H / 2);
  ctx.lineTo(W - m, H / 2);
  ctx.stroke();

  // Círculo central
  var cr = Math.min(W, H) * 0.1;
  ctx.beginPath();
  ctx.arc(W/2, H/2, cr, 0, Math.PI*2);
  ctx.stroke();

  // Punto central
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(W/2, H/2, 3, 0, Math.PI*2);
  ctx.fill();

  // ── Área grande ──
  var aW = W * 0.55, aH = H * 0.14;
  // Arriba
  ctx.strokeRect((W - aW)/2, m, aW, aH);
  // Abajo
  ctx.strokeRect((W - aW)/2, H - m - aH, aW, aH);

  // ── Área pequeña ──
  var pW = W * 0.28, pH = H * 0.065;
  // Arriba
  ctx.strokeRect((W - pW)/2, m, pW, pH);
  // Abajo
  ctx.strokeRect((W - pW)/2, H - m - pH, pW, pH);

  // ── Puntos de penalti ──
  var pyOff = H * 0.115;
  ctx.beginPath();
  ctx.arc(W/2, m + pyOff, 3, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W/2, H - m - pyOff, 3, 0, Math.PI*2);
  ctx.fill();

  // ── Arcos de penalti ──
  ctx.beginPath();
  ctx.arc(W/2, m + pyOff, cr * 0.85, Math.PI * 0.18, Math.PI * 0.82);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W/2, H - m - pyOff, cr * 0.85, Math.PI * 1.18, Math.PI * 1.82);
  ctx.stroke();

  // ── Arcos de esquina ──
  var cR = 8;
  // Esquina sup-izq
  ctx.beginPath(); ctx.arc(m, m, cR, 0, Math.PI/2); ctx.stroke();
  // Esquina sup-der
  ctx.beginPath(); ctx.arc(W-m, m, cR, Math.PI/2, Math.PI); ctx.stroke();
  // Esquina inf-izq
  ctx.beginPath(); ctx.arc(m, H-m, cR, -Math.PI/2, 0); ctx.stroke();
  // Esquina inf-der
  ctx.beginPath(); ctx.arc(W-m, H-m, cR, Math.PI, Math.PI*3/2); ctx.stroke();

  // ── Portería arriba ──
  var gW = W * 0.14, gH = H * 0.025;
  ctx.strokeRect((W - gW)/2, m - gH, gW, gH);
  // ── Portería abajo ──
  ctx.strokeRect((W - gW)/2, H - m, gW, gH);
}

// ─── Dibujo libre ─────────────────────────────────────────────────────────────
function getTouchPos(e) {
  var rect = drawCanvas.getBoundingClientRect();
  var t = e.touches ? e.touches[0] : e;
  return { x: t.clientX - rect.left, y: t.clientY - rect.top };
}

drawCanvas.addEventListener('touchstart', function(e) {
  e.preventDefault();
  if (currentTool === 'eraser') { startEraser(e); return; }
  isDrawing = true;
  var p = getTouchPos(e);
  startX = p.x; startY = p.y;
  currentPath = { tool: currentTool, color: currentColor, thickness: currentThickness, points: [{x:p.x,y:p.y}] };
  if (currentTool === 'pencil') {
    drawCtx.beginPath();
    drawCtx.moveTo(p.x, p.y);
    drawCtx.strokeStyle = currentColor;
    drawCtx.lineWidth   = currentThickness;
    drawCtx.lineCap     = 'round';
    drawCtx.lineJoin    = 'round';
  }
}, { passive: false });

drawCanvas.addEventListener('touchmove', function(e) {
  e.preventDefault();
  if (!isDrawing) return;
  var p = getTouchPos(e);
  currentPath.points.push({x:p.x,y:p.y});
  if (currentTool === 'pencil') {
    drawCtx.lineTo(p.x, p.y);
    drawCtx.stroke();
  } else if (currentTool === 'arrow') {
    // Previsualización: redibujar todos los trazos + flecha provisional
    redrawStrokes();
    drawArrow(drawCtx, startX, startY, p.x, p.y, currentColor, currentThickness);
  }
}, { passive: false });

drawCanvas.addEventListener('touchend', function(e) {
  e.preventDefault();
  if (!isDrawing) return;
  isDrawing = false;
  if (currentTool === 'arrow' && currentPath.points.length > 0) {
    var last = currentPath.points[currentPath.points.length - 1];
    currentPath.endX = last.x; currentPath.endY = last.y;
  }
  strokes.push(currentPath);
  currentPath = null;
  redrawStrokes();
}, { passive: false });

// Soporte para mouse (desktop / emulador)
drawCanvas.addEventListener('mousedown', function(e) {
  if (currentTool === 'eraser') { startEraserMouse(e); return; }
  isDrawing = true;
  startX = e.offsetX; startY = e.offsetY;
  currentPath = { tool: currentTool, color: currentColor, thickness: currentThickness, points: [{x:startX,y:startY}] };
  if (currentTool === 'pencil') {
    drawCtx.beginPath();
    drawCtx.moveTo(startX, startY);
    drawCtx.strokeStyle = currentColor;
    drawCtx.lineWidth   = currentThickness;
    drawCtx.lineCap     = 'round';
    drawCtx.lineJoin    = 'round';
  }
});
drawCanvas.addEventListener('mousemove', function(e) {
  if (!isDrawing) return;
  currentPath.points.push({x:e.offsetX,y:e.offsetY});
  if (currentTool === 'pencil') {
    drawCtx.lineTo(e.offsetX, e.offsetY);
    drawCtx.stroke();
  } else if (currentTool === 'arrow') {
    redrawStrokes();
    drawArrow(drawCtx, startX, startY, e.offsetX, e.offsetY, currentColor, currentThickness);
  }
});
drawCanvas.addEventListener('mouseup', function(e) {
  if (!isDrawing) return;
  isDrawing = false;
  if (currentTool === 'arrow') {
    currentPath.endX = e.offsetX; currentPath.endY = e.offsetY;
  }
  strokes.push(currentPath);
  currentPath = null;
  redrawStrokes();
});

// ─── Dibujar flecha ───────────────────────────────────────────────────────────
function drawArrow(ctx, x1, y1, x2, y2, color, thickness) {
  var headLen = Math.max(12, thickness * 4);
  var angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = color;
  ctx.fillStyle   = color;
  ctx.lineWidth   = thickness;
  ctx.lineCap     = 'round';
  // Línea
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  // Cabeza de flecha
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI/6), y2 - headLen * Math.sin(angle - Math.PI/6));
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI/6), y2 - headLen * Math.sin(angle + Math.PI/6));
  ctx.closePath();
  ctx.fill();
}

// ─── Redibujar todos los trazos ───────────────────────────────────────────────
function redrawStrokes() {
  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  for (var i = 0; i < strokes.length; i++) {
    var s = strokes[i];
    if (s.tool === 'pencil' && s.points.length > 0) {
      drawCtx.strokeStyle = s.color;
      drawCtx.lineWidth   = s.thickness;
      drawCtx.lineCap     = 'round';
      drawCtx.lineJoin    = 'round';
      drawCtx.beginPath();
      drawCtx.moveTo(s.points[0].x, s.points[0].y);
      for (var j = 1; j < s.points.length; j++) {
        drawCtx.lineTo(s.points[j].x, s.points[j].y);
      }
      drawCtx.stroke();
    } else if (s.tool === 'arrow' && s.endX != null) {
      drawArrow(drawCtx, s.points[0].x, s.points[0].y, s.endX, s.endY, s.color, s.thickness);
    }
  }
}

// ─── Borrador ─────────────────────────────────────────────────────────────────
function startEraser(e) {
  e.preventDefault();
  var pos = getTouchPos(e);
  eraseAt(pos.x, pos.y);
  function onMove(ev) { ev.preventDefault(); eraseAt(getTouchPos(ev).x, getTouchPos(ev).y); }
  function onEnd()  { drawCanvas.removeEventListener('touchmove', onMove); drawCanvas.removeEventListener('touchend', onEnd); }
  drawCanvas.addEventListener('touchmove', onMove, { passive: false });
  drawCanvas.addEventListener('touchend', onEnd);
}
function startEraserMouse(e) {
  eraseAt(e.offsetX, e.offsetY);
  function onMove(ev) { eraseAt(ev.offsetX, ev.offsetY); }
  function onUp()  { drawCanvas.removeEventListener('mousemove', onMove); drawCanvas.removeEventListener('mouseup', onUp); }
  drawCanvas.addEventListener('mousemove', onMove);
  drawCanvas.addEventListener('mouseup', onUp);
}
function eraseAt(x, y) {
  var radius = currentThickness * 6 + 10;
  strokes = strokes.filter(function(s) {
    if (s.tool === 'pencil') {
      return !s.points.some(function(p) { return dist(p.x,p.y,x,y) < radius; });
    } else if (s.tool === 'arrow') {
      return dist(s.points[0].x, s.points[0].y, x, y) > radius && dist(s.endX, s.endY, x, y) > radius;
    }
    return true;
  });
  redrawStrokes();
}
function dist(x1,y1,x2,y2) { return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)); }

// ─── Controles de toolbar ─────────────────────────────────────────────────────
function setTool(tool) {
  currentTool = tool;
  ['pencil','arrow','eraser'].forEach(function(t) {
    document.getElementById('btn-'+t).classList.toggle('active', t === tool);
  });
  drawCanvas.style.cursor = tool === 'eraser' ? 'crosshair' : 'crosshair';
}

function setColor(color, el) {
  currentColor = color;
  document.querySelectorAll('.color-dot').forEach(function(d) { d.classList.remove('selected'); });
  el.classList.add('selected');
}

function setThickness(val, el) {
  currentThickness = val;
  document.querySelectorAll('.thick-btn').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
}

function undo() {
  if (strokes.length > 0) {
    strokes.pop();
    redrawStrokes();
  }
}

function clearAll() {
  if (!confirm('¿Borrar todos los trazos?')) return;
  strokes = [];
  redrawStrokes();
}

// ─── Guardar imagen ───────────────────────────────────────────────────────────
function saveImage() {
  // Composite: campo + trazos + fichas en un canvas temporal
  var tmpCanvas = document.createElement('canvas');
  tmpCanvas.width  = fieldCanvas.width;
  tmpCanvas.height = fieldCanvas.height;
  var tmpCtx = tmpCanvas.getContext('2d');
  tmpCtx.drawImage(fieldCanvas, 0, 0);
  tmpCtx.drawImage(drawCanvas,  0, 0);
  // Dibujar fichas encima
  var tokens = document.querySelectorAll('.player-token');
  tokens.forEach(function(tok) {
    var x = parseFloat(tok.style.left);
    var y = parseFloat(tok.style.top);
    var r = 18;
    tmpCtx.fillStyle   = tok.dataset.color;
    tmpCtx.strokeStyle = 'rgba(255,255,255,0.6)';
    tmpCtx.lineWidth   = 2;
    tmpCtx.beginPath();
    tmpCtx.arc(x + r, y + r, r, 0, Math.PI*2);
    tmpCtx.fill(); tmpCtx.stroke();
    tmpCtx.fillStyle  = '#fff';
    tmpCtx.font       = 'bold 13px sans-serif';
    tmpCtx.textAlign  = 'center';
    tmpCtx.textBaseline = 'middle';
    tmpCtx.fillText(tok.dataset.num, x + r, y + r);
  });
  // Dibujar ficha del balón sobre el canvas de exportación
  var ballEl = document.getElementById('ball-token');
  if (ballEl) {
    var bx = parseFloat(ballEl.style.left);
    var by = parseFloat(ballEl.style.top);
    var br = 15; // radio = tokenSize/2 = 30/2
    tmpCtx.fillStyle   = '#FFFFFF';
    tmpCtx.strokeStyle = '#222222';
    tmpCtx.lineWidth   = 2;
    tmpCtx.beginPath();
    tmpCtx.arc(bx + br, by + br, br, 0, Math.PI * 2);
    tmpCtx.fill();
    tmpCtx.stroke();
    tmpCtx.fillStyle    = '#000';
    tmpCtx.font         = '18px sans-serif';
    tmpCtx.textAlign    = 'center';
    tmpCtx.textBaseline = 'middle';
    tmpCtx.fillText('⚽', bx + br, by + br);
  }
  var dataUrl = tmpCanvas.toDataURL('image/png');
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'save', image: dataUrl }));
  }
}

// ─── Fichas de jugadores ──────────────────────────────────────────────────────
var TEAM_A_COLOR = '#1565C0'; // azul — equipo local
var TEAM_B_COLOR = '#C62828'; // rojo — equipo rival

/**
 * Formaciones base 4-4-2:
 * Las posiciones se expresan como porcentaje del ancho/alto del contenedor.
 * El equipo local ocupa la mitad inferior, el rival la superior.
 */
var FORMATION_LOCAL = [
  // Portero
  {n:1, xp:50, yp:88},
  // Defensas
  {n:2, xp:20, yp:75}, {n:3, xp:40, yp:75}, {n:4, xp:60, yp:75}, {n:5, xp:80, yp:75},
  // Medios
  {n:6, xp:20, yp:60}, {n:7, xp:40, yp:60}, {n:8, xp:60, yp:60}, {n:9, xp:80, yp:60},
  // Delanteros
  {n:10, xp:35, yp:47}, {n:11, xp:65, yp:47},
];
var FORMATION_RIVAL = [
  // Portero rival
  {n:1, xp:50, yp:12},
  // Defensas
  {n:2, xp:20, yp:25}, {n:3, xp:40, yp:25}, {n:4, xp:60, yp:25}, {n:5, xp:80, yp:25},
  // Medios
  {n:6, xp:20, yp:40}, {n:7, xp:40, yp:40}, {n:8, xp:60, yp:40}, {n:9, xp:80, yp:40},
  // Delanteros
  {n:10, xp:35, yp:53}, {n:11, xp:65, yp:53},
];

function createToken(data, color, containerEl) {
  var tok = document.createElement('div');
  tok.className = 'player-token';
  tok.dataset.color = color;
  tok.dataset.num   = data.n;
  tok.textContent   = data.n;
  tok.style.background = color;

  var W = containerEl.clientWidth;
  var H = containerEl.clientHeight;
  var tokenSize = 36;
  // Centrar la ficha en el punto indicado
  tok.style.left = (W * data.xp / 100 - tokenSize/2) + 'px';
  tok.style.top  = (H * data.yp / 100 - tokenSize/2) + 'px';

  // Drag con touch
  var dragOffX = 0, dragOffY = 0;
  tok.addEventListener('touchstart', function(e) {
    e.stopPropagation();
    tok.classList.add('dragging');
    var t = e.touches[0];
    var rect = tok.getBoundingClientRect();
    dragOffX = t.clientX - rect.left;
    dragOffY = t.clientY - rect.top;
  }, { passive: true });
  tok.addEventListener('touchmove', function(e) {
    e.stopPropagation(); e.preventDefault();
    var t = e.touches[0];
    var cRect = containerEl.getBoundingClientRect();
    var newLeft = t.clientX - cRect.left - dragOffX;
    var newTop  = t.clientY - cRect.top  - dragOffY;
    // Mantener dentro del contenedor
    newLeft = Math.max(0, Math.min(cRect.width  - tokenSize, newLeft));
    newTop  = Math.max(0, Math.min(cRect.height - tokenSize, newTop));
    tok.style.left = newLeft + 'px';
    tok.style.top  = newTop  + 'px';
  }, { passive: false });
  tok.addEventListener('touchend', function() {
    tok.classList.remove('dragging');
  });

  // Drag con mouse
  tok.addEventListener('mousedown', function(e) {
    e.stopPropagation();
    tok.classList.add('dragging');
    var startL = parseInt(tok.style.left);
    var startT = parseInt(tok.style.top);
    var startMX = e.clientX; var startMY = e.clientY;
    function onMove(ev) {
      var cRect = containerEl.getBoundingClientRect();
      var newLeft = startL + (ev.clientX - startMX);
      var newTop  = startT + (ev.clientY - startMY);
      newLeft = Math.max(0, Math.min(cRect.width  - tokenSize, newLeft));
      newTop  = Math.max(0, Math.min(cRect.height - tokenSize, newTop));
      tok.style.left = newLeft + 'px';
      tok.style.top  = newTop  + 'px';
    }
    function onUp() {
      tok.classList.remove('dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  containerEl.appendChild(tok);
}

// ─── Ficha del balón ──────────────────────────────────────────────────────────
var ballToken = null;

function createBallToken(containerEl) {
  var tok = document.createElement('div');
  tok.className = 'ball-token';
  tok.id = 'ball-token';
  tok.textContent = '⚽';
  var tokenSize = 30;
  tok.style.left = (containerEl.clientWidth  / 2 - tokenSize / 2) + 'px';
  tok.style.top  = (containerEl.clientHeight / 2 - tokenSize / 2) + 'px';

  var dragOffX = 0, dragOffY = 0;
  tok.addEventListener('touchstart', function(e) {
    e.stopPropagation();
    tok.classList.add('dragging');
    var t = e.touches[0];
    var rect = tok.getBoundingClientRect();
    dragOffX = t.clientX - rect.left;
    dragOffY = t.clientY - rect.top;
  }, { passive: true });
  tok.addEventListener('touchmove', function(e) {
    e.stopPropagation(); e.preventDefault();
    var t = e.touches[0];
    var cRect = containerEl.getBoundingClientRect();
    var newLeft = t.clientX - cRect.left - dragOffX;
    var newTop  = t.clientY - cRect.top  - dragOffY;
    newLeft = Math.max(0, Math.min(cRect.width  - tokenSize, newLeft));
    newTop  = Math.max(0, Math.min(cRect.height - tokenSize, newTop));
    tok.style.left = newLeft + 'px';
    tok.style.top  = newTop  + 'px';
  }, { passive: false });
  tok.addEventListener('touchend', function() { tok.classList.remove('dragging'); });

  tok.addEventListener('mousedown', function(e) {
    e.stopPropagation();
    tok.classList.add('dragging');
    var startL = parseInt(tok.style.left);
    var startT = parseInt(tok.style.top);
    var startMX = e.clientX; var startMY = e.clientY;
    function onMove(ev) {
      var cRect = containerEl.getBoundingClientRect();
      var newLeft = startL + (ev.clientX - startMX);
      var newTop  = startT + (ev.clientY - startMY);
      newLeft = Math.max(0, Math.min(cRect.width  - tokenSize, newLeft));
      newTop  = Math.max(0, Math.min(cRect.height - tokenSize, newTop));
      tok.style.left = newLeft + 'px';
      tok.style.top  = newTop  + 'px';
    }
    function onUp() {
      tok.classList.remove('dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  containerEl.appendChild(tok);
  ballToken = tok;
}

function resetBall() {
  if (!ballToken) return;
  var containerEl = document.getElementById('canvas-container');
  var tokenSize = 30;
  ballToken.style.left = (containerEl.clientWidth  / 2 - tokenSize / 2) + 'px';
  ballToken.style.top  = (containerEl.clientHeight / 2 - tokenSize / 2) + 'px';
}

function createAllTokens() {
  var cont = document.getElementById('canvas-container');
  FORMATION_LOCAL.forEach(function(d) { createToken(d, TEAM_A_COLOR, cont); });
  FORMATION_RIVAL.forEach(function(d) { createToken(d, TEAM_B_COLOR, cont); });
  createBallToken(cont); // ficha del balón en el centro
}

// ─── Inicialización ───────────────────────────────────────────────────────────
window.addEventListener('load', function() {
  resize();
  createAllTokens();
});
window.addEventListener('resize', resize);
</script>
</body>
</html>`;

export default function TacticalBoard({ onSave, style }) {
  const webviewRef = useRef(null);

  function handleMessage(event) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'save' && onSave) {
        onSave(data.image);
      }
    } catch (_) {}
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webviewRef}
        source={{ html: TACTICAL_HTML }}
        style={styles.webview}
        javaScriptEnabled
        originWhitelist={['*']}
        onMessage={handleMessage}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        // Permite que los eventos táctiles del canvas no se propaguen al scroll
        nestedScrollEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview:   { flex: 1, backgroundColor: '#1a1a2e' },
});
