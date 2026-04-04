"use strict";

/* ==========================================================
   Configuración
========================================================== */
const MODULOS = [1, 2, 3, 4, 5, 6, 7];

const IMAGENES_SOURCES = "assets/data/imagenes.json";
const VIDEOS_SOURCES = "assets/data/videos.json";
const IMAGENES_PLACEHOLDER = "https://placehold.co/1200x675?text=Proyecto";

const MODULOS_INFO = {
  1: {
    etiqueta: "Módulo 1",
    titulo: "Orientación al perfil y metodología del curso",
    subtitulo:
      "Actividades introductorias y primeros acercamientos al bootcamp.",
    pagina: "../pages/sitiosModulo1.html",
  },
  2: {
    etiqueta: "Módulo 2",
    titulo: "Fundamentos de programación en Java",
    subtitulo:
      "Ejercicios base, lógica y estructuras para comenzar a programar.",
    pagina: "../pages/sitiosModulo2.html",
  },
  3: {
    etiqueta: "Módulo 3",
    titulo: "Fundamentos de bases de datos relacionales",
    subtitulo: "Modelado, consultas y trabajo inicial con bases de datos.",
    pagina: "../pages/sitiosModulo3.html",
  },
  4: {
    etiqueta: "Módulo 4",
    titulo: "Desarrollo de la interfaz de usuario Android",
    subtitulo:
      "Primeras pantallas, vistas y estructura visual de aplicaciones.",
    pagina: "../pages/sitiosModulo4.html",
  },
  5: {
    etiqueta: "Módulo 5",
    titulo: "Arquitectura y ciclo de vida de componentes Android",
    subtitulo: "Navegación, componentes y organización interna de la app.",
    pagina: "../pages/sitiosModulo5.html",
  },
  6: {
    etiqueta: "Módulo 6",
    titulo: "Desarrollo de aplicaciones empresariales Android",
    subtitulo: "Proyectos con mayor integración y lógica aplicada.",
    pagina: "../pages/sitiosModulo6.html",
  },
  7: {
    etiqueta: "Módulo 7",
    titulo: "Desarrollo de portafolio de un producto digital",
    subtitulo: "Cierre del proceso con trabajos más completos y presentables.",
    pagina: "../pages/sitiosModulo7.html",
  },
};

/* ==========================================================
   Utilidades
========================================================== */
function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escAttr(value = "") {
  return esc(value);
}

function asArray(data) {
  return Array.isArray(data) ? data : [];
}

function normalizarTexto(value, fallback = "") {
  const txt = String(value ?? "").trim();
  return txt || fallback;
}

function getModuloActualDesdePagina() {
  const section = document.querySelector(".module-detail-page[data-modulo]");
  if (!section) return null;

  const modulo = Number(section.dataset.modulo);
  return Number.isInteger(modulo) ? modulo : null;
}

function esPaginaClases() {
  const path = window.location.pathname.toLowerCase();
  return (
    path.includes("proyectosclases") ||
    !!document.querySelector('.classes-detail-page[data-page="clases"]')
  );
}

function getJsonPathModulo(n) {
  const esPaginaModulo = !!document.querySelector(
    ".module-detail-page[data-modulo]",
  );

  return esPaginaModulo
    ? `../assets/data/sitiosModulo${n}.json`
    : `assets/data/sitiosModulo${n}.json`;
}

function getJsonPathClases() {
  return esPaginaClases()
    ? "../assets/data/proyectosClases.json"
    : "assets/data/proyectosClases.json";
}

function getModulosHost() {
  return (
    document.getElementById("modulos-container") ||
    document.getElementById("cards")
  );
}

function prepararHostModulos() {
  const host = getModulosHost();
  if (!host) return null;

  host.classList.remove("row", "g-3");
  host.innerHTML = "";
  return host;
}

function youtubeId(url = "") {
  const raw = String(url).trim();
  if (!raw) return null;

  try {
    const parsed = new URL(raw);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "").trim() || null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return v.trim();

      const parts = parsed.pathname.split("/").filter(Boolean);
      const embedIdx = parts.indexOf("embed");
      if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];

      const shortsIdx = parts.indexOf("shorts");
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
    titulo: normalizarTexto(item.nombre ?? item.titulo, "Sin título"),
    descripcion: normalizarTexto(
      item.descripcion ?? item.descripcionCorta,
      "Sin descripción",
    ),
    link: normalizarTexto(item.link ?? item.url, "#"),
    img: normalizarTexto(item.img, IMAGENES_PLACEHOLDER),
    modulo: n,
  }));
}

async function cargarClases() {
  const data = await cargarJson(getJsonPathClases());
  return asArray(data).map((item) => ({
    titulo: normalizarTexto(item.nombre ?? item.titulo, "Sin título"),
    descripcion: normalizarTexto(
      item.descripcion ?? item.descripcionCorta,
      "Sin descripción",
    ),
    link: normalizarTexto(item.link ?? item.url, "#"),
    img: normalizarTexto(item.img, IMAGENES_PLACEHOLDER),
    modulo: null,
  }));
}

async function cargarImagenesData() {
  const response = await fetch(IMAGENES_SOURCES);
  if (!response.ok) {
    throw new Error(`Error al cargar imágenes: ${response.status}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

async function cargarVideosDesde(path) {
  const data = await cargarJson(path);
  return asArray(data).map((item) => ({
    titulo: normalizarTexto(item.titulo ?? item.nombre, "Video"),
    descripcion: normalizarTexto(item.descripcion ?? item.texto, ""),
    link: normalizarTexto(item.link ?? item.url, "#"),
  }));
}

/* ==========================================================
   Render de cards para páginas detalle
========================================================== */
function renderCardsModuloDetalle(containerSelector, items = []) {
  const host =
    typeof containerSelector === "string"
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

  const html = items
    .map(
      ({ titulo, descripcion, link, img }) => `
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="card h-100">
        <button
          type="button"
          class="module-card-image-trigger js-open-image"
          data-img="${escAttr(img || IMAGENES_PLACEHOLDER)}"
          data-alt="${escAttr(titulo)}"
          data-caption="${escAttr(descripcion)}"
          aria-label="Ampliar imagen: ${escAttr(titulo)}"
        >
          <img
            src="${escAttr(img || IMAGENES_PLACEHOLDER)}"
            class="card-img-top"
            alt="${escAttr(titulo)}"
            loading="lazy"
          >
        </button>

        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-2">${esc(titulo)}</h5>
          <p class="card-text flex-grow-1">${esc(descripcion)}</p>
          ${
            link && link !== "#"
              ? `<a class="card-link mt-2" href="${escAttr(link)}" target="_blank" rel="noopener noreferrer">Visitar repositorio</a>`
              : ""
          }
        </div>
      </div>
    </div>
  `,
    )
    .join("");

  host.innerHTML = html;
  activarModalImagenes();
}

/* ==========================================================
   Render genérico para cards Bootstrap
========================================================== */
function renderCardsTo(containerSelector, items = []) {
  const host =
    typeof containerSelector === "string"
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

  const html = items
    .map(
      ({ titulo, descripcion, link, modulo }) => `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3">
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-1">${esc(titulo)}</h5>
          ${modulo != null ? `<h6 class="card-subtitle mb-2 text-muted">Módulo ${modulo}</h6>` : ""}
          <p class="card-text flex-grow-1">${esc(descripcion)}</p>
          ${
            link && link !== "#"
              ? `<a class="card-link mt-2" href="${escAttr(link)}" target="_blank" rel="noopener noreferrer">Visitar</a>`
              : ""
          }
        </div>
      </div>
    </div>
  `,
    )
    .join("");

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
        ${
          item.link && item.link !== "#"
            ? `<a class="module-card-link mt-2" href="${escAttr(item.link)}" target="_blank" rel="noopener noreferrer">Visitar repositorio</a>`
            : ""
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

  host.innerHTML = modulosData
    .map(({ modulo, items }) => {
      const info = MODULOS_INFO[modulo] ?? {
        etiqueta: `Módulo ${modulo}`,
        titulo: `Trabajos del módulo ${modulo}`,
        subtitulo: "Proyectos y ejercicios asociados a este módulo.",
      };

      return `
      <section class="module-section mb-5">
        <div class="module-heading mb-3">
          <p class="module-kicker mb-1">${esc(info.etiqueta)}</p>
          <h3 class="module-title mb-1">${esc(info.titulo)}</h3>
          <p class="module-subtitle mb-2">${esc(info.subtitulo)}</p>
          ${
            info.pagina
              ? `<div class="module-actions">
                  <a class="module-section-link" href="${escAttr(info.pagina)}">Ver página del módulo</a>
                </div>`
              : ""
          }
        </div>
        <div class="module-row">
          ${items.map(crearCardModulo).join("")}
        </div>
      </section>
    `;
    })
    .join("");
}

/* ==========================================================
   Imágenes representativas con scroll horizontal + modal
========================================================== */
function getImagenesHost() {
  return document.getElementById("cards_imagenes");
}

function prepararHostImagenes() {
  const host = getImagenesHost();
  if (!host) return null;

  host.classList.remove("row", "g-3");
  host.classList.add("image-gallery-row");
  host.innerHTML = "";
  return host;
}

function crearCardImagen(item, index) {
  const src = normalizarTexto(item.img, IMAGENES_PLACEHOLDER);
  const titulo = normalizarTexto(item.titulo, `Proyecto ${index + 1}`);
  const alt = titulo;
  const texto = normalizarTexto(
    item.texto,
    "Imagen representativa del bootcamp.",
  );

  return `
    <article class="image-card">
      <button
        type="button"
        class="image-card-trigger js-open-image"
        data-img="${escAttr(src)}"
        data-alt="${escAttr(alt)}"
        data-caption="${escAttr(texto)}"
        aria-label="Ampliar imagen: ${escAttr(titulo)}">
        <img class="image-card-img" src="${escAttr(src)}" alt="${escAttr(alt)}" loading="lazy">
      </button>

      <div class="image-card-body">
        <h4 class="image-card-title">${esc(titulo)}</h4>
        <p class="image-card-text">${esc(texto)}</p>
      </div>
    </article>
  `;
}

function activarModalImagenes() {
  const modalEl = document.getElementById("imageModal");
  if (!modalEl || typeof bootstrap === "undefined") return;

  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  const modalTitle = document.getElementById("imageModalLabel");
  const modalImage = document.getElementById("modalImage");
  const modalCaption = document.getElementById("modalImageCaption");

  document.querySelectorAll(".js-open-image").forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.dataset.img || IMAGENES_PLACEHOLDER;
      const alt = btn.dataset.alt || "Imagen ampliada";
      const caption = btn.dataset.caption || "";

      modalTitle.textContent = alt;
      modalImage.src = src;
      modalImage.alt = alt;
      modalCaption.textContent = caption;

      modal.show();
    });
  });

  modalEl.addEventListener("hidden.bs.modal", () => {
    modalImage.src = "";
    modalImage.alt = "";
    modalCaption.textContent = "";
  });
}

function renderImagenes(imagenesData = []) {
  const host = prepararHostImagenes();
  if (!host) return;

  if (!imagenesData.length) {
    host.innerHTML = `<div class="alert alert-warning mb-0">No hay imágenes para mostrar.</div>`;
    return;
  }

  host.innerHTML = imagenesData.map(crearCardImagen).join("");
  activarModalImagenes();
}

/* ==========================================================
   Videos YouTube
========================================================== */
function renderVideoCards(items = []) {
  const host = document.getElementById("cards_youtube");
  if (!host) return;

  if (!items.length) {
    host.innerHTML = `<div class="col-12"><div class="alert alert-secondary mb-0">No hay videos para mostrar.</div></div>`;
    return;
  }

  const html = items
    .map((item) => {
      const titulo = item.titulo || "Video";
      const descripcion = item.descripcion || "";
      const href = item.link || "#";
      const id = youtubeId(href);
      const thumb = id
        ? thumbYoutube(id)
        : "https://placehold.co/640x360?text=Video";
      const embed = id ? `https://www.youtube.com/embed/${id}` : "";

      return `
      <div class="col-12 col-md-6 col-lg-4">
        <article class="video-tile">
          <div class="ratio ratio-16x9">
            ${
              embed
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
              ${
                href && href !== "#"
                  ? `<a class="video-link" href="${escAttr(href)}" target="_blank" rel="noopener noreferrer">Ver en YouTube</a>`
                  : ""
              }
            </div>

            ${descripcion ? `<p class="video-desc">${esc(descripcion)}</p>` : ""}
          </div>
        </article>
      </div>
    `;
    })
    .join("");

  host.innerHTML = html;
}

/* ==========================================================
   Init
========================================================== */
function esHome() {
  const path = window.location.pathname.toLowerCase();
  return (
    document.body.dataset.page === "home" ||
    path.endsWith("/") ||
    path.endsWith("/index.html") ||
    path.includes("ejercicios_bootcamp_app_mov")
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  const moduloActual = getModuloActualDesdePagina();
  const paginaClases = esPaginaClases();
  const home = esHome();

  try {
    if (moduloActual) {
      const items = await cargarModulo(moduloActual);
      renderCardsModuloDetalle("#cards_modulo", items);
    } else if (paginaClases) {
      const clasesItems = await cargarClases();
      renderCardsModuloDetalle("#cards_clases", clasesItems);
    } else if (home) {
      try {
        const imagenesItems = await cargarImagenesData();
        renderImagenes(imagenesItems);
      } catch (error) {
        console.error("Error en imágenes:", error);
        const host = document.getElementById("cards_imagenes");
        if (host) {
          host.innerHTML = `<div class="alert alert-danger">No se pudieron cargar las imágenes.</div>`;
        }
      }

      try {
        const archivos = Array.isArray(VIDEOS_SOURCES)
          ? VIDEOS_SOURCES
          : [VIDEOS_SOURCES];
        const sets = await Promise.allSettled(archivos.map(cargarVideosDesde));
        const videos = sets
          .filter((p) => p.status === "fulfilled")
          .flatMap((p) => p.value);
        renderVideoCards(videos);
      } catch (error) {
        console.error("Error en videos:", error);
        const host = document.getElementById("cards_youtube");
        if (host) {
          host.innerHTML = `<div class="col-12"><div class="alert alert-danger">No se pudieron cargar los videos.</div></div>`;
        }
      }
    }
  } catch (error) {
    console.error("Error general:", error);
  }
});