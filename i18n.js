// Textos en español e inglés y selector de idioma.
// Idioma inicial: ?lang=en|es en el enlace > el último elegido > el idioma del navegador.

var TEXTOS = {
  es: {
    marca: 'Artículos del congreso',
    sub_envio: 'Envío de artículos',
    sub_panel: 'Panel de evaluación',
    cargando: 'Cargando…',
    // API
    e_conexion: 'No se pudo conectar. Revisa tu conexión a internet e intenta de nuevo.',
    e_servidor: 'El servidor no respondió ({s}). Intenta de nuevo en unos minutos.',
    e_respuesta: 'Respuesta inesperada del servidor.',
    e_generico: 'Ocurrió un error.',
    // Envío
    titulo_envio: 'Envío de artículos',
    titulo_envio_c: 'Envío de artículos – {c}',
    e_form_titulo: 'No pudimos abrir el formulario',
    e_form_hint: 'Revisa que el enlace sea el que te entregó la organización.',
    e_sin_codigo: 'Falta el código del congreso en el enlace.',
    intro: 'Completa tus datos y sube el archivo de tu artículo. Recibirás una confirmación por email.',
    nombre: 'Nombre o empresa',
    email: 'Email de contacto',
    titulo: 'Título del artículo',
    archivo: 'Archivo del artículo',
    zona: 'Arrastra tu archivo aquí o haz clic para elegirlo',
    formatos: '{f} · máximo {n} MB',
    cambiar: '{t} · haz clic para cambiarlo',
    enviar: 'Enviar artículo',
    preparando: 'Preparando la subida…',
    reintentando: 'Conexión inestable, reintentando…',
    subiendo: 'Subiendo {a} de {b}',
    registrando: 'Registrando el envío…',
    e_nombre: 'Escribe tu nombre o el de tu empresa.',
    e_email: 'Revisa tu email.',
    e_titulo: 'Escribe el título del artículo.',
    e_archivo: 'Elige el archivo de tu artículo.',
    e_formato: 'Formato no permitido. Se aceptan: {f}.',
    e_tamano: 'El archivo pesa {a} y el máximo es {n} MB.',
    e_lectura: 'No se pudo leer el archivo.',
    exito_titulo: '¡Artículo recibido!',
    exito_codigo: 'Tu código de envío es',
    exito_email: 'Te enviamos una confirmación a',
    exito_guarda: 'Guarda este código para cualquier consulta.',
    otro: 'Enviar otro artículo',
    pie_envio: 'Tus archivos se guardan de forma privada y solo los ve el comité evaluador.',
    // Panel
    titulo_panel: 'Panel de evaluación',
    titulo_panel_c: 'Evaluación – {c}',
    e_panel_titulo: 'No pudimos abrir el panel',
    e_panel_hint: 'Usa el enlace personal que te llegó por email. Si el problema sigue, avísale a la organización.',
    e_enlace: 'El enlace no es válido o está incompleto.',
    congreso: 'Congreso',
    hola_1: 'Hola, {n}. Tienes 1 artículo por evaluar.',
    hola_n: 'Hola, {n}. Tienes {p} artículos por evaluar.',
    hola_0: 'Hola, {n}. No tienes artículos pendientes.',
    avance: 'Evaluaste {a} de {b}',
    cerrada: 'La evaluación está cerrada. Puedes revisar tus notas, pero ya no se pueden cambiar.',
    sin_criterios: 'Todavía no hay criterios de evaluación definidos para este congreso.',
    sin_articulos: 'Aún no hay artículos para evaluar.',
    pendiente: 'Pendiente',
    nota: 'Nota {n}',
    volver: '← Volver a la lista',
    vista_no: 'La vista previa todavía no está disponible. Google la genera unos minutos después de la subida.',
    vista_alt: 'Vista previa de {t}',
    leer: 'Leer artículo completo',
    descargar_f: 'Descargar artículo ({f})',
    descargar: 'Descargar',
    drive: 'Abrir en Google Drive ↗',
    muy_grande: 'Este archivo es muy grande para abrirlo aquí. Pide acceso en Google Drive a la organización.',
    articulo_n: 'Artículo {c}',
    peso: 'peso {n}',
    muy_bajo: '{n} = muy bajo',
    excelente: '{n} = excelente',
    entre: 'Entre {a} y {b}',
    comentario: 'Comentario',
    opcional: '(opcional)',
    guardar: 'Guardar evaluación',
    actualizar: 'Actualizar evaluación',
    guardando: 'Guardando…',
    falta: 'Falta puntuar "{c}".',
    guardado: 'Evaluación de {c} guardada. Nota: {n} de 10.',
    pie_panel: 'Este enlace es personal. No lo compartas.',
    plazo_envio: 'Recibimos artículos hasta el {f}',
    plazo_eval: 'Puedes evaluar hasta el {f}',
    quedan_d: 'quedan {n} días',
    quedan_1d: 'queda 1 día',
    quedan_h: 'quedan {n} horas',
    quedan_1h: 'queda 1 hora',
    quedan_m: 'queda menos de una hora'
  },
  en: {
    marca: 'Conference articles',
    sub_envio: 'Article submission',
    sub_panel: 'Review panel',
    cargando: 'Loading…',
    e_conexion: 'Could not connect. Please check your internet connection and try again.',
    e_servidor: 'The server did not respond ({s}). Please try again in a few minutes.',
    e_respuesta: 'Unexpected response from the server.',
    e_generico: 'Something went wrong.',
    titulo_envio: 'Article submission',
    titulo_envio_c: 'Article submission – {c}',
    e_form_titulo: 'We could not open the form',
    e_form_hint: 'Please check that you are using the link provided by the organizers.',
    e_sin_codigo: 'The conference code is missing from the link.',
    intro: 'Fill in your details and upload your article file. You will receive a confirmation email.',
    nombre: 'Name or company',
    email: 'Contact email',
    titulo: 'Article title',
    archivo: 'Article file',
    zona: 'Drag your file here or click to choose it',
    formatos: '{f} · up to {n} MB',
    cambiar: '{t} · click to change it',
    enviar: 'Submit article',
    preparando: 'Preparing the upload…',
    reintentando: 'Unstable connection, retrying…',
    subiendo: 'Uploading {a} of {b}',
    registrando: 'Registering your submission…',
    e_nombre: 'Please enter your name or company.',
    e_email: 'Please check your email address.',
    e_titulo: 'Please enter the article title.',
    e_archivo: 'Please choose your article file.',
    e_formato: 'File type not allowed. Accepted: {f}.',
    e_tamano: 'The file is {a} and the maximum is {n} MB.',
    e_lectura: 'The file could not be read.',
    exito_titulo: 'Article received!',
    exito_codigo: 'Your submission code is',
    exito_email: 'We sent a confirmation to',
    exito_guarda: 'Please keep this code for any inquiries.',
    otro: 'Submit another article',
    pie_envio: 'Your files are stored privately and are only seen by the review committee.',
    titulo_panel: 'Review panel',
    titulo_panel_c: 'Review – {c}',
    e_panel_titulo: 'We could not open the panel',
    e_panel_hint: 'Use the personal link you received by email. If the problem continues, contact the organizers.',
    e_enlace: 'The link is invalid or incomplete.',
    congreso: 'Conference',
    hola_1: 'Hello, {n}. You have 1 article to review.',
    hola_n: 'Hello, {n}. You have {p} articles to review.',
    hola_0: 'Hello, {n}. You have no pending articles.',
    avance: 'Reviewed {a} of {b}',
    cerrada: 'Reviewing is closed. You can see your scores, but they can no longer be changed.',
    sin_criterios: 'No review criteria have been defined for this conference yet.',
    sin_articulos: 'There are no articles to review yet.',
    pendiente: 'Pending',
    nota: 'Score {n}',
    volver: '← Back to the list',
    vista_no: 'The preview is not available yet. Google creates it a few minutes after the upload.',
    vista_alt: 'Preview of {t}',
    leer: 'Read full article',
    descargar_f: 'Download article ({f})',
    descargar: 'Download',
    drive: 'Open in Google Drive ↗',
    muy_grande: 'This file is too large to open here. Ask the organizers for access in Google Drive.',
    articulo_n: 'Article {c}',
    peso: 'weight {n}',
    muy_bajo: '{n} = very poor',
    excelente: '{n} = excellent',
    entre: 'Between {a} and {b}',
    comentario: 'Comment',
    opcional: '(optional)',
    guardar: 'Save review',
    actualizar: 'Update review',
    guardando: 'Saving…',
    falta: 'Please score "{c}".',
    guardado: 'Review of {c} saved. Score: {n} out of 10.',
    pie_panel: 'This link is personal. Please do not share it.',
    plazo_envio: 'Submissions accepted until {f}',
    plazo_eval: 'Reviews accepted until {f}',
    quedan_d: '{n} days left',
    quedan_1d: '1 day left',
    quedan_h: '{n} hours left',
    quedan_1h: '1 hour left',
    quedan_m: 'less than an hour left'
  }
};

// Si algo falla al cargar, en vez de quedarse en "Cargando…" se muestra un aviso para recargar.
window.addEventListener('error', function () {
  var cargando = document.getElementById('cargando');
  if (cargando && !cargando.hidden) {
    cargando.textContent = (IDIOMA === 'en')
      ? 'The page could not load. Please reload it (Ctrl+F5).'
      : 'No se pudo cargar la página. Recárgala (Ctrl+F5).';
  }
});

var IDIOMA = (function () {
  var param = new URLSearchParams(location.search).get('lang');
  if (param === 'en' || param === 'es') return param;
  try {
    var guardado = localStorage.getItem('idioma');
    if (guardado === 'en' || guardado === 'es') return guardado;
  } catch (e) { /* sin almacenamiento: se usa el del navegador */ }
  return /^en\b/i.test(navigator.language || '') ? 'en' : 'es';
})();

function t(clave, vars) {
  var texto = (TEXTOS[IDIOMA] && TEXTOS[IDIOMA][clave]) || TEXTOS.es[clave] || clave;
  Object.keys(vars || {}).forEach(function (k) { texto = texto.split('{' + k + '}').join(vars[k]); });
  return texto;
}

// Número con coma en español y punto en inglés.
function num(n) { return IDIOMA === 'en' ? String(n) : String(n).replace('.', ','); }

// Elige el texto en el idioma actual, con el español como respaldo.
function segunIdioma(es, en) { return IDIOMA === 'en' && en ? en : es; }

// Muestra una fecha de cierre ("Recibimos artículos hasta el 30 de noviembre de 2026, 23:59 · quedan 3 días").
// La hora se muestra en la zona horaria del congreso, con su sigla (ej. GMT-3).
function pintarPlazo(nodo, clave, iso, zona) {
  if (!iso) { nodo.hidden = true; return; }
  var cierre = new Date(iso);
  var fecha;
  try {
    fecha = new Intl.DateTimeFormat(IDIOMA === 'en' ? 'en-US' : 'es-CL',
      { dateStyle: 'long', timeStyle: 'short', timeZone: zona || undefined, hour12: IDIOMA === 'en' }).format(cierre);
    var sigla = new Intl.DateTimeFormat('en-US', { timeZone: zona || undefined, timeZoneName: 'short' })
      .formatToParts(cierre).filter(function (p) { return p.type === 'timeZoneName'; })[0];
    if (sigla) fecha += ' (' + sigla.value + ')';
  } catch (e) {
    fecha = cierre.toLocaleString();
  }
  var horas = (cierre.getTime() - Date.now()) / 3600000;
  var resta = horas >= 48 ? t('quedan_d', { n: Math.floor(horas / 24) })
            : horas >= 24 ? t('quedan_1d')
            : horas >= 2 ? t('quedan_h', { n: Math.floor(horas) })
            : horas >= 1 ? t('quedan_1h')
            : t('quedan_m');
  nodo.textContent = t(clave, { f: fecha }) + ' · ' + resta;
  nodo.classList.toggle('urgente', horas < 72);
  nodo.hidden = horas <= 0;
}

var alCambiarIdioma = [];

function aplicarTextos() {
  document.documentElement.lang = IDIOMA;
  document.querySelectorAll('[data-t]').forEach(function (n) { n.textContent = t(n.getAttribute('data-t')); });
  document.querySelectorAll('.idioma button').forEach(function (b) {
    var activo = b.getAttribute('data-lang') === IDIOMA;
    b.classList.toggle('activo', activo);
    b.setAttribute('aria-pressed', activo ? 'true' : 'false');
  });
}

function cambiarIdioma(nuevo) {
  if (nuevo === IDIOMA) return;
  IDIOMA = nuevo;
  try { localStorage.setItem('idioma', nuevo); } catch (e) { /* no se recuerda, pero funciona igual */ }
  aplicarTextos();
  alCambiarIdioma.forEach(function (fn) { fn(); });
}

document.querySelectorAll('.idioma button').forEach(function (b) {
  b.addEventListener('click', function () { cambiarIdioma(b.getAttribute('data-lang')); });
});
aplicarTextos();
