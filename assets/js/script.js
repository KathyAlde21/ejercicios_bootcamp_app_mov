/* *****************************************************************/
// --- CONFIGURANDO ---
/* *****************************************************************/
//enumerando los json
const MODULOS = [1, 2, 3];
//aca se van a llamar los json sitios
const RUTA = (n) => `assets/data/sitiosModulo${n}.json`;
//creando cards y enviando al DOM
const contenedor = document.getElementById('cards');

/* *****************************************************************/
 // --- EVITANDO INYECCION ---
/* *****************************************************************/
// Utilidades simples para evitar inyección, con esto se ingresan de forma
// segura al evitar que el JSON se convierta en código HTML ejecutable, lo que podría
// provocar un ataque de inyección de HTML/JavaScript (conocido como XSS — Cross-Site Scripting)
function esc(texto) {
  return String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
function escAttr(texto) {
  return String(texto)
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/* *****************************************************************/
// --- Carga de un módulo --- 
/* *****************************************************************/
// Carga un JSON y “etiqueta” cada item con su módulo
async function cargarModulo(n) {
  const res = await fetch(RUTA(n));
  if (!res.ok) throw new Error(`HTTP ${res.status} en módulo ${n}`);
  const datos = await res.json();

  // normaliza campos esperados: nombre/descripcion/link/imagen (por el momento ninguna)
  return (Array.isArray(datos) ? datos : []).map(item => ({
    titulo: item.nombre ?? item.titulo ?? 'Sin título',
    descripcion: item.descripcion ?? item.descripcionCorta ?? 'Sin descripción',
    link: item.link ?? item.url ?? '#',
    imagen: item.imagen ?? item.img ?? null, // cuando tenga van acá
    modulo: n
  }));
}

/* *****************************************************************/
// --- Render de cards --- 
/* *****************************************************************/
// Renderiza cards Bootstrap
function renderCards(items) {
  if (!items.length) {
    contenedor.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning">No hay datos para mostrar.</div>
      </div>`;
    return;
  }

const frag = document.createDocumentFragment();

  items.forEach(({ titulo, descripcion, link, modulo }) => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
    // imagen (si viene en el JSON)
     const imgHTML = imagen
      ? `<img src="${escAttr(imagen)}" class="card-img-top" alt="${escAttr(titulo)}">`
      : '';

    col.innerHTML = `
      <div class="card h-100">
        ${imgHTML}
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-1">${esc(titulo)}</h5>
          <h6 class="card-subtitle mb-2 text-muted">Módulo ${modulo}</h6>
          <p class="card-text flex-grow-1">${esc(descripcion)}</p>
          <a class="card-link mt-2" href="${escAttr(link)}" target="_blank" rel="noopener noreferrer">Visitar</a>
        </div>
      </div>
    `;
    frag.appendChild(col);
  });

  $cards.innerHTML = '';
  $cards.appendChild(frag);
}

/* *****************************************************************/
// --- CARGANDO JSON --- 
/* *****************************************************************/
// --- Init: carga los archivos JSON e imprime en el HTML ---
(async function init() {
  try {
    const packs = await Promise.all(MODULOS.map(cargarModulo));
    const todos = packs.flat();
    renderCards(todos);
  } catch (e) {
    console.error(e);
    $cards.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">No se pudieron cargar los datos: ${esc(e.message)}</div>
      </div>`;
  }
})();