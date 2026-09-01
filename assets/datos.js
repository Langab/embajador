/* =========================================================================
   datos.js — el catálogo: deportes, ligas, equipos y tipos de apuesta.
   Los nombres de los mercados siguen los que usa BetPlay en español, para que
   anotar un boleto sea copiar lo que dice la pantalla y no traducir nada.
   ========================================================================= */

(function (global) {
  'use strict';

  /* ====================== deportes ====================== */
  var DEPORTES = {
    futbol:     { n: 'Fútbol', ico: '⚽' },
    baloncesto: { n: 'Baloncesto', ico: '🏀' },
    tenis:      { n: 'Tenis', ico: '🎾' },
    otro:       { n: 'Otro', ico: '🏅' }
  };

  /* ====================== ligas ======================
     `id` es el identificador de la CDN de escudos; `c` son los colores del
     torneo para el escudo generado cuando la imagen no carga. */
  var LIGAS = {
    /* --- las cinco grandes de Europa --- */
    premier:    { n: 'Premier League',      pais: 'Inglaterra', deporte: 'futbol', grupo: 'Europa', id: 39,  c: ['#3D195B', '#FFFFFF'] },
    laliga:     { n: 'LaLiga',              pais: 'España',     deporte: 'futbol', grupo: 'Europa', id: 140, c: ['#E52534', '#FFFFFF'] },
    seriea:     { n: 'Serie A',             pais: 'Italia',     deporte: 'futbol', grupo: 'Europa', id: 135, c: ['#0B4EA2', '#FFFFFF'] },
    bundesliga: { n: 'Bundesliga',          pais: 'Alemania',   deporte: 'futbol', grupo: 'Europa', id: 78,  c: ['#D20515', '#FFFFFF'] },
    ligue1:     { n: 'Ligue 1',             pais: 'Francia',    deporte: 'futbol', grupo: 'Europa', id: 61,  c: ['#091C3E', '#D8B26A'] },

    /* --- Sudamérica y Turquía --- */
    betplay:    { n: 'Liga BetPlay Dimayor', pais: 'Colombia',  deporte: 'futbol', grupo: 'América', id: 239, c: ['#00A94F', '#FFFFFF'] },
    brasileirao:{ n: 'Brasileirão Série A',  pais: 'Brasil',    deporte: 'futbol', grupo: 'América', id: 71,  c: ['#009C3B', '#FFDF00'] },
    argentina:  { n: 'Liga Profesional',     pais: 'Argentina', deporte: 'futbol', grupo: 'América', id: 128, c: ['#75AADB', '#FFFFFF'] },
    superlig:   { n: 'Süper Lig',            pais: 'Turquía',   deporte: 'futbol', grupo: 'Europa',  id: 203, c: ['#E30A17', '#FFFFFF'] },

    /* --- copas --- */
    champions:  { n: 'Champions League',     pais: 'Europa',    deporte: 'futbol', grupo: 'Copas', id: 2,   c: ['#0A1E5E', '#FFFFFF'] },
    europa:     { n: 'Europa League',        pais: 'Europa',    deporte: 'futbol', grupo: 'Copas', id: 3,   c: ['#FF5C00', '#1B1B1B'] },
    libertadores:{ n: 'Copa Libertadores',   pais: 'América',   deporte: 'futbol', grupo: 'Copas', id: 13,  c: ['#B99B4E', '#0D1B3E'] },
    sudamericana:{ n: 'Copa Sudamericana',   pais: 'América',   deporte: 'futbol', grupo: 'Copas', id: 11,  c: ['#F5A623', '#0D1B3E'] },
    mundial:    { n: 'Selecciones',          pais: 'Mundo',     deporte: 'futbol', grupo: 'Copas', id: 1,   c: ['#2F4B8D', '#FFFFFF'] },

    /* --- otros deportes --- */
    nba:        { n: 'NBA',                  pais: 'EE. UU.',   deporte: 'baloncesto', grupo: 'Otros deportes', id: 12, c: ['#1D428A', '#C8102E'] },
    atp:        { n: 'Tenis ATP / WTA',      pais: 'Mundo',     deporte: 'tenis',      grupo: 'Otros deportes', id: 0,  c: ['#0E7A5F', '#FFFFFF'] },
    otra:       { n: 'Otra competición',     pais: '',          deporte: 'otro',       grupo: 'Otros deportes', id: 0,  c: ['#5A6478', '#FFFFFF'] }
  };

  /* ====================== tipos de apuesta ======================
     `opciones` arma los botones de "a qué le apostaste". Los comodines
     @local y @visita se reemplazan por los nombres reales de los equipos.
     `linea` marca los mercados que necesitan un número (2.5 goles, −1 de
     hándicap) para quedar bien anotados. */
  var MERCADOS = [
    /* --- los principales --- */
    { k: '1x2',        n: 'Resultado del partido (1X2)', grupo: 'Principales', deporte: 'futbol',
      opciones: ['@local', 'Empate', '@visita'] },
    { k: 'doble',      n: 'Doble oportunidad',           grupo: 'Principales', deporte: 'futbol',
      opciones: ['@localOempate', '@localOvisita', '@visitaOempate'] },
    { k: 'dnb',        n: 'Empate no válido',            grupo: 'Principales', deporte: 'futbol',
      opciones: ['@local', '@visita'] },
    { k: 'ambos',      n: 'Ambos equipos marcan',        grupo: 'Principales', deporte: 'futbol',
      opciones: ['Sí', 'No'] },
    { k: 'totalgoles', n: 'Más / Menos goles',           grupo: 'Principales', deporte: 'futbol',
      opciones: ['Más de', 'Menos de'], linea: true, etiquetaLinea: 'Línea de goles', ejemploLinea: '2.5' },

    /* --- hándicaps --- */
    { k: 'hasiatico',  n: 'Hándicap asiático',           grupo: 'Hándicaps', deporte: 'futbol',
      opciones: ['@local', '@visita'], linea: true, etiquetaLinea: 'Hándicap', ejemploLinea: '-0.5' },
    { k: 'heuropeo',   n: 'Hándicap europeo',            grupo: 'Hándicaps', deporte: 'futbol',
      opciones: ['@local', 'Empate', '@visita'], linea: true, etiquetaLinea: 'Hándicap', ejemploLinea: '-1' },
    { k: 'totalasia',  n: 'Más / Menos asiático',        grupo: 'Hándicaps', deporte: 'futbol',
      opciones: ['Más de', 'Menos de'], linea: true, etiquetaLinea: 'Línea', ejemploLinea: '2.25' },

    /* --- mitades --- */
    { k: 'primert',    n: 'Resultado del primer tiempo', grupo: 'Por tiempos', deporte: 'futbol',
      opciones: ['@local', 'Empate', '@visita'] },
    { k: 'mitadfinal', n: 'Descanso / Final',            grupo: 'Por tiempos', deporte: 'futbol' },
    { k: 'golespt',    n: 'Goles del primer tiempo',     grupo: 'Por tiempos', deporte: 'futbol',
      opciones: ['Más de', 'Menos de'], linea: true, etiquetaLinea: 'Línea', ejemploLinea: '0.5' },

    /* --- por equipo --- */
    { k: 'goleslocal', n: 'Goles del local',             grupo: 'Por equipo', deporte: 'futbol',
      opciones: ['Más de', 'Menos de'], linea: true, etiquetaLinea: 'Línea', ejemploLinea: '1.5' },
    { k: 'golesvisita',n: 'Goles del visitante',         grupo: 'Por equipo', deporte: 'futbol',
      opciones: ['Más de', 'Menos de'], linea: true, etiquetaLinea: 'Línea', ejemploLinea: '1.5' },
    { k: 'porteria',   n: 'Portería en cero',            grupo: 'Por equipo', deporte: 'futbol',
      opciones: ['@local', '@visita'] },

    /* --- resultados y jugadores --- */
    { k: 'exacto',     n: 'Marcador exacto',             grupo: 'Resultados', deporte: 'futbol' },
    { k: 'margen',     n: 'Margen de victoria',          grupo: 'Resultados', deporte: 'futbol' },
    { k: 'parimpar',   n: 'Par / Impar',                 grupo: 'Resultados', deporte: 'futbol',
      opciones: ['Par', 'Impar'] },
    { k: 'goleador',   n: 'Goleador',                    grupo: 'Jugadores', deporte: 'futbol' },
    { k: 'tarjetas',   n: 'Tarjetas',                    grupo: 'Jugadores', deporte: 'futbol',
      opciones: ['Más de', 'Menos de'], linea: true, etiquetaLinea: 'Línea', ejemploLinea: '4.5' },
    { k: 'corners',    n: 'Córners',                     grupo: 'Jugadores', deporte: 'futbol',
      opciones: ['Más de', 'Menos de'], linea: true, etiquetaLinea: 'Línea', ejemploLinea: '9.5' },

    /* --- otros deportes --- */
    { k: 'ganador',    n: 'Ganador del encuentro',       grupo: 'Otros deportes',
      opciones: ['@local', '@visita'] },
    { k: 'spread',     n: 'Hándicap de puntos',          grupo: 'Otros deportes',
      opciones: ['@local', '@visita'], linea: true, etiquetaLinea: 'Hándicap', ejemploLinea: '-4.5' },
    { k: 'totalpuntos',n: 'Más / Menos puntos',          grupo: 'Otros deportes',
      opciones: ['Más de', 'Menos de'], linea: true, etiquetaLinea: 'Línea', ejemploLinea: '210.5' },

    /* --- comodín --- */
    { k: 'otro',       n: 'Otro mercado',                grupo: 'Otros deportes' }
  ];

  var MERCADOS_POR_CLAVE = {};
  MERCADOS.forEach(function (m) { MERCADOS_POR_CLAVE[m.k] = m; });

  /* ====================== equipos ======================
     Se completa en equipos.js, que se genera aparte por ser una tabla larga. */
  var EQUIPOS = global.EQUIPOS_CATALOGO || {};

  var indice = null;
  function normalizar(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }
  function construirIndice() {
    indice = {};
    Object.keys(EQUIPOS).forEach(function (liga) {
      (EQUIPOS[liga] || []).forEach(function (e) {
        var reg = { n: e.n, id: e.id, c: e.c, liga: liga };
        indice[normalizar(e.n)] = reg;
        (e.alias || []).forEach(function (a) {
          if (!indice[normalizar(a)]) indice[normalizar(a)] = reg;
        });
      });
    });
  }
  function buscarEquipo(nombre) {
    if (!nombre) return null;
    if (!indice) construirIndice();
    return indice[normalizar(nombre)] || null;
  }
  function equiposDeLiga(liga) {
    if (liga && EQUIPOS[liga]) return EQUIPOS[liga];
    // sin liga elegida se ofrecen todos, para no bloquear el registro
    var todos = [];
    Object.keys(EQUIPOS).forEach(function (k) { todos = todos.concat(EQUIPOS[k] || []); });
    return todos;
  }

  /* ====================== escudos ====================== */
  /* La CDN de API-Sports sirve los escudos por id, sin clave y con CORS
     abierto. Si algún día deja de responder, escudos.js dibuja el respaldo. */
  function urlEscudo(id) {
    return id ? 'https://media.api-sports.io/football/teams/' + id + '.png' : null;
  }
  function urlLiga(id) {
    return id ? 'https://media.api-sports.io/football/leagues/' + id + '.png' : null;
  }

  /* ====================== opciones para los <select> ====================== */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function opcionesLigas(sel) {
    var grupos = {};
    Object.keys(LIGAS).forEach(function (k) {
      var l = LIGAS[k];
      (grupos[l.grupo] = grupos[l.grupo] || []).push([k, l]);
    });
    return ['Europa', 'América', 'Copas', 'Otros deportes'].filter(function (g) { return grupos[g]; })
      .map(function (g) {
        return '<optgroup label="' + esc(g) + '">' + grupos[g].map(function (par) {
          return '<option value="' + esc(par[0]) + '"' + (par[0] === sel ? ' selected' : '') + '>' +
            esc(par[1].n) + (par[1].pais ? ' · ' + esc(par[1].pais) : '') + '</option>';
        }).join('') + '</optgroup>';
      }).join('');
  }
  function opcionesMercados(sel, deporte) {
    var grupos = {};
    MERCADOS.forEach(function (m) {
      (grupos[m.grupo] = grupos[m.grupo] || []).push(m);
    });
    return Object.keys(grupos).map(function (g) {
      return '<optgroup label="' + esc(g) + '">' + grupos[g].map(function (m) {
        return '<option value="' + esc(m.k) + '"' + (m.k === sel ? ' selected' : '') + '>' + esc(m.n) + '</option>';
      }).join('') + '</optgroup>';
    }).join('');
  }

  global.DATOS = {
    DEPORTES: DEPORTES, LIGAS: LIGAS, MERCADOS: MERCADOS,
    MERCADOS_POR_CLAVE: MERCADOS_POR_CLAVE, EQUIPOS: EQUIPOS,
    buscarEquipo: buscarEquipo, equiposDeLiga: equiposDeLiga,
    urlEscudo: urlEscudo, urlLiga: urlLiga,
    opcionesLigas: opcionesLigas, opcionesMercados: opcionesMercados,
    normalizar: normalizar
  };
})(window);
