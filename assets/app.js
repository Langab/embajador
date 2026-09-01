/* =========================================================================
   app.js — estado, sincronización, formularios y pantallas.
   Los datos viven en el teléfono y se espejan en una hoja de Google, igual
   que en la app de la casa: gana siempre el registro editado más tarde.
   ========================================================================= */

(function () {
  'use strict';

  var C = window.CALC, G = window.G, D = window.DATOS, E = window.ESCUDOS;
  var esc = G.esc;

  /* ====================== estado ====================== */
  var CLAVE_A = 'emb_apuestas_v1';
  var CLAVE_M = 'emb_movimientos_v1';
  var CLAVE_C = 'emb_cfg_v1';

  var apuestas = [];
  var movimientos = [];
  var cfg = {};
  var seccion = 'hoy';

  var filtros = { mes: 'todos', estado: 'todos', liga: 'todas', tipo: 'todos' };
  var periodoAnalisis = '90';

  var hoyISO = function () {
    var d = new Date(), z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4);
    return z.toISOString().slice(0, 10);
  };
  var ahoraHora = function () {
    var d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  };
  var nuevoId = function () {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  };
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
               'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var MESES_C = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  function nomMes(ym) {
    var m = +ym.slice(5, 7) - 1;
    return MESES[m].charAt(0).toUpperCase() + MESES[m].slice(1) + ' ' + ym.slice(0, 4);
  }
  function mesCorto(ym) { return MESES_C[+ym.slice(5, 7) - 1] + ' ' + ym.slice(2, 4); }
  function fechaCorta(iso) {
    if (!iso) return '';
    return iso.slice(8, 10) + ' ' + MESES_C[+iso.slice(5, 7) - 1];
  }

  var vivas = function () { return apuestas.filter(function (a) { return !a.deleted; }); };
  var vivosMov = function () { return movimientos.filter(function (m) { return !m.deleted; }); };

  /* ====================== almacenamiento ====================== */
  function cargar() {
    try { apuestas = JSON.parse(localStorage.getItem(CLAVE_A) || '[]'); } catch (e) { apuestas = []; }
    try { movimientos = JSON.parse(localStorage.getItem(CLAVE_M) || '[]'); } catch (e) { movimientos = []; }
    try { cfg = JSON.parse(localStorage.getItem(CLAVE_C) || '{}'); } catch (e) { cfg = {}; }
    if (!Array.isArray(apuestas)) apuestas = [];
    if (!Array.isArray(movimientos)) movimientos = [];
    C.cargarTasa();
  }
  function guardar() {
    try {
      localStorage.setItem(CLAVE_A, JSON.stringify(apuestas));
      localStorage.setItem(CLAVE_M, JSON.stringify(movimientos));
    } catch (e) { alert('No se pudo guardar en este teléfono: ' + e.message); }
  }
  function guardarCfg() {
    try { localStorage.setItem(CLAVE_C, JSON.stringify(cfg)); } catch (e) {}
  }

  /* ====================== sincronización ====================== */
  function fusionar(lista, remotas) {
    var n = 0;
    (remotas || []).forEach(function (r) {
      if (!r || !r.id) return;
      var mia = null;
      for (var i = 0; i < lista.length; i++) if (lista[i].id === r.id) { mia = lista[i]; break; }
      if (!mia) { lista.push(r); n++; }
      else if (String(r.updatedAt || '') > String(mia.updatedAt || '')) { Object.assign(mia, r); n++; }
    });
    return n;
  }

  var sincronizando = false;
  function sincronizar(silencioso) {
    if (!cfg.sheetUrl || sincronizando) return Promise.resolve();
    sincronizando = true;
    if (!silencioso) estadoSync('Sincronizando…');
    return fetch(cfg.sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ token: cfg.token || '', apuestas: apuestas, movimientos: movimientos })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.ok) throw new Error(d.error || 'la planilla respondió con un error');
        fusionar(apuestas, d.apuestas);
        fusionar(movimientos, d.movimientos);
        guardar();
        cfg.ultimaSync = new Date().toISOString(); guardarCfg();
        render();
        estadoSync('Sincronizado a las ' + new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }));
      })
      .catch(function (err) {
        estadoSync('No se pudo conectar con la planilla (' + err.message + '). Lo que anotaste quedó guardado en este teléfono.');
      })
      .then(function () { sincronizando = false; });
  }
  function estadoSync(txt) {
    var el = document.getElementById('estadoSync');
    if (el) el.textContent = txt;
  }

  /* ====================== alta y baja de registros ====================== */
  function guardarBoleto(b) {
    b.updatedAt = new Date().toISOString();
    if (!b.id) { b.id = nuevoId(); apuestas.push(b); }
    else {
      var i = apuestas.findIndex(function (a) { return a.id === b.id; });
      if (i >= 0) apuestas[i] = b; else apuestas.push(b);
    }
    guardar(); render(); sincronizar(true);
  }
  function borrarBoleto(id) {
    var a = apuestas.find(function (x) { return x.id === id; });
    if (!a) return;
    a.deleted = true; a.updatedAt = new Date().toISOString();
    guardar(); render(); sincronizar(true);
  }
  function guardarMov(m) {
    m.updatedAt = new Date().toISOString();
    if (!m.id) { m.id = nuevoId(); movimientos.push(m); }
    else {
      var i = movimientos.findIndex(function (x) { return x.id === m.id; });
      if (i >= 0) movimientos[i] = m; else movimientos.push(m);
    }
    guardar(); render(); sincronizar(true);
  }
  function borrarMov(id) {
    var m = movimientos.find(function (x) { return x.id === id; });
    if (!m) return;
    m.deleted = true; m.updatedAt = new Date().toISOString();
    guardar(); render(); sincronizar(true);
  }

  /* ====================== navegación ====================== */
  function irA(sec) {
    seccion = sec;
    document.querySelectorAll('main section').forEach(function (s) {
      s.classList.toggle('act', s.id === 'sec-' + sec);
    });
    document.querySelectorAll('nav button[data-sec]').forEach(function (b) {
      var act = b.dataset.sec === sec;
      b.classList.toggle('act', act);
      if (act) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
    render();
  }

  /* ====================== el boleto dibujado ====================== */
  var NOMBRE_ESTADO = {
    ganada: 'Ganada', perdida: 'Perdida', anulada: 'Anulada', cashout: 'Cash out',
    media_ganada: 'Media ganada', media_perdida: 'Media perdida', pendiente: 'En juego'
  };

  function boletoHTML(b) {
    var g = C.ganancia(b);
    var pend = C.estaPendiente(b);
    var mercado = D.MERCADOS_POR_CLAVE[b.mercado];
    var nomMercado = mercado ? mercado.n : (b.mercado || 'Apuesta');
    var esCombi = b.tipoBoleto && b.tipoBoleto !== 'simple';

    var s = '<article class="boleto tocable" data-boleto="' + esc(b.id) + '" tabindex="0" role="button" ' +
            'aria-label="' + esc((b.equipoLocal || 'Boleto') + ' contra ' + (b.equipoVisita || '') + ', ' + (NOMBRE_ESTADO[b.resultado] || '')) + '">';
    s += '<div class="boleto-cuerpo">';
    s += '<span class="sello ' + esc(b.resultado || 'pendiente') + '">' + esc(NOMBRE_ESTADO[b.resultado] || 'En juego') + '</span>';

    // fecha, liga y etiquetas
    s += '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:9px;padding-right:88px">';
    s += '<span style="font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--tinta-suave)">' +
         esc(fechaCorta(b.fecha)) + (b.hora ? ' · ' + esc(b.hora) : '') + '</span>';
    if (b.liga && D.LIGAS[b.liga]) {
      s += '<span style="font-size:10.5px;color:var(--tinta-suave);font-weight:600">· ' + esc(D.LIGAS[b.liga].n) + '</span>';
    }
    if (b.enVivo) s += '<span class="pill vivo">En vivo</span>';
    if (b.freebet) s += '<span class="pill free">Gratis</span>';
    if (esCombi) s += '<span class="pill combi">' + esc(b.tipoBoleto === 'sistema' ? 'Sistema' : 'Combinada ' + (b.numSelecciones || '') ).trim() + '</span>';
    s += '</div>';

    // el enfrentamiento
    if (b.equipoLocal || b.equipoVisita) {
      var elegLocal = b.seleccion === b.equipoLocal;
      var elegVisita = b.seleccion === b.equipoVisita;
      s += '<div class="duelo">' +
             '<span class="lado">' + E.escudo(b.equipoLocal, 30) +
               '<span class="equipo-nom' + (elegLocal ? ' elegido' : '') + '">' + esc(b.equipoLocal || '—') + '</span></span>' +
             '<span class="vs">VS</span>' +
             '<span class="lado visita">' + E.escudo(b.equipoVisita, 30) +
               '<span class="equipo-nom' + (elegVisita ? ' elegido' : '') + '">' + esc(b.equipoVisita || '—') + '</span></span>' +
           '</div>';
    }

    // qué apostó
    s += '<div style="margin-top:10px;display:flex;align-items:center;gap:7px;flex-wrap:wrap">' +
           '<span class="mercado-tag">' + esc(nomMercado) + '</span>' +
           '<strong style="font-size:14px">' + esc(b.seleccion || '') +
             (b.linea != null && b.linea !== '' ? ' <span style="color:var(--tinta-suave)">' + esc(b.linea) + '</span>' : '') +
           '</strong>' +
         '</div>';

    // cuota, inversión y lo que está en juego
    s += '<div class="datos-boleto">' +
           '<div class="dato"><div class="k">Cuota</div><div class="v num">' + C.fmtCuota(b.cuota) + '</div></div>' +
           '<div class="dato"><div class="k">Invirtió</div><div class="v">' + C.fmtCOP(b.stake) + '</div></div>' +
           '<div class="dato"><div class="k">' + (pend ? 'Si gana' : 'Pagó') + '</div><div class="v chico">' +
             (pend ? C.fmtCOPsigno(C.gananciaPotencial(b)) : C.fmtCOP(C.retorno(b))) + '</div></div>' +
         '</div>';
    s += '</div>';

    // la perforación y el pie con el resultado en plata
    s += '<div class="perfo"></div>';
    s += '<div class="boleto-pie"><div class="resultado-plata">';
    if (pend) {
      s += '<span class="plata cero">En juego</span>' +
           '<span class="plata-eur">' + C.fmtEUR(C.copAEur(b.stake, b.tasaEurCop)) + ' en riesgo</span>';
    } else {
      s += '<span class="plata ' + (g > 0 ? 'pos' : g < 0 ? 'neg' : 'cero') + '">' + C.fmtCOPsigno(g) + '</span>' +
           '<span class="plata-eur">' + C.fmtEURsigno(C.copAEur(g, b.tasaEurCop)) + '</span>';
    }
    s += '</div>';
    if (b.notas) s += '<div style="font-size:12px;color:var(--tinta-suave);margin-top:6px;line-height:1.4">' + esc(b.notas) + '</div>';
    s += '</div></article>';
    return s;
  }

  /* ====================== pantalla: HOY ====================== */
  function renderHoy() {
    var res = vivas().filter(C.estaResuelto);
    var pend = vivas().filter(C.estaPendiente);
    var neto = res.reduce(function (t, b) { return t + C.ganancia(b); }, 0);

    var dep = vivosMov().filter(function (m) { return m.tipo === 'deposito'; })
                        .reduce(function (t, m) { return t + (+m.monto || 0); }, 0);
    var ret = vivosMov().filter(function (m) { return m.tipo === 'retiro'; })
                        .reduce(function (t, m) { return t + (+m.monto || 0); }, 0);
    var bono = vivosMov().filter(function (m) { return m.tipo === 'bono'; })
                         .reduce(function (t, m) { return t + (+m.monto || 0); }, 0);
    // lo que debería quedar en la plataforma, con lo pendiente ya descontado
    var enRiesgo = pend.reduce(function (t, b) { return t + C.invertido(b); }, 0);
    var saldo = dep + bono - ret + neto - enRiesgo;

    var cont = document.getElementById('marcador');
    var clase = neto > 0 ? 'pos' : neto < 0 ? 'neg' : 'cero';
    var s = '<div class="boleto"><div class="boleto-cuerpo marcador">' +
      '<div class="rotulo">Ganancia real acumulada</div>' +
      '<div class="cifra ' + clase + '">' + C.fmtCOPsigno(neto) + '</div>' +
      '<div class="euros">' + C.fmtEURsigno(C.copAEur(neto)) + '</div>' +
      '<div class="caja-tres">' +
        '<div><div class="k">Depositado</div><div class="v">' + C.fmtCOP(dep + bono, true) + '</div></div>' +
        '<div><div class="k">Retirado</div><div class="v">' + C.fmtCOP(ret, true) + '</div></div>' +
        '<div><div class="k">En BetPlay</div><div class="v">' + C.fmtCOP(saldo, true) + '</div></div>' +
      '</div>';
    if (pend.length) {
      s += '<div style="margin-top:10px;font-size:12px;color:var(--tinta-suave);font-weight:600">' +
           pend.length + ' boleto' + (pend.length === 1 ? '' : 's') + ' en juego · ' + C.fmtCOP(enRiesgo) + ' en riesgo</div>';
    }
    s += '</div><div class="perfo"></div><div class="boleto-pie">' +
         '<div id="curvaHoy"></div></div></div>';
    cont.innerHTML = s;

    // la curva de la caja dentro del boleto maestro
    var serie = serieCaja(res);
    document.getElementById('curvaHoy').innerHTML = serie.length > 1
      ? G.curva(serie, { fmt: function (v, corto) { return C.fmtCOP(v, corto); }, titulo: 'Evolución de la ganancia', alto: 118 })
      : '<div style="text-align:center;font-size:12px;color:var(--tinta-suave);padding:6px 0">La curva de tu caja aparece con dos boletos resueltos.</div>';

    // fichas de cabecera
    var m = window.ANALISIS.resumen(res);
    document.getElementById('fichasHoy').innerHTML =
      ficha('Rentabilidad', C.fmtPct(m.yield), m.n + ' boletos resueltos', m.yield > 0 ? 'pos' : m.yield < 0 ? 'neg' : '') +
      ficha('Acierto', m.n ? Math.round(m.tasaAcierto * 100) + '%' : '—', 'necesita ' + (m.cuotaMedia ? Math.round(100 / m.cuotaMedia) + '%' : '—') + ' para empatar') +
      ficha('Cuota media', C.fmtCuota(m.cuotaMedia), 'invertido ' + C.fmtCOP(m.turnover, true));

    // avisos accionables
    document.getElementById('avisosHoy').innerHTML =
      window.ANALISIS.avisos(res, vivas(), { deposito: dep + bono, retiro: ret, saldo: saldo }).slice(0, 3).join('');

    // últimos boletos
    var ult = vivas().slice().sort(ordenFecha).reverse().slice(0, 5);
    document.getElementById('ultimosBoletos').innerHTML = ult.length
      ? ult.map(boletoHTML).join('')
      : '<div class="tarjeta"><div class="vacio"><strong>Todavía no hay boletos.</strong>' +
        'Toca <b>Apostar</b> abajo para anotar el primero.</div></div>';
  }

  function ficha(k, v, sub, clase) {
    return '<div class="ficha"><div class="k">' + esc(k) + '</div>' +
           '<div class="v ' + (clase || '') + '">' + esc(v) + '</div>' +
           (sub ? '<div class="sub">' + esc(sub) + '</div>' : '') + '</div>';
  }

  function ordenFecha(a, b) {
    var f = String(a.fecha || '').localeCompare(String(b.fecha || ''));
    if (f !== 0) return f;
    return String(a.hora || '').localeCompare(String(b.hora || ''));
  }

  /** Serie acumulada de ganancia, un punto por boleto resuelto. */
  function serieCaja(res) {
    var ord = res.slice().sort(ordenFecha);
    var acum = 0;
    return ord.map(function (b) {
      acum += C.ganancia(b);
      return {
        x: fechaCorta(b.fecha), v: acum,
        meta: (b.equipoLocal || '') + (b.equipoVisita ? ' vs ' + b.equipoVisita : '') +
              '<br>' + C.fmtCOPsigno(C.ganancia(b)) + ' en este boleto'
      };
    });
  }

  /* ====================== pantalla: BOLETOS ====================== */
  function renderBoletos() {
    var todas = vivas();
    var meses = [].concat.apply([], [todas.map(function (b) { return (b.fecha || '').slice(0, 7); })])
      .filter(Boolean).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort().reverse();

    llenarSelect('fMes', [['todos', 'Todos los meses']].concat(meses.map(function (m) { return [m, nomMes(m)]; })), filtros.mes);
    llenarSelect('fEstado', [['todos', 'Cualquier resultado'], ['pendiente', 'En juego'], ['ganada', 'Ganadas'],
      ['perdida', 'Perdidas'], ['cashout', 'Cash out'], ['anulada', 'Anuladas']], filtros.estado);
    var ligasUsadas = todas.map(function (b) { return b.liga; }).filter(Boolean)
      .filter(function (v, i, a) { return a.indexOf(v) === i; });
    llenarSelect('fLiga', [['todas', 'Todas las ligas']].concat(ligasUsadas.map(function (l) {
      return [l, D.LIGAS[l] ? D.LIGAS[l].n : l];
    })), filtros.liga);
    llenarSelect('fTipo', [['todos', 'Simples y combinadas'], ['simple', 'Solo simples'],
      ['combinada', 'Solo combinadas'], ['envivo', 'Solo en vivo']], filtros.tipo);

    var lista = todas.filter(function (b) {
      if (filtros.mes !== 'todos' && (b.fecha || '').slice(0, 7) !== filtros.mes) return false;
      if (filtros.estado !== 'todos') {
        if (filtros.estado === 'pendiente' ? !C.estaPendiente(b) : b.resultado !== filtros.estado) return false;
      }
      if (filtros.liga !== 'todas' && b.liga !== filtros.liga) return false;
      if (filtros.tipo === 'simple' && b.tipoBoleto !== 'simple') return false;
      if (filtros.tipo === 'combinada' && b.tipoBoleto === 'simple') return false;
      if (filtros.tipo === 'envivo' && !b.enVivo) return false;
      return true;
    }).sort(ordenFecha).reverse();

    var res = lista.filter(C.estaResuelto);
    var neto = res.reduce(function (t, b) { return t + C.ganancia(b); }, 0);
    var inv = res.reduce(function (t, b) { return t + C.invertido(b); }, 0);
    document.getElementById('resumenFiltro').innerHTML = lista.length
      ? '<div class="tarjeta" style="padding:11px 13px"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">' +
          '<span style="font-size:12.5px;color:var(--tinta-suave);font-weight:700">' + lista.length + ' boleto' + (lista.length === 1 ? '' : 's') +
            (res.length !== lista.length ? ' · ' + res.length + ' resuelto' + (res.length === 1 ? '' : 's') : '') + '</span>' +
          '<span class="plata ' + (neto > 0 ? 'pos' : neto < 0 ? 'neg' : 'cero') + '" style="font-size:17px">' + C.fmtCOPsigno(neto) + '</span>' +
        '</div>' +
        (inv ? '<div style="font-size:11.5px;color:var(--tinta-suave);margin-top:3px">Invertido ' + C.fmtCOP(inv) +
               ' · rentabilidad ' + C.fmtPct(neto / inv * 100) + '</div>' : '') +
        '</div>'
      : '';

    document.getElementById('listaBoletos').innerHTML = lista.length
      ? lista.map(boletoHTML).join('')
      : '<div class="tarjeta"><div class="vacio"><strong>Ningún boleto con esos filtros.</strong>Prueba con otro mes o con otro resultado.</div></div>';
  }

  function llenarSelect(id, opciones, valor) {
    var el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = opciones.map(function (o) {
      return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(valor) ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
    }).join('');
  }

  /* ====================== pantalla: CAJA ====================== */
  function renderCaja() {
    var dep = 0, ret = 0, bono = 0;
    vivosMov().forEach(function (m) {
      var v = +m.monto || 0;
      if (m.tipo === 'deposito') dep += v;
      else if (m.tipo === 'retiro') ret += v;
      else if (m.tipo === 'bono') bono += v;
    });
    var res = vivas().filter(C.estaResuelto);
    var neto = res.reduce(function (t, b) { return t + C.ganancia(b); }, 0);
    var enRiesgo = vivas().filter(C.estaPendiente).reduce(function (t, b) { return t + C.invertido(b); }, 0);
    var saldo = dep + bono - ret + neto - enRiesgo;
    var deBolsillo = dep - ret;      // lo que de verdad salió (o volvió) a su bolsillo

    var t = C.tasaInfo();
    var s = '';

    /* --- el conversor: lo primero, porque vive en Malta --- */
    s += '<div class="tarjeta">' +
      '<div class="tarjeta-titulo">Conversor euro · peso colombiano</div>' +
      '<div class="conversor">' +
        '<label class="campo" style="margin:0"><span>Euros</span>' +
          '<input type="number" id="convEur" inputmode="decimal" step="0.01" placeholder="0,00"></label>' +
        '<span class="flecha" aria-hidden="true">⇄</span>' +
        '<label class="campo" style="margin:0"><span>Pesos</span>' +
          '<input type="number" id="convCop" inputmode="numeric" step="1000" placeholder="0"></label>' +
      '</div>' +
      '<div class="tasa-nota">1 € = <b>' + C.fmtCOP(t.v) + '</b>' +
        (t.cuando ? ' · ' + t.origen + ', ' + new Date(t.cuando).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' }) : ' · valor de respaldo') +
        ' <button type="button" class="btn suave chico" id="btnTasa" style="margin-left:6px">Actualizar</button></div>' +
      '<div class="segmentos chico" style="margin-top:9px" id="atajosEur"></div>' +
    '</div>';

    /* --- el estado real de la caja --- */
    s += '<div class="tarjeta">' +
      '<div class="tarjeta-titulo">Tu plata, de verdad</div>' +
      '<table class="tabla-datos" style="font-size:13px">' +
        fila('Depositado', dep) + (bono ? fila('Bonos recibidos', bono) : '') +
        fila('Retirado', -ret) +
        fila('Resultado de los boletos', neto, true) +
        (enRiesgo ? fila('En juego ahora', -enRiesgo) : '') +
      '</table>' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:11px;padding-top:11px;border-top:2px solid var(--borde-fuerte)">' +
        '<span style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:var(--tinta-suave)">Saldo esperado en BetPlay</span>' +
        '<span style="font-size:19px;font-weight:800" class="num">' + C.fmtCOP(saldo) + '</span>' +
      '</div>' +
      '<div style="font-size:11.5px;color:var(--tinta-suave);margin-top:4px">' + C.fmtEUR(C.copAEur(saldo)) +
        ' · compáralo con lo que muestra la app de BetPlay: si no cuadra, falta anotar algo.</div>' +
      '<div class="aviso ' + (deBolsillo > 0 ? 'ojo' : 'bien') + '" style="margin-top:12px">' +
        '<span class="ico">' + (deBolsillo > 0 ? '↘' : '↗') + '</span><span>' +
        '<strong>' + (deBolsillo > 0 ? 'Llevas puesto ' + C.fmtCOP(deBolsillo) : 'Has sacado ' + C.fmtCOP(-deBolsillo) + ' más de lo que pusiste') + '</strong>' +
        (deBolsillo > 0
          ? 'Es la plata que salió de tu bolsillo y todavía no vuelve: ' + C.fmtEUR(C.copAEur(deBolsillo)) + '.'
          : 'Depositaste ' + C.fmtCOP(dep) + ' y retiraste ' + C.fmtCOP(ret) + '. Eso es lo que cuenta.') +
        '</span></div>' +
    '</div>';

    /* --- movimientos --- */
    s += '<div class="tarjeta">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
        '<div class="tarjeta-titulo" style="margin:0">Depósitos y retiros</div>' +
        '<button type="button" class="btn oro chico" id="btnNuevoMov">+ Anotar</button>' +
      '</div>';
    var movs = vivosMov().slice().sort(function (a, b) { return String(a.fecha).localeCompare(String(b.fecha)); }).reverse();
    if (!movs.length) {
      s += '<div class="vacio"><strong>Sin movimientos anotados.</strong>' +
           'Anota cada depósito y cada retiro: es lo único que BetPlay no te dice.</div>';
    } else {
      s += '<table class="tabla-datos">';
      movs.forEach(function (m) {
        var v = +m.monto || 0;
        var signo = m.tipo === 'retiro' ? -1 : 1;
        var color = m.tipo === 'retiro' ? 'var(--div-pos)' : m.tipo === 'bono' ? 'var(--cash)' : 'var(--tinta-media)';
        s += '<tr class="tocable" data-mov="' + esc(m.id) + '">' +
             '<th scope="row" style="font-weight:600">' + esc(fechaCorta(m.fecha)) +
               '<span style="display:block;font-size:10.5px;color:var(--tinta-suave);font-weight:700;text-transform:uppercase;letter-spacing:.05em">' +
               esc(m.tipo === 'deposito' ? 'Depósito' : m.tipo === 'retiro' ? 'Retiro' : m.tipo === 'bono' ? 'Bono' : 'Ajuste') +
               (m.metodo ? ' · ' + esc(m.metodo) : '') + '</span></th>' +
             '<td style="color:' + color + ';font-weight:800">' + (signo > 0 ? '+' : '−') + C.fmtCOP(v) +
               '<span style="display:block;font-size:10.5px;color:var(--tinta-suave);font-weight:600">' +
               C.fmtEUR(C.copAEur(v, m.tasaEurCop)) + '</span></td></tr>';
      });
      s += '</table>';
    }
    s += '</div>';

    /* --- sincronización y respaldos --- */
    s += '<div class="tarjeta">' +
      '<div class="tarjeta-titulo">Planilla de Google</div>' +
      '<label class="campo"><span>Dirección de la planilla (termina en /exec)</span>' +
        '<input type="url" id="cfgUrl" placeholder="https://script.google.com/…/exec" value="' + esc(cfg.sheetUrl || '') + '"></label>' +
      '<label class="campo"><span>Clave (solo si la configuraste)</span>' +
        '<input type="text" id="cfgToken" placeholder="opcional" value="' + esc(cfg.token || '') + '"></label>' +
      '<div class="fila-2"><button type="button" class="btn" id="btnGuardarSync">Guardar y sincronizar</button>' +
      '<button type="button" class="btn suave" id="btnSyncAhora">Sincronizar ahora</button></div>' +
      '<div class="estado-sync" id="estadoSync">' +
        (cfg.sheetUrl ? (cfg.ultimaSync ? 'Última sincronización: ' + new Date(cfg.ultimaSync).toLocaleString('es-CO') : 'Sin sincronizar todavía.')
                      : 'Sin planilla conectada. Los datos viven solo en este teléfono.') +
      '</div>' +
      '<div class="ayuda">Las instrucciones para crear la planilla están en el archivo <b>_sistema/google_sheets_sync.gs</b> del proyecto.</div>' +
    '</div>';

    s += '<div class="tarjeta">' +
      '<div class="tarjeta-titulo">Respaldo</div>' +
      '<div class="fila-2"><button type="button" class="btn suave" id="btnExpJSON">Bajar respaldo</button>' +
      '<button type="button" class="btn suave" id="btnExpCSV">Bajar CSV</button></div>' +
      '<label class="btn suave" style="margin-top:9px;cursor:pointer">Restaurar desde un respaldo' +
        '<input type="file" id="impJSON" accept=".json,application/json" hidden></label>' +
    '</div>';

    document.getElementById('caja').innerHTML = s;
    montarCaja();
  }

  function fila(k, v, fuerte) {
    return '<tr><th scope="row" style="font-weight:' + (fuerte ? 800 : 600) + '">' + esc(k) + '</th>' +
           '<td style="color:' + (v > 0 ? 'var(--div-pos)' : v < 0 ? 'var(--div-neg)' : 'var(--tinta-media)') + ';font-weight:' + (fuerte ? 800 : 700) + '">' +
           C.fmtCOPsigno(v) + '</td></tr>';
  }

  function montarCaja() {
    var eur = document.getElementById('convEur'), cop = document.getElementById('convCop');
    if (eur && cop) {
      eur.addEventListener('input', function () {
        cop.value = eur.value === '' ? '' : Math.round(C.eurACop(parseFloat(eur.value) || 0));
      });
      cop.addEventListener('input', function () {
        eur.value = cop.value === '' ? '' : C.copAEur(parseFloat(cop.value) || 0).toFixed(2);
      });
      // atajos con los montos que más usa
      var atajos = [10, 20, 50, 100];
      document.getElementById('atajosEur').innerHTML = atajos.map(function (v) {
        return '<button type="button" data-eur="' + v + '">€' + v + ' = ' + C.fmtCOP(C.eurACop(v), true) + '</button>';
      }).join('');
      document.getElementById('atajosEur').addEventListener('click', function (e) {
        var b = e.target.closest('button[data-eur]');
        if (!b) return;
        eur.value = b.dataset.eur;
        eur.dispatchEvent(new Event('input'));
      });
    }
    var bt = document.getElementById('btnTasa');
    if (bt) bt.addEventListener('click', function () {
      bt.textContent = 'Buscando…';
      C.refrescarTasa().then(function () { render(); });
    });
    var bm = document.getElementById('btnNuevoMov');
    if (bm) bm.addEventListener('click', function () { abrirMov(null); });
    document.querySelectorAll('[data-mov]').forEach(function (tr) {
      tr.addEventListener('click', function () { abrirMov(tr.dataset.mov); });
    });
    var bg = document.getElementById('btnGuardarSync');
    if (bg) bg.addEventListener('click', function () {
      var url = document.getElementById('cfgUrl').value.trim();
      if (url && !/^https:\/\/script\.google\.com\/.+\/exec$/.test(url)) {
        alert('La dirección tiene que ser la de la implementación de Apps Script y terminar en /exec.');
        return;
      }
      cfg.sheetUrl = url;
      cfg.token = document.getElementById('cfgToken').value.trim();
      guardarCfg();
      sincronizar();
    });
    var bs = document.getElementById('btnSyncAhora');
    if (bs) bs.addEventListener('click', function () { sincronizar(); });
    var bj = document.getElementById('btnExpJSON');
    if (bj) bj.addEventListener('click', exportarJSON);
    var bc = document.getElementById('btnExpCSV');
    if (bc) bc.addEventListener('click', exportarCSV);
    var ij = document.getElementById('impJSON');
    if (ij) ij.addEventListener('change', importarJSON);
  }

  /* ====================== respaldos ====================== */
  function bajar(nombre, contenido, tipo) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([contenido], { type: tipo }));
    a.download = nombre; a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  function exportarJSON() {
    bajar('apuestas_respaldo_' + hoyISO() + '.json',
      JSON.stringify({ exportado: new Date().toISOString(), apuestas: apuestas, movimientos: movimientos }, null, 2),
      'application/json');
  }
  function exportarCSV() {
    var cab = ['fecha', 'hora', 'liga', 'local', 'visitante', 'mercado', 'seleccion', 'linea',
               'tipo', 'cuota', 'inversion_cop', 'inversion_eur', 'en_vivo', 'gratis',
               'resultado', 'ganancia_cop', 'ganancia_eur', 'notas'];
    var filas = [cab];
    vivas().slice().sort(ordenFecha).forEach(function (b) {
      filas.push([b.fecha, b.hora || '', D.LIGAS[b.liga] ? D.LIGAS[b.liga].n : (b.liga || ''),
        b.equipoLocal || '', b.equipoVisita || '',
        D.MERCADOS_POR_CLAVE[b.mercado] ? D.MERCADOS_POR_CLAVE[b.mercado].n : (b.mercado || ''),
        b.seleccion || '', b.linea == null ? '' : b.linea, b.tipoBoleto || '',
        String(b.cuota || '').replace('.', ','), Math.round(b.stake || 0),
        C.copAEur(b.stake, b.tasaEurCop).toFixed(2).replace('.', ','),
        b.enVivo ? 'SI' : '', b.freebet ? 'SI' : '', NOMBRE_ESTADO[b.resultado] || '',
        Math.round(C.ganancia(b)), C.gananciaEur(b).toFixed(2).replace('.', ','), b.notas || '']);
    });
    filas.push([]);
    filas.push(['MOVIMIENTOS']);
    filas.push(['fecha', 'tipo', 'monto_cop', 'monto_eur', 'metodo', 'notas']);
    vivosMov().slice().sort(function (a, b) { return String(a.fecha).localeCompare(String(b.fecha)); }).forEach(function (m) {
      filas.push([m.fecha, m.tipo, Math.round(m.monto || 0),
        C.copAEur(m.monto, m.tasaEurCop).toFixed(2).replace('.', ','), m.metodo || '', m.notas || '']);
    });
    var csv = filas.map(function (f) {
      return f.map(function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }).join(';');
    }).join('\r\n');
    bajar('apuestas_' + hoyISO() + '.csv', '﻿' + csv, 'text/csv');
  }
  function importarJSON(ev) {
    var f = ev.target.files[0];
    if (!f) return;
    var lector = new FileReader();
    lector.onload = function () {
      try {
        var d = JSON.parse(lector.result);
        var a = fusionar(apuestas, Array.isArray(d) ? d : d.apuestas || []);
        var m = fusionar(movimientos, d.movimientos || []);
        guardar(); render();
        alert('Listo: ' + a + ' boleto(s) y ' + m + ' movimiento(s) nuevos o actualizados.');
      } catch (e) { alert('No se pudo leer el archivo: ' + e.message); }
    };
    lector.readAsText(f);
    ev.target.value = '';
  }

  /* ====================== render ====================== */
  function render() {
    if (seccion === 'hoy') renderHoy();
    else if (seccion === 'boletos') renderBoletos();
    else if (seccion === 'analisis') window.ANALISIS.render(vivas(), vivosMov(), periodoAnalisis);
    else if (seccion === 'caja') renderCaja();
  }

  /* ====================== arranque ====================== */
  cargar();

  document.querySelectorAll('nav button[data-sec]').forEach(function (b) {
    b.addEventListener('click', function () { irA(b.dataset.sec); });
  });
  document.getElementById('btnNuevo').addEventListener('click', function () { abrirBoleto(null); });

  ['fMes', 'fEstado', 'fLiga', 'fTipo'].forEach(function (id) {
    document.getElementById(id).addEventListener('change', function (e) {
      filtros[id.slice(1).toLowerCase()] = e.target.value;
      renderBoletos();
    });
  });
  document.getElementById('aPeriodo').addEventListener('change', function (e) {
    periodoAnalisis = e.target.value;
    window.ANALISIS.render(vivas(), vivosMov(), periodoAnalisis);
  });

  // tocar un boleto lo abre para editarlo
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-boleto]');
    if (el) abrirBoleto(el.dataset.boleto);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var el = e.target.closest && e.target.closest('[data-boleto]');
    if (el) { e.preventDefault(); abrirBoleto(el.dataset.boleto); }
  });

  // se expone lo que necesitan los formularios (formularios.js)
  window.APP = {
    get apuestas() { return apuestas; },
    get movimientos() { return movimientos; },
    get cfg() { return cfg; },
    vivas: vivas, vivosMov: vivosMov,
    guardarBoleto: guardarBoleto, borrarBoleto: borrarBoleto,
    guardarMov: guardarMov, borrarMov: borrarMov,
    render: render, irA: irA, sincronizar: sincronizar,
    hoyISO: hoyISO, ahoraHora: ahoraHora, nuevoId: nuevoId,
    fechaCorta: fechaCorta, nomMes: nomMes, mesCorto: mesCorto, ordenFecha: ordenFecha,
    NOMBRE_ESTADO: NOMBRE_ESTADO, ficha: ficha, boletoHTML: boletoHTML, serieCaja: serieCaja,
    llenarSelect: llenarSelect
  };

  // abrirBoleto y abrirMov los define formularios.js; aquí solo se declaran
  function abrirBoleto(id) { window.FORM.abrirBoleto(id); }
  function abrirMov(id) { window.FORM.abrirMov(id); }

  C.refrescarTasa().then(function () { render(); });
  irA('hoy');
  if (cfg.sheetUrl) sincronizar(true);
})();
