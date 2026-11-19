// Reemplazo de archivo (Usuario A), desde el enlace privado del email de confirmación.
// La clave va después del "#": no se envía a GitHub ni queda en registros.

(function () {
  pintarMarca();
  var CLAVE = decodeURIComponent(location.hash.replace(/^#/, '')).trim();
  var INFO = null, archivo = null;
  var errorActual = null, estadoActual = null;

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
  function ocultarError() { errorActual = null; $('error').hidden = true; }
  function estado(clave, vars) { estadoActual = { clave: clave, vars: vars }; $('estado').textContent = t(clave, vars); }
  function listaFormatos() { return INFO.formatos.join(', ').toUpperCase(); }
  function extension(n) { return (n.split('.').pop() || '').toLowerCase(); }

  function pintarZona() {
    var texto = $('zona-texto');
    texto.innerHTML = '';
    if (archivo) {
      texto.appendChild(el('div', { class: 'archivo', text: archivo.name }));
      texto.appendChild(el('div', { class: 'hint', text: t('cambiar', { t: mb(archivo.size) }) }));
    } else {
      texto.appendChild(el('div', { class: 'principal', text: t('zona') }));
      texto.appendChild(el('div', { class: 'hint', text: t('formatos', { f: listaFormatos(), n: INFO.maxMB }) }));
    }
  }

  function pintarTextos() {
    document.title = t('titulo_reemplazo');
    if (!INFO) return;
    $('r-codigo').textContent = INFO.codigo;
    $('r-congreso').textContent = segunIdioma(INFO.congreso.nombre, INFO.congreso.nombreEn);
    $('r-titulo').textContent = INFO.titulo;
    $('r-actual').textContent = t('reemplazo_actual', { v: INFO.version, a: INFO.archivo || '—' });
    $('r-restan').textContent = t('reemplazo_restan', { n: INFO.maxVersiones });
    pintarPlazo($('plazo'), 'plazo_envio', INFO.cierre, INFO.zona);
    pintarZona();
    if (estadoActual) $('estado').textContent = t(estadoActual.clave, estadoActual.vars);
    if (errorActual && errorActual.clave) $('error').textContent = t(errorActual.clave, errorActual.vars);
  }
  alCambiarIdioma.push(pintarTextos);

  function elegir(f) {
    ocultarError();
    if (!f) return;
    if (INFO.formatos.indexOf(extension(f.name)) === -1) {
      archivo = null; pintarZona();
      return mostrarError({ clave: 'e_formato', vars: { f: listaFormatos() } });
    }
    if (f.size > INFO.maxMB * 1048576) {
      archivo = null; pintarZona();
      return mostrarError({ clave: 'e_tamano', vars: { a: mb(f.size), n: INFO.maxMB } });
    }
    archivo = f;
    pintarZona();
  }

  var zona = $('zona');
  ['dragenter', 'dragover'].forEach(function (ev) { zona.addEventListener(ev, function () { zona.classList.add('activa'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { zona.addEventListener(ev, function () { zona.classList.remove('activa'); }); });
  $('archivo').addEventListener('change', function () { elegir(this.files[0]); });

  $('form').addEventListener('submit', async function (ev) {
    ev.preventDefault();
    ocultarError();
    if (!archivo) return mostrarError({ clave: 'e_archivo' });

    var campos = $('form').querySelectorAll('input, button');
    campos.forEach(function (c) { c.disabled = true; });
    $('progreso').hidden = false;
    estado('preparando');
    $('porcentaje').textContent = '';
    $('barra').style.width = '0';
    window.onbeforeunload = function () { return true; };

    try {
      var sesion = await api('iniciarReemplazo', { clave: CLAVE, archivoNombre: archivo.name, tamano: archivo.size });
      await subirPorPartes(sesion, archivo, function (clave, vars, pct) {
        estado(clave, vars);
        if (pct !== null) { $('barra').style.width = pct + '%'; $('porcentaje').textContent = pct + '%'; }
      });
      estado('registrando');
      var fin = await api('finalizarEnvio', { id: sesion.id });
      window.onbeforeunload = null;
      estadoActual = null;
      $('form').hidden = true;
      $('r-version-nueva').textContent = fin.codigo + ' · v' + fin.version;
      $('exito').hidden = false;
    } catch (e) {
      window.onbeforeunload = null;
      estadoActual = null;
      $('progreso').hidden = true;
      campos.forEach(function (c) { c.disabled = false; });
      mostrarError({ texto: e.message });
    }
  });

  async function iniciar() {
    pintarTextos();
    if (!/^[a-f0-9]{64}$/.test(CLAVE)) return errorInicial(t('e_enlace'));
    try { INFO = await api('infoReemplazo', { clave: CLAVE }); } catch (e) { return errorInicial(e.message); }
    $('archivo').accept = INFO.formatos.map(function (f) { return '.' + f; }).join(',');
    pintarTextos();
    $('cargando').hidden = true;
    $('form').hidden = false;
  }
  iniciar();
})();
