'use strict';

/* ==========================================================
   Configuración
========================================================== */
const MODULOS = [1, 2, 3, 4, 5, 6, 7];

const SITIOS_CLASES_JSON = 'assets/data/sitiosClases.json';
const CARRUSEL_DATA = 'assets/data/carrusel.json';
const VIDEOS_SOURCES = 'assets/data/videos.json';
const CARRUSEL_PLACEHOLDER = 'https://placehold.co/1200x675?text=Proyecto';

const MODULOS_INFO = {
  1: {
    etiqueta: 'Módulo 1',
    titulo: 'Orientación al perfil y metodología del curso',
    subtitulo: 'Actividades introductorias y primeros acercamientos al bootcamp.'
  },
  2: {
    etiqueta: 'Módulo 2',
    titulo: 'Fundamentos de programación en Java',
    subtitulo: 'Ejercicios base, lógica y estructuras para comenzar a programar.'
  },
  3: {
    etiqueta: 'Módulo 3',
    titulo: 'Fundamentos de bases de datos relacionales',
    subtitulo: 'Modelado, consultas y trabajo inicial con bases de datos.'
  },
  4: {
    etiqueta: 'Módulo 4',
    titulo: 'Desarrollo de la interfaz de usuario Android',
    subtitulo: 'Primeras pantallas, vistas y estructura visual de aplicaciones.'
  },
  5: {
    etiqueta: 'Módulo 5',
    titulo: 'Arquitectura y ciclo de vida de componentes Android',
    subtitulo: 'Navegación, componentes y organización interna de la app.'
  },
  6: {
    etiqueta: 'Módulo 6',
    titulo: 'Desarrollo de aplicaciones empresariales Android',
    subtitulo: 'Proyectos con mayor integración y lógica aplicada.'
  },
  7: {
    etiqueta: 'Módulo 7',
    titulo: 'Desarrollo de portafolio de un producto digital',
    subtitulo: 'Cierre del proceso con trabajos más completos y presentables.'
  }
};

/* ==========================================================
   Utilidades
========================================================== */
function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escAttr(value = '') {
  return esc(value);
}

function asArray(data) {
  return Array.isArray(data) ? data : [];
}

function normalizarTexto(value, fallback = '') {
  const txt = String(value ?? '').trim();
  return txt || fallback;
}

function getJsonPathModulo(n) {
  return `assets/data/sitiosModulo${n}.json`;
}

function getModulosHost() {
  return document.getElementById('modulos-container') || document.getElementById('cards');
}

function prepararHostModulos() {
  const host = getModulosHost();
  if (!host) return null;

  host.classList.remove('row', 'g-3');
  host.innerHTML = '';
  return host;
}

function youtubeId(url = '') {
  const raw = String(url).trim();
  if (!raw) return null;

  try {
    const parsed = new URL(raw);

    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '').trim() || null;
    }

    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return v.trim();

      const parts = parsed.pathname.split('/').filter(Boolean);
      const embedIdx = parts.indexOf('embed');
      if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];

      const shortsIdx = parts.indexOf('shorts');
      if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
    }
  } catch {
    return null;
  }

  return null;
}

function thumbYoutube(videoId) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/* ==========================================================
   Carga de datos
========================================================== */
async function cargarJson(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} en ${path}`);
  }
  return res.json();
}

async function cargarModulo(n) {
  const data = await cargarJson(getJsonPathModulo(n));
  return asArray(data).map((item) => ({
    titulo: normalizarTexto(item.nombre ?? item.titulo, 'Sin título'),
    descripcion: normalizarTexto(item.descripcion ?? item.descripcionCorta, 'Sin descripción'),
    link: normalizarTexto(item.link ?? item.url, '#'),
    modulo: n
  }));
}

async function cargarClases() {
  const data = await cargarJson(SITIOS_CLASES_JSON);
  return asArray(data).map((item) => ({
    titulo: normalizarTexto(item.nombre ?? item.titulo, 'Sin título'),
    descripcion: normalizarTexto(item.descripcion ?? item.descripcionCorta, 'Sin descripción'),
    link: normalizarTexto(item.link ?? item.url, '#'),
    modulo: null
  }));
}

async function cargarCarruselData() {
  const data = await cargarJson(CARRUSEL_DATA);
  return asArray(data).map((item) => ({
    src: normalizarTexto(item.src ?? item.img, CARRUSEL_PLACEHOLDER),
    alt: normalizarTexto(item.alt ?? item.titulo, 'Imagen'),
    caption: normalizarTexto(item.caption ?? item.texto, ''),
    link: normalizarTexto(item.link ?? item.url, '')
  }));
}

async function cargarVideosDesde(path) {
  const data = await cargarJson(path);
  return asArray(data).map((item) => ({
    titulo: normalizarTexto(item.titulo ?? item.nombre, 'Video'),
    descripcion: normalizarTexto(item.descripcion ?? item.texto, ''),
    link: normalizarTexto(item.link ?? item.url, '#')
  }));
}

/* ==========================================================
   Render genérico para cards Bootstrap
========================================================== */
function renderCardsTo(containerSelector, items = []) {
  const host = typeof containerSelector === 'string'
    ? document.querySelector(containerSelector)
    : containerSelector;

  if (!host) return;

  if (!items.length) {
    host.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning mb-0">No hay proyectos para mostrar.</div>
      </div>`;
    return;
  }

  const html = items.map(({ titulo, descripcion, link, modulo }) => `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3">
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-1">${esc(titulo)}</h5>
          ${modulo != null ? `<h6 class="card-subtitle mb-2 text-muted">Módulo ${modulo}</h6>` : ''}
          <p class="card-text flex-grow-1">${esc(descripcion)}</p>
          ${link && link !== '#'
            ? `<a class="card-link mt-2" href="${escAttr(link)}" target="_blank" rel="noopener noreferrer">Visitar</a>`
            : ''
          }
        </div>
      </div>
    </div>
  `).join('');

  host.innerHTML = html;
}

/* ==========================================================
   Render módulos separados con scroll horizontal
========================================================== */
function crearCardModulo(item) {
  return `
    <article class="module-card">
      <div class="module-card-body">
        <h5 class="module-card-title">${esc(item.titulo)}</h5>
        <p class="module-card-text">${esc(item.descripcion)}</p>
        ${item.link && item.link !== '#'
          ? `<a class="module-card-link mt-2" href="${escAttr(item.link)}" target="_blank" rel="noopener noreferrer">Visitar repositorio</a>`
          : ''
        }
      </div>
    </article>
  `;
}

function renderModulosSeparados(modulosData = []) {
  const host = prepararHostModulos();
  if (!host) return;

  if (!modulosData.length) {
    host.innerHTML = `<div class="alert alert-warning mb-0">No hay proyectos para mostrar.</div>`;
    return;
  }

  host.innerHTML = modulosData.map(({ modulo, items }) => {
    const info = MODULOS_INFO[modulo] ?? {
      etiqueta: `Módulo ${modulo}`,
      titulo: `Trabajos del módulo ${modulo}`,
      subtitulo: 'Proyectos y ejercicios asociados a este módulo.'
    };

    return `
      <section class="module-section mb-5">
        <div class="module-heading mb-3">
          <p class="module-kicker mb-1">${esc(info.etiqueta)}</p>
          <h3 class="module-title mb-1">${esc(info.titulo)}</h3>
          <p class="module-subtitle mb-0">${esc(info.subtitulo)}</p>
        </div>

        <div class="module-row">
          ${items.map(crearCardModulo).join('')}
        </div>
      </section>
    `;
  }).join('');
}

/* ==========================================================
   Modal imagen carrusel
========================================================== */
function createModalOnce() {
  if (document.getElementById('imgPreviewModal')) return;

  const modalHtml = `
    <div class="modal fade" id="imgPreviewModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content bg-dark text-light">
          <div class="modal-header border-secondary">
            <h5 class="modal-title" id="imgPreviewTitle">Vista previa</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <img id="imgPreviewImage" src="" alt="" class="img-fluid rounded mb-3 d-block mx-auto">
            <p id="imgPreviewCaption" class="mb-0"></p>
          </div>
          <div class="modal-footer border-secondary">
            <a id="imgPreviewLink" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-outline-light d-none">Abrir enlace</a>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function attachModalEvents() {
  const modalEl = document.getElementById('imgPreviewModal');
  if (!modalEl || typeof bootstrap === 'undefined') return;

  const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
  const imgs = document.querySelectorAll('.js-carrusel-img');

  const img = document.getElementById('imgPreviewImage');
  const title = document.getElementById('imgPreviewTitle');
  const cap = document.getElementById('imgPreviewCaption');
  const link = document.getElementById('imgPreviewLink');

  imgs.forEach((node) => {
    node.addEventListener('click', () => {
      const src = node.dataset.src || node.getAttribute('src') || '';
      const alt = node.dataset.alt || node.getAttribute('alt') || 'Imagen';
      const caption = node.dataset.caption || '';
      const href = node.dataset.link || '';

      img.src = src;
      img.alt = alt;
      title.textContent = alt;
      cap.textContent = caption;

      if (href) {
        link.href = href;
        link.classList.remove('d-none');
      } else {
        link.classList.add('d-none');
      }

      bsModal.show();
    });
  });
}

/* ==========================================================
   Carrusel
========================================================== */
function renderCarrusel(items = []) {
  const host = document.getElementById('carrusel');
  if (!host) return;

  if (!items.length) {
    host.innerHTML = `<div class="alert alert-secondary mb-0">No hay elementos para el carrusel.</div>`;
    return;
  }

  const carouselId = 'carouselIndependiente';

  const indicators = items.map((_, i) => `
    <button
      type="button"
      data-bs-target="#${carouselId}"
      data-bs-slide-to="${i}"
      ${i === 0 ? 'class="active" aria-current="true"' : ''}
      aria-label="Slide ${i + 1}">
    </button>
  `).join('');

  const inner = items.map((it, i) => `
    <div class="carousel-item ${i === 0 ? 'active' : ''}">
      <img
        src="${escAttr(it.src || CARRUSEL_PLACEHOLDER)}"
        alt="${esc(it.alt || 'Imagen')}"
        class="d-block w-100 carrusel-img js-carrusel-img"
        data-src="${escAttr(it.src || CARRUSEL_PLACEHOLDER)}"
        data-alt="${esc(it.alt || 'Imagen')}"
        data-caption="${esc(it.caption || '')}"
        data-link="${escAttr(it.link || '')}">
      ${(it.alt || it.caption) ? `
        <div class="carousel-caption d-none d-sm-block">
          <div class="caption-box">
            ${it.alt ? `<h5 class="mb-1">${esc(it.alt)}</h5>` : ''}
            ${it.caption ? `<p class="mb-0">${esc(it.caption)}</p>` : ''}
          </div>
        </div>` : ''
      }
    </div>
  `).join('');

  host.innerHTML = `
    <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-indicators">${indicators}</div>
      <div class="carousel-inner">${inner}</div>

      <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Anterior</span>
      </button>

      <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Siguiente</span>
      </button>
    </div>
  `;

  createModalOnce();
  attachModalEvents();
}

/* ==========================================================
   Videos YouTube
========================================================== */
function renderVideoCards(items = []) {
  const host = document.getElementById('cards_youtube');
  if (!host) return;

  if (!items.length) {
    host.innerHTML = `<div class="col-12"><div class="alert alert-secondary mb-0">No hay videos para mostrar.</div></div>`;
    return;
  }

  const html = items.map((item) => {
    const titulo = item.titulo || 'Video';
    const descripcion = item.descripcion || '';
    const href = item.link || '#';
    const id = youtubeId(href);
    const thumb = id ? thumbYoutube(id) : 'https://placehold.co/640x360?text=Video';
    const embed = id ? `https://www.youtube.com/embed/${id}` : '';

    return `
      <div class="col-12 col-md-6 col-lg-4">
        <article class="video-tile">
          <div class="ratio ratio-16x9">
            ${embed
              ? `<iframe
                  src="${escAttr(embed)}"
                  title="${escAttr(titulo)}"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  loading="lazy"></iframe>`
              : `<img class="video-thumb" src="${escAttr(thumb)}" alt="${escAttr(titulo)}" loading="lazy">`
            }
          </div>

          <div class="video-text">
            <div class="video-meta">
              <strong class="video-title">${esc(titulo)}</strong>
              ${href && href !== '#'
                ? `<a class="video-link" href="${escAttr(href)}" target="_blank" rel="noopener noreferrer">Ver en YouTube</a>`
                : ''
              }
            </div>

            ${descripcion ? `<p class="video-desc">${esc(descripcion)}</p>` : ''}
          </div>
        </article>
      </div>
    `;
  }).join('');

  host.innerHTML = html;
}

/* ==========================================================
   Fondo Matrix
========================================================== */
(function () {
  function startMatrixBackground({
    canvasId = 'matrix-bg',
    color = '#00ff8860',
    fontSize = 16,
    fade = 0.05,
    speed = 0.35
  } = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const chars = 'アイウエオｱｲｳｴｵ01ABCDEFGHJKLMNPQRSTUVWXYZ';

    let width = 0;
    let height = 0;
    let cols = 0;
    let drops = [];
    let rafId = null;
    let lastTime = 0;
    let acc = 0;

    function sizeCanvas() {
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      width = w;
      height = h;
      cols = Math.max(1, Math.floor(width / fontSize));
      drops = Array(cols).fill(0).map(() => Math.floor(Math.random() * (height / fontSize)));

      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.fillRect(0, 0, width, height);
    }

    function drawFrame() {
      ctx.fillStyle = `rgba(0, 0, 0, ${fade})`;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i += 1) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          drops[i] += 1;
        }
      }
    }

    function tick(ts) {
      if (!lastTime) lastTime = ts;
      const delta = ts - lastTime;
      lastTime = ts;
      acc += delta;

      const interval = 1000 / (30 * speed);

      if (acc >= interval) {
        drawFrame();
        acc = 0;
      }

      rafId = requestAnimationFrame(tick);
    }

    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', sizeCanvas);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }

  window.startMatrixBackground = startMatrixBackground;
})();

/* ==========================================================
   Init
========================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  /* ************* */
  // MÓDULOS
  /* ************* */
  try {
    const packs = await Promise.allSettled(
      MODULOS.map(async (n) => ({
        modulo: n,
        items: await cargarModulo(n)
      }))
    );

    const modulosOk = packs
      .filter((p) => p.status === 'fulfilled')
      .map((p) => p.value)
      .filter(({ items }) => items.length);

    renderModulosSeparados(modulosOk);
  } catch (error) {
    console.error('Error en módulos:', error);
    const host = getModulosHost();
    if (host) {
      host.innerHTML = `<div class="alert alert-danger">Error cargando módulos: ${esc(error?.message || String(error))}</div>`;
    }
  }

  /* ************* */
  // CARRUSEL
  /* ************* */
  try {
    const carruselItems = await cargarCarruselData();
    renderCarrusel(carruselItems);
  } catch (error) {
    console.error('Error en carrusel:', error);
    const host = document.getElementById('carrusel');
    if (host) {
      host.innerHTML = `<div class="alert alert-danger">No se pudo construir el carrusel.</div>`;
    }
  }

  /* ************* */
  // VIDEOS
  /* ************* */
  try {
    const archivos = Array.isArray(VIDEOS_SOURCES) ? VIDEOS_SOURCES : [VIDEOS_SOURCES];
    const sets = await Promise.allSettled(archivos.map(cargarVideosDesde));
    const videos = sets
      .filter((p) => p.status === 'fulfilled')
      .flatMap((p) => p.value);

    renderVideoCards(videos);
  } catch (error) {
    console.error('Error en videos:', error);
    const host = document.getElementById('cards_youtube');
    if (host) {
      host.innerHTML = `<div class="col-12"><div class="alert alert-danger">No se pudieron cargar los videos.</div></div>`;
    }
  }

  /* ************* */
  // CLASES
  /* ************* */
  try {
    const clasesItems = await cargarClases();
    renderCardsTo('#cards_clases', clasesItems);
  } catch (error) {
    console.error('Error en clases:', error);
    const host = document.getElementById('cards_clases');
    if (host) {
      host.innerHTML = `<div class="col-12"><div class="alert alert-danger">No se pudieron cargar los links de clases.</div></div>`;
    }
  }

  /* ************* */
  // MATRIX
  /* ************* */
  if (typeof window.startMatrixBackground === 'function') {
    window.startMatrixBackground({
      canvasId: 'matrix-bg',
      color: '#00ff8860',
      fontSize: 16,
      fade: 0.05,
      speed: 0.35
    });
  }
});