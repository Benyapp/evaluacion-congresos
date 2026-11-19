// Subida de un archivo en partes de 8 MB (la usan el envío y el reemplazo de archivo).
// Cada parte se reintenta hasta 3 veces si la conexión falla.

function leerBase64(blob) {
  return new Promise(function (ok, mal) {
    var r = new FileReader();
    r.onload = function () { ok(String(r.result).split(',')[1] || ''); };
    r.onerror = function () { mal(new Error(t('e_lectura'))); };
    r.readAsDataURL(blob);
  });
}

// progreso(clave, vars, porcentaje) se llama para mostrar el avance.
async function subirPorPartes(sesion, archivo, progreso) {
  var parte = sesion.tamanoParte;
  var inicio = 0, completo = false;
  while (!completo) {
    var base64 = await leerBase64(archivo.slice(inicio, Math.min(inicio + parte, archivo.size)));
    var resp = null;
    for (var intento = 1; intento <= 3 && !resp; intento++) {
      try {
        resp = await api('subirParte', { id: sesion.id, inicio: inicio, base64: base64 });
      } catch (e) {
        if (intento === 3) throw e;
        progreso('reintentando', null, null);
        await new Promise(function (r) { setTimeout(r, 2000 * intento); });
      }
    }
    completo = !!resp.completo;
    inicio = completo ? archivo.size : resp.siguiente;
    progreso('subiendo', { a: mb(inicio), b: mb(archivo.size) }, Math.round(inicio / archivo.size * 100));
  }
}
