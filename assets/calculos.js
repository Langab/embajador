/* =========================================================================
   calculos.js — la matemática del boleto y de la caja.
   Todo se guarda en pesos colombianos, que es la moneda de BetPlay. El euro
   es una lectura: cada boleto congela la tasa del día en que se registró, así
   que "cuánto era en euros" no cambia cuando cambia el cambio.
   ========================================================================= */

(function (global) {
  'use strict';

  /* ====================== moneda ====================== */

  var TASA_RESPALDO = 4300;          // último recurso si nunca hubo internet
  var CLAVE_TASA = 'emb_tasa_v1';

  var tasaActual = { v: TASA_RESPALDO, cuando: null, origen: 'respaldo' };

  function cargarTasa() {
    try {
      var g = JSON.parse(localStorage.getItem(CLAVE_TASA) || 'null');
      if (g && g.v > 0) tasaActual = g;
    } catch (e) { /* si no se puede leer, queda el respaldo */ }
    return tasaActual;
  }

  function fijarTasa(v, origen) {
    if (!(v > 0)) return tasaActual;
    tasaActual = { v: v, cuando: new Date().toISOString(), origen: origen || 'manual' };
    try { localStorage.setItem(CLAVE_TASA, JSON.stringify(tasaActual)); } catch (e) {}
    return tasaActual;
  }

  /** Trae la tasa EUR→COP del día. Si falla, se queda con la última guardada. */
  function refrescarTasa() {
    return fetch('https://open.er-api.com/v6/latest/EUR')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.result === 'success' && d.rates && d.rates.COP > 0) {
          return fijarTasa(d.rates.COP, 'en línea');
        }
        throw new Error('respuesta sin COP');
      })
      .catch(function () { return tasaActual; });
  }

  var tasa = function () { return tasaActual.v; };

  function copAEur(cop, tasaFija) { return cop / (tasaFija > 0 ? tasaFija : tasa()); }
  function eurACop(eur, tasaFija) { return eur * (tasaFija > 0 ? tasaFija : tasa()); }

  /** Pesos. En modo corto, 1.250.000 se lee "1,25 M" para que quepa en un eje. */
  function fmtCOP(n, corto) {
    if (n == null || isNaN(n)) return '—';
    var signo = n < 0 ? '−' : '';
    var a = Math.abs(n);
    if (corto) {
      if (a >= 1e6) return signo + '$' + (a / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace('.', ',') + 'M';
      if (a >= 1e3) return signo + '$' + Math.round(a / 1e3) + 'k';
      return signo + '$' + Math.round(a);
    }
    return signo + '$' + Math.round(a).toLocaleString('es-CO');
  }
  function fmtCOPsigno(n, corto) {
    if (n == null || isNaN(n)) return '—';
    return (n > 0 ? '+' : '') + fmtCOP(n, corto);
  }
  function fmtEUR(n) {
    if (n == null || isNaN(n)) return '—';
    var signo = n < 0 ? '−' : '';
    return signo + '€' + Math.abs(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function fmtEURsigno(n) {
    if (n == null || isNaN(n)) return '—';
    return (n > 0 ? '+' : '') + fmtEUR(n);
  }
  function fmtPct(n, dec) {
    if (n == null || isNaN(n) || !isFinite(n)) return '—';
    return (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n).toFixed(dec == null ? 1 : dec).replace('.', ',') + '%';
  }
  function fmtCuota(c) {
    if (c == null || isNaN(c)) return '—';
    return Number(c).toFixed(2).replace('.', ',');
  }

  /* ====================== la matemática del boleto ====================== */

  /* Estados en que puede terminar un boleto. Los "media" existen porque el
     hándicap asiático puede partir la apuesta en dos mitades. */
  var RESUELTOS = ['ganada', 'perdida', 'anulada', 'cashout', 'media_ganada', 'media_perdida'];

  function estaResuelto(b) { return RESUELTOS.indexOf(b.resultado) >= 0; }
  function estaPendiente(b) { return !estaResuelto(b); }

  /**
   * Ganancia neta de un boleto, en pesos. Positiva si ganó, negativa si perdió.
   *
   *   ganada        el boleto paga stake × cuota, de los cuales stake era suyo
   *   perdida       se pierde todo lo invertido
   *   anulada       el evento se cayó: devuelven lo invertido, ni gana ni pierde
   *   cashout       retiró antes; la ganancia es lo que le pagaron menos lo puesto
   *   media_ganada  hándicap asiático: media apuesta gana, media se devuelve
   *   media_perdida hándicap asiático: media apuesta se pierde, media se devuelve
   *
   * Una apuesta gratis no descuenta plata del bolsillo: si gana, deja la
   * ganancia sin devolver el valor del bono; si pierde, no cuesta nada.
   */
  function ganancia(b) {
    if (estaPendiente(b)) return 0;
    var s = Number(b.stake) || 0;
    var c = Number(b.cuota) || 0;
    if (b.freebet) {
      if (b.resultado === 'ganada') return s * (c - 1);
      if (b.resultado === 'media_ganada') return s / 2 * (c - 1);
      if (b.resultado === 'cashout') return Number(b.retorno) || 0;
      return 0;
    }
    switch (b.resultado) {
      case 'ganada':        return s * (c - 1);
      case 'perdida':       return -s;
      case 'anulada':       return 0;
      case 'media_ganada':  return s / 2 * (c - 1);
      case 'media_perdida': return -s / 2;
      case 'cashout':       return (Number(b.retorno) || 0) - s;
      default:              return 0;
    }
  }

  /** Lo que devuelve el boleto en total (incluye lo invertido). */
  function retorno(b) {
    if (estaPendiente(b)) return 0;
    var s = Number(b.stake) || 0;
    if (b.freebet) return ganancia(b);
    if (b.resultado === 'cashout') return Number(b.retorno) || 0;
    return s + ganancia(b);
  }

  /** Lo que el boleto arriesga de verdad (una apuesta gratis no arriesga nada). */
  function invertido(b) { return b.freebet ? 0 : (Number(b.stake) || 0); }

  /** Ganancia potencial si el boleto pendiente sale bien. */
  function gananciaPotencial(b) {
    var s = Number(b.stake) || 0, c = Number(b.cuota) || 0;
    return s * (c - 1);
  }

  /** Probabilidad implícita en la cuota: qué tan seguido tiene que acertar. */
  function probImplicita(cuota) {
    var c = Number(cuota);
    return c > 0 ? 1 / c : 0;
  }

  /** Ganancia en euros, usando la tasa congelada del boleto. */
  function gananciaEur(b) { return copAEur(ganancia(b), b.tasaEurCop); }


  /* ====================== retención en la fuente ======================
     En Colombia los premios de juegos de suerte y azar pagan 20% de
     retención cuando superan 48 UVT (art. 306, 317 y 404-1 del Estatuto
     Tributario). BetPlay lo advierte en la pantalla de retiro, así que aquí
     se calcula sobre el retiro y sobre el monto bruto, sin descontar lo
     apostado. Para quien no declara renta en Colombia esa retención es el
     impuesto final; para quien sí declara, se descuenta al declarar.

     Ojo: esto es la retención colombiana. Lo que Seba deba tributar en
     Malta por su residencia es otra cosa y no se calcula aquí. */

  var UVT = { 2024: 47065, 2025: 49799, 2026: 52374 };
  var TASA_RETENCION = 0.20;
  var UVT_UMBRAL = 48;

  function uvtDe(anio) { return UVT[anio] || UVT[2026]; }
  function umbralRetencion(anio) { return UVT_UMBRAL * uvtDe(anio); }

  /** Retención estimada sobre un retiro. Cero si no pasa el umbral. */
  function retencionDe(monto, fecha) {
    var anio = fecha ? +String(fecha).slice(0, 4) : 2026;
    var m = Number(monto) || 0;
    return m > umbralRetencion(anio) ? m * TASA_RETENCION : 0;
  }

  /* ====================== movimientos de caja ====================== */

  function montoMovimiento(m) {
    var v = Number(m.monto) || 0;
    return m.tipo === 'retiro' ? -v : v;
  }

  global.CALC = {
    // moneda
    cargarTasa: cargarTasa, refrescarTasa: refrescarTasa, fijarTasa: fijarTasa, tasa: tasa,
    tasaInfo: function () { return tasaActual; },
    copAEur: copAEur, eurACop: eurACop,
    fmtCOP: fmtCOP, fmtCOPsigno: fmtCOPsigno, fmtEUR: fmtEUR, fmtEURsigno: fmtEURsigno,
    fmtPct: fmtPct, fmtCuota: fmtCuota,
    // boleto
    RESUELTOS: RESUELTOS, estaResuelto: estaResuelto, estaPendiente: estaPendiente,
    ganancia: ganancia, gananciaEur: gananciaEur, retorno: retorno, invertido: invertido,
    gananciaPotencial: gananciaPotencial, probImplicita: probImplicita,
    montoMovimiento: montoMovimiento,
    uvtDe: uvtDe, umbralRetencion: umbralRetencion, retencionDe: retencionDe,
    TASA_RETENCION: TASA_RETENCION, UVT_UMBRAL: UVT_UMBRAL
  };
})(window);
