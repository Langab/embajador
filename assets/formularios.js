/* =========================================================================
   formularios.js — anotar un boleto y anotar un movimiento de caja.
   El formulario se adapta al mercado elegido: si la apuesta necesita una
   línea (más/menos 2,5) aparece el campo; si no, no estorba.
   ========================================================================= */

(function (global) {
  'use strict';

  var C = global.CALC, G = global.G, D = global.DATOS, A = global.APP;
  var esc = G.esc;

  var borrador = {};
  var telon = document.getElementById('telonBoleto');
  var telonMov = document.getElementById('telonMov');
  var form = document.getElementById('formBoleto');
  var formMov = document.getElementById('formMov');

  var ESTADOS = [
    ['pendiente', 'En juego'], ['ganada', 'Ganada'], ['perdida', 'Perdida'],
    ['cashout', 'Cash out'], ['anulada', 'Anulada'],
    ['media_ganada', 'Media ganada'], ['media_perdida', 'Media perdida']
  ];

  /* ====================== abrir y cerrar ====================== */
  function abrirBoleto(id) {
    var b = id ? A.vivas().find(function (x) { return x.id === id; }) : null;
    borrador = b ? JSON.parse(JSON.stringify(b)) : {
      fecha: A.hoyISO(), hora: A.ahoraHora(), deporte: 'futbol',
      liga: global.APP.cfg && global.APP.cfg.ultimaLiga || '', tipoBoleto: 'simple',
      resultado: 'pendiente', moneda: 'COP'
    };
    document.getElementById('tituloHoja').textContent = b ? 'Editar boleto' : 'Nuevo boleto';
    pintarForm();
    telon.classList.add('abierto');
    document.body.style.overflow = 'hidden';
  }
  function cerrarBoleto() {
    telon.classList.remove('abierto');
    document.body.style.overflow = '';
  }
  document.getElementById('cerrarBoleto').addEventListener('click', cerrarBoleto);
  telon.addEventListener('click', function (e) { if (e.target === telon) cerrarBoleto(); });

  /* ====================== el formulario del boleto ====================== */
  function pintarForm() {
    var b = borrador;
    var merc = D.MERCADOS_POR_CLAVE[b.mercado];
    var s = '';

    /* --- cuándo --- */
    s += '<div class="fila-2">' +
      campo('Fecha', '<input type="date" name="fecha" value="' + esc(b.fecha || '') + '">') +
      campo('Hora', '<input type="time" name="hora" value="' + esc(b.hora || '') + '">') +
    '</div>';

    /* --- dónde --- */
    s += campo('Liga o competición', '<select name="liga">' +
      '<option value="">— elegir liga —</option>' + D.opcionesLigas(b.liga) + '</select>');

    /* --- quiénes: los dos equipos --- */
    var lista = D.equiposDeLiga(b.liga);
    s += '<datalist id="dlEquipos">' + lista.map(function (e) {
      return '<option value="' + esc(e.n) + '"></option>';
    }).join('') + '</datalist>';

    s += '<div class="fila-2">' +
      campo('Local', '<input type="text" name="equipoLocal" list="dlEquipos" autocomplete="off" ' +
        'placeholder="equipo de casa" value="' + esc(b.equipoLocal || '') + '">') +
      campo('Visitante', '<input type="text" name="equipoVisita" list="dlEquipos" autocomplete="off" ' +
        'placeholder="equipo de fuera" value="' + esc(b.equipoVisita || '') + '">') +
    '</div>';

    // vista previa del enfrentamiento con los escudos
    if (b.equipoLocal || b.equipoVisita) {
      s += '<div style="background:var(--papel-hueco);border-radius:10px;padding:9px 11px;margin-bottom:11px">' +
        '<div class="duelo">' +
          '<span class="lado">' + global.ESCUDOS.escudo(b.equipoLocal, 26) +
            '<span class="equipo-nom">' + esc(b.equipoLocal || '—') + '</span></span>' +
          '<span class="vs">VS</span>' +
          '<span class="lado visita">' + global.ESCUDOS.escudo(b.equipoVisita, 26) +
            '<span class="equipo-nom">' + esc(b.equipoVisita || '—') + '</span></span>' +
        '</div></div>';
    }

    /* --- qué apostó --- */
    s += campo('Tipo de apuesta', '<select name="mercado">' +
      '<option value="">— elegir mercado —</option>' + D.opcionesMercados(b.mercado, b.deporte) + '</select>');

    // la selección se adapta al mercado
    s += campo('A qué le apostaste', selectorSeleccion(b, merc));

    if (merc && merc.linea) {
      s += campo(merc.etiquetaLinea || 'Línea',
        '<input type="number" name="linea" step="0.25" inputmode="decimal" placeholder="' +
        esc(merc.ejemploLinea || '2.5') + '" value="' + esc(b.linea == null ? '' : b.linea) + '">');
    }

    /* --- cuánto --- */
    s += '<div class="fila-2">' +
      campo('Cuota', '<input type="number" name="cuota" step="0.01" min="1" inputmode="decimal" ' +
        'placeholder="1,85" value="' + esc(b.cuota == null ? '' : b.cuota) + '">') +
      campo('Inversión', '<input type="number" name="stakeVis" step="any" inputmode="decimal" ' +
        'placeholder="0" value="' + esc(valorVisible(b)) + '">') +
    '</div>';

    s += '<div class="segmentos chico" style="margin:-4px 0 11px" role="group" aria-label="Moneda de la inversión">' +
      botonSeg('moneda', 'COP', 'Pesos', b.moneda !== 'EUR') +
      botonSeg('moneda', 'EUR', 'Euros', b.moneda === 'EUR') +
    '</div>';

    // lo que se juega, en las dos monedas
    s += '<div id="previa"></div>';

    /* --- formato del boleto --- */
    s += campo('Formato', '<div class="segmentos" role="group" aria-label="Formato del boleto">' +
      botonSeg('tipoBoleto', 'simple', 'Simple', (b.tipoBoleto || 'simple') === 'simple') +
      botonSeg('tipoBoleto', 'combinada', 'Combinada', b.tipoBoleto === 'combinada') +
      botonSeg('tipoBoleto', 'sistema', 'Sistema', b.tipoBoleto === 'sistema') +
    '</div>');

    if (b.tipoBoleto && b.tipoBoleto !== 'simple') {
      s += campo('Cuántas selecciones tiene',
        '<input type="number" name="numSelecciones" min="2" max="30" step="1" inputmode="numeric" ' +
        'placeholder="3" value="' + esc(b.numSelecciones == null ? '' : b.numSelecciones) + '">');
    }

    s += '<div class="segmentos" style="margin-bottom:12px" role="group" aria-label="Condiciones del boleto">' +
      botonSeg('enVivo', '1', '⚡ En vivo', !!b.enVivo, true) +
      botonSeg('freebet', '1', '🎁 Apuesta gratis', !!b.freebet, true) +
    '</div>';

    /* --- cómo terminó --- */
    s += campo('Resultado', '<div class="segmentos chico" role="group" aria-label="Resultado del boleto">' +
      ESTADOS.map(function (e) {
        return botonSeg('resultado', e[0], e[1], (b.resultado || 'pendiente') === e[0]);
      }).join('') + '</div>');

    if (b.resultado === 'cashout') {
      s += campo('Cuánto te pagó BetPlay',
        '<input type="number" name="retorno" step="any" inputmode="decimal" placeholder="0" ' +
        'value="' + esc(b.retorno == null ? '' : b.retorno) + '">' +
        '<div class="ayuda">El total que recibiste al retirar, no la ganancia.</div>');
    }

    s += campo('Notas (opcional)', '<textarea name="notas" placeholder="por qué la elegiste, cómo se dio el partido…">' +
      esc(b.notas || '') + '</textarea>');

    s += '<button type="submit" class="btn oro" style="margin-top:4px">' +
         (b.id ? 'Guardar cambios' : 'Anotar el boleto') + '</button>';
    if (b.id) {
      s += '<button type="button" class="btn peligro" id="btnBorrar" style="margin-top:9px">Borrar este boleto</button>';
    }

    form.innerHTML = s;
    montarForm();
    pintarPrevia();
  }

  function campo(etiqueta, control) {
    return '<label class="campo"><span>' + esc(etiqueta) + '</span>' + control + '</label>';
  }
  function botonSeg(campoNom, valor, texto, activo, alterna) {
    return '<button type="button" data-campo="' + esc(campoNom) + '" data-valor="' + esc(valor) + '"' +
      (alterna ? ' data-alterna="1"' : '') + ' aria-pressed="' + (activo ? 'true' : 'false') + '">' +
      esc(texto) + '</button>';
  }

  /** El control de "a qué le apostaste" cambia según el mercado. */
  function selectorSeleccion(b, merc) {
    var opciones = [];
    if (merc && merc.opciones) {
      opciones = merc.opciones.map(function (o) {
        if (o === '@local') return b.equipoLocal || 'Local';
        if (o === '@visita') return b.equipoVisita || 'Visitante';
        if (o === '@localOempate') return (b.equipoLocal || 'Local') + ' o empate';
        if (o === '@visitaOempate') return (b.equipoVisita || 'Visitante') + ' o empate';
        if (o === '@localOvisita') return (b.equipoLocal || 'Local') + ' o ' + (b.equipoVisita || 'Visitante');
        return o;
      });
    }
    if (!opciones.length) {
      return '<input type="text" name="seleccion" placeholder="a qué le apostaste" autocomplete="off" value="' +
        esc(b.seleccion || '') + '">';
    }
    var enLista = opciones.indexOf(b.seleccion) >= 0;
    return '<div class="segmentos chico" role="group" aria-label="Selección">' +
      opciones.map(function (o) { return botonSeg('seleccion', o, o, b.seleccion === o); }).join('') +
      '</div>' +
      '<input type="text" name="seleccion" placeholder="…u otra cosa" autocomplete="off" style="margin-top:6px" value="' +
      esc(enLista ? '' : (b.seleccion || '')) + '">';
  }

  /** Lo que el usuario ve en el campo de inversión, en la moneda que eligió. */
  function valorVisible(b) {
    if (b.stake == null || b.stake === '') return '';
    if (b.moneda === 'EUR') return C.copAEur(b.stake, b.tasaEurCop).toFixed(2);
    return Math.round(b.stake);
  }

  function montarForm() {
    // cada cambio de campo se guarda en el borrador
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      var ev = (el.tagName === 'SELECT' || el.type === 'date' || el.type === 'time') ? 'change' : 'input';
      el.addEventListener(ev, function () { leerCampo(el); });
    });
    form.querySelectorAll('button[data-campo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var c = btn.dataset.campo, v = btn.dataset.valor;
        if (btn.dataset.alterna) borrador[c] = borrador[c] ? false : true;
        else borrador[c] = v;
        if (c === 'moneda' || c === 'resultado' || c === 'tipoBoleto') pintarForm();
        else { pintarBotones(c); pintarPrevia(); }
      });
    });
    var bb = document.getElementById('btnBorrar');
    if (bb) bb.addEventListener('click', function () {
      if (confirm('¿Borrar este boleto? No se puede deshacer.')) {
        A.borrarBoleto(borrador.id); cerrarBoleto();
      }
    });
  }

  function pintarBotones(campoNom) {
    form.querySelectorAll('button[data-campo="' + campoNom + '"]').forEach(function (b) {
      var act = b.dataset.alterna ? !!borrador[campoNom] : borrador[campoNom] === b.dataset.valor;
      b.setAttribute('aria-pressed', act ? 'true' : 'false');
    });
  }

  function leerCampo(el) {
    var n = el.name, v = el.value;
    if (n === 'stakeVis') {
      var num = parseFloat(v);
      if (isNaN(num)) { borrador.stake = null; }
      else if (borrador.moneda === 'EUR') {
        borrador.tasaEurCop = C.tasa();
        borrador.stake = Math.round(C.eurACop(num));
      } else {
        borrador.stake = Math.round(num);
        borrador.tasaEurCop = C.tasa();
      }
    } else if (n === 'cuota' || n === 'linea' || n === 'retorno' || n === 'numSelecciones') {
      borrador[n] = v === '' ? null : parseFloat(v);
    } else {
      borrador[n] = v;
    }
    if (n === 'liga') pintarForm();
    else if (n === 'mercado') pintarForm();
    else if (n === 'equipoLocal' || n === 'equipoVisita') { pintarPrevia(); }
    else pintarPrevia();
  }

  /** La previa: cuánto se juega y cuánto se lleva, en pesos y en euros. */
  function pintarPrevia() {
    var el = document.getElementById('previa');
    if (!el) return;
    var b = borrador;
    var st = +b.stake || 0, q = +b.cuota || 0;
    if (!st || !q) { el.innerHTML = ''; return; }
    var pot = st * (q - 1);
    var total = st * q;
    var g = C.estaResuelto(b) ? C.ganancia(b) : null;
    var t = b.tasaEurCop || C.tasa();

    var s = '<div style="background:var(--espera-suave);border-radius:10px;padding:10px 12px;margin-bottom:12px">';
    s += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">' +
      '<span style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:var(--tinta-suave)">Invierte</span>' +
      '<span style="font-weight:800;font-size:15px">' + C.fmtCOP(st) +
        '<span style="color:var(--tinta-suave);font-weight:600;font-size:12px"> · ' + C.fmtEUR(C.copAEur(st, t)) + '</span></span></div>';
    s += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-top:4px">' +
      '<span style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:var(--tinta-suave)">' +
        (g == null ? 'Si gana, se lleva' : 'Resultado') + '</span>' +
      '<span style="font-weight:800;font-size:15px;color:' + (g == null ? 'var(--ok)' : (g > 0 ? 'var(--ok)' : g < 0 ? 'var(--mal)' : 'var(--tinta-media)')) + '">' +
        (g == null ? C.fmtCOP(total) + ' (' + C.fmtCOPsigno(pot) + ')' : C.fmtCOPsigno(g)) +
        '<span style="color:var(--tinta-suave);font-weight:600;font-size:12px"> · ' +
        (g == null ? C.fmtEUR(C.copAEur(total, t)) : C.fmtEURsigno(C.copAEur(g, t))) + '</span></span></div>';
    s += '<div style="font-size:11px;color:var(--tinta-suave);margin-top:6px;line-height:1.4">' +
      'A cuota ' + C.fmtCuota(q) + ' tienes que acertar <b>' + Math.round(C.probImplicita(q) * 100) +
      '%</b> de las veces solo para no perder plata.</div>';
    s += '</div>';
    el.innerHTML = s;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var b = borrador;
    if (!b.fecha) { alert('Ponle fecha al boleto.'); return; }
    if (!(+b.cuota > 1)) { alert('La cuota tiene que ser mayor que 1.'); return; }
    if (!(+b.stake > 0)) { alert('Anota cuánto invertiste.'); return; }
    if (b.resultado === 'cashout' && !(+b.retorno >= 0)) {
      alert('En un cash out hay que anotar cuánto te pagó BetPlay.'); return;
    }
    if (!b.tasaEurCop) b.tasaEurCop = C.tasa();
    if (b.tipoBoleto === 'simple') b.numSelecciones = null;
    // recordar la última liga para el próximo boleto
    A.cfg.ultimaLiga = b.liga || '';
    A.guardarBoleto(b);
    cerrarBoleto();
  });

  /* ====================== movimientos de caja ====================== */
  var borradorMov = {};
  var TIPOS_MOV = [['deposito', 'Depósito'], ['retiro', 'Retiro'], ['bono', 'Bono'], ['ajuste', 'Ajuste']];
  var METODOS = ['Nequi', 'Daviplata', 'PSE', 'Bancolombia', 'Efecty', 'Tarjeta', 'Otro'];

  function abrirMov(id) {
    var m = id ? A.vivosMov().find(function (x) { return x.id === id; }) : null;
    borradorMov = m ? JSON.parse(JSON.stringify(m)) : {
      fecha: A.hoyISO(), tipo: 'deposito', moneda: 'COP'
    };
    document.getElementById('tituloMov').textContent = m ? 'Editar movimiento' : 'Movimiento de caja';
    pintarMov();
    telonMov.classList.add('abierto');
    document.body.style.overflow = 'hidden';
  }
  function cerrarMov() {
    telonMov.classList.remove('abierto');
    document.body.style.overflow = '';
  }
  document.getElementById('cerrarMov').addEventListener('click', cerrarMov);
  telonMov.addEventListener('click', function (e) { if (e.target === telonMov) cerrarMov(); });

  function pintarMov() {
    var m = borradorMov;
    var s = '';
    s += campo('Qué fue', '<div class="segmentos" role="group" aria-label="Tipo de movimiento">' +
      TIPOS_MOV.map(function (t) {
        return '<button type="button" data-mcampo="tipo" data-valor="' + t[0] + '" aria-pressed="' +
          (m.tipo === t[0] ? 'true' : 'false') + '">' + t[1] + '</button>';
      }).join('') + '</div>');
    s += campo('Fecha', '<input type="date" name="fecha" value="' + esc(m.fecha || '') + '">');
    s += campo('Cuánto', '<input type="number" name="montoVis" step="any" inputmode="decimal" placeholder="0" value="' +
      esc(m.monto == null ? '' : (m.moneda === 'EUR' ? C.copAEur(m.monto, m.tasaEurCop).toFixed(2) : Math.round(m.monto))) + '">');
    s += '<div class="segmentos chico" style="margin:-4px 0 11px" role="group" aria-label="Moneda">' +
      '<button type="button" data-mcampo="moneda" data-valor="COP" aria-pressed="' + (m.moneda !== 'EUR') + '">Pesos</button>' +
      '<button type="button" data-mcampo="moneda" data-valor="EUR" aria-pressed="' + (m.moneda === 'EUR') + '">Euros</button>' +
    '</div>';
    s += '<div id="previaMov"></div>';
    s += campo('Medio (opcional)', '<select name="metodo"><option value="">—</option>' +
      METODOS.map(function (x) {
        return '<option value="' + esc(x) + '"' + (m.metodo === x ? ' selected' : '') + '>' + esc(x) + '</option>';
      }).join('') + '</select>');
    s += campo('Notas (opcional)', '<textarea name="notas">' + esc(m.notas || '') + '</textarea>');
    s += '<button type="submit" class="btn oro">' + (m.id ? 'Guardar cambios' : 'Anotar el movimiento') + '</button>';
    if (m.id) s += '<button type="button" class="btn peligro" id="btnBorrarMov" style="margin-top:9px">Borrar</button>';
    formMov.innerHTML = s;

    formMov.querySelectorAll('input, select, textarea').forEach(function (el) {
      var ev = (el.tagName === 'SELECT' || el.type === 'date') ? 'change' : 'input';
      el.addEventListener(ev, function () {
        if (el.name === 'montoVis') {
          var num = parseFloat(el.value);
          borradorMov.tasaEurCop = C.tasa();
          borradorMov.monto = isNaN(num) ? null
            : (borradorMov.moneda === 'EUR' ? Math.round(C.eurACop(num)) : Math.round(num));
        } else borradorMov[el.name] = el.value;
        previaMov();
      });
    });
    formMov.querySelectorAll('button[data-mcampo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        borradorMov[btn.dataset.mcampo] = btn.dataset.valor;
        pintarMov();
      });
    });
    var bb = document.getElementById('btnBorrarMov');
    if (bb) bb.addEventListener('click', function () {
      if (confirm('¿Borrar este movimiento?')) { A.borrarMov(borradorMov.id); cerrarMov(); }
    });
    previaMov();
  }

  function previaMov() {
    var el = document.getElementById('previaMov');
    if (!el) return;
    var v = +borradorMov.monto || 0;
    if (!v) { el.innerHTML = ''; return; }
    var t = borradorMov.tasaEurCop || C.tasa();
    el.innerHTML = '<div style="background:var(--papel-hueco);border-radius:10px;padding:9px 12px;margin-bottom:12px;' +
      'display:flex;justify-content:space-between;align-items:baseline">' +
      '<span style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:var(--tinta-suave)">Equivale a</span>' +
      '<span style="font-weight:800">' + C.fmtCOP(v) + ' · ' + C.fmtEUR(C.copAEur(v, t)) + '</span></div>';
  }

  formMov.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!borradorMov.fecha) { alert('Ponle fecha al movimiento.'); return; }
    if (!(+borradorMov.monto > 0)) { alert('Anota cuánta plata fue.'); return; }
    if (!borradorMov.tasaEurCop) borradorMov.tasaEurCop = C.tasa();
    A.guardarMov(borradorMov);
    cerrarMov();
  });

  global.FORM = { abrirBoleto: abrirBoleto, abrirMov: abrirMov };
})(window);
