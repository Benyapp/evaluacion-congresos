// Conexión con el motor (Apps Script) y utilidades compartidas.

// Se envía como texto plano para que el navegador no exija permisos extra (CORS).
async function api(accion, cuerpo) {
  var resp;
  try {
    resp = await fetch(APP.API, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ accion: accion }, cuerpo || {})),
      redirect: 'follow'
    });
  } catch (e) {
    throw new Error('No se pudo conectar. Revisa tu conexión a internet e intenta de nuevo.');
  }
  if (!resp.ok) throw new Error('El servidor no respondió (' + resp.status + '). Intenta de nuevo en unos minutos.');
  var json;
  try { json = await resp.json(); } catch (e) { throw new Error('Respuesta inesperada del servidor.'); }
  if (!json.ok) throw new Error(json.error || 'Ocurrió un error.');
  return json.datos;
}

function $(id) { return document.getElementById(id); }

// Crea elementos sin usar innerHTML con datos (evita inyectar código).
function el(tag, props, hijos) {
  var n = document.createElement(tag);
  Object.keys(props || {}).forEach(function (k) {
    if (k === 'text') n.textContent = props[k];
    else if (k === 'class') n.className = props[k];
    else n.setAttribute(k, props[k]);
  });
  (hijos || []).forEach(function (h) { if (h) n.appendChild(typeof h === 'string' ? document.createTextNode(h) : h); });
  return n;
}

function coma(n) { return String(n).replace('.', ','); }
function mb(bytes) { return coma((bytes / 1048576).toFixed(1)) + ' MB'; }

function pintarMarca() {
  document.querySelectorAll('[data-marca]').forEach(function (n) { n.textContent = APP.MARCA; });
  document.querySelectorAll('[data-inicial]').forEach(function (n) { n.textContent = APP.INICIAL; });
}
