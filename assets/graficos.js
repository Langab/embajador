/* =========================================================================
   graficos.js — gráficos en SVG puro, sin librerías.
   Reglas: marcas finas, extremos redondeados de 4px anclados a la línea base,
   líneas de 2px, rejilla y ejes recesivos, etiquetas directas selectivas
   (nunca un número en cada punto) y capa de hover en todos los gráficos.
   Cada gráfico viene acompañado de su tabla de datos como alternativa accesible.
   ========================================================================= */

(function (global) {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* --------------------- tooltip único, compartido --------------------- */
  var tip = null;
  function verTip(html, x, y) {
    if (!tip) {
      tip = document.createElement('div');
      tip.style.cssText =
        'position:fixed;z-index:200;pointer-events:none;background:#0B1F3D;color:#fff;' +
        'padding:7px 9px;border-radius:8px;font:600 11.5px/1.35 Archivo,sans-serif;' +
        'box-shadow:0 6px 20px rgba(0,0,0,.4);max-width:210px;opacity:0;transition:opacity .1s;' +
        'font-variant-numeric:tabular-nums';
      document.body.appendChild(tip);
    }
    tip.innerHTML = html;
    tip.style.opacity = '1';
    var r = tip.getBoundingClientRect();
    var izq = Math.max(8, Math.min(x - r.width / 2, innerWidth - r.width - 8));
    var arr = y - r.height - 14;
    if (arr < 8) arr = y + 18;
    tip.style.left = izq + 'px';
    tip.style.top = arr + 'px';
  }
  function ocultarTip() { if (tip) tip.style.opacity = '0'; }
  document.addEventListener('pointerdown', function (e) {
    if (!e.target.closest || !e.target.closest('[data-tip]')) ocultarTip();
  });

  /* Delegación: cualquier elemento con data-tip muestra su contenido. */
  document.addEventListener('pointerover', function (e) {
    var el = e.target.closest && e.target.closest('[data-tip]');
    if (el) verTip(el.getAttribute('data-tip'), e.clientX, e.clientY);
  });
  document.addEventListener('pointerout', function (e) {
    var el = e.target.closest && e.target.closest('[data-tip]');
    if (el) ocultarTip();
  });

  /* --------------------- utilidades de dibujo --------------------- */

  /** Barra con los extremos redondeados solo en el lado opuesto a la base. */
  function barraV(x, y, w, h, r, haciaArriba) {
    if (h <= 0.4) h = 0.8;
    r = Math.min(r, w / 2, h);
    return haciaArriba
      ? 'M' + x + ',' + (y + h) + 'v' + (-(h - r)) + 'a' + r + ',' + r + ' 0 0 1 ' + r + ',' + (-r) +
        'h' + (w - 2 * r) + 'a' + r + ',' + r + ' 0 0 1 ' + r + ',' + r + 'v' + (h - r) + 'Z'
      : 'M' + x + ',' + y + 'v' + (h - r) + 'a' + r + ',' + r + ' 0 0 0 ' + r + ',' + r +
        'h' + (w - 2 * r) + 'a' + r + ',' + r + ' 0 0 0 ' + r + ',' + (-r) + 'v' + (-(h - r)) + 'Z';
  }

  function ticksLindos(min, max, n) {
    if (min === max) { min -= 1; max += 1; }
    var bruto = (max - min) / (n || 4);
    var mag = Math.pow(10, Math.floor(Math.log10(Math.abs(bruto) || 1)));
    var norm = bruto / mag;
    var paso = (norm >= 7.5 ? 10 : norm >= 3.5 ? 5 : norm >= 1.5 ? 2 : 1) * mag;
    var t = [], v = Math.ceil(min / paso) * paso;
    for (; v <= max + paso * .001; v += paso) t.push(+v.toFixed(10));
    return t;
  }

  /* =====================================================================
     1. Curva de caja (evolución en el tiempo) — área + línea, con cruceta.
     datos: [{x: 'etiqueta', v: número, meta: 'texto extra'}]
     ===================================================================== */
  function curva(datos, opts) {
    opts = opts || {};
    var fmt = opts.fmt || String;
    var W = 340, H = opts.alto || 150, ml = 44, mr = 8, mt = 10, mb = 20;
    if (!datos || datos.length < 2) {
      return '<div class="vacio">Con dos boletos resueltos aparece la curva de tu caja.</div>';
    }
    var vals = datos.map(function (d) { return d.v; });
    var min = Math.min.apply(null, vals.concat([0]));
    var max = Math.max.apply(null, vals.concat([0]));
    var ticks = ticksLindos(min, max, 4);
    min = Math.min(min, ticks[0]); max = Math.max(max, ticks[ticks.length - 1]);
    var px = function (i) { return ml + i * (W - ml - mr) / (datos.length - 1); };
    var py = function (v) { return mt + (max - v) * (H - mt - mb) / (max - min || 1); };

    var linea = datos.map(function (d, i) { return (i ? 'L' : 'M') + px(i).toFixed(1) + ',' + py(d.v).toFixed(1); }).join('');
    var y0 = py(0);
    var area = linea + 'L' + px(datos.length - 1).toFixed(1) + ',' + y0.toFixed(1) + 'L' + px(0).toFixed(1) + ',' + y0.toFixed(1) + 'Z';
    var fin = datos[datos.length - 1].v;
    var color = fin >= 0 ? 'var(--div-pos)' : 'var(--div-neg)';

    var s = '<svg class="grafico" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' +
            esc(opts.titulo || 'Evolución de la caja') + '">';
    s += '<defs><linearGradient id="grad-curva" x1="0" y1="0" x2="0" y2="1">' +
         '<stop offset="0" stop-color="' + color + '" stop-opacity=".26"/>' +
         '<stop offset="1" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs>';
    ticks.forEach(function (t) {
      s += '<line class="rejilla" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + py(t).toFixed(1) + '" y2="' + py(t).toFixed(1) + '"/>';
      s += '<text class="etq-eje" x="' + (ml - 5) + '" y="' + (py(t) + 3).toFixed(1) + '" text-anchor="end">' + esc(fmt(t, true)) + '</text>';
    });
    // la línea del cero es la referencia que importa: ganar o perder
    s += '<line class="eje" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + y0.toFixed(1) + '" y2="' + y0.toFixed(1) + '" stroke-width="1.5"/>';
    s += '<path d="' + area + '" fill="url(#grad-curva)"/>';
    s += '<path d="' + linea + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    // etiqueta directa solo en el punto final: nunca un número en cada punto
    s += '<circle cx="' + px(datos.length - 1).toFixed(1) + '" cy="' + py(fin).toFixed(1) + '" r="4" fill="' + color + '" stroke="var(--papel)" stroke-width="2"/>';
    // zonas de toque invisibles, más grandes que la marca
    var anchoZona = (W - ml - mr) / datos.length;
    datos.forEach(function (d, i) {
      s += '<rect x="' + (px(i) - anchoZona / 2).toFixed(1) + '" y="0" width="' + anchoZona.toFixed(1) + '" height="' + H + '" fill="transparent" ' +
           'data-tip="' + esc('<b>' + d.x + '</b><br>' + fmt(d.v) + (d.meta ? '<br>' + d.meta : '')) + '"/>';
    });
    // fechas: primera, media y última
    [0, Math.floor((datos.length - 1) / 2), datos.length - 1].filter(function (v, i, a) { return a.indexOf(v) === i; })
      .forEach(function (i) {
        var anc = i === 0 ? 'start' : i === datos.length - 1 ? 'end' : 'middle';
        s += '<text class="etq-eje" x="' + px(i).toFixed(1) + '" y="' + (H - 5) + '" text-anchor="' + anc + '">' + esc(datos[i].x) + '</text>';
      });
    return s + '</svg>';
  }

  /* =====================================================================
     2. Barras divergentes (ganancia/pérdida por período) — rojo ↔ verde.
     datos: [{x, v}]
     ===================================================================== */
  function barrasDivergentes(datos, opts) {
    opts = opts || {};
    var fmt = opts.fmt || String;
    var W = 340, H = opts.alto || 140, ml = 44, mr = 6, mt = 8, mb = 18;
    if (!datos || !datos.length) return '<div class="vacio">Todavía no hay boletos resueltos en este período.</div>';
    var vals = datos.map(function (d) { return d.v; });
    var min = Math.min.apply(null, vals.concat([0]));
    var max = Math.max.apply(null, vals.concat([0]));
    var ticks = ticksLindos(min, max, 3);
    min = Math.min(min, ticks[0]); max = Math.max(max, ticks[ticks.length - 1]);
    var py = function (v) { return mt + (max - v) * (H - mt - mb) / (max - min || 1); };
    var paso = (W - ml - mr) / datos.length;
    var ancho = Math.max(7, Math.min(30, paso - 6));   // 2px de aire entre barras vecinas
    var y0 = py(0);

    var s = '<svg class="grafico" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' +
            esc(opts.titulo || 'Resultado por período') + '">';
    ticks.forEach(function (t) {
      if (t === 0) return;
      s += '<line class="rejilla" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + py(t).toFixed(1) + '" y2="' + py(t).toFixed(1) + '"/>';
      s += '<text class="etq-eje" x="' + (ml - 5) + '" y="' + (py(t) + 3).toFixed(1) + '" text-anchor="end">' + esc(fmt(t, true)) + '</text>';
    });
    datos.forEach(function (d, i) {
      var x = ml + i * paso + (paso - ancho) / 2;
      var arriba = d.v >= 0;
      var alto = Math.abs(py(d.v) - y0);
      var color = arriba ? 'var(--div-pos)' : 'var(--div-neg)';
      s += '<path d="' + barraV(x, arriba ? y0 - alto : y0, ancho, alto, 4, arriba) + '" fill="' + color + '" ' +
           'data-tip="' + esc('<b>' + d.x + '</b><br>' + fmt(d.v) + (d.meta ? '<br>' + d.meta : '')) + '"/>';
    });
    s += '<line class="eje" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + y0.toFixed(1) + '" y2="' + y0.toFixed(1) + '" stroke-width="1.5"/>';
    s += '<text class="etq-eje" x="' + (ml - 5) + '" y="' + (y0 + 3).toFixed(1) + '" text-anchor="end">0</text>';
    datos.forEach(function (d, i) {
      if (datos.length > 8 && i % 2) return;
      s += '<text class="etq-eje" x="' + (ml + i * paso + paso / 2).toFixed(1) + '" y="' + (H - 4) + '" text-anchor="middle">' + esc(d.x) + '</text>';
    });
    return s + '</svg>';
  }

  /* =====================================================================
     3. Barras horizontales — la forma más legible en celular para comparar
     categorías. Divergentes si hay valores negativos.
     datos: [{et, v, n, color}]
     ===================================================================== */
  function barrasH(datos, opts) {
    opts = opts || {};
    var fmt = opts.fmt || String;
    if (!datos || !datos.length) return '<div class="vacio">Sin datos suficientes todavía.</div>';
    var maxAbs = Math.max.apply(null, datos.map(function (d) { return Math.abs(d.v); }).concat([1e-9]));
    var hayNeg = datos.some(function (d) { return d.v < 0; });
    var s = '<div class="barras">';
    datos.forEach(function (d) {
      var pct = Math.abs(d.v) / maxAbs * 100;
      var color = d.color || (hayNeg ? (d.v >= 0 ? 'var(--div-pos)' : 'var(--div-neg)') : 'var(--cat-1)');
      var estilo = hayNeg
        ? (d.v >= 0 ? 'left:50%;width:' + (pct / 2) + '%' : 'right:50%;width:' + (pct / 2) + '%')
        : 'left:0;width:' + pct + '%';
      s += '<div class="barra-fila"' + (d.tip ? ' data-tip="' + esc(d.tip) + '"' : '') + '>' +
             '<span class="et">' + (d.ico || '') + '<span class="nom">' + esc(d.et) + '</span></span>' +
             '<span class="vl" style="color:' + (hayNeg ? (d.v >= 0 ? 'var(--div-pos)' : 'var(--div-neg)') : 'var(--tinta-media)') + '">' +
               esc(fmt(d.v)) + '</span>' +
             '<span class="barra-riel">' +
               (hayNeg ? '<span class="cero"></span>' : '') +
               '<span class="rel" style="' + estilo + ';background:' + color + '"></span>' +
             '</span>' +
           '</div>';
    });
    return s + '</div>';
  }

  /* =====================================================================
     4. Mapa de calor día × franja horaria — secuencial, un solo tono.
     matriz: [[valor,...7 días], ...franjas], filas: etiquetas
     ===================================================================== */
  function mapaCalor(matriz, filas, columnas, opts) {
    opts = opts || {};
    var fmt = opts.fmt || String;
    var plano = [];
    matriz.forEach(function (f) { f.forEach(function (c) { if (c && c.n) plano.push(Math.abs(c.v)); }); });
    if (!plano.length) return '<div class="vacio">Necesitas más boletos para ver tus patrones por día y hora.</div>';
    var max = Math.max.apply(null, plano);
    var pasos = ['var(--seq-1)', 'var(--seq-2)', 'var(--seq-3)', 'var(--seq-4)', 'var(--seq-5)', 'var(--seq-6)'];
    var W = 340, celdaW = (W - 46) / columnas.length, celdaH = 26;
    var H = 18 + matriz.length * celdaH;

    var s = '<svg class="grafico" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' +
            esc(opts.titulo || 'Actividad por día y hora') + '">';
    columnas.forEach(function (c, j) {
      s += '<text class="etq-eje" x="' + (46 + j * celdaW + celdaW / 2).toFixed(1) + '" y="11" text-anchor="middle">' + esc(c) + '</text>';
    });
    matriz.forEach(function (fila, i) {
      s += '<text class="etq-eje" x="42" y="' + (18 + i * celdaH + celdaH / 2 + 3).toFixed(1) + '" text-anchor="end">' + esc(filas[i]) + '</text>';
      fila.forEach(function (celda, j) {
        var x = 46 + j * celdaW, y = 18 + i * celdaH;
        var tiene = celda && celda.n;
        var idx = tiene ? Math.min(5, Math.floor(Math.abs(celda.v) / max * 5.999)) : -1;
        s += '<rect x="' + (x + 1).toFixed(1) + '" y="' + (y + 1) + '" width="' + (celdaW - 2).toFixed(1) + '" height="' + (celdaH - 2) + '" rx="3" ' +
             'fill="' + (tiene ? pasos[idx] : 'var(--papel-hueco)') + '"' +
             (tiene ? ' data-tip="' + esc('<b>' + filas[i] + ' · ' + columnas[j] + '</b><br>' + celda.n + ' boleto' + (celda.n === 1 ? '' : 's') + '<br>' + fmt(celda.v)) + '"' : '') + '/>';
        if (tiene && celda.n > 0) {
          s += '<text x="' + (x + celdaW / 2).toFixed(1) + '" y="' + (y + celdaH / 2 + 3) + '" text-anchor="middle" ' +
               'style="font-size:9px;font-weight:700;fill:' + (idx >= 3 ? '#fff' : 'var(--tinta-media)') + '">' + celda.n + '</text>';
        }
      });
    });
    return s + '</svg>';
  }

  /* =====================================================================
     5. Histograma de inversión por boleto — distribución.
     ===================================================================== */
  function histograma(cubos, opts) {
    opts = opts || {};
    if (!cubos || !cubos.length) return '<div class="vacio">Sin datos suficientes todavía.</div>';
    var W = 340, H = opts.alto || 116, ml = 8, mr = 8, mt = 12, mb = 26;
    var max = Math.max.apply(null, cubos.map(function (c) { return c.n; }).concat([1]));
    var paso = (W - ml - mr) / cubos.length;
    var ancho = Math.max(8, paso - 5);
    var base = H - mb;
    var s = '<svg class="grafico" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' +
            esc(opts.titulo || 'Distribución de la inversión') + '">';
    cubos.forEach(function (c, i) {
      var alto = c.n / max * (base - mt);
      var x = ml + i * paso + (paso - ancho) / 2;
      s += '<path d="' + barraV(x, base - alto, ancho, alto, 4, true) + '" fill="var(--cat-1)" opacity="' + (c.destacado ? 1 : .78) + '" ' +
           'data-tip="' + esc('<b>' + c.et + '</b><br>' + c.n + ' boleto' + (c.n === 1 ? '' : 's') + (c.detalle ? '<br>' + c.detalle : '')) + '"/>';
      if (c.n) s += '<text class="etq-dato" x="' + (x + ancho / 2).toFixed(1) + '" y="' + (base - alto - 4).toFixed(1) + '" text-anchor="middle">' + c.n + '</text>';
      s += '<text class="etq-eje" x="' + (x + ancho / 2).toFixed(1) + '" y="' + (H - 13) + '" text-anchor="middle">' + esc(c.et) + '</text>';
      if (c.et2) s += '<text class="etq-eje" x="' + (x + ancho / 2).toFixed(1) + '" y="' + (H - 3) + '" text-anchor="middle" opacity=".75">' + esc(c.et2) + '</text>';
    });
    s += '<line class="eje" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + base + '" y2="' + base + '"/>';
    return s + '</svg>';
  }

  /* =====================================================================
     Tabla de datos: la alternativa accesible que acompaña a cada gráfico.
     ===================================================================== */
  function tabla(cabeceras, filas, resumen) {
    var s = '<details class="ver-tabla"><summary>' + esc(resumen || 'Ver los números') + '</summary>' +
            '<div class="scroll-x"><table class="tabla-datos"><thead><tr>';
    cabeceras.forEach(function (c) { s += '<th scope="col">' + esc(c) + '</th>'; });
    s += '</tr></thead><tbody>';
    filas.forEach(function (f) {
      s += '<tr>';
      f.forEach(function (c, i) { s += i === 0 ? '<th scope="row">' + esc(c) + '</th>' : '<td>' + esc(c) + '</td>'; });
      s += '</tr>';
    });
    return s + '</tbody></table></div></details>';
  }

  function leyenda(items) {
    var s = '<div class="leyenda">';
    items.forEach(function (it) {
      s += '<span><i style="background:' + it.color + '"></i>' + esc(it.et) + '</span>';
    });
    return s + '</div>';
  }

  global.G = {
    curva: curva,
    barrasDivergentes: barrasDivergentes,
    barrasH: barrasH,
    mapaCalor: mapaCalor,
    histograma: histograma,
    tabla: tabla,
    leyenda: leyenda,
    esc: esc
  };
})(window);
