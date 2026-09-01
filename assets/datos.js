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
  /* Todos los `id` están verificados uno a uno contra la CDN: se descargó el
     logo de cada competición y se comprobó a ojo que fuera la correcta. */
  var LIGAS = {
    /* --- las cinco grandes de Europa, más Turquía --- */
    premier:    { n: 'Premier League',      pais: 'Inglaterra', deporte: 'futbol', grupo: 'Ligas de Europa', id: 39,  c: ['#3D195B', '#FFFFFF'] },
    laliga:     { n: 'LaLiga',              pais: 'España',     deporte: 'futbol', grupo: 'Ligas de Europa', id: 140, c: ['#E52534', '#FFFFFF'] },
    seriea:     { n: 'Serie A',             pais: 'Italia',     deporte: 'futbol', grupo: 'Ligas de Europa', id: 135, c: ['#0B4EA2', '#FFFFFF'] },
    bundesliga: { n: 'Bundesliga',          pais: 'Alemania',   deporte: 'futbol', grupo: 'Ligas de Europa', id: 78,  c: ['#D20515', '#FFFFFF'] },
    ligue1:     { n: 'Ligue 1',             pais: 'Francia',    deporte: 'futbol', grupo: 'Ligas de Europa', id: 61,  c: ['#091C3E', '#D8B26A'] },
    superlig:   { n: 'Süper Lig',           pais: 'Turquía',    deporte: 'futbol', grupo: 'Ligas de Europa', id: 203, c: ['#E30A17', '#FFFFFF'] },

    /* --- ligas de América --- */
    betplay:    { n: 'Liga BetPlay Dimayor', pais: 'Colombia',  deporte: 'futbol', grupo: 'Ligas de América', id: 239, c: ['#00A94F', '#FFFFFF'] },
    brasileirao:{ n: 'Brasileirão Série A',  pais: 'Brasil',    deporte: 'futbol', grupo: 'Ligas de América', id: 71,  c: ['#009C3B', '#FFDF00'] },
    argentina:  { n: 'Liga Profesional',     pais: 'Argentina', deporte: 'futbol', grupo: 'Ligas de América', id: 128, c: ['#75AADB', '#FFFFFF'] },

    /* --- copas europeas --- */
    champions:  { n: 'Champions League',     pais: 'Europa',    deporte: 'futbol', grupo: 'Copas de Europa', id: 2,   c: ['#0A1E5E', '#FFFFFF'] },
    europa:     { n: 'Europa League',        pais: 'Europa',    deporte: 'futbol', grupo: 'Copas de Europa', id: 3,   c: ['#FF5C00', '#1B1B1B'] },
    conference: { n: 'Conference League',    pais: 'Europa',    deporte: 'futbol', grupo: 'Copas de Europa', id: 848, c: ['#00B94E', '#FFFFFF'] },
    supercopaeu:{ n: 'Supercopa de Europa',  pais: 'Europa',    deporte: 'futbol', grupo: 'Copas de Europa', id: 531, c: ['#0A1E5E', '#C9B37E'] },

    /* --- copas de América --- */
    libertadores:{ n: 'Copa Libertadores',   pais: 'América',   deporte: 'futbol', grupo: 'Copas de América', id: 13,  c: ['#B99B4E', '#0D1B3E'] },
    sudamericana:{ n: 'Copa Sudamericana',   pais: 'América',   deporte: 'futbol', grupo: 'Copas de América', id: 11,  c: ['#F5A623', '#0D1B3E'] },

    /* --- copas nacionales --- */
    facup:      { n: 'FA Cup',               pais: 'Inglaterra', deporte: 'futbol', grupo: 'Copas nacionales', id: 45,  c: ['#E5202E', '#FFFFFF'] },
    carabao:    { n: 'Carabao Cup',          pais: 'Inglaterra', deporte: 'futbol', grupo: 'Copas nacionales', id: 48,  c: ['#009A44', '#F5C518'] },
    copadelrey: { n: 'Copa del Rey',         pais: 'España',     deporte: 'futbol', grupo: 'Copas nacionales', id: 143, c: ['#003B7C', '#C9B37E'] },
    coppaitalia:{ n: 'Coppa Italia',         pais: 'Italia',     deporte: 'futbol', grupo: 'Copas nacionales', id: 137, c: ['#0B4EA2', '#FFFFFF'] },
    dfbpokal:   { n: 'DFB-Pokal',            pais: 'Alemania',   deporte: 'futbol', grupo: 'Copas nacionales', id: 81,  c: ['#E30613', '#F5C518'] },
    coupefrance:{ n: 'Copa de Francia',      pais: 'Francia',    deporte: 'futbol', grupo: 'Copas nacionales', id: 66,  c: ['#1F3B73', '#FFFFFF'] },
    copaturquia:{ n: 'Copa de Turquía',      pais: 'Turquía',    deporte: 'futbol', grupo: 'Copas nacionales', id: 206, c: ['#E30A17', '#FFFFFF'] },
    copacolombia:{ n: 'Copa BetPlay Dimayor', pais: 'Colombia',  deporte: 'futbol', grupo: 'Copas nacionales', id: 240, c: ['#00A94F', '#FFFFFF'] },
    copabrasil: { n: 'Copa do Brasil',       pais: 'Brasil',     deporte: 'futbol', grupo: 'Copas nacionales', id: 73,  c: ['#009C3B', '#FFDF00'] },
    copaargentina:{ n: 'Copa Argentina',     pais: 'Argentina',  deporte: 'futbol', grupo: 'Copas nacionales', id: 130, c: ['#75AADB', '#FFFFFF'] },

    /* --- otros --- */
    mundial:    { n: 'Selecciones',          pais: 'Mundo',     deporte: 'futbol', grupo: 'Otros', id: 1,   c: ['#2F4B8D', '#FFFFFF'] },
    nba:        { n: 'NBA',                  pais: 'EE. UU.',   deporte: 'baloncesto', grupo: 'Otros', id: 12, c: ['#1D428A', '#C8102E'] },
    atp:        { n: 'Tenis ATP / WTA',      pais: 'Mundo',     deporte: 'tenis',      grupo: 'Otros', id: 0,  c: ['#0E7A5F', '#FFFFFF'] },
    otra:       { n: 'Otra competición',     pais: '',          deporte: 'otro',       grupo: 'Otros', id: 0,  c: ['#5A6478', '#FFFFFF'] }
  };

  /* ====================== tipos de apuesta ======================
     Los nombres son los que BetPlay muestra en pantalla, tal cual. La
     plataforma corre sobre Kambi, así que "Resultado Final" no es "1X2",
     los córners son "Tiros de Esquina" y el marcador exacto es "Resultado
     Correcto": anotar un boleto es copiar lo que dice la app, sin traducir.

     `opciones` arma los botones de "a qué le apostaste"; @local y @visita se
     reemplazan por los nombres reales de los equipos. `linea` marca los
     mercados que necesitan un número (2,5 goles; −1 de hándicap). */
  var MERCADOS = [
    /* --- los que más se juegan --- */
    { k: 'resultado',  n: 'Resultado Final', grupo: 'Principales', deporte: 'futbol',
      opciones: ['@local', 'Empate', '@visita'] },
    { k: 'doble',      n: 'Doble Oportunidad', grupo: 'Principales', deporte: 'futbol',
      opciones: ['@localOempate', '@localOvisita', '@visitaOempate'] },
    { k: 'sinempate',  n: 'Apuesta sin empate', grupo: 'Principales', deporte: 'futbol',
      opciones: ['@local', '@visita'] },
    { k: 'ambos',      n: 'Ambos Equipos Marcarán', grupo: 'Principales', deporte: 'futbol',
      opciones: ['Sí', 'No'] },
    { k: 'totalgoles', n: 'Total de goles', grupo: 'Principales', deporte: 'futbol',
      opciones: ['Más de', 'Menos de'], linea: true, etiquetaLinea: 'Línea de goles', ejemploLinea: '2.5' },
    { k: 'correcto',   n: 'Resultado Correcto', grupo: 'Principales', deporte: 'futbol' },

    /* --- hándicaps --- */
    { k: 'hasiatico',  n: 'Hándicap Asiático', grupo: 'Hándicaps', deporte: 'futbol',
      opciones: ['@local', '@visita'], linea: true, etiquetaLinea: 'Hándicap', ejemploLinea: '-0.5' },
    { k: 'h3way',      n: 'Hándicap 3-Way', grupo: 'Hándicaps', deporte: 'futbol',
      opciones: ['@local', 'Empate', '@visita'], linea: true, etiquetaLinea: 'Hándicap', ejemploLinea: '-1' },
    { k: 'handicap',   n: 'Hándicap', grupo: 'Hándicaps', deporte: 'futbol',
      opciones: ['@local', '@visita'], linea: true, etiquetaLinea: 'Hándicap', ejemploLinea: '-1' },
    { k: 'totalasia',  n: 'Total asiático', grupo: 'Hándicaps', deporte: 'futbol',
      opciones: ['Más de', 'Menos de'], linea: true, etiquetaLinea: 'Línea', ejemploLinea: '2.25' },

    /* --- por tiempos --- */
    { k: 'descanso',   n: 'Descanso', grupo: 'Por tiempos', deporte: 'futbol',
      opciones: ['@local', 'Empate', '@visita'] },
    { k: 'htft',       n: 'Primera parte/Tiempo reglamentario', grupo: 'Por tiempos', deporte: 'futbol' },
    { k: 'segunda',    n: '2.ª parte', grupo: 'Por tiempos', deporte: 'futbol',
      opciones: ['@local', 'Empate', '@visita'] },
    { k: 'goles1p',    n: 'Total de goles - 1.ª parte', grupo: 'Por tiempos', deporte: 'futbol',
      opciones: ['Más de', 'Menos de'], linea: true, etiquetaLinea: 'Línea', ejemploLinea: '0.5' },
    { k: 'goles2p',    n: 'Total de goles - 2.ª parte', grupo: 'Por tiempos', deporte: 'futbol',
      opciones: ['Más de', 'Menos de'], linea: true, etiquetaLinea: 'Línea', ejemploLinea: '1.5' },

    /* --- por equipo --- */
    { k: 'golesequipo', n: 'Total de goles de un equipo', grupo: 'Por equipo', deporte: 'futbol',
      opciones: ['Más de', 'Menos de'], linea: true, etiquetaLinea: 'Línea', ejemploLinea: '1.5' },
    { k: 'sinrecibir', n: 'Victoria sin recibir goles en contra', grupo: 'Por equipo', deporte: 'futbol',
      opciones: ['@local', '@visita'] },
    { k: 'ganayambos', n: 'Victoria y ambos equipos marcan', grupo: 'Por equipo', deporte: 'futbol',
      opciones: ['@local', '@visita'] },

    /* --- tiros de esquina y tarjetas --- */
    { k: 'corners',    n: 'Total de Tiros de Esquina', grupo: 'Esquinas y tarjetas', deporte: 'futbol',
      opciones: ['Más de', 'Menos de'], linea: true, etiquetaLinea: 'Línea', ejemploLinea: '9.5' },
    { k: 'mascorners', n: 'Más Tiros de Esquina', grupo: 'Esquinas y tarjetas', deporte: 'futbol',
      opciones: ['@local', 'Empate', '@visita'] },
    { k: 'tarjetas',   n: 'Total de tarjetas', grupo: 'Esquinas y tarjetas', deporte: 'futbol',
      opciones: ['Más de', 'Menos de'], linea: true, etiquetaLinea: 'Línea', ejemploLinea: '4.5' },
    { k: 'mastarjetas',n: 'Más Tarjetas', grupo: 'Esquinas y tarjetas', deporte: 'futbol',
      opciones: ['@local', 'Empate', '@visita'] },
    { k: 'roja',       n: 'Tarjeta Roja en el Partido', grupo: 'Esquinas y tarjetas', deporte: 'futbol',
      opciones: ['Sí', 'No'] },

    /* --- jugadores --- */
    { k: 'primergol',  n: 'Anotador del primer gol', grupo: 'Jugadores', deporte: 'futbol' },
    { k: 'anotara',    n: 'Anotará', grupo: 'Jugadores', deporte: 'futbol' },
    { k: 'disparos',   n: 'Disparos del jugador', grupo: 'Jugadores', deporte: 'futbol',
      opciones: ['Más de', 'Menos de'], linea: true, etiquetaLinea: 'Línea', ejemploLinea: '1.5' },
    { k: 'asistencia', n: 'Da una asistencia', grupo: 'Jugadores', deporte: 'futbol' },

    /* --- otros deportes --- */
    { k: 'prorroga',   n: 'Prórroga incluida', grupo: 'Otros deportes',
      opciones: ['@local', '@visita'] },
    { k: 'hpuntos',    n: 'Hándicap de Puntos', grupo: 'Otros deportes',
      opciones: ['@local', '@visita'], linea: true, etiquetaLinea: 'Hándicap', ejemploLinea: '-4.5' },
    { k: 'totalpuntos',n: 'Total de puntos', grupo: 'Otros deportes',
      opciones: ['Más de', 'Menos de'], linea: true, etiquetaLinea: 'Línea', ejemploLinea: '210.5' },
    { k: 'partidoten', n: 'Cuotas del partido', grupo: 'Otros deportes',
      opciones: ['@local', '@visita'] },
    { k: 'totaljuegos',n: 'Total de juegos', grupo: 'Otros deportes',
      opciones: ['Más de', 'Menos de'], linea: true, etiquetaLinea: 'Línea', ejemploLinea: '22.5' },
    { k: 'hsets',      n: 'Hándicap de Sets', grupo: 'Otros deportes',
      opciones: ['@local', '@visita'], linea: true, etiquetaLinea: 'Hándicap', ejemploLinea: '-1.5' },

    /* --- comodín --- */
    { k: 'otro',       n: 'Otro mercado', grupo: 'Otros deportes' }
  ];

  var MERCADOS_POR_CLAVE = {};
  MERCADOS.forEach(function (m) { MERCADOS_POR_CLAVE[m.k] = m; });

  /* ====================== equipos ======================
     Se completa en equipos.js, que se genera aparte por ser una tabla larga. */
  var EQUIPOS = global.EQUIPOS_CATALOGO || {};

  /* ====================== buscar un equipo ======================
     Seba escribe "psg", "millos" o "Bayern" y tiene que salir el escudo
     correcto. Se busca por nombre exacto, luego por el nombre sin palabras
     de relleno (FC, CF, Club…) y por último por coincidencia parcial, pero
     solo si apunta a un único equipo: ante la duda, mejor no adivinar. */
  var indice = null, indiceNucleo = null;

  var RELLENO = /\b(fc|cf|ac|as|sc|cd|ca|afc|ssc|rc|sv|vfb|vfl|tsg|fsv|bsc|us|ud|sd|rcd|club|de|del|do|da|the|1846|1901|1907|1909|1910|1913|29|05)\b/g;

  function normalizar(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }
  function nucleo(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s.]/g, ' ').replace(RELLENO, ' ').replace(/[^a-z0-9]/g, '');
  }

  function construirIndice() {
    indice = {}; indiceNucleo = {};
    Object.keys(EQUIPOS).forEach(function (liga) {
      (EQUIPOS[liga] || []).forEach(function (e) {
        var reg = { n: e.n, id: e.id, c: e.c, liga: liga };
        [e.n].concat(e.alias || []).forEach(function (t) {
          var k = normalizar(t);
          if (k && !indice[k]) indice[k] = reg;
          var kn = nucleo(t);
          if (kn && kn !== k) { if (!indice[kn]) indice[kn] = reg; }
          if (kn) (indiceNucleo[kn] = indiceNucleo[kn] || []).push(reg);
        });
      });
    });
  }

  function buscarEquipo(nombre) {
    if (!nombre) return null;
    if (!indice) construirIndice();
    var n = normalizar(nombre);
    if (indice[n]) return indice[n];
    var nn = nucleo(nombre);
    if (nn && indice[nn]) return indice[nn];
    if (!nn || nn.length < 3) return null;
    // coincidencia parcial: vale solo si señala a un único club
    var vistos = {}, unico = null, cuantos = 0;
    Object.keys(indiceNucleo).forEach(function (k) {
      if (k.indexOf(nn) !== 0 && nn.indexOf(k) !== 0) return;
      indiceNucleo[k].forEach(function (reg) {
        if (vistos[reg.id]) return;
        vistos[reg.id] = true; unico = reg; cuantos++;
      });
    });
    return cuantos === 1 ? unico : null;
  }

  /* Las copas no tienen plantilla propia: se juegan con los equipos de su país.
     Al elegir la FA Cup conviene ofrecer los ingleses, no los 184 de golpe. */
  var EQUIPOS_DE_COPA = {
    facup: ['premier'], carabao: ['premier'],
    copadelrey: ['laliga'], coppaitalia: ['seriea'], dfbpokal: ['bundesliga'],
    coupefrance: ['ligue1'], copaturquia: ['superlig'],
    copacolombia: ['betplay'], copabrasil: ['brasileirao'], copaargentina: ['argentina'],
    // las europeas mezclan países: se ofrecen todos los de las grandes ligas
    champions: ['premier', 'laliga', 'seriea', 'bundesliga', 'ligue1', 'superlig'],
    europa: ['premier', 'laliga', 'seriea', 'bundesliga', 'ligue1', 'superlig'],
    conference: ['premier', 'laliga', 'seriea', 'bundesliga', 'ligue1', 'superlig'],
    supercopaeu: ['premier', 'laliga', 'seriea', 'bundesliga', 'ligue1'],
    libertadores: ['betplay', 'brasileirao', 'argentina'],
    sudamericana: ['betplay', 'brasileirao', 'argentina']
  };

  function equiposDeLiga(liga) {
    if (liga && EQUIPOS[liga]) return EQUIPOS[liga];
    var fuentes = EQUIPOS_DE_COPA[liga];
    if (!fuentes) {
      // sin liga elegida (o una sin catálogo) se ofrecen todos, para no bloquear
      fuentes = Object.keys(EQUIPOS);
    }
    var todos = [];
    fuentes.forEach(function (k) { todos = todos.concat(EQUIPOS[k] || []); });
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
    return ['Ligas de Europa', 'Ligas de América', 'Copas de Europa', 'Copas de América',
            'Copas nacionales', 'Otros'].filter(function (g) { return grupos[g]; })
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
    var orden = ['Principales', 'Hándicaps', 'Por tiempos', 'Por equipo',
                 'Esquinas y tarjetas', 'Jugadores', 'Otros deportes'];
    return orden.filter(function (g) { return grupos[g]; }).map(function (g) {
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
