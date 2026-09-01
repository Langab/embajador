/**
 * Sincronización de "La arepa veneca ctm" (las apuestas de Seba) con Google Sheets.
 *
 * CÓMO INSTALARLO (una sola vez, ~5 minutos):
 * 1. En Google Drive crea una hoja de cálculo nueva llamada "Apuestas Seba".
 * 2. En esa planilla: menú Extensiones → Apps Script. Borra el código que aparece
 *    y pega TODO este archivo. Guarda (icono de disquete).
 * 3. Botón "Implementar" → "Nueva implementación" → tipo "Aplicación web":
 *      - Ejecutar como: Yo
 *      - Quién tiene acceso: Cualquier persona
 *    Presiona "Implementar" y autoriza los permisos cuando lo pida.
 * 4. Copia la URL que termina en /exec y pégala en Caja → Planilla de Google
 *    (la app ya trae una puesta; solo hace falta si cambias de planilla).
 *
 * PARA DEJAR LA PLANILLA EN CERO: usa el botón "Empezar de cero" de la pestaña
 * Caja, o ejecuta a mano la función limpiarTodo desde este editor. Borrar las
 * filas a mano NO basta: el teléfono que todavía tenga los datos los vuelve a
 * subir en la siguiente sincronización.
 *
 * Las hojas "Apuestas" y "Movimientos" se crean solas. No cambies el orden de sus
 * columnas: la app las lee por posición.
 *
 * CLAVE OPCIONAL: si quieres que solo tu app pueda escribir, entra a
 * Configuración del proyecto → Propiedades del script y agrega una propiedad
 * llamada TOKEN con el valor que quieras. Después pon ese mismo valor en la app
 * (Caja → Sincronización → Clave). Si no creas la propiedad, no se pide clave.
 */

var HOJAS = {
  apuestas: {
    nombre: 'Apuestas',
    cols: ['id', 'fecha', 'hora', 'deporte', 'liga', 'equipoLocal', 'equipoVisita',
           'mercado', 'seleccion', 'linea', 'tipoBoleto', 'numSelecciones',
           'cuota', 'stake', 'moneda', 'tasaEurCop', 'enVivo', 'freebet',
           'resultado', 'retorno', 'notas', 'deleted', 'updatedAt'],
    numeros: ['linea', 'numSelecciones', 'cuota', 'stake', 'tasaEurCop', 'retorno'],
    bools: ['enVivo', 'freebet', 'deleted']
  },
  movimientos: {
    nombre: 'Movimientos',
    cols: ['id', 'fecha', 'tipo', 'monto', 'moneda', 'tasaEurCop', 'metodo',
           'notas', 'deleted', 'updatedAt'],
    numeros: ['monto', 'tasaEurCop'],
    bools: ['deleted']
  }
};

function hoja_(def) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var h = ss.getSheetByName(def.nombre);
  if (!h) {
    h = ss.insertSheet(def.nombre);
    h.appendRow(def.cols);
    h.setFrozenRows(1);
    h.getRange(1, 1, 1, def.cols.length).setFontWeight('bold');
  }
  /* TODA la hoja va como texto plano, y se reaplica en cada uso, no solo al
     crearla. Si no, Sheets "ayuda": convierte "21:30" en una hora (y la
     devuelve como fecha de 1899), y una nota que empiece por "=" la toma como
     fórmula. Ambas cosas corrompen el dato de forma silenciosa. */
  h.getRange(1, 1, Math.max(h.getMaxRows(), 2), def.cols.length).setNumberFormat('@');
  return h;
}

function leer_(def) {
  var h = hoja_(def);
  var vals = h.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < vals.length; i++) {
    var e = {};
    for (var j = 0; j < def.cols.length; j++) e[def.cols[j]] = vals[i][j];
    if (!e.id) continue;
    /* Aunque la hoja vaya como texto, una fila escrita a mano o guardada por
       una versión anterior puede traer Date. Se normaliza antes de devolverla:
       si "hora" o "updatedAt" salieran como Date, el orden de los boletos y la
       resolución de conflictos por fecha dejarían de funcionar. */
    if (e.fecha instanceof Date) {
      e.fecha = Utilities.formatDate(e.fecha, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    } else {
      e.fecha = String(e.fecha || '');
    }
    if (e.hora instanceof Date) {
      e.hora = Utilities.formatDate(e.hora, Session.getScriptTimeZone(), 'HH:mm');
    }
    if (e.updatedAt instanceof Date) {
      e.updatedAt = e.updatedAt.toISOString();
    }
    def.numeros.forEach(function (k) {
      e[k] = (e[k] === '' || e[k] === null) ? null : Number(e[k]);
    });
    def.bools.forEach(function (k) {
      e[k] = e[k] === true || e[k] === 'SI';
    });
    def.cols.forEach(function (k) {
      if (def.numeros.indexOf(k) < 0 && def.bools.indexOf(k) < 0 && k !== 'fecha') {
        e[k] = String(e[k] === null || e[k] === undefined ? '' : e[k]);
      }
    });
    out.push(e);
  }
  return out;
}

function escribir_(def, lista) {
  var h = hoja_(def);
  var n = h.getLastRow();
  if (n > 1) h.getRange(2, 1, n - 1, def.cols.length).clearContent();
  if (!lista.length) return;
  lista.sort(function (a, b) {
    var f = String(a.fecha || '').localeCompare(String(b.fecha || ''));
    return f !== 0 ? f : String(a.hora || '').localeCompare(String(b.hora || ''));
  });
  var filas = lista.map(function (e) {
    return def.cols.map(function (k) {
      if (def.bools.indexOf(k) >= 0) return e[k] ? 'SI' : '';
      var v = e[k];
      if (v === null || v === undefined) return '';
      /* Una nota que empiece por = + - @ la toma Sheets como fórmula y la
         guarda rota (#ERROR!). El formato de texto no lo impide: hay que
         anteponerle un apóstrofo, que Sheets usa como marca de "esto es texto"
         y no devuelve al leer. */
      if (typeof v === 'string' && /^[=+\-@']/.test(v)) return "'" + v;
      return v;
    });
  });
  h.getRange(2, 1, filas.length, def.cols.length).setValues(filas);
}

/** Gana el registro con updatedAt más reciente. Así los dos teléfonos convergen. */
function fusionar_(base, nuevas) {
  var porId = {};
  base.forEach(function (e) { porId[e.id] = e; });
  (nuevas || []).forEach(function (n) {
    if (!n || !n.id) return;
    var mia = porId[n.id];
    if (!mia || String(n.updatedAt || '') > String(mia.updatedAt || '')) porId[n.id] = n;
  });
  return Object.keys(porId).map(function (k) { return porId[k]; });
}

function respuesta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function tokenOk_(recibido) {
  var esperado = PropertiesService.getScriptProperties().getProperty('TOKEN');
  if (!esperado) return true;              // sin propiedad TOKEN => sin clave
  return String(recibido || '') === esperado;
}

/* ====================== borrón y cuenta nueva ======================
   Vaciar la hoja a mano no basta: cualquier teléfono que todavía tenga los
   registros los vuelve a subir en la siguiente sincronización, y reaparecen.
   Por eso se guarda la fecha del último borrado: todo lo anterior a esa marca
   se rechaza, venga del teléfono que venga. Así el borrado sí se queda. */

function marcaBorrado_() {
  return PropertiesService.getScriptProperties().getProperty('PURGADO_EN') || '';
}

function borrarTodo_() {
  var marca = new Date().toISOString();
  PropertiesService.getScriptProperties().setProperty('PURGADO_EN', marca);
  escribir_(HOJAS.apuestas, []);
  escribir_(HOJAS.movimientos, []);
  return marca;
}

/** Descarta lo que sea anterior al último borrón. */
function vigentes_(lista, marca) {
  if (!marca) return lista;
  return lista.filter(function (e) { return String(e.updatedAt || '') > marca; });
}

/**
 * Para ejecutar a mano desde el editor de Apps Script cuando quieras dejar la
 * planilla en cero: elige "limpiarTodo" arriba y dale a Ejecutar.
 */
function limpiarTodo() {
  var marca = borrarTodo_();
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'Planilla vaciada. Lo anterior a esta marca ya no se vuelve a subir.', 'Listo', 8);
  return marca;
}

function doGet(e) {
  if (!tokenOk_(e && e.parameter && e.parameter.token)) {
    return respuesta_({ ok: false, error: 'clave incorrecta' });
  }
  return respuesta_({
    ok: true,
    purgadoEn: marcaBorrado_(),
    apuestas: leer_(HOJAS.apuestas),
    movimientos: leer_(HOJAS.movimientos)
  });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var body = JSON.parse(e.postData.contents || '{}');
    if (!tokenOk_(body.token)) {
      return respuesta_({ ok: false, error: 'clave incorrecta' });
    }

    // la app pide empezar de cero
    if (body.purgar === true) {
      return respuesta_({ ok: true, purgadoEn: borrarTodo_(), apuestas: [], movimientos: [] });
    }

    var marca = marcaBorrado_();
    var apuestas = vigentes_(fusionar_(leer_(HOJAS.apuestas), vigentes_(body.apuestas || [], marca)), marca);
    var movimientos = vigentes_(fusionar_(leer_(HOJAS.movimientos), vigentes_(body.movimientos || [], marca)), marca);
    escribir_(HOJAS.apuestas, apuestas);
    escribir_(HOJAS.movimientos, movimientos);
    return respuesta_({ ok: true, purgadoEn: marca, apuestas: apuestas, movimientos: movimientos });
  } catch (err) {
    return respuesta_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
