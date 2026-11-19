// Formulario de envío (Usuario A).
// El archivo se sube en partes de 8 MB; cada parte se reintenta hasta 3 veces.

(function () {
  pintarMarca();
  var CONFIG = null;
  var archivo = null;
  var errorActual = null;   // { clave, vars } si es un texto propio, o { texto } si viene del servidor
  var estadoActual = null;  // { clave, vars }

  var codigo = new URLSearchParams(location.search).get('c') || '';

  function errorInicial(texto) {
    $('cargando').hidden = true;
    $('error-inicial-texto').textContent = texto;
    $('error-inicial').hidden = false;
  }

  function mostrarError(e) {
    errorActual = e;
    $('error').textContent = e.clave ? t(e.clave, e.vars) : e.texto;
    $('error').hidden = false;
  }

  function ocultarError() {
    errorActual = null;
    $('error').hidden = true;
  }

  function estado(clave, vars) {
    estadoActual = { clave: clave, vars: vars };
    $('estado').textContent = t(clave, vars);
  }

  function leerBase64(blob) {
    return new Promise(function (ok, mal) {
      var r = new FileReader();
      r.onload = function () { ok(String(r.result).split(',')[1] || ''); };
      r.onerror = function () { mal(new Error(t('e_lectura'))); };
      r.readAsDataURL(blob);
    });
  }

  function extension(nombre) { return (nombre.split('.').pop() || '').toLowerCase(); }
  function listaFormatos() { return CONFIG.formatos.join(', ').toUpperCase(); }

  function pintarZona() {
    var texto = $('zona-texto');
    texto.innerHTML = '';
    if (archivo) {
      texto.appendChild(el('div', { class: 'archivo', text: archivo.name }));
      texto.appendChild(el('div', { class: 'hint', text: t('cambiar', { t: mb(archivo.size) }) }));
    } else {
      texto.appendChild(el('div', { class: 'principal', text: t('zona') }));
      texto.appendChild(el('div', { class: 'hint', text: t('formatos', { f: listaFormatos(), n: CONFIG.maxMB }) }));
    }
  }

  // Vuelve a escribir los textos que dependen de datos al cambiar de idioma.
  function pintarTextos() {
    if (!CONFIG) {
      document.title = t('titulo_envio');
      return;
    }
    var nombre = segunIdioma(CONFIG.nombre, CONFIG.nombreEn);
    document.title = t('titulo_envio_c', { c: nombre });
    $('congreso-nombre').textContent = nombre;
    pintarZona();
    if (estadoActual) $('estado').textContent = t(estadoActual.clave, estadoActual.vars);
    if (errorActual && errorActual.clave) $('error').textContent = t(errorActual.clave, errorActual.vars);
  }
  alCambiarIdioma.push(pintarTextos);

  function elegir(f) {
    ocultarError();
    if (!f) return;
    if (CONFIG.formatos.indexOf(extension(f.name)) === -1) {
      archivo = null;
      pintarZona();
      return mostrarError({ clave: 'e_formato', vars: { f: listaFormatos() } });
    }
    if (f.size > CONFIG.maxMB * 1048576) {
      archivo = null;
      pintarZona();
      return mostrarError({ clave: 'e_tamano', vars: { a: mb(f.size), n: CONFIG.maxMB } });
    }
    archivo = f;
    pintarZona();
  }

  async function iniciar() {
    pintarTextos();
    if (!codigo) return errorInicial(t('e_sin_codigo'));
    try {
      CONFIG = await api('congreso', { congreso: codigo });
    } catch (e) {
      return errorInicial(e.message);
    }
    $('congreso-codigo').textContent = CONFIG.codigo;
    $('archivo').accept = CONFIG.formatos.map(function (f) { return '.' + f; }).join(',');
    pintarTextos();
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
    ocultarError();

    var datos = {
      congreso: CONFIG.codigo,
      nombre: $('nombre').value.trim(),
      email: $('email').value.trim(),
      titulo: $('titulo').value.trim(),
      web: $('web').value
    };
    if (!datos.nombre) return mostrarError({ clave: 'e_nombre' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) return mostrarError({ clave: 'e_email' });
    if (!datos.titulo) return mostrarError({ clave: 'e_titulo' });
    if (!archivo) return mostrarError({ clave: 'e_archivo' });
    datos.archivoNombre = archivo.name;
    datos.tamano = archivo.size;

    var campos = $('form').querySelectorAll('input, button');
    campos.forEach(function (c) { c.disabled = true; });
    $('progreso').hidden = false;
    estado('preparando');
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
            estado('reintentando');
            await new Promise(function (r) { setTimeout(r, 2000 * intento); });
          }
        }
        completo = !!resp.completo;
        inicio = completo ? archivo.size : resp.siguiente;
        var pct = Math.round(inicio / archivo.size * 100);
        $('barra').style.width = pct + '%';
        $('porcentaje').textContent = pct + '%';
        estado('subiendo', { a: mb(inicio), b: mb(archivo.size) });
      }

      estado('registrando');
      var fin = await api('finalizarEnvio', { id: sesion.id });
      window.onbeforeunload = null;
      estadoActual = null;
      $('form').hidden = true;
      $('codigo').textContent = fin.codigo;
      $('exito-email').textContent = datos.email;
      $('exito').hidden = false;
    } catch (e) {
      window.onbeforeunload = null;
      estadoActual = null;
      $('progreso').hidden = true;
      campos.forEach(function (c) { c.disabled = false; });
      mostrarError({ texto: e.message });
    }
  });

  $('otro').addEventListener('click', function () { location.reload(); });

  iniciar();
})();
