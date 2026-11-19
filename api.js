// Conexión con el motor (Apps Script) y utilidades compartidas.

// Se envía como texto plano para que el navegador no exija permisos extra (CORS).
// El idioma viaja en cada consulta para que el motor responda los errores en ese idioma.
async function api(accion, cuerpo) {
  var resp;
  try {
    resp = await fetch(APP.API, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ accion: accion, idioma: IDIOMA }, cuerpo || {})),
      redirect: 'follow'
    });
  } catch (e) {
    throw new Error(t('e_conexion'));
  }
  if (!resp.ok) throw new Error(t('e_servidor', { s: resp.status }));
  var json;
  try { json = await resp.json(); } catch (e) { throw new Error(t('e_respuesta')); }
  if (!json.ok) throw new Error(json.error || t('e_generico'));
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

function mb(bytes) { return num((bytes / 1048576).toFixed(1)) + ' MB'; }

function pintarMarca() {
  document.querySelectorAll('[data-marca]').forEach(function (n) {
    n.textContent = segunIdioma(APP.MARCA || t('marca'), APP.MARCA_EN || t('marca'));
  });
  document.querySelectorAll('[data-inicial]').forEach(function (n) { n.textContent = APP.INICIAL; });
}
alCambiarIdioma.push(pintarMarca);
