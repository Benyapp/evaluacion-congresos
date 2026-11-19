// Panel de evaluación (Usuario B).
// La clave personal va después del "#" del enlace: el navegador nunca la envía a GitHub
// ni la deja en registros; solo se manda al motor dentro de cada consulta.
// Los criterios se muestran en el idioma elegido, pero las notas se guardan siempre
// con el nombre en español del criterio (así el ranking no depende del idioma).

(function () {
  pintarMarca();
  var CLAVE = decodeURIComponent(location.hash.replace(/^#/, '')).trim();
  var datos = null, actual = null;
  var vistaActual = 'cargando';
  var mensajeLista = null;   // { clave, vars }
  var errorDetalle = null;   // { clave, vars } o { texto }
  var errorPanel = null;     // { clave } o { texto }
  var urlArchivo = null, nombreArchivo = '', lectorAbierto = false;

  function mostrar(vista) {
    vistaActual = vista;
    $('cargando').hidden = vista !== 'cargando';
    $('vista-lista').hidden = vista !== 'lista';
    $('vista-detalle').hidden = vista !== 'detalle';
    $('error-general').hidden = vista !== 'error';
  }

  function errorGeneral(e) {
    errorPanel = e;
    $('error-general-texto').textContent = e.clave ? t(e.clave) : e.texto;
    mostrar('error');
  }

  function mostrarErrorDetalle(e) {
    errorDetalle = e;
    $('d-error').textContent = e.clave ? t(e.clave, e.vars) : e.texto;
    $('d-error').hidden = false;
  }

  function ocultarErrorDetalle() {
    errorDetalle = null;
    $('d-error').hidden = true;
  }

  function nombreCriterio(c) { return segunIdioma(c.nombre, c.nombreEn); }

  // --- Lista --------------------------------------------------------------
  async function cargarLista(mensaje) {
    mensajeLista = mensaje || null;
    mostrar('cargando');
    try { datos = await api('panel', { clave: CLAVE }); } catch (e) { return errorGeneral({ texto: e.message }); }
    pintarLista();
    mostrar('lista');
    window.scrollTo(0, 0);
  }

  function pintarLista() {
    var nombreCongreso = segunIdioma(datos.congreso.nombre, datos.congreso.nombreEn);
    document.title = t('titulo_panel_c', { c: nombreCongreso });
    var hechos = datos.envios.filter(function (x) { return x.nota !== null; }).length;
    var pendientes = datos.envios.length - hechos;
    $('saludo').textContent = t('congreso');
    $('congreso').textContent = nombreCongreso;
    $('bienvenida').textContent = t(pendientes === 0 ? 'hola_0' : pendientes === 1 ? 'hola_1' : 'hola_n',
                                    { n: datos.evaluador, p: pendientes });
    $('avance-texto').textContent = t('avance', { a: hechos, b: datos.envios.length });
    $('avance-barra').style.width = (datos.envios.length ? hechos / datos.envios.length * 100 : 0) + '%';

    var avisos = $('avisos');
    avisos.innerHTML = '';
    if (mensajeLista) avisos.appendChild(el('div', { class: 'msg ok', text: t(mensajeLista.clave, mensajeLista.vars) }));
    if (!datos.congreso.evaluacionAbierta) avisos.appendChild(el('div', { class: 'msg warn', text: t('cerrada') }));
    if (!datos.criterios.length) avisos.appendChild(el('div', { class: 'msg warn', text: t('sin_criterios') }));
    if (avisos.childNodes.length) avisos.appendChild(el('div', { class: 'campo' }));

    var lista = $('lista');
    lista.innerHTML = '';
    if (!datos.envios.length) lista.appendChild(el('div', { class: 'card', text: t('sin_articulos') }));
    datos.envios.forEach(function (x) {
      var meta = [x.autor, x.fecha].filter(String).join(' · ');
      var b = el('button', { class: 'item', type: 'button' }, [
        el('div', {}, [
          el('div', { class: 'etiqueta', text: x.codigo }),
          el('div', { class: 'tit', text: x.titulo }),
          meta ? el('div', { class: 'meta', text: meta }) : null
        ]),
        x.nota === null ? el('span', { class: 'chip pend', text: t('pendiente') })
                        : el('span', { class: 'chip ok', text: t('nota', { n: num(x.nota) }) })
      ]);
      b.addEventListener('click', function () { abrir(x.codigo); });
      lista.appendChild(b);
    });
  }

  // --- Detalle ------------------------------------------------------------
  async function abrir(codigo) {
    mostrar('cargando');
    try { actual = await api('detalle', { clave: CLAVE, codigo: codigo }); } catch (e) { return errorGeneral({ texto: e.message }); }

    cerrarArchivo();
    ocultarErrorDetalle();
    $('comentario').value = actual.evaluacion ? actual.evaluacion.comentario : '';
    pintarDetalle((actual.evaluacion && actual.evaluacion.valores) || {});
    mostrar('detalle');
    window.scrollTo(0, 0);
  }

  function pintarVista() {
    var vista = $('d-vista');
    if (lectorAbierto) {
      var lector = vista.querySelector('iframe');
      if (lector) lector.title = t('articulo_n', { c: actual.codigo });
      return;
    }
    vista.innerHTML = '';
    vista.appendChild(actual.vista
      ? el('img', { src: actual.vista, alt: t('vista_alt', { t: actual.titulo }) })
      : el('div', { class: 'vacia', text: t('vista_no') }));
  }

  function pintarOriginal() {
    var orig = $('d-original');
    orig.innerHTML = '';
    var esPdf = actual.formato === 'PDF';
    if (lectorAbierto) {
      orig.appendChild(el('a', { class: 'btn sec', href: urlArchivo, download: nombreArchivo, text: t('descargar') }));
    } else if (actual.descargable) {
      var leer = el('button', { class: 'btn', type: 'button', text: esPdf ? t('leer') : t('descargar_f', { f: actual.formato }) });
      leer.addEventListener('click', function () { abrirArchivo(leer, esPdf); });
      orig.appendChild(leer);
    }
    if (actual.archivoUrl) {
      orig.appendChild(el('a', { class: 'btn sec', href: actual.archivoUrl, target: '_blank', rel: 'noopener noreferrer',
                                 text: t('drive') }));
    }
    if (!actual.descargable && !actual.archivoUrl) {
      orig.appendChild(el('span', { class: 'hint', text: t('muy_grande') }));
    }
  }

  // Dibuja el detalle con los valores indicados (los guardados o los que el evaluador ya marcó).
  function pintarDetalle(valores) {
    $('d-codigo').textContent = actual.codigo;
    $('d-titulo').textContent = actual.titulo;
    $('d-meta').textContent = [actual.autor, actual.formato + ' · ' + num(actual.tamano) + ' MB'].filter(String).join(' · ');
    pintarVista();
    pintarOriginal();

    var abierta = datos.congreso.evaluacionAbierta;
    var cont = $('criterios');
    cont.innerHTML = '';
    datos.criterios.forEach(function (c, i) {
      var descripcion = segunIdioma(c.descripcion, c.descripcionEn);
      var bloque = el('div', { class: 'criterio' }, [
        el('div', { class: 'nom' }, [nombreCriterio(c), c.peso !== 1 ? el('span', { class: 'peso', text: t('peso', { n: num(c.peso) }) }) : null]),
        descripcion ? el('div', { class: 'desc', text: descripcion }) : null
      ]);
      var previo = valores.hasOwnProperty(c.nombre) ? valores[c.nombre] : null;

      if (c.max - c.min <= 10 && c.min === Math.floor(c.min) && c.max === Math.floor(c.max)) {
        var escala = el('div', { class: 'escala', role: 'radiogroup', 'aria-label': nombreCriterio(c) });
        for (var v = c.min; v <= c.max; v++) {
          var input = el('input', { type: 'radio', name: 'c' + i, value: v });
          if (previo === v) input.checked = true;
          if (!abierta) input.disabled = true;
          escala.appendChild(el('label', {}, [input, el('span', { text: String(v) })]));
        }
        bloque.appendChild(escala);
        bloque.appendChild(el('div', { class: 'extremos' }, [
          el('span', { text: t('muy_bajo', { n: c.min }) }), el('span', { text: t('excelente', { n: c.max }) })
        ]));
      } else {
        var campo = el('input', { type: 'number', name: 'c' + i, min: c.min, max: c.max, step: 1,
                                  placeholder: t('entre', { a: c.min, b: c.max }) });
        if (previo !== null) campo.value = previo;
        if (!abierta) campo.disabled = true;
        bloque.appendChild(campo);
      }
      cont.appendChild(bloque);
    });

    $('comentario').disabled = !abierta;
    $('guardar').hidden = !abierta || !datos.criterios.length;
    $('guardar').disabled = false;
    $('guardar').textContent = actual.evaluacion ? t('actualizar') : t('guardar');
    if (errorDetalle && errorDetalle.clave) $('d-error').textContent = t(errorDetalle.clave, errorDetalle.vars);
  }

  // Lee lo que el evaluador marcó en pantalla (para guardar o para no perderlo al cambiar de idioma).
  function valoresEnPantalla() {
    var valores = {};
    datos.criterios.forEach(function (c, i) {
      var marcado = document.querySelector('[name="c' + i + '"]:checked') ||
                    document.querySelector('input[type=number][name="c' + i + '"]');
      if (marcado && marcado.value !== '') valores[c.nombre] = Number(marcado.value);
    });
    return valores;
  }

  // Trae el archivo completo. Los PDF se muestran dentro del panel; los demás se descargan.
  async function abrirArchivo(boton, esPdf) {
    var texto = boton.textContent;
    boton.disabled = true;
    boton.textContent = t('cargando');
    try {
      var r = await api('archivo', { clave: CLAVE, codigo: actual.codigo });
      var bin = atob(r.base64);
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      if (urlArchivo) URL.revokeObjectURL(urlArchivo);
      urlArchivo = URL.createObjectURL(new Blob([bytes], { type: r.mime }));
      nombreArchivo = r.nombre;

      if (esPdf) {
        var vista = $('d-vista');
        vista.innerHTML = '';
        vista.classList.add('con-lector');
        vista.appendChild(el('iframe', { class: 'lector', src: urlArchivo, title: t('articulo_n', { c: actual.codigo }) }));
        lectorAbierto = true;
        pintarOriginal();
      } else {
        el('a', { href: urlArchivo, download: nombreArchivo }).click();
        boton.disabled = false;
        boton.textContent = texto;
      }
    } catch (e) {
      boton.disabled = false;
      boton.textContent = texto;
      mostrarErrorDetalle({ texto: e.message });
    }
  }

  function cerrarArchivo() {
    if (urlArchivo) { URL.revokeObjectURL(urlArchivo); urlArchivo = null; }
    lectorAbierto = false;
    $('d-vista').classList.remove('con-lector');
  }

  $('volver').addEventListener('click', function () {
    cerrarArchivo();
    cargarLista();
  });

  $('form').addEventListener('submit', async function (ev) {
    ev.preventDefault();
    ocultarErrorDetalle();
    var valores = valoresEnPantalla();
    var falta = datos.criterios.filter(function (c) {
      var v = valores[c.nombre];
      return !(typeof v === 'number' && !isNaN(v) && v >= c.min && v <= c.max);
    })[0];
    if (falta) return mostrarErrorDetalle({ clave: 'falta', vars: { c: nombreCriterio(falta) } });

    $('guardar').disabled = true;
    $('guardar').textContent = t('guardando');
    try {
      var r = await api('evaluar', { clave: CLAVE, codigo: actual.codigo, valores: valores, comentario: $('comentario').value });
      cerrarArchivo();
      cargarLista({ clave: 'guardado', vars: { c: actual.codigo, n: num(r.nota) } });
    } catch (e) {
      mostrarErrorDetalle({ texto: e.message });
      $('guardar').disabled = false;
      $('guardar').textContent = actual.evaluacion ? t('actualizar') : t('guardar');
    }
  });

  // Al cambiar de idioma se redibuja la vista actual sin perder lo marcado ni el artículo abierto.
  alCambiarIdioma.push(function () {
    if (vistaActual === 'lista' && datos) pintarLista();
    else if (vistaActual === 'detalle' && actual) pintarDetalle(valoresEnPantalla());
    else if (vistaActual === 'error' && errorPanel && errorPanel.clave) $('error-general-texto').textContent = t(errorPanel.clave);
    if (vistaActual !== 'lista' && vistaActual !== 'detalle') document.title = t('titulo_panel');
  });

  document.title = t('titulo_panel');
  if (!/^[a-f0-9]{64}$/.test(CLAVE)) errorGeneral({ clave: 'e_enlace' });
  else cargarLista();
})();
