// Formulario de envío (Usuario A).
// El archivo se sube en partes de 8 MB; cada parte se reintenta hasta 3 veces.

(function () {
  pintarMarca();
  var CONFIG = null;
  var archivo = null;

  var codigo = new URLSearchParams(location.search).get('c') || '';

  function errorInicial(texto) {
    $('cargando').hidden = true;
    $('error-inicial-texto').textContent = texto;
    $('error-inicial').hidden = false;
  }

  function mostrarError(texto) {
    $('error').textContent = texto;
    $('error').hidden = false;
  }

  function leerBase64(blob) {
    return new Promise(function (ok, mal) {
      var r = new FileReader();
      r.onload = function () { ok(String(r.result).split(',')[1] || ''); };
      r.onerror = function () { mal(new Error('No se pudo leer el archivo.')); };
      r.readAsDataURL(blob);
    });
  }

  function extension(nombre) { return (nombre.split('.').pop() || '').toLowerCase(); }

  function elegir(f) {
    $('error').hidden = true;
    if (!f) return;
    if (CONFIG.formatos.indexOf(extension(f.name)) === -1) {
      archivo = null;
      return mostrarError('Formato no permitido. Se aceptan: ' + CONFIG.formatos.join(', ').toUpperCase() + '.');
    }
    if (f.size > CONFIG.maxMB * 1048576) {
      archivo = null;
      return mostrarError('El archivo pesa ' + mb(f.size) + ' y el máximo es ' + CONFIG.maxMB + ' MB.');
    }
    archivo = f;
    var texto = $('zona-texto');
    texto.innerHTML = '';
    texto.appendChild(el('div', { class: 'archivo', text: f.name }));
    texto.appendChild(el('div', { class: 'hint', text: mb(f.size) + ' · haz clic para cambiarlo' }));
  }

  async function iniciar() {
    if (!codigo) return errorInicial('Falta el código del congreso en el enlace.');
    try {
      CONFIG = await api('congreso', { congreso: codigo });
    } catch (e) {
      return errorInicial(e.message);
    }
    document.title = 'Envío de anuncios – ' + CONFIG.nombre;
    $('congreso-codigo').textContent = CONFIG.codigo;
    $('congreso-nombre').textContent = CONFIG.nombre;
    $('formatos').textContent = CONFIG.formatos.join(', ').toUpperCase() + ' · máximo ' + CONFIG.maxMB + ' MB';
    $('archivo').accept = CONFIG.formatos.map(function (f) { return '.' + f; }).join(',');
    $('cargando').hidden = true;
    $('form').hidden = false;
  }

  // Arrastrar y soltar
  var zona = $('zona');
  ['dragenter', 'dragover'].forEach(function (ev) {
    zona.addEventListener(ev, function () { zona.classList.add('activa'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    zona.addEventListener(ev, function () { zona.classList.remove('activa'); });
  });
  $('archivo').addEventListener('change', function () { elegir(this.files[0]); });

  $('form').addEventListener('submit', async function (ev) {
    ev.preventDefault();
    $('error').hidden = true;

    var datos = {
      congreso: CONFIG.codigo,
      nombre: $('nombre').value.trim(),
      email: $('email').value.trim(),
      titulo: $('titulo').value.trim(),
      web: $('web').value
    };
    if (!datos.nombre) return mostrarError('Escribe tu nombre o el de tu empresa.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) return mostrarError('Revisa tu email.');
    if (!datos.titulo) return mostrarError('Escribe el título del anuncio.');
    if (!archivo) return mostrarError('Elige el archivo de tu anuncio.');
    datos.archivoNombre = archivo.name;
    datos.tamano = archivo.size;

    var campos = $('form').querySelectorAll('input, button');
    campos.forEach(function (c) { c.disabled = true; });
    $('progreso').hidden = false;
    $('estado').textContent = 'Preparando la subida…';
    $('porcentaje').textContent = '';
    $('barra').style.width = '0';
    window.onbeforeunload = function () { return true; };

    try {
      var sesion = await api('iniciarSubida', { datos: datos });
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
            $('estado').textContent = 'Conexión inestable, reintentando…';
            await new Promise(function (r) { setTimeout(r, 2000 * intento); });
          }
        }
        completo = !!resp.completo;
        inicio = completo ? archivo.size : resp.siguiente;
        var pct = Math.round(inicio / archivo.size * 100);
        $('barra').style.width = pct + '%';
        $('porcentaje').textContent = pct + '%';
        $('estado').textContent = 'Subiendo ' + mb(inicio) + ' de ' + mb(archivo.size);
      }

      $('estado').textContent = 'Registrando el envío…';
      var fin = await api('finalizarEnvio', { id: sesion.id });
      window.onbeforeunload = null;
      $('form').hidden = true;
      $('codigo').textContent = fin.codigo;
      $('exito-email').textContent = datos.email;
      $('exito').hidden = false;
    } catch (e) {
      window.onbeforeunload = null;
      $('progreso').hidden = true;
      campos.forEach(function (c) { c.disabled = false; });
      mostrarError(e.message);
    }
  });

  $('otro').addEventListener('click', function () { location.reload(); });

  iniciar();
})();
