'use strict';
/* *****************************************************************/
// --- CONFIGURANDO ---
/* *****************************************************************/
//enumerando los json
const MODULOS = [1, 2, 3];
//aca se van a llamar los json sitios
const RUTA = (n) => `assets/data/sitiosModulo${n}.json`;
//creando cards y enviando al DOM
function getCardsContainer() {
    const el = document.getElementById('cards');
    if (!el) {
      console.error('No se encontró #cards en el DOM.');
    }
    return el;
}

/* *****************************************************************/
 // --- EVITANDO INYECCION ---
/* *****************************************************************/
// --- Utilidades de escape ---
  const esc = (t) =>
    String(t).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const escAttr = (t) =>
    String(t).replaceAll('"', '&quot;').replaceAll("'", '&#39;');

/* *****************************************************************/
// --- Carga de un módulo --- 
/* *****************************************************************/
// Carga un JSON y “etiqueta” cada item con su módulo
async function cargarModulo(n) {
  const res = await fetch(RUTA(n));
  if (!res.ok) throw new Error(`HTTP ${res.status} en módulo ${n}`);
  const datos = await res.json();

  // normaliza campos esperados: nombre/descripcion/link
  return (Array.isArray(datos) ? datos : []).map(item => ({
    titulo: item.nombre ?? item.titulo ?? 'Sin título',
    descripcion: item.descripcion ?? item.descripcionCorta ?? 'Sin descripción',
    link: item.link ?? item.url ?? '#',
    modulo: n
  }));
}

/* *****************************************************************/
// --- Render de cards --- 
/* *****************************************************************/
// Renderiza cards Bootstrap sin imagen
  function renderCards(items) {
  const $cards = document.getElementById('cards');
  if (!$cards) {
    console.error('No se encontró #cards en el DOM.');
    return;
  }

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
          <h6 class="card-subtitle mb-2 text-muted">Módulo ${modulo}</h6>
          <p class="card-text flex-grow-1" id="descripcion">${esc(descripcion)}</p>
          <a class="card-link mt-2" href="${escAttr(link)}" target="_blank" rel="noopener noreferrer">Visitar</a>
        </div>
      </div>`;
    frag.appendChild(col);
  });

  $cards.innerHTML = '';
  $cards.appendChild(frag);
}
/* *****************************************************************/
// --- CARGANDO JSON --- 
/* *****************************************************************/
// --- Init: carga los archivos JSON e imprime en el HTML ---
async function init() {
  try {
    const packs = await Promise.all(MODULOS.map(cargarModulo));
    const todos = packs.flat();
    renderCards(todos);
  } catch (e) {
       console.error(e);
    const $cards = document.getElementById('cards');
    if ($cards) {
      $cards.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger">No se pudieron cargar los datos: ${esc(e.message)}</div>
        </div>`;
    }
  }
}

// Arranca cuando el DOM está listo (por si no usas "defer")
document.addEventListener('DOMContentLoaded', init);