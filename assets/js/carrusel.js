'use strict';

/* =======================
   Config general
======================= */
const MODULOS = [1, 2, 3];
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
          <h5 class="card-title mb-1">${esc(titulo)}</h5>
          <h6 class="card-subtitle mb-2 text-muted">Módulo ${modulo}</h6>
          <p class="card-text flex-grow-1">${esc(descripcion)}</p>
          <a class="card-link mt-2" href="${escAttr(link)}" target="_blank" rel="noopener noreferrer">Visitar</a>
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

function renderCarrusel(items) {
  const $carrusel = document.getElementById('carrusel');
  if (!$carrusel) return;

  if (!items.length) {
    $carrusel.innerHTML = `
      <div class="alert alert-secondary mb-0">No hay elementos para el carrusel.</div>`;
    return;
  }

  const carouselId = 'carouselIndependiente';

  const indicators = items.map((_, i) =>
    `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${i}"
      ${i === 0 ? 'class="active" aria-current="true"' : ''} aria-label="Slide ${i + 1}"></button>`
  ).join('');

  const inner = items.map((it, i) => `
    <div class="carousel-item ${i === 0 ? 'active' : ''}">
      ${it.link ? `<a href="${escAttr(it.link)}" target="_blank" rel="noopener">` : ''}
        <img src="${escAttr(it.src)}" class="d-block w-100 carrusel-img" alt="${escAttr(it.alt)}">
      ${it.link ? `</a>` : ''}
      ${(it.alt || it.caption) ? `
        <div class="carousel-caption d-none d-md-block">
          ${it.alt ? `<h5>${esc(it.alt)}</h5>` : ''}
          ${it.caption ? `<p>${esc(it.caption)}</p>` : ''}
        </div>` : ''}
    </div>
  `).join('');

  $carrusel.innerHTML = `
    <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-indicators">
        ${indicators}
      </div>
      <div class="carousel-inner">
        ${inner}
      </div>
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
}

/* =======================
   Init
======================= */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Cards (sitios): sigue igual
    const packs = await Promise.all(MODULOS.map(cargarModulo));
    const todos = packs.flat();
    renderCards(todos);

    // Carrusel: independiente
    const carruselItems = await cargarCarruselData();
    renderCarrusel(carruselItems);
  } catch (e) {
    console.error(e);
    // mensajes de error amigables
    const $cards = document.getElementById('cards');
    if ($cards) $cards.innerHTML = `<div class="col-12"><div class="alert alert-danger">
      Error cargando datos: ${esc(e.message)}</div></div>`;
    const $carrusel = document.getElementById('carrusel');
    if ($carrusel) $carrusel.innerHTML = `<div class="alert alert-danger">
      No se pudo construir el carrusel.</div>`;
  }
});