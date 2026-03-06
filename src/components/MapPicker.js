/**
 * MapPicker.js — Componente de selección de ubicación con Leaflet + OpenStreetMap
 * Usa react-native-webview para renderizar el mapa en un WebView.
 * Comunicación: WebView → RN via postMessage / onMessage.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * Construye el HTML completo del mapa Leaflet con los parámetros iniciales inyectados.
 * @param {number} initialLat  Latitud inicial del centro del mapa
 * @param {number} initialLng  Longitud inicial del centro del mapa
 * @param {number} initialZoom Nivel de zoom inicial
 * @param {string} initialAddr Dirección inicial (para modo edición)
 * @param {boolean} hasInitial Si true, coloca marcador en la posición inicial
 */
function buildMapHtml(initialLat, initialLng, initialZoom, initialAddr, hasInitial) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    #map { position: absolute; inset: 0; z-index: 0; }

    /* ── Barra de búsqueda ── */
    #search-container {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      z-index: 1000;
    }
    #search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fff;
      border-radius: 8px;
      padding: 8px 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.25);
    }
    #search-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 14px;
      color: #222;
      min-width: 0;
      background: transparent;
    }
    #search-input::placeholder { color: #aaa; }
    #search-btn {
      background: #FF6F00;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 7px 14px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      flex-shrink: 0;
    }
    #search-results {
      background: #fff;
      border-radius: 8px;
      margin-top: 5px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.22);
      max-height: 220px;
      overflow-y: auto;
      display: none;
    }
    .result-item {
      padding: 10px 14px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      font-size: 13px;
      color: #333;
      line-height: 1.4;
    }
    .result-item:last-child { border-bottom: none; }
    .result-item:active { background: #f5f5f5; }

    /* ── Botón confirmar ── */
    #confirm-btn {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      background: #00AA13;
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 14px 36px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 3px 12px rgba(0,0,0,0.3);
      white-space: nowrap;
      min-width: 180px;
      text-align: center;
    }
    #confirm-btn:disabled {
      background: #b0b0b0;
      cursor: default;
      box-shadow: none;
    }

    /* ── Sin conexión ── */
    #no-conn {
      display: none;
      position: absolute;
      inset: 0;
      z-index: 2000;
      background: #f5f5f5;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    #no-conn.visible { display: flex; }
    #no-conn .icon { font-size: 48px; }
    #no-conn .title { font-weight: 700; font-size: 18px; color: #333; }
    #no-conn .subtitle { font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div id="no-conn">
    <div class="icon">📡</div>
    <div class="title">Sin conexión</div>
    <div class="subtitle">El mapa no está disponible.</div>
  </div>

  <div id="search-container">
    <div id="search-box">
      <input id="search-input" type="text" placeholder="Buscar campo o dirección..." autocomplete="off" />
      <button id="search-btn">Buscar</button>
    </div>
    <div id="search-results"></div>
  </div>

  <div id="map"></div>
  <button id="confirm-btn" disabled>Confirmar ubicación</button>

  <script>
    var map, marker, selectedLocation = null;
    var HAS_INITIAL = ${hasInitial ? 'true' : 'false'};
    var INITIAL_LAT  = ${initialLat};
    var INITIAL_LNG  = ${initialLng};
    var INITIAL_ZOOM = ${initialZoom};
    var INITIAL_ADDR = ${JSON.stringify(initialAddr)};

    // ── Inicializar mapa ────────────────────────────────────────────────────
    try {
      map = L.map('map', {
        zoomControl: true,
        attributionControl: true,
      }).setView([INITIAL_LAT, INITIAL_LNG], INITIAL_ZOOM);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Marcador inicial en modo edición
      if (HAS_INITIAL) {
        marker = L.marker([INITIAL_LAT, INITIAL_LNG]).addTo(map);
        selectedLocation = {
          latitude: INITIAL_LAT,
          longitude: INITIAL_LNG,
          address: INITIAL_ADDR,
          name: INITIAL_ADDR ? INITIAL_ADDR.split(',')[0].trim() : '',
        };
        document.getElementById('confirm-btn').disabled = false;
        if (INITIAL_ADDR) {
          marker.bindPopup(INITIAL_ADDR).openPopup();
        }
      }

      // Click en el mapa para colocar marcador
      map.on('click', function(e) {
        placeMarker(e.latlng.lat, e.latlng.lng, null);
      });

    } catch (err) {
      document.getElementById('no-conn').classList.add('visible');
    }

    // ── Colocar/mover marcador con geocodificación inversa ──────────────────
    function placeMarker(lat, lng, overrideAddress) {
      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lng]).addTo(map);
      selectedLocation = { latitude: lat, longitude: lng, address: '', name: '' };
      document.getElementById('confirm-btn').disabled = false;

      // Si se tiene una dirección del buscador, usarla directamente
      if (overrideAddress) {
        marker.bindPopup(overrideAddress).openPopup();
        selectedLocation.address = overrideAddress;
        selectedLocation.name = overrideAddress.split(',')[0].trim();
        return;
      }

      // Geocodificación inversa con Nominatim
      fetch(
        'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&accept-language=es',
        { headers: { 'User-Agent': 'FutManager/1.0' } }
      )
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var addr = data.display_name || (lat.toFixed(5) + ', ' + lng.toFixed(5));
        var name = (data.name || addr.split(',')[0]).trim();
        marker.bindPopup(addr).openPopup();
        selectedLocation = { latitude: lat, longitude: lng, address: addr, name: name };
      })
      .catch(function() {
        var coord = lat.toFixed(5) + ', ' + lng.toFixed(5);
        marker.bindPopup(coord).openPopup();
        selectedLocation = { latitude: lat, longitude: lng, address: coord, name: coord };
      });
    }

    // ── Buscador con Nominatim ──────────────────────────────────────────────
    var searchTimeout = null;

    document.getElementById('search-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        clearTimeout(searchTimeout);
        doSearch(this.value);
      }
    });

    document.getElementById('search-btn').addEventListener('click', function() {
      clearTimeout(searchTimeout);
      doSearch(document.getElementById('search-input').value);
    });

    // Debounce de 500ms al escribir
    document.getElementById('search-input').addEventListener('input', function() {
      clearTimeout(searchTimeout);
      var q = this.value;
      if (q.length < 3) { hideResults(); return; }
      searchTimeout = setTimeout(function() { doSearch(q); }, 500);
    });

    function doSearch(q) {
      if (!q || q.trim().length < 2) return;
      fetch(
        'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(q.trim()) + '&limit=5&accept-language=es',
        { headers: { 'User-Agent': 'FutManager/1.0' } }
      )
      .then(function(r) { return r.json(); })
      .then(function(results) { showResults(results); })
      .catch(function() { hideResults(); });
    }

    function showResults(results) {
      var container = document.getElementById('search-results');
      container.innerHTML = '';
      if (!results || results.length === 0) {
        container.style.display = 'none';
        return;
      }
      results.forEach(function(r) {
        var div = document.createElement('div');
        div.className = 'result-item';
        div.textContent = r.display_name;
        div.addEventListener('click', function() {
          var lat = parseFloat(r.lat);
          var lng = parseFloat(r.lon);
          map.setView([lat, lng], 16);
          placeMarker(lat, lng, r.display_name);
          document.getElementById('search-input').value = r.display_name.split(',')[0].trim();
          hideResults();
        });
        container.appendChild(div);
      });
      container.style.display = 'block';
    }

    function hideResults() {
      document.getElementById('search-results').style.display = 'none';
    }

    // Cerrar resultados al hacer tap fuera del buscador
    document.addEventListener('click', function(e) {
      if (!document.getElementById('search-container').contains(e.target)) {
        hideResults();
      }
    });

    // ── Botón confirmar: envía datos a React Native ─────────────────────────
    document.getElementById('confirm-btn').addEventListener('click', function() {
      if (!selectedLocation) return;
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(selectedLocation));
      }
    });
  <\/script>
</body>
</html>`;
}

/**
 * MapPicker — componente de selección de ubicación interactiva.
 * @param {function} onLocationSelect  Callback con { latitude, longitude, address, name }
 * @param {number}   initialLatitude   Latitud inicial (modo edición)
 * @param {number}   initialLongitude  Longitud inicial (modo edición)
 * @param {string}   initialAddress    Dirección inicial (modo edición)
 */
export default function MapPicker({
  onLocationSelect,
  initialLatitude,
  initialLongitude,
  initialAddress,
}) {
  const hasInitial = !!(initialLatitude && initialLongitude);
  const lat  = hasInitial ? initialLatitude  : 40.4168;
  const lng  = hasInitial ? initialLongitude : -3.7038;
  const zoom = hasInitial ? 15 : 6;
  const addr = initialAddress || '';

  const html = buildMapHtml(lat, lng, zoom, addr, hasInitial);

  function handleMessage(event) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (onLocationSelect) onLocationSelect(data);
    } catch (e) {
      console.error('[MapPicker] Error al parsear mensaje del WebView:', e);
    }
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ html }}
        onMessage={handleMessage}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
        allowsInlineMediaPlayback
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview:   { flex: 1 },
});
