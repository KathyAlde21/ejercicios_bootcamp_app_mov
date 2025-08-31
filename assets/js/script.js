'use strict';

/* =======================
   Config general
======================= */
const MODULOS = [1, 2, 3, 4, 5, 6];
const RUTA_MOD = (n) => `assets/data/sitiosModulo${n}.json`;
const CARRUSEL_JSON = 'assets/data/carrusel.json';
const CARRUSEL_PLACEHOLDER = 'assets/img/placeholder.png'; // opcional

/* =======================
   Utils
======================= */
const esc = (t) =>
  String(t).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const escAttr = (t) =>
  String(t).replaceAll('"','&quot;').replaceAll("'", '&#39;');

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

function renderCards(items) {
  const $cards = document.getElementById('cards');
  if (!$cards) return;

  if (!items.length) {
    $cards.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning mb-0">No hay proyectos para mostrar.</div>
      </div>`;
    return;
  }

  const frag = document.createDocumentFragment();
  items.forEach(({ titulo, descripcion, link, modulo }) => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
    col.innerHTML = `
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-1" id="titulo">${esc(titulo)}</h5>
          <h6 class="card-subtitle mb-2 text-muted" id="modulo">Módulo ${modulo}</h6>
          <p class="card-text flex-grow-1" id="descripcion">${esc(descripcion)}</p>
          <a class="card-link mt-2" id="link-repositorio"href="${escAttr(link)}" target="_blank" rel="noopener noreferrer">Visitar</a>
        </div>
      </div>`;
    frag.appendChild(col);
  });

  $cards.innerHTML = '';
  $cards.appendChild(frag);
}

/* =======================
   Carrusel (independiente de sitios)
======================= */
async function cargarCarruselData() {
  const res = await fetch(CARRUSEL_JSON);
  if (!res.ok) throw new Error(`HTTP ${res.status} en carrusel.json`);
  const data = await res.json();

  // normaliza claves: img/imagen/image, titulo, texto/caption/descripcion, link/url
  return (Array.isArray(data) ? data : []).map(item => ({
    src: item.img ?? item.imagen ?? item.image ?? CARRUSEL_PLACEHOLDER,
    alt: item.titulo ?? item.alt ?? 'Imagen',
    caption: item.texto ?? item.caption ?? item.descripcion ?? '',
    link: item.link ?? item.url ?? null
  }));
}

// Helpers para armar slides de a 3
const ITEMS_POR_SLIDE = 3;
const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};


// === Modal: insertar una sola vez en <body> ===
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

// === Vincular clic en imagen del carrusel para abrir modal ===
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

      if (link) {
        $link.href = link;
        $link.classList.remove('d-none');
      } else {
        $link.classList.add('d-none');
      }

      bsModal.show();
    });
  });
}

// === Carrusel (3 por slide). Click en imagen abre modal ===
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
      ${i === 0 ? 'class="active" aria-current="true"' : ''} aria-label="Slide ${i + 1}"></button>`
  ).join('');

  const inner = items.map((it, i) => {
    const src = escAttr(it.src ?? it.img ?? it.imagen ?? it.image ?? CARRUSEL_PLACEHOLDER);
    const alt = esc(it.alt ?? it.titulo ?? 'Imagen');
    const caption = esc(it.caption ?? it.texto ?? it.descripcion ?? '');
    const link = it.link ?? it.url ?? '';

    return `
      <div class="carousel-item ${i === 0 ? 'active' : ''}" id="carrusel-css">
        <img
          src="${src}"
          alt="${alt}"
          class="d-block w-100 carrusel-img js-carrusel-img"
          data-src="${src}"
          data-alt="${alt}"
          data-caption="${caption}"
          data-link="${link ? escAttr(link) : ''}"
        >
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
        <span class="visually-hidden">Siguiente</span>
      </button>
    </div>
  `;

  // prepara el modal (una sola vez) y conecta eventos de clic
  createModalOnce();
  attachModalEvents();
};

/* =======================
   Init
======================= */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const packs = await Promise.all(MODULOS.map(cargarModulo));
    const todos = packs.flat();
    renderCards(todos);

    const carruselItems = await cargarCarruselData();
    renderCarrusel(carruselItems);
  } catch (error) { // 👈 usa una variable aquí
    console.error('Error en init:', error); // 👈 y úsala aquí

    const $cards = document.getElementById('cards');
    if ($cards) {
      $cards.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger">Error cargando datos: ${esc(error?.message || String(error))}</div>
        </div>`;
    }

    const $carrusel = document.getElementById('carrusel');
    if ($carrusel) {
      $carrusel.innerHTML = `<div class="alert alert-danger">No se pudo construir el carrusel.</div>`;
    }
  }
});

/* =======================
   Fondo Matrix (canvas)
======================= */
(function(){
  function startMatrixBackground({
    canvasId = 'matrix-bg',
    color = '#00ff88',   // verde Matrix (cámbialo a '#0d6efd' si quieres azul)
    fontSize = 16,       // tamaño de carácter
    fade = 0.08          // rastro (0.05 suave, 0.15 más barrido)
  } = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { console.warn('[Matrix] No se encontró #' + canvasId); return; }
    const ctx = canvas.getContext('2d');
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const CHARS = 'アイウエオｱｲｳｴｵ01ABCDEFGHJKLMNPQRSTUVWXYZ';

    let width = 0, height = 0, cols = 0, drops = [], rafId = null;

    function sizeCanvas() {
      // Lee el tamaño CSS que ya tiene el canvas (100vw/100vh por tu CSS)
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;

      // Ajusta el buffer de dibujo para HiDPI
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);

      // Escala el contexto para que 1 unidad == 1 px CSS
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      width = w; 
      height = h;
      cols = Math.floor(width / fontSize);
      drops = Array(cols).fill(0).map(() => Math.floor(Math.random() * height / fontSize));

      // Fondo inicial oscuro para el rastro
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px monospace`;
    }

    function tick() {
      // capa semitransparente que genera el rastro
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
      // respeta "reduce motion": dibuja 1 frame estático si el usuario lo pide
      const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduce) {
        // un frame “congelado”
        for (let i = 0; i < cols; i++) {
          const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.fillStyle = color;
          ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
        }
        return;
      }
      tick();
    }

    window.addEventListener('resize', sizeCanvas);
    start();
  }

  // Garantiza que corra cuando el DOM ya existe
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => startMatrixBackground());
  } else {
    startMatrixBackground();
  }
})();