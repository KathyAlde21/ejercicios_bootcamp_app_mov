'use strict';

/* =======================
   Config
======================= */
const MODULOS = [1,2,3,4,5,6,7];

const RUTA_MOD = (n) => `assets/data/sitiosModulo${n}.json`;

const SITIOS_CLASES_JSON = 'assets/data/sitiosClases.json';

const VIDEOS_SOURCES = ['assets/data/videos.json'];

const CARRUSEL_JSON = 'assets/data/carrusel.json';

const CARRUSEL_PLACEHOLDER = 'assets/img/placeholder.png';

/* =======================
   Utils
======================= */
const esc = (t='') =>
  String(t).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');

const escAttr = (t='') =>
  String(t).replaceAll('"','&quot;').replaceAll("'",'&#39;');

function youtubeId(link='') {
  try {
    const u = new URL(link);
    const host = u.hostname.replace(/^www\./,'');
    if (host === 'youtu.be') return u.pathname.slice(1);
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (u.pathname === '/watch') return u.searchParams.get('v') ?? '';
      const m = u.pathname.match(/\/(?:shorts|embed)\/([^/?#]+)/);
      if (m) return m[1];
    }
  } catch {}
  return '';
}

/* =======================
   Cards (sitios)
======================= */
async function cargarModulo(n) {
  const res = await fetch(RUTA_MOD(n));
  if (!res.ok) throw new Error(`HTTP ${res.status} en módulo ${n}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map(item => ({
    titulo: item.nombre ?? item.titulo ?? 'Sin título',
    descripcion: item.descripcion ?? item.descripcionCorta ?? 'Sin descripción',
    link: item.link ?? item.url ?? '#',
    modulo: n
  }));
}

// Render genérico reutilizable
function renderCardsTo(containerSelector, items) {
  const $cards = typeof containerSelector === 'string'
    ? document.querySelector(containerSelector)
    : containerSelector;
  if (!$cards) return;

  if (!items?.length) {
    $cards.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning mb-0">No hay proyectos para mostrar.</div>
      </div>`;
    return;
  }

  const frag = document.createDocumentFragment();
  items.forEach(({ titulo, descripcion, link, modulo }) => {
    const col = document.createElement('div');
    // Si quieres 3 por fila en desktop, usa col-12 col-md-4
    col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
    col.innerHTML = `
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-1">${esc(titulo)}</h5>
          ${modulo != null ? `<h6 class="card-subtitle mb-2 text-muted">Módulo ${modulo}</h6>` : ''}
          <p class="card-text flex-grow-1">${esc(descripcion)}</p>
          ${link ? `<a class="card-link mt-2" href="${escAttr(link)}" target="_blank" rel="noopener noreferrer">Visitar</a>` : ''}
        </div>
      </div>`;
    frag.appendChild(col);
  });

  $cards.replaceChildren(frag);
}

// Wrapper para módulos -> #cards
function renderCards(items) {
  renderCardsTo('#cards', items);
}

/* =======================
   Clases
======================= */
async function cargarClases() {
  const res = await fetch(SITIOS_CLASES_JSON);
  if (!res.ok) throw new Error(`HTTP ${res.status} en sitiosClases.json`);
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map(item => ({
    titulo: item.nombre ?? item.titulo ?? 'Sin título',
    descripcion: item.descripcion ?? item.descripcionCorta ?? 'Sin descripción',
    link: item.link ?? item.url ?? '#',
    modulo: null
  }));
}

/* =======================
   Videos (YouTube)
======================= */
async function cargarVideosDesde(archivo) {
  const res = await fetch(archivo);
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${archivo}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function renderVideoCards(items = []) {
  const $host = document.getElementById('cards_youtube');
  if (!$host) return;

  if (!items.length) {
    $host.innerHTML = `<div class="col-12"><div class="alert alert-secondary mb-0">No hay videos para mostrar.</div></div>`;
    return;
  }

  const frag = document.createDocumentFragment();
  items.forEach(({ nombre, titulo, descripcion, url, link }) => {
    const t = (titulo ?? nombre ?? 'Video');
    const d = (descripcion ?? '');
    const href = (link ?? url ?? '#');

    const id = youtubeId(href);
    if (!id) return; // sólo YouTube

    const thumb = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

    const col = document.createElement('div');
    col.className = 'col-12 col-md-4'; // 3 por fila en desktop
    col.innerHTML = `
      <div class="video-tile">
        <div class="ratio ratio-16x9 position-relative js-yt" data-id="${escAttr(id)}" aria-label="Reproducir ${escAttr(t)}">
          <img class="video-thumb" src="${thumb}" alt="${esc(t)}" loading="lazy">
          <button type="button" class="video-play js-play" aria-label="Reproducir ${escAttr(t)}">▶</button>
        </div>
        <div class="video-text">
          <div class="video-meta">
            <span class="video-title" title="${escAttr(t)}">${esc(t)}</span>
            <a class="video-link" href="${escAttr(href)}" target="_blank" rel="noopener">YouTube ↗</a>
          </div>
          ${d ? `<p class="video-desc" title="${escAttr(d)}">${esc(d)}</p>` : ''}
        </div>
      </div>`;
    frag.appendChild(col);
  });
  $host.replaceChildren(frag);
}

// Reproducción inline
document.addEventListener('click', (ev) => {
  const btn = ev.target.closest('.js-play');
  if (!btn) return;
  const wrap = btn.closest('.js-yt');
  if (!wrap) return;
  const id = wrap.dataset.id;
  wrap.innerHTML = `
    <iframe
      class="w-100 h-100"
      src="https://www.youtube.com/embed/${escAttr(id)}?autoplay=1&rel=0&modestbranding=1"
      title="YouTube video player"
      loading="lazy"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen>
    </iframe>`;
});

/* =======================
   Carrusel
======================= */
async function cargarCarruselData() {
  const res = await fetch(CARRUSEL_JSON);
  if (!res.ok) throw new Error(`HTTP ${res.status} en carrusel.json`);
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map(item => ({
    src: item.img ?? item.imagen ?? item.image ?? CARRUSEL_PLACEHOLDER,
    alt: item.titulo ?? item.alt ?? 'Imagen',
    caption: item.texto ?? item.caption ?? item.descripcion ?? '',
    link: item.link ?? item.url ?? null
  }));
}

function createModalOnce() {
  if (document.getElementById('imgPreviewModal')) return;
  const modalHTML = `
  <div class="modal fade" id="imgPreviewModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content bg-dark text-light">
        <div class="modal-header border-0">
          <h5 class="modal-title" id="imgPreviewTitle"></h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body p-0">
          <img id="imgPreviewTag" src="" alt="" class="w-100" style="max-height:75vh;object-fit:contain">
        </div>
        <div class="modal-footer border-0 d-flex justify-content-between">
          <p id="imgPreviewCaption" class="mb-0 small text-secondary"></p>
          <a id="imgPreviewLink" href="#" target="_blank" rel="noopener" class="btn btn-outline-light btn-sm d-none">Visitar</a>
        </div>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function attachModalEvents() {
  const imgs = document.querySelectorAll('.js-carrusel-img');
  const modalEl = document.getElementById('imgPreviewModal');
  if (!imgs.length || !modalEl) return;

  const bsModal = new bootstrap.Modal(modalEl);
  const $img = document.getElementById('imgPreviewTag');
  const $title = document.getElementById('imgPreviewTitle');
  const $cap = document.getElementById('imgPreviewCaption');
  const $link = document.getElementById('imgPreviewLink');

  imgs.forEach(img => {
    img.addEventListener('click', () => {
      const src = img.dataset.src || img.getAttribute('src');
      const alt = img.dataset.alt || img.getAttribute('alt') || 'Imagen';
      const caption = img.dataset.caption || '';
      const link = img.dataset.link || '';

      $img.src = src;
      $img.alt = alt;
      $title.textContent = alt;
      $cap.textContent = caption;

      if (link) { $link.href = link; $link.classList.remove('d-none'); }
      else { $link.classList.add('d-none'); }

      bsModal.show();
    });
  });
}

function renderCarrusel(items) {
  const $carrusel = document.getElementById('carrusel');
  if (!$carrusel) return;

  if (!items.length) {
    $carrusel.innerHTML = `<div class="alert alert-secondary mb-0">No hay elementos para el carrusel.</div>`;
    return;
  }

  const carouselId = 'carouselIndependiente';

  const indicators = items.map((_, i) =>
    `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${i}"
      ${i===0?'class="active" aria-current="true"':''} aria-label="Slide ${i+1}"></button>`
  ).join('');

  const inner = items.map((it, i) => {
    const src = escAttr(it.src ?? CARRUSEL_PLACEHOLDER);
    const alt = esc(it.alt ?? 'Imagen');
    const caption = esc(it.caption ?? '');
    const link = it.link ?? '';

    return `
      <div class="carousel-item ${i===0 ? 'active' : ''}">
        <img
          src="${src}"
          alt="${alt}"
          class="d-block w-100 carrusel-img js-carrusel-img"
          data-src="${src}"
          data-alt="${alt}"
          data-caption="${caption}"
          data-link="${link ? escAttr(link) : ''}">
        ${(alt || caption) ? `
        <div class="carousel-caption d-none d-sm-block">
          ${alt ? `<h5 class="mb-1">${alt}</h5>` : ''}
          ${caption ? `<p class="mb-0">${caption}</p>` : ''}
        </div>` : ''}
      </div>`;
  }).join('');

  $carrusel.innerHTML = `
    <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-indicators">${indicators}</div>
      <div class="carousel-inner">${inner}</div>
      <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Anterior</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visualmente-hidden">Siguiente</span>
      </button>
    </div>`;

  createModalOnce();
  attachModalEvents();
}

/* =======================
   Init
======================= */
document.addEventListener('DOMContentLoaded', async () => {
  // MÓDULOS (tolerante a faltantes)
  try {
    const packs = await Promise.allSettled(MODULOS.map(cargarModulo));
    const todos = packs
      .filter(p => p.status === 'fulfilled')
      .flatMap(p => p.value);
    renderCards(todos);
  } catch (error) {
    console.error('Error en módulos:', error);
    const $cards = document.getElementById('cards');
    if ($cards) {
      $cards.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger">Error cargando módulos: ${esc(error?.message || String(error))}</div>
        </div>`;
    }
  }

  // CARRUSEL
  try {
    const carruselItems = await cargarCarruselData();
    renderCarrusel(carruselItems);
  } catch (e) {
    console.error('carrusel error', e);
    const $carrusel = document.getElementById('carrusel');
    if ($carrusel) $carrusel.innerHTML = `<div class="alert alert-danger">No se pudo construir el carrusel.</div>`;
  }

  // VIDEOS (normaliza VIDEOS_SOURCES para aceptar string o array)
  try {
    const VIDEO_FILES = Array.isArray(VIDEOS_SOURCES) ? VIDEOS_SOURCES : [VIDEOS_SOURCES];
const sets = await Promise.allSettled(VIDEO_FILES.map(cargarVideosDesde));
const vids = sets
  .filter(p => p.status === 'fulfilled')
  .flatMap(p => p.value);
renderVideoCards(vids);
  } catch (e) {
    console.error('videos error', e);
    const $v = document.getElementById('cards_youtube');
    if ($v) $v.innerHTML = `<div class="col-12"><div class="alert alert-danger">No se pudieron cargar los videos.</div></div>`;
  }

  // CLASES
  try {
    const clasesItems = await cargarClases();
    renderCardsTo('#cards_clases', clasesItems);
  } catch (e) {
    console.error('clases error', e);
    const $c = document.getElementById('cards_clases');
    if ($c) $c.innerHTML = `<div class="col-12"><div class="alert alert-danger">No se pudieron cargar los links de clases.</div></div>`;
  }
});

/* =======================
   Fondo Matrix
======================= */
(function(){
  function startMatrixBackground({
    canvasId = 'matrix-bg',
    color = '#00ff88',
    fontSize = 16,
    fade = 0.08
  } = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { console.warn('[Matrix] No se encontró #' + canvasId); return; }
    const ctx = canvas.getContext('2d');
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const CHARS = 'アイウエオｱｲｳｴｵ01ABCDEFGHJKLMNPQRSTUVWXYZ';

    let width = 0, height = 0, cols = 0, drops = [], rafId = null;

    function sizeCanvas() {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      width = w; height = h;
      cols = Math.floor(width / fontSize);
      drops = Array(cols).fill(0).map(() => Math.floor(Math.random() * height / fontSize));

      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px monospace`;
    }

    function tick() {
      ctx.fillStyle = `rgba(0,0,0,${fade})`;
      ctx.fillRect(0,0,width,height);

      for (let i = 0; i < cols; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillStyle = color;
        ctx.fillText(ch, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) drops[i] = 0;
        else drops[i]++;
      }
      rafId = requestAnimationFrame(tick);
    }

    function start() {
      cancelAnimationFrame(rafId);
      sizeCanvas();
      const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduce) return;
      tick();
    }

    window.addEventListener('resize', sizeCanvas);
    start();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => startMatrixBackground());
  } else {
    startMatrixBackground();
  }
})();