/* =========================================================================
   analisis.js — las métricas que BetPlay no muestra.

   Dos reglas que mandan sobre todo lo demás:
   1. Ninguna cifra de rentabilidad se muestra sin su número de boletos y su
      margen de error. Con menos de 15 boletos no se muestra: sería inventar.
   2. Cada mal hábito se traduce a pesos. "Las combinadas te costaron $412.000"
      mueve más que cualquier gráfico.
   ========================================================================= */

(function (global) {
  'use strict';

  var C = global.CALC, G = global.G, D = global.DATOS;
  var esc = G.esc;

  var MIN_MOSTRAR = 15;    // por debajo de esto no se muestra rentabilidad
  var MIN_FIABLE  = 30;    // por debajo de esto se muestra con advertencia

  /* ====================== utilidades estadísticas ====================== */
  function suma(a) { return a.reduce(function (s, x) { return s + x; }, 0); }
  function media(a) { return a.length ? suma(a) / a.length : 0; }
  function mediana(a) {
    if (!a.length) return 0;
    var b = a.slice().sort(function (x, y) { return x - y; });
    var m = Math.floor(b.length / 2);
    return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
  }
  function desvest(a) {
    if (a.length < 2) return 0;
    var m = media(a);
    return Math.sqrt(suma(a.map(function (x) { return (x - m) * (x - m); })) / (a.length - 1));
  }
  function pearson(x, y) {
    var n = Math.min(x.length, y.length);
    if (n < 3) return null;
    var mx = media(x.slice(0, n)), my = media(y.slice(0, n));
    var num = 0, dx = 0, dy = 0;
    for (var i = 0; i < n; i++) {
      var a = x[i] - mx, b = y[i] - my;
      num += a * b; dx += a * a; dy += b * b;
    }
    return (dx && dy) ? num / Math.sqrt(dx * dy) : null;
  }
  /** Cola derecha de la normal estándar (Abramowitz–Stegun). */
  function colaNormal(z) {
    var t = 1 / (1 + 0.2316419 * Math.abs(z));
    var d = 0.3989422804014327 * Math.exp(-z * z / 2);
    var p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 +
            t * (-1.821255978 + t * 1.330274429))));
    return z > 0 ? p : 1 - p;
  }

  /* ====================== el bloque de métricas ====================== */

  /**
   * Resumen de un conjunto de boletos resueltos.
   *
   *   yield          ganancia por cada peso arriesgado. Es la métrica de habilidad.
   *   umbralEmpate   qué tasa de acierto necesitaba para no perder, dadas sus cuotas.
   *                  Se calcula ponderando por lo invertido, no promediando cuotas.
   *   ic95           margen de error del yield. Sin esto, el yield es una anécdota.
   */
  function resumen(boletos) {
    var res = boletos.filter(C.estaResuelto).filter(function (b) { return b.resultado !== 'anulada'; });
    var turnover = suma(res.map(C.invertido));
    var neto = suma(res.map(C.ganancia));
    var n = res.length;

    /* Un boleto acertó si devolvió más de lo que costó. Así quedan bien
       clasificadas las parciales del hándicap asiático y los cobros
       anticipados, que no son ni ganada ni perdida limpia. */
    var acerto = function (b) { return C.retorno(b) > C.invertido(b); };
    var ganadas = res.filter(acerto).length;

    /* El umbral de empate se pondera por lo invertido, no promediando cuotas:
       lo que importa es dónde está la plata. Y la tasa de acierto se pondera
       igual, para que las dos cifras sean comparables entre sí. */
    var umbral = turnover > 0
      ? suma(res.map(function (b) { return C.invertido(b) * C.probImplicita(b.cuota); })) / turnover
      : 0;
    var aciertoPond = turnover > 0
      ? suma(res.map(function (b) { return acerto(b) ? C.invertido(b) : 0; })) / turnover
      : 0;

    // retornos por peso apostado: la base del test de significancia
    var r = res.filter(function (b) { return C.invertido(b) > 0; })
               .map(function (b) { return C.ganancia(b) / C.invertido(b); });
    var m = media(r), sd = desvest(r);
    var err = r.length > 1 ? sd / Math.sqrt(r.length) : 0;

    return {
      n: n,
      turnover: turnover,
      neto: neto,
      yield: turnover > 0 ? neto / turnover * 100 : 0,
      tasaAcierto: n ? ganadas / n : 0,
      tasaAciertoPond: aciertoPond,
      umbralEmpate: umbral,
      ventaja: (aciertoPond - umbral) * 100,
      cuotaMedia: n ? media(res.map(function (b) { return +b.cuota || 0; })) : 0,
      cuotaPonderada: turnover > 0
        ? suma(res.map(function (b) { return (+b.cuota || 0) * C.invertido(b); })) / turnover : 0,
      stakeMedio: n ? turnover / n : 0,
      ic95: [(m - 1.96 * err) * 100, (m + 1.96 * err) * 100],
      t: err > 0 ? m / err : 0,
      p: err > 0 ? colaNormal(m / err) : 1,
      fiable: n >= MIN_FIABLE,
      mostrable: n >= MIN_MOSTRAR
    };
  }

  /** Cuántos boletos harían falta para demostrar el rendimiento actual. */
  function boletosNecesarios(yieldPct, cuotaMedia) {
    var y = Math.abs(yieldPct) / 100;
    if (!y || cuotaMedia <= 1) return null;
    return Math.ceil(Math.pow(1.645 * Math.sqrt(cuotaMedia - 1) / y, 2));
  }

  /* ====================== bankroll en cada momento ====================== */
  /* Sin saber cuánta plata tenía al apostar, no se puede juzgar si el monto
     fue prudente. Se reconstruye con los depósitos, retiros y lo ya resuelto. */
  function conBankroll(boletos, movs) {
    var ord = boletos.slice().sort(global.APP.ordenFecha);
    var eventos = movs.slice().sort(function (a, b) {
      return String(a.fecha).localeCompare(String(b.fecha));
    });
    var acumMov = 0, iMov = 0, acumPL = 0;
    return ord.map(function (b) {
      while (iMov < eventos.length && String(eventos[iMov].fecha) <= String(b.fecha)) {
        acumMov += C.montoMovimiento(eventos[iMov]); iMov++;
      }
      var banca = Math.max(acumMov + acumPL, 1);
      if (C.estaResuelto(b)) acumPL += C.ganancia(b);
      return Object.assign({}, b, { banca: banca, stakeNorm: C.invertido(b) / banca });
    });
  }

  /* ====================== cortes ====================== */

  function cortar(boletos, clave) {
    var grupos = {};
    boletos.forEach(function (b) {
      var k = clave(b);
      if (k == null || k === '') return;
      (grupos[k] = grupos[k] || []).push(b);
    });
    return Object.keys(grupos).map(function (k) {
      var m = resumen(grupos[k]);
      m.clave = k; m.boletos = grupos[k];
      return m;
    });
  }

  var CUBOS_CUOTA = [
    { et: '1,01–1,50', min: 1.00, max: 1.50 },
    { et: '1,51–2,00', min: 1.50, max: 2.00 },
    { et: '2,01–3,00', min: 2.00, max: 3.00 },
    { et: '3,01–5,00', min: 3.00, max: 5.00 },
    { et: '5,00+',     min: 5.00, max: Infinity }
  ];
  function porCuota(boletos) {
    return CUBOS_CUOTA.map(function (c) {
      var g = boletos.filter(function (b) {
        var q = +b.cuota || 0;
        return q > c.min && q <= c.max;
      });
      var m = resumen(g);
      m.clave = c.et; m.boletos = g;
      return m;
    });
  }

  /* ====================== la banda del azar ====================== */
  /**
   * Simula muchas veces el mismo historial suponiendo que Seba no tiene ninguna
   * ventaja (que acierta exactamente lo que dice la cuota). Si su curva real
   * cae dentro de la banda, lo que ve es ruido, no habilidad.
   */
  function bandaAzar(boletos, sims) {
    sims = sims || 600;
    var res = boletos.filter(C.estaResuelto).filter(function (b) { return b.resultado !== 'anulada'; })
                     .sort(global.APP.ordenFecha);
    if (res.length < 8) return null;
    var caminos = [];
    for (var s = 0; s < sims; s++) {
      var acc = 0, camino = [];
      for (var i = 0; i < res.length; i++) {
        var b = res[i], st = C.invertido(b), q = +b.cuota || 1;
        acc += (Math.random() < 1 / q) ? st * (q - 1) : -st;
        camino.push(acc);
      }
      caminos.push(camino);
    }
    return res.map(function (_, i) {
      var col = caminos.map(function (c) { return c[i]; }).sort(function (a, b) { return a - b; });
      return { p5: col[Math.floor(sims * 0.05)], p95: col[Math.floor(sims * 0.95)] };
    });
  }

  /* ====================== patrones de conducta ====================== */

  /**
   * Compara cómo apuesta después de perder frente a después de ganar.
   * El eje más fiable es la cuota: tras perder se tiende a buscar cuotas más
   * altas para recuperar de un golpe, y eso alarga las malas rachas.
   */
  function trasPerder(boletos) {
    var ord = boletos.filter(C.estaResuelto).sort(global.APP.ordenFecha);
    var perd = [], gan = [];
    for (var i = 1; i < ord.length; i++) {
      var prev = ord[i - 1], cur = ord[i];
      var reg = {
        stakeNorm: cur.stakeNorm || 0, cuota: +cur.cuota || 0,
        enVivo: !!cur.enVivo, combi: cur.tipoBoleto && cur.tipoBoleto !== 'simple',
        gan: C.ganancia(cur), inv: C.invertido(cur)
      };
      if (prev.resultado === 'perdida') perd.push(reg);
      else if (prev.resultado === 'ganada') gan.push(reg);
    }
    if (perd.length < 12 || gan.length < 12) return null;
    var invP = suma(perd.map(function (r) { return r.inv; }));
    var invG = suma(gan.map(function (r) { return r.inv; }));
    return {
      nPerd: perd.length, nGan: gan.length,
      cuotaTrasPerder: media(perd.map(function (r) { return r.cuota; })),
      cuotaTrasGanar: media(gan.map(function (r) { return r.cuota; })),
      stakeTrasPerder: media(perd.map(function (r) { return r.stakeNorm; })),
      stakeTrasGanar: media(gan.map(function (r) { return r.stakeNorm; })),
      vivoTrasPerder: perd.filter(function (r) { return r.enVivo; }).length / perd.length,
      vivoTrasGanar: gan.filter(function (r) { return r.enVivo; }).length / gan.length,
      yieldTrasPerder: invP ? suma(perd.map(function (r) { return r.gan; })) / invP * 100 : 0,
      yieldTrasGanar: invG ? suma(gan.map(function (r) { return r.gan; })) / invG * 100 : 0
    };
  }

  /** Rachas y la caída más honda desde un máximo. */
  function rachasYCaida(boletos) {
    var ord = boletos.filter(C.estaResuelto).sort(global.APP.ordenFecha);
    var maxG = 0, maxP = 0, curG = 0, curP = 0;
    var acc = 0, pico = 0, caida = 0;
    ord.forEach(function (b) {
      if (b.resultado === 'ganada' || b.resultado === 'media_ganada') { curG++; curP = 0; }
      else if (b.resultado === 'perdida' || b.resultado === 'media_perdida') { curP++; curG = 0; }
      maxG = Math.max(maxG, curG); maxP = Math.max(maxP, curP);
      acc += C.ganancia(b);
      pico = Math.max(pico, acc);
      caida = Math.max(caida, pico - acc);
    });
    var res = resumen(ord);
    // racha de derrotas que el puro azar ya explica
    var pPerder = 1 - res.tasaAcierto;
    var esperada = (ord.length > 1 && pPerder > 0.01 && pPerder < 0.999)
      ? Math.log(ord.length) / Math.log(1 / pPerder) : null;
    return {
      maxGanadas: maxG, maxPerdidas: maxP, rachaActual: curG || -curP,
      caidaMax: caida, caidaActual: pico - acc,
      rachaEsperada: esperada ? Math.round(esperada) : null
    };
  }

  /* ====================== coste de cada hábito ====================== */
  /**
   * Cuánto le costó cada costumbre, comparando el rendimiento de ese grupo
   * contra el del resto de sus boletos. Es la lectura más accionable de todas.
   */
  function costes(boletos) {
    var lista = [];
    function comparar(nombre, filtro, detalle) {
      var dentro = boletos.filter(filtro);
      var fuera = boletos.filter(function (b) { return !filtro(b); });
      var a = resumen(dentro), b = resumen(fuera);
      if (a.n < MIN_MOSTRAR || b.n < MIN_MOSTRAR || !a.turnover) return;
      var coste = a.turnover * (b.yield - a.yield) / 100;
      if (coste > 0) lista.push({ et: nombre, v: -coste, n: a.n, detalle: detalle(a, b) });
    }

    comparar('Combinadas',
      function (b) { return b.tipoBoleto && b.tipoBoleto !== 'simple'; },
      function (a, b) { return 'Rinden ' + C.fmtPct(a.yield) + ' frente a ' + C.fmtPct(b.yield) + ' en simples.'; });

    comparar('En vivo',
      function (b) { return !!b.enVivo; },
      function (a, b) { return 'Rinden ' + C.fmtPct(a.yield) + ' frente a ' + C.fmtPct(b.yield) + ' antes del partido.'; });

    comparar('Cuotas 3+',
      function (b) { return (+b.cuota || 0) > 3; },
      function (a, b) { return 'Rinden ' + C.fmtPct(a.yield) + ' frente a ' + C.fmtPct(b.yield) + ' en cuotas más bajas.'; });

    /* El equipo al que más le apuesta. Solo cuenta cuando la selección es uno
       de los dos equipos del partido: en "Ambos Equipos Marcarán" la selección
       es "Sí" o "No", y tratarla como equipo inventaría un sesgo que no existe. */
    var porEquipo = {};
    boletos.forEach(function (b) {
      if (!b.seleccion) return;
      if (b.seleccion !== b.equipoLocal && b.seleccion !== b.equipoVisita) return;
      (porEquipo[b.seleccion] = porEquipo[b.seleccion] || []).push(b);
    });
    var fav = Object.keys(porEquipo)
      .map(function (k) { return { k: k, inv: suma(porEquipo[k].map(C.invertido)), n: porEquipo[k].length }; })
      .sort(function (a, b) { return b.inv - a.inv; })[0];
    if (fav && fav.n >= MIN_MOSTRAR) {
      comparar('Apostarle a ' + fav.k,
        function (b) { return b.seleccion === fav.k; },
        function (a, b) { return 'Le has puesto ' + C.fmtCOP(a.turnover) + ' con ' + C.fmtPct(a.yield) + ' de rentabilidad.'; });
    }

    return lista.sort(function (a, b) { return a.v - b.v; });
  }

  /* ====================== presentación ====================== */

  function selloMuestra(m) {
    if (m.n < MIN_MOSTRAR) return '<span style="color:var(--tinta-suave);font-weight:700">pocos datos</span>';
    var t = m.n + ' boleto' + (m.n === 1 ? '' : 's');
    if (m.n < MIN_FIABLE) t += ' · muestra corta';
    return esc(t);
  }

  function celdaYield(m) {
    if (m.n < MIN_MOSTRAR) return '—';
    return C.fmtPct(m.yield);
  }

  function tarjeta(titulo, cuerpo, nota) {
    return '<div class="tarjeta"><div class="tarjeta-titulo">' + esc(titulo) + '</div>' + cuerpo +
           (nota ? '<div class="ayuda">' + nota + '</div>' : '') + '</div>';
  }

  /* ====================== avisos para la pantalla de hoy ====================== */
  function avisos(resueltos, todas, caja) {
    var out = [];
    var m = resumen(resueltos);

    if (m.n >= MIN_MOSTRAR) {
      // ¿lo que ve es habilidad o es azar?
      var dentroDelAzar = m.ic95[0] < 0 && m.ic95[1] > 0;
      if (m.yield > 0 && dentroDelAzar) {
        out.push(aviso('ojo', '📊', 'Vas ganando, pero todavía puede ser suerte',
          'Tu rentabilidad es ' + C.fmtPct(m.yield) + ', y el margen de error va de ' +
          C.fmtPct(m.ic95[0]) + ' a ' + C.fmtPct(m.ic95[1]) + '. Con ' + m.n +
          ' boletos aún no alcanza para distinguir habilidad de azar.'));
      } else if (m.yield < 0 && !dentroDelAzar) {
        out.push(aviso('grave', '📉', 'Estás perdiendo de forma consistente',
          'Rentabilidad ' + C.fmtPct(m.yield) + ' sobre ' + C.fmtCOP(m.turnover) +
          ' apostados, y el margen de error no llega a cero. No es mala suerte.'));
      } else if (m.yield > 0 && !dentroDelAzar) {
        out.push(aviso('bien', '📈', 'Rendimiento por encima del azar',
          'Rentabilidad ' + C.fmtPct(m.yield) + ' con ' + m.n + ' boletos. El margen de error se mantiene positivo.'));
      } else if (m.yield < 0) {
        out.push(aviso('ojo', '📉', 'Vas perdiendo, aunque todavía podría ser mala suerte',
          'Rentabilidad ' + C.fmtPct(m.yield) + ' sobre ' + C.fmtCOP(m.turnover) + ' apostados. ' +
          'El margen de error va de ' + C.fmtPct(m.ic95[0]) + ' a ' + C.fmtPct(m.ic95[1]) +
          ', y como cruza el cero, con ' + m.n + ' boletos aún no se puede afirmar que el problema sea tu juego.'));
      }

      /* Acierto contra el umbral que exigen sus cuotas. Ambas cifras van
         ponderadas por lo invertido, que es lo único que las hace
         comparables cuando no siempre apuesta lo mismo. */
      var falta = m.tasaAciertoPond - m.umbralEmpate;
      var pts = function (x) { return Math.abs(x * 100).toFixed(1).replace('.', ','); };
      if (falta >= 0 && m.yield < 0) {
        // acierta lo suficiente y aun así pierde: gana las baratas, pierde las caras
        out.push(aviso('ojo', '⚖️',
          'Aciertas lo suficiente y aun así pierdes plata',
          'Acertaste el ' + Math.round(m.tasaAciertoPond * 100) + '% de lo apostado y te bastaba el ' +
          Math.round(m.umbralEmpate * 100) + '%, pero la rentabilidad es ' + C.fmtPct(m.yield) +
          '. Eso pasa cuando los boletos que ganas son los baratos y los que pierdes, los caros.'));
      } else {
        out.push(aviso(falta >= 0 ? 'bien' : 'ojo', '🎯',
          'Aciertas el ' + Math.round(m.tasaAciertoPond * 100) + '% y necesitas ' + Math.round(m.umbralEmpate * 100) + '%',
          falta >= 0
            ? 'Vas ' + pts(falta) + ' puntos por encima del umbral que exigen tus cuotas.'
            : 'Te faltan ' + pts(falta) + ' puntos para empatar con las cuotas a las que juegas.'));
      }
    } else if (m.n > 0) {
      out.push(aviso('dato', '🧮', 'Todavía son pocos boletos',
        'Con ' + m.n + ' resuelto' + (m.n === 1 ? '' : 's') + ' cualquier número es ruido. ' +
        'Desde ' + MIN_MOSTRAR + ' empiezan a aparecer las métricas.'));
    }

    var pend = todas.filter(C.estaPendiente);
    if (pend.length >= 4) {
      out.push(aviso('dato', '⏳', pend.length + ' boletos abiertos a la vez',
        C.fmtCOP(suma(pend.map(C.invertido))) + ' esperando resultado. Anótalos apenas se resuelvan para que las métricas no se atrasen.'));
    }
    return out;
  }

  function aviso(clase, ico, titulo, texto) {
    return '<div class="aviso ' + clase + '"><span class="ico">' + ico + '</span>' +
           '<span><strong>' + esc(titulo) + '</strong>' + esc(texto) + '</span></div>';
  }

  /* ====================== la pantalla de análisis ====================== */
  function render(todas, movs, periodo) {
    var cont = document.getElementById('analisis');
    global.APP.llenarSelect('aPeriodo', [
      ['30', 'Últimos 30 días'], ['90', 'Últimos 3 meses'],
      ['365', 'Último año'], ['todo', 'Todo el historial']
    ], periodo);

    var desde = null;
    if (periodo !== 'todo') {
      var d = new Date(); d.setDate(d.getDate() - parseInt(periodo, 10));
      desde = d.toISOString().slice(0, 10);
    }
    var enRango = todas.filter(function (b) { return !desde || (b.fecha || '') >= desde; });
    var conB = conBankroll(enRango, movs);
    var res = conB.filter(C.estaResuelto).filter(function (b) { return b.resultado !== 'anulada'; });

    if (res.length < 3) {
      cont.innerHTML = '<div class="tarjeta"><div class="vacio"><strong>Aún no hay suficiente para analizar.</strong>' +
        'Anota boletos y marca sus resultados. Con unos pocos ya aparecen las primeras métricas, y desde ' +
        MIN_MOSTRAR + ' empiezan a ser confiables.</div></div>';
      return;
    }

    var m = resumen(res);
    var s = '';

    /* --- 1. el veredicto honesto --- */
    s += bloqueVeredicto(m);

    /* --- 2. la curva contra la banda del azar --- */
    s += bloqueCurva(res);

    /* --- 3. qué le cuesta cada costumbre --- */
    s += bloqueCostes(res);

    /* --- 4. por cuota --- */
    s += bloqueCuotas(res);

    /* --- 5. simples contra combinadas, y en vivo --- */
    s += bloqueFormato(res);

    /* --- 6. por liga y por mercado --- */
    s += bloqueDimension(res, 'liga', 'Por liga', function (b) { return b.liga; },
      function (k) { return D.LIGAS[k] ? D.LIGAS[k].n : k; });
    s += bloqueDimension(res, 'mercado', 'Por tipo de apuesta', function (b) { return b.mercado; },
      function (k) { return D.MERCADOS_POR_CLAVE[k] ? D.MERCADOS_POR_CLAVE[k].n : k; });

    /* --- 7. disciplina --- */
    s += bloqueDisciplina(res, conB);

    /* --- 8. rachas y caídas --- */
    s += bloqueRachas(res);

    /* --- 9. mes a mes --- */
    s += bloqueMeses(res);

    /* --- 10. día y hora --- */
    s += bloqueDiaHora(res);

    cont.innerHTML = s;
  }

  function bloqueVeredicto(m) {
    var dentro = m.ic95[0] < 0 && m.ic95[1] > 0;
    var faltan = boletosNecesarios(m.yield, m.cuotaMedia || 2);
    var cuerpo =
      '<div class="fichas" style="margin-bottom:10px">' +
        global.APP.ficha('Rentabilidad', celdaYield(m), 'por cada peso apostado',
          m.n < MIN_MOSTRAR ? '' : (m.yield > 0 ? 'pos' : m.yield < 0 ? 'neg' : '')) +
        global.APP.ficha('Ganancia neta', C.fmtCOPsigno(m.neto, true), C.fmtEURsigno(C.copAEur(m.neto)),
          m.neto > 0 ? 'pos' : m.neto < 0 ? 'neg' : '') +
        global.APP.ficha('Apostado', C.fmtCOP(m.turnover, true), m.n + ' boletos resueltos') +
      '</div>';

    if (m.n >= MIN_MOSTRAR) {
      cuerpo += '<table class="tabla-datos">' +
        '<tr><th scope="row">Margen de error (95%)</th><td>' + C.fmtPct(m.ic95[0]) + ' a ' + C.fmtPct(m.ic95[1]) + '</td></tr>' +
        '<tr><th scope="row">Boletos acertados</th><td>' + Math.round(m.tasaAcierto * 100) + '%</td></tr>' +
        '<tr><th scope="row">Acierto sobre lo apostado</th><td>' + Math.round(m.tasaAciertoPond * 100) + '%</td></tr>' +
        '<tr><th scope="row">Umbral para empatar</th><td>' + Math.round(m.umbralEmpate * 100) + '%</td></tr>' +
        '<tr><th scope="row">Cuota media</th><td>' + C.fmtCuota(m.cuotaMedia) + '</td></tr>' +
        '<tr><th scope="row">Inversión media</th><td>' + C.fmtCOP(m.stakeMedio) + '</td></tr>' +
        '</table>';
      cuerpo += aviso(dentro ? 'ojo' : (m.yield > 0 ? 'bien' : 'grave'), dentro ? '🎲' : (m.yield > 0 ? '✅' : '⚠️'),
        dentro ? 'Todavía no se puede separar habilidad de suerte' : (m.yield > 0 ? 'El resultado sobrevive al azar' : 'La pérdida no es mala suerte'),
        dentro
          ? 'El margen de error cruza el cero: con estos datos, el azar explica lo que ves.' +
            (faltan && faltan > m.n ? ' Jugando a cuotas de ' + C.fmtCuota(m.cuotaMedia) + ' de media, harían falta unos ' + faltan.toLocaleString('es-CO') + ' boletos para que un resultado de este tamaño dejara de ser explicable por azar. Llevas ' + m.n + '.' : '')
          : 'El margen de error completo queda del mismo lado del cero.');
    }
    return tarjeta('El veredicto', cuerpo,
      'La rentabilidad mide cuánto ganas por cada peso que arriesgas. Es la métrica de habilidad: no depende de cuánto apuestes.');
  }

  function bloqueCurva(res) {
    var serie = global.APP.serieCaja(res);
    var banda = bandaAzar(res);
    var cuerpo = G.curva(serie, { fmt: function (v, corto) { return C.fmtCOP(v, corto); }, alto: 150 });
    if (banda && banda.length === serie.length) {
      var fin = serie[serie.length - 1].v;
      var b = banda[banda.length - 1];
      var dentro = fin >= b.p5 && fin <= b.p95;
      cuerpo += aviso(dentro ? 'ojo' : (fin > b.p95 ? 'bien' : 'grave'), dentro ? '🎲' : (fin > b.p95 ? '🚀' : '🧊'),
        dentro ? 'Tu curva está dentro de lo que haría el puro azar'
               : (fin > b.p95 ? 'Tu curva va por encima de lo que explica el azar' : 'Tu curva va por debajo de lo que explica el azar'),
        'Simulando tu mismo historial sin ninguna ventaja, el 90% de los resultados caería entre ' +
        C.fmtCOPsigno(b.p5) + ' y ' + C.fmtCOPsigno(b.p95) + '. Tú vas en ' + C.fmtCOPsigno(fin) + '.');
    }
    return tarjeta('Cómo evolucionó tu plata', cuerpo);
  }

  function bloqueCostes(res) {
    var lista = costes(res);
    if (!lista.length) {
      return tarjeta('Qué te cuesta cada costumbre',
        '<div class="vacio">Todavía no hay grupos con suficientes boletos para comparar. Necesitas al menos ' +
        MIN_MOSTRAR + ' de cada tipo.</div>');
    }
    var cuerpo = G.barrasH(lista.map(function (c) {
      return { et: c.et, v: c.v, tip: '<b>' + esc(c.et) + '</b><br>' + esc(c.detalle) + '<br>' + c.n + ' boletos' };
    }), { fmt: function (v) { return C.fmtCOP(v, true); } });
    cuerpo += '<div style="margin-top:11px">' + lista.slice(0, 2).map(function (c) {
      return aviso('grave', '💸', c.et + ': ' + C.fmtCOP(Math.abs(c.v)) + ' de más',
        c.detalle + ' Si hubieras rendido igual que en el resto, tendrías ' + C.fmtCOP(Math.abs(c.v)) + ' más.');
    }).join('') + '</div>';
    return tarjeta('Qué te cuesta cada costumbre', cuerpo,
      'Compara cada grupo de boletos contra el resto de tu juego. Solo aparecen las costumbres que te cuestan plata, con al menos ' + MIN_MOSTRAR + ' boletos en cada lado.');
  }

  function bloqueCuotas(res) {
    var cubos = porCuota(res).filter(function (c) { return c.n > 0; });
    if (!cubos.length) return '';
    var conDatos = cubos.filter(function (c) { return c.n >= MIN_MOSTRAR; });
    var cuerpo = G.barrasH(cubos.map(function (c) {
      return {
        et: c.clave,
        v: c.n >= MIN_MOSTRAR ? c.yield : 0,
        color: c.n < MIN_MOSTRAR ? 'var(--nulo)' : undefined,
        tip: '<b>Cuota ' + esc(c.clave) + '</b><br>' + c.n + ' boletos · ' + C.fmtCOP(c.turnover) + ' apostados<br>' +
             (c.n >= MIN_MOSTRAR ? 'Rentabilidad ' + C.fmtPct(c.yield) + '<br>' + C.fmtCOPsigno(c.neto) : 'Pocos datos para calcular rentabilidad')
      };
    }), { fmt: function (v) { return v === 0 ? '—' : C.fmtPct(v, 0); } });

    cuerpo += G.tabla(['Cuota', 'N.º', 'Apostado', 'Result.', 'Rent.'],
      cubos.map(function (c) {
        return [c.clave, String(c.n), C.fmtCOP(c.turnover, true), C.fmtCOPsigno(c.neto, true), celdaYield(c)];
      }), 'Ver la tabla por cuota');

    // el sesgo hacia las cuotas altas: el patrón más repetido en apostadores
    var altas = conDatos.filter(function (c) { return c.clave === '3,01–5,00' || c.clave === '5,00+'; });
    var bajas = conDatos.filter(function (c) { return c.clave !== '3,01–5,00' && c.clave !== '5,00+'; });
    if (altas.length && bajas.length) {
      var tA = suma(altas.map(function (c) { return c.turnover; }));
      var nA = suma(altas.map(function (c) { return c.neto; }));
      var tB = suma(bajas.map(function (c) { return c.turnover; }));
      var nB = suma(bajas.map(function (c) { return c.neto; }));
      var yA = tA ? nA / tA * 100 : 0, yB = tB ? nB / tB * 100 : 0;
      if (yA < yB - 3) {
        cuerpo += aviso('grave', '🎰', 'Las cuotas altas te están costando',
          'En cuotas sobre 3,00 rindes ' + C.fmtPct(yA) + ' sobre ' + C.fmtCOP(tA) + ' apostados; ' +
          'en el resto, ' + C.fmtPct(yB) + '. Es el sesgo más documentado en apostadores: la cuota alta ' +
          'promete recuperar de un golpe y paga peor de lo que parece.');
      }
    }
    return tarjeta('Por rango de cuota', cuerpo,
      'Los tramos en gris tienen menos de ' + MIN_MOSTRAR + ' boletos: no alcanzan para calcular rentabilidad.');
  }

  function bloqueFormato(res) {
    var simples = res.filter(function (b) { return !b.tipoBoleto || b.tipoBoleto === 'simple'; });
    var combis = res.filter(function (b) { return b.tipoBoleto && b.tipoBoleto !== 'simple'; });
    var prev = res.filter(function (b) { return !b.enVivo; });
    var vivo = res.filter(function (b) { return b.enVivo; });
    var filas = [];
    [['Simples', simples], ['Combinadas', combis], ['Prepartido', prev], ['En vivo', vivo]]
      .forEach(function (par) {
        var m = resumen(par[1]);
        if (m.n) filas.push([par[0], String(m.n), C.fmtCOP(m.turnover, true), C.fmtCOPsigno(m.neto, true), celdaYield(m)]);
      });
    if (filas.length < 2) return '';
    var cuerpo = '<div class="scroll-x"><table class="tabla-datos"><thead><tr><th>Formato</th>' +
      '<th>N.º</th><th>Apostado</th><th>Result.</th><th>Rent.</th></tr></thead><tbody>' +
      filas.map(function (f) {
        return '<tr><th scope="row">' + esc(f[0]) + '</th>' + f.slice(1).map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody></table></div>';

    var mS = resumen(simples), mC = resumen(combis);
    if (mS.n >= MIN_MOSTRAR && mC.n >= MIN_MOSTRAR && mC.yield < mS.yield - 3) {
      var patas = media(combis.map(function (b) { return +b.numSelecciones || 2; }));
      var margen = (1 - Math.pow(1 - 0.05, patas)) * 100;
      cuerpo += aviso('grave', '🧩', 'Las combinadas rinden peor que las simples',
        'Combinadas: ' + C.fmtPct(mC.yield) + ' · simples: ' + C.fmtPct(mS.yield) + '. ' +
        'Con ' + patas.toFixed(1) + ' selecciones de media, la casa se queda con cerca del ' + Math.round(margen) +
        '% de lo que apuestas, contra un 5% en una simple. La combinada multiplica el margen, no la ventaja.');
    }
    return tarjeta('Simples, combinadas y en vivo', cuerpo);
  }

  function bloqueDimension(res, id, titulo, clave, nombre) {
    var cortes = cortar(res, clave).sort(function (a, b) { return b.turnover - a.turnover; }).slice(0, 8);
    if (cortes.length < 2) return '';
    var cuerpo = G.barrasH(cortes.map(function (c, i) {
      return {
        et: nombre(c.clave),
        v: c.neto,
        color: 'var(--cat-' + ((i % 6) + 1) + ')',
        tip: '<b>' + esc(nombre(c.clave)) + '</b><br>' + c.n + ' boletos · ' + C.fmtCOP(c.turnover) + ' apostados<br>' +
             C.fmtCOPsigno(c.neto) + (c.n >= MIN_MOSTRAR ? '<br>Rentabilidad ' + C.fmtPct(c.yield) : '<br>Pocos datos')
      };
    }), { fmt: function (v) { return C.fmtCOP(v, true); } });
    cuerpo += G.tabla([titulo.replace('Por ', ''), 'N.º', 'Apostado', 'Result.', 'Rent.'],
      cortes.map(function (c) {
        return [nombre(c.clave), String(c.n), C.fmtCOP(c.turnover, true), C.fmtCOPsigno(c.neto, true), celdaYield(c)];
      }), 'Ver la tabla');
    return tarjeta(titulo, cuerpo);
  }

  function bloqueDisciplina(res, conB) {
    var norm = res.map(function (b) { return b.stakeNorm || 0; }).filter(function (x) { return x > 0; });
    if (norm.length < 8) return '';
    var cv = media(norm) ? desvest(norm) / media(norm) : 0;
    var sizing = pearson(norm, res.filter(function (b) { return (b.stakeNorm || 0) > 0; })
      .map(function (b) { return C.invertido(b) ? C.ganancia(b) / C.invertido(b) : 0; }));
    var tp = trasPerder(res);

    var cuerpo = '<div class="fichas" style="margin-bottom:4px">' +
      global.APP.ficha('Inversión media', (media(norm) * 100).toFixed(1).replace('.', ',') + '%', 'de tu caja por boleto',
        media(norm) > 0.05 ? 'neg' : media(norm) <= 0.03 ? 'pos' : '') +
      global.APP.ficha('Regularidad', cv < 0.35 ? 'Alta' : cv < 0.6 ? 'Media' : 'Baja',
        'variación de ' + Math.round(cv * 100) + '%', cv < 0.35 ? 'pos' : cv > 0.6 ? 'neg' : '') +
      (sizing != null ? global.APP.ficha('Puntería', sizing > 0.05 ? 'Buena' : sizing < -0.05 ? 'Invertida' : 'Neutra',
        'apuestas fuerte en tus…', sizing > 0.05 ? 'pos' : sizing < -0.05 ? 'neg' : '') : '') +
    '</div>';

    if (media(norm) > 0.05) {
      cuerpo += aviso('grave', '📏', 'Estás apostando ' + (media(norm) * 100).toFixed(1).replace('.', ',') + '% de tu caja por boleto',
        'Ninguna guía de gestión de banca respalda pasar del 5%. Entre 1% y 3% es lo habitual: con esa proporción, ' +
        'una mala racha de 10 boletos te quita el 20% y no el 50%.');
    }
    if (sizing != null && sizing < -0.05) {
      cuerpo += aviso('grave', '🔀', 'Apuestas más fuerte justo en tus peores boletos',
        'La relación entre cuánto pones y cómo te va es negativa. Si tus apuestas grandes fueran las buenas, sería al revés. ' +
        'Es la señal más común de que el monto lo decide la emoción y no el análisis.');
    }
    if (cv > 0.6) {
      cuerpo += aviso('ojo', '🎚', 'El monto varía demasiado de un boleto a otro',
        'Tus inversiones oscilan un ' + Math.round(cv * 100) + '% alrededor de su media. Un monto parejo hace que tus ' +
        'resultados dependan de acertar y no de en cuál acertaste.');
    }

    if (tp) {
      var subeCuota = tp.cuotaTrasPerder / (tp.cuotaTrasGanar || 1);
      cuerpo += '<table class="tabla-datos" style="margin-top:10px"><thead><tr><th>Después de…</th><th>Cuota media</th><th>Inversión</th><th>Rentab.</th></tr></thead><tbody>' +
        '<tr><th scope="row">una derrota</th><td>' + C.fmtCuota(tp.cuotaTrasPerder) + '</td><td>' + (tp.stakeTrasPerder * 100).toFixed(1).replace('.', ',') + '%</td><td>' + C.fmtPct(tp.yieldTrasPerder) + '</td></tr>' +
        '<tr><th scope="row">una victoria</th><td>' + C.fmtCuota(tp.cuotaTrasGanar) + '</td><td>' + (tp.stakeTrasGanar * 100).toFixed(1).replace('.', ',') + '%</td><td>' + C.fmtPct(tp.yieldTrasGanar) + '</td></tr>' +
        '</tbody></table>';
      if (subeCuota > 1.15) {
        cuerpo += aviso('grave', '🌡', 'Después de perder buscas cuotas más altas',
          'Tu cuota media sube de ' + C.fmtCuota(tp.cuotaTrasGanar) + ' a ' + C.fmtCuota(tp.cuotaTrasPerder) +
          ' tras una derrota. Es perseguir la pérdida: se asume más riesgo justo cuando peor se está decidiendo, ' +
          'y es lo que convierte una mala tarde en una mala semana.');
      }
      if (tp.vivoTrasPerder - tp.vivoTrasGanar > 0.10) {
        cuerpo += aviso('ojo', '⚡', 'Después de perder te vas al en vivo',
          Math.round(tp.vivoTrasPerder * 100) + '% de tus boletos tras una derrota son en vivo, contra ' +
          Math.round(tp.vivoTrasGanar * 100) + '% tras una victoria. El en vivo tiene el doble de margen para la casa.');
      }
    }
    return tarjeta('Disciplina', cuerpo,
      'La inversión se mide como porcentaje de la caja que tenías en ese momento, reconstruida con tus depósitos y retiros.');
  }

  function bloqueRachas(res) {
    var r = rachasYCaida(res);
    var cuerpo = '<div class="fichas" style="margin-bottom:4px">' +
      global.APP.ficha('Racha ganadora', String(r.maxGanadas), 'boletos seguidos') +
      global.APP.ficha('Racha perdedora', String(r.maxPerdidas), 'boletos seguidos') +
      global.APP.ficha('Caída más honda', C.fmtCOP(r.caidaMax, true), 'desde tu mejor momento', r.caidaMax ? 'neg' : '') +
    '</div>';
    if (r.rachaEsperada != null && r.maxPerdidas) {
      var normal = r.maxPerdidas <= r.rachaEsperada + 1;
      cuerpo += aviso(normal ? 'bien' : 'ojo', normal ? '😌' : '🥶',
        normal ? 'Tu peor racha entra dentro de lo normal' : 'Tu peor racha fue algo más larga de lo esperable',
        'Con tu tasa de acierto y ' + res.length + ' boletos, lo esperable por puro azar era una racha de unas ' +
        r.rachaEsperada + ' derrotas seguidas. La tuya fue de ' + r.maxPerdidas + '. ' +
        (normal ? 'Perder varias seguidas no significa que algo esté roto.' : 'Aun así, rachas así ocurren.'));
    }
    if (r.caidaActual > 0) {
      cuerpo += '<div class="ayuda" style="margin-top:8px">Ahora mismo estás <b>' + C.fmtCOP(r.caidaActual) +
        '</b> por debajo de tu mejor momento.</div>';
    }
    return tarjeta('Rachas y caídas', cuerpo);
  }

  function bloqueMeses(res) {
    var porMes = {};
    res.forEach(function (b) {
      var k = (b.fecha || '').slice(0, 7);
      if (k) (porMes[k] = porMes[k] || []).push(b);
    });
    var claves = Object.keys(porMes).sort();
    if (claves.length < 2) return '';
    var datos = claves.slice(-12).map(function (k) {
      var m = resumen(porMes[k]);
      return {
        x: global.APP.mesCorto(k), v: m.neto,
        meta: m.n + ' boletos · ' + C.fmtCOP(m.turnover) + ' apostados'
      };
    });
    var cuerpo = G.barrasDivergentes(datos, { fmt: function (v, corto) { return C.fmtCOP(v, corto); } });
    cuerpo += G.tabla(['Mes', 'N.º', 'Apostado', 'Result.'],
      claves.slice(-12).map(function (k) {
        var m = resumen(porMes[k]);
        return [global.APP.nomMes(k), String(m.n), C.fmtCOP(m.turnover, true), C.fmtCOPsigno(m.neto, true)];
      }), 'Ver la tabla por mes');
    return tarjeta('Mes a mes', cuerpo,
      'Un mes son pocos boletos: sirve para ver el ritmo, no para sacar conclusiones sobre si estás jugando mejor.');
  }

  var DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var FRANJAS = [
    { et: 'mañana', min: 6, max: 12 },
    { et: 'tarde', min: 12, max: 18 },
    { et: 'noche', min: 18, max: 24 },
    { et: 'madrugada', min: 0, max: 6 }
  ];
  function bloqueDiaHora(res) {
    var conHora = res.filter(function (b) { return b.hora; });
    if (conHora.length < 12) return '';
    var matriz = FRANJAS.map(function () {
      return DIAS.map(function () { return { n: 0, v: 0 }; });
    });
    conHora.forEach(function (b) {
      var d = new Date(b.fecha + 'T' + (b.hora || '12:00') + ':00');
      if (isNaN(d)) return;
      var h = +b.hora.slice(0, 2);
      var f = FRANJAS.findIndex(function (x) { return h >= x.min && h < x.max; });
      if (f < 0) return;
      var celda = matriz[f][d.getDay()];
      celda.n++; celda.v += C.invertido(b);
    });
    var cuerpo = G.mapaCalor(matriz, FRANJAS.map(function (f) { return f.et; }), DIAS,
      { fmt: function (v) { return C.fmtCOP(v) + ' apostados'; } });

    // la madrugada: marcador conocido de decisiones cansadas
    var madrugada = conHora.filter(function (b) { var h = +b.hora.slice(0, 2); return h >= 0 && h < 6; });
    var resto = conHora.filter(function (b) { var h = +b.hora.slice(0, 2); return !(h >= 0 && h < 6); });
    var mM = resumen(madrugada), mR = resumen(resto);
    if (mM.n >= MIN_MOSTRAR && mR.n >= MIN_MOSTRAR && mM.yield < mR.yield - 5) {
      cuerpo += aviso('ojo', '🌙', 'De madrugada te va peor',
        'Rentabilidad ' + C.fmtPct(mM.yield) + ' entre medianoche y las 6, contra ' + C.fmtPct(mR.yield) +
        ' el resto del día, sobre ' + mM.n + ' boletos. Apostar a esas horas es una señal conocida de decisiones cansadas.');
    }
    return tarjeta('Cuándo apuestas', cuerpo,
      'El número en cada casilla es la cantidad de boletos; el color, cuánta plata movió. Con pocos boletos por casilla, léelo como una tendencia y no como un dato.');
  }

  global.ANALISIS = {
    resumen: resumen, avisos: avisos, render: render,
    conBankroll: conBankroll, porCuota: porCuota, costes: costes,
    rachasYCaida: rachasYCaida, trasPerder: trasPerder, bandaAzar: bandaAzar,
    boletosNecesarios: boletosNecesarios,
    MIN_MOSTRAR: MIN_MOSTRAR, MIN_FIABLE: MIN_FIABLE
  };
})(window);
