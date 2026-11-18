// Panel de evaluación (Usuario B).
// La clave personal va después del "#" del enlace: el navegador nunca la envía a GitHub
// ni la deja en registros; solo se manda al motor dentro de cada consulta.

(function () {
  pintarMarca();
  var CLAVE = decodeURIComponent(location.hash.replace(/^#/, '')).trim();
  var datos = null, actual = null;

  function mostrar(vista) {
    $('cargando').hidden = vista !== 'cargando';
    $('vista-lista').hidden = vista !== 'lista';
    $('vista-detalle').hidden = vista !== 'detalle';
    $('error-general').hidden = vista !== 'error';
  }

  function errorGeneral(texto) {
    $('error-general-texto').textContent = texto;
    mostrar('error');
  }

  // --- Lista --------------------------------------------------------------
  async function cargarLista(mensaje) {
    mostrar('cargando');
    try { datos = await api('panel', { clave: CLAVE }); } catch (e) { return errorGeneral(e.message); }

    document.title = 'Evaluación – ' + datos.congreso.nombre;
    var hechos = datos.envios.filter(function (x) { return x.nota !== null; }).length;
    var pendientes = datos.envios.length - hechos;
    $('saludo').textContent = 'Congreso';
    $('congreso').textContent = datos.congreso.nombre;
    $('bienvenida').textContent = 'Hola, ' + datos.evaluador + '. ' +
      (pendientes ? 'Tienes ' + pendientes + (pendientes === 1 ? ' artículo' : ' artículos') + ' por evaluar.'
                  : 'No tienes artículos pendientes.');
    $('avance-texto').textContent = 'Evaluaste ' + hechos + ' de ' + datos.envios.length;
    $('avance-barra').style.width = (datos.envios.length ? hechos / datos.envios.length * 100 : 0) + '%';

    var avisos = $('avisos');
    avisos.innerHTML = '';
    if (mensaje) avisos.appendChild(el('div', { class: 'msg ok', text: mensaje }));
    if (!datos.congreso.evaluacionAbierta) avisos.appendChild(el('div', { class: 'msg warn',
      text: 'La evaluación está cerrada. Puedes revisar tus notas, pero ya no se pueden cambiar.' }));
    if (!datos.criterios.length) avisos.appendChild(el('div', { class: 'msg warn',
      text: 'Todavía no hay criterios de evaluación definidos para este congreso.' }));
    if (avisos.childNodes.length) avisos.appendChild(el('div', { class: 'campo' }));

    var lista = $('lista');
    lista.innerHTML = '';
    if (!datos.envios.length) lista.appendChild(el('div', { class: 'card', text: 'Aún no hay artículos para evaluar.' }));
    datos.envios.forEach(function (x) {
      var meta = [x.autor, x.fecha].filter(String).join(' · ');
      var b = el('button', { class: 'item', type: 'button' }, [
        el('div', {}, [
          el('div', { class: 'etiqueta', text: x.codigo }),
          el('div', { class: 'tit', text: x.titulo }),
          meta ? el('div', { class: 'meta', text: meta }) : null
        ]),
        x.nota === null ? el('span', { class: 'chip pend', text: 'Pendiente' })
                        : el('span', { class: 'chip ok', text: 'Nota ' + coma(x.nota) })
      ]);
      b.addEventListener('click', function () { abrir(x.codigo); });
      lista.appendChild(b);
    });
    mostrar('lista');
    window.scrollTo(0, 0);
  }

  // --- Detalle ------------------------------------------------------------
  async function abrir(codigo) {
    mostrar('cargando');
    try { actual = await api('detalle', { clave: CLAVE, codigo: codigo }); } catch (e) { return errorGeneral(e.message); }

    $('d-codigo').textContent = actual.codigo;
    $('d-titulo').textContent = actual.titulo;
    $('d-meta').textContent = [actual.autor, actual.formato + ' · ' + coma(actual.tamano) + ' MB'].filter(String).join(' · ');

    var vista = $('d-vista');
    vista.innerHTML = '';
    vista.appendChild(actual.vista
      ? el('img', { src: actual.vista, alt: 'Vista previa de ' + actual.titulo })
      : el('div', { class: 'vacia', text: 'La vista previa todavía no está disponible. Google la genera unos minutos después de la subida.' }));

    var orig = $('d-original');
    orig.innerHTML = '';
    var esPdf = actual.formato === 'PDF';
    if (actual.descargable) {
      var leer = el('button', { class: 'btn', type: 'button', text: esPdf ? 'Leer artículo completo' : 'Descargar artículo (' + actual.formato + ')' });
      leer.addEventListener('click', function () { abrirArchivo(leer, esPdf); });
      orig.appendChild(leer);
    }
    if (actual.archivoUrl) {
      orig.appendChild(el('a', { class: 'btn sec', href: actual.archivoUrl, target: '_blank', rel: 'noopener noreferrer',
                                 text: 'Abrir en Google Drive ↗' }));
    }
    if (!actual.descargable && !actual.archivoUrl) {
      orig.appendChild(el('span', { class: 'hint', text: 'Este archivo es muy grande para abrirlo aquí. Pide acceso en Google Drive a la organización.' }));
    }

    var abierta = datos.congreso.evaluacionAbierta;
    var previos = (actual.evaluacion && actual.evaluacion.valores) || {};
    var cont = $('criterios');
    cont.innerHTML = '';
    datos.criterios.forEach(function (c, i) {
      var bloque = el('div', { class: 'criterio' }, [
        el('div', { class: 'nom' }, [c.nombre, c.peso !== 1 ? el('span', { class: 'peso', text: 'peso ' + coma(c.peso) }) : null]),
        c.descripcion ? el('div', { class: 'desc', text: c.descripcion }) : null
      ]);
      var previo = previos.hasOwnProperty(c.nombre) ? previos[c.nombre] : null;

      if (c.max - c.min <= 10 && c.min === Math.floor(c.min) && c.max === Math.floor(c.max)) {
        var escala = el('div', { class: 'escala', role: 'radiogroup', 'aria-label': c.nombre });
        for (var v = c.min; v <= c.max; v++) {
          var input = el('input', { type: 'radio', name: 'c' + i, value: v });
          if (previo === v) input.checked = true;
          if (!abierta) input.disabled = true;
          escala.appendChild(el('label', {}, [input, el('span', { text: String(v) })]));
        }
        bloque.appendChild(escala);
        bloque.appendChild(el('div', { class: 'extremos' }, [
          el('span', { text: c.min + ' = muy bajo' }), el('span', { text: c.max + ' = excelente' })
        ]));
      } else {
        var num = el('input', { type: 'number', name: 'c' + i, min: c.min, max: c.max, step: 1,
                                placeholder: 'Entre ' + c.min + ' y ' + c.max });
        if (previo !== null) num.value = previo;
        if (!abierta) num.disabled = true;
        bloque.appendChild(num);
      }
      cont.appendChild(bloque);
    });

    $('comentario').value = actual.evaluacion ? actual.evaluacion.comentario : '';
    $('comentario').disabled = !abierta;
    $('guardar').hidden = !abierta || !datos.criterios.length;
    $('guardar').disabled = false;
    $('guardar').textContent = actual.evaluacion ? 'Actualizar evaluación' : 'Guardar evaluación';
    $('d-error').hidden = true;
    mostrar('detalle');
    window.scrollTo(0, 0);
  }

  // Trae el archivo completo. Los PDF se muestran dentro del panel; los demás se descargan.
  var urlArchivo = null;
  async function abrirArchivo(boton, esPdf) {
    var texto = boton.textContent;
    boton.disabled = true;
    boton.textContent = 'Cargando…';
    try {
      var r = await api('archivo', { clave: CLAVE, codigo: actual.codigo });
      var bin = atob(r.base64);
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      if (urlArchivo) URL.revokeObjectURL(urlArchivo);
      urlArchivo = URL.createObjectURL(new Blob([bytes], { type: r.mime }));
      var descarga = el('a', { class: 'btn sec', href: urlArchivo, download: r.nombre, text: 'Descargar' });

      if (esPdf) {
        var vista = $('d-vista');
        vista.innerHTML = '';
        vista.classList.add('con-lector');
        vista.appendChild(el('iframe', { class: 'lector', src: urlArchivo, title: 'Artículo ' + actual.codigo }));
        boton.replaceWith(descarga);
      } else {
        descarga.click();
        boton.disabled = false;
        boton.textContent = texto;
      }
    } catch (e) {
      boton.disabled = false;
      boton.textContent = texto;
      $('d-error').textContent = e.message;
      $('d-error').hidden = false;
    }
  }

  $('volver').addEventListener('click', function () {
    if (urlArchivo) { URL.revokeObjectURL(urlArchivo); urlArchivo = null; }
    $('d-vista').classList.remove('con-lector');
    cargarLista();
  });

  $('form').addEventListener('submit', async function (ev) {
    ev.preventDefault();
    $('d-error').hidden = true;
    var valores = {}, falta = null;
    datos.criterios.forEach(function (c, i) {
      var marcado = document.querySelector('[name="c' + i + '"]:checked') ||
                    document.querySelector('input[type=number][name="c' + i + '"]');
      var v = marcado && marcado.value !== '' ? Number(marcado.value) : NaN;
      if (isNaN(v) || v < c.min || v > c.max) { if (!falta) falta = c.nombre; }
      else valores[c.nombre] = v;
    });
    if (falta) {
      $('d-error').textContent = 'Falta puntuar "' + falta + '".';
      $('d-error').hidden = false;
      return;
    }
    $('guardar').disabled = true;
    $('guardar').textContent = 'Guardando…';
    try {
      var r = await api('evaluar', { clave: CLAVE, codigo: actual.codigo, valores: valores, comentario: $('comentario').value });
      cargarLista('Evaluación de ' + actual.codigo + ' guardada. Nota: ' + coma(r.nota) + ' de 10.');
    } catch (e) {
      $('d-error').textContent = e.message;
      $('d-error').hidden = false;
      $('guardar').disabled = false;
      $('guardar').textContent = 'Guardar evaluación';
    }
  });

  if (!/^[a-f0-9]{64}$/.test(CLAVE)) errorGeneral('El enlace no es válido o está incompleto.');
  else cargarLista();
})();
