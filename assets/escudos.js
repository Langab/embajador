/* =========================================================================
   escudos.js — cómo se dibuja cada equipo.
   Dos capas: si el equipo está en el catálogo con id, se pide el escudo real
   a la CDN; si falla o el equipo es desconocido, se dibuja un escudo generado
   con las iniciales sobre los colores del club. Nunca se ve una imagen rota.
   ========================================================================= */

(function (global) {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* Palabras que no aportan a las iniciales de un club. */
  var RUIDO = /^(fc|cf|ac|as|sc|cd|ca|afc|ssc|rc|sv|vfb|vfl|tsg|fsv|bsc|us|ud|sd|rcd|club|de|del|la|el|los|las|do|da|dos|das|e|y|and|of|the|1899|1904|1900|1846|1848|1860|09|04|05|1|ii)$/i;

  /** Iniciales de un club: 1–3 letras que lo identifiquen de un vistazo. */
  function iniciales(nombre) {
    var limpio = String(nombre || '?').replace(/[().]/g, ' ').trim();
    var partes = limpio.split(/[\s\-–/]+/).filter(function (p) { return p && !RUIDO.test(p); });
    if (!partes.length) partes = limpio.split(/\s+/).filter(Boolean);
    if (!partes.length) return '?';
    if (partes.length === 1) {
      var p = partes[0];
      return (p.length <= 3 ? p : p.slice(0, 3)).toUpperCase();
    }
    return partes.slice(0, 3).map(function (p) { return p[0]; }).join('').toUpperCase();
  }

  /* Colores por defecto cuando el club no está en el catálogo: se derivan
     del propio nombre para que el mismo equipo salga siempre igual. */
  var TONOS = [
    ['#2F4B8D', '#FFFFFF'], ['#8C1D2C', '#F2E4C9'], ['#14624A', '#F0EAD6'],
    ['#1F2933', '#E8B33C'], ['#5B2A86', '#EFE3F7'], ['#B4531A', '#FBEBDA'],
    ['#0F5A75', '#DCEFF5'], ['#7A1D3F', '#F6DDE6']
  ];
  function tonoDe(nombre) {
    var h = 0, s = String(nombre || '');
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return TONOS[h % TONOS.length];
  }

  /** Escudo generado: un blasón con las iniciales sobre los colores del club. */
  function generado(nombre, colores, tam) {
    tam = tam || 30;
    var c = colores && colores.length ? colores : tonoDe(nombre);
    var fondo = c[0], tinta = c[1] || '#fff';
    var txt = iniciales(nombre);
    var tamTexto = txt.length >= 3 ? 15 : txt.length === 2 ? 18 : 21;
    var id = 'e' + Math.random().toString(36).slice(2, 8);
    return '<svg class="escudo escudo-svg" style="width:' + tam + 'px;height:' + tam + 'px;flex-basis:' + tam + 'px" ' +
      'viewBox="0 0 40 40" role="img" aria-label="' + esc(nombre) + '">' +
      '<defs><clipPath id="' + id + '"><path d="M20 1.5 36.5 6v14.5c0 8.6-6.6 15.2-16.5 18C10.1 35.7 3.5 29.1 3.5 20.5V6Z"/></clipPath></defs>' +
      '<path d="M20 1.5 36.5 6v14.5c0 8.6-6.6 15.2-16.5 18C10.1 35.7 3.5 29.1 3.5 20.5V6Z" fill="' + fondo + '"/>' +
      '<rect x="0" y="0" width="40" height="40" clip-path="url(#' + id + ')" fill="' + tinta + '" opacity=".14" ' +
        'transform="rotate(-20 20 20)" style="transform-origin:center" y="26"/>' +
      '<text x="20" y="' + (txt.length >= 3 ? 25 : 26) + '" text-anchor="middle" fill="' + tinta + '" ' +
        'style="font:800 ' + tamTexto + 'px Archivo,Helvetica,sans-serif;letter-spacing:-.02em">' + esc(txt) + '</text>' +
      '<path d="M20 1.5 36.5 6v14.5c0 8.6-6.6 15.2-16.5 18C10.1 35.7 3.5 29.1 3.5 20.5V6Z" fill="none" ' +
        'stroke="rgba(0,0,0,.22)" stroke-width="1.5"/>' +
      '</svg>';
  }

  /**
   * Escudo de un equipo. Si el catálogo trae un id de CDN se intenta la imagen
   * real; el onerror la reemplaza por el escudo generado en el mismo hueco.
   */
  function escudo(nombre, tam) {
    tam = tam || 30;
    var eq = global.DATOS && global.DATOS.buscarEquipo ? global.DATOS.buscarEquipo(nombre) : null;
    var colores = eq && eq.c ? eq.c : null;
    var respaldo = generado(eq ? eq.n : nombre, colores, tam);
    var url = eq && eq.id && global.DATOS.urlEscudo ? global.DATOS.urlEscudo(eq.id) : null;
    if (!url) return respaldo;
    return '<img class="escudo" src="' + esc(url) + '" alt="' + esc(eq.n) + '" width="' + tam + '" height="' + tam + '" ' +
      'loading="lazy" decoding="async" style="width:' + tam + 'px;height:' + tam + 'px;flex-basis:' + tam + 'px" ' +
      'onerror="this.outerHTML=' + esc(JSON.stringify(respaldo)).replace(/"/g, '&quot;') + '">';
  }

  /** Escudo de una liga o competición. */
  function escudoLiga(claveLiga, tam) {
    tam = tam || 24;
    var L = global.DATOS && global.DATOS.LIGAS ? global.DATOS.LIGAS[claveLiga] : null;
    if (!L) return '';
    var respaldo = generado(L.n, L.c || null, tam);
    var url = L.id && global.DATOS.urlLiga ? global.DATOS.urlLiga(L.id) : null;
    if (!url) return respaldo;
    return '<img class="escudo" src="' + esc(url) + '" alt="' + esc(L.n) + '" width="' + tam + '" height="' + tam + '" ' +
      'loading="lazy" decoding="async" style="width:' + tam + 'px;height:' + tam + 'px;flex-basis:' + tam + 'px;object-fit:contain" ' +
      'onerror="this.outerHTML=' + esc(JSON.stringify(respaldo)).replace(/"/g, '&quot;') + '">';
  }

  global.ESCUDOS = { escudo: escudo, escudoLiga: escudoLiga, generado: generado, iniciales: iniciales };
})(window);
