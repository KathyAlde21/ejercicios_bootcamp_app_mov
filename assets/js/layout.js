"use strict";

(function () {
  function getBasePath() {
    return window.location.pathname.includes("/pages/") ? "../" : "./";
  }

  function getCurrentPage() {
    const path = window.location.pathname;
    const fileName = path.substring(path.lastIndexOf("/") + 1) || "index.html";
    return fileName;
  }

  /* ************* */
  // NAVBAR
  /* ************* */
  function renderNavbar() {
    const host = document.getElementById("site-navbar");
    if (!host) return;

    const base = getBasePath();
    const currentPage = getCurrentPage();

    const links = [
      { href: `${base}index.html`, label: "Inicio", page: "index.html" },
      {
        href: `${base}pages/sitiosModulo1.html`.replace(
          "/pages/pages/",
          "/pages/",
        ),
        label: "Módulo 1",
        page: "sitiosModulo1.html",
      },
      {
        href: `${base}pages/sitiosModulo2.html`.replace(
          "/pages/pages/",
          "/pages/",
        ),
        label: "Módulo 2",
        page: "sitiosModulo2.html",
      },
      {
        href: `${base}pages/sitiosModulo3.html`.replace(
          "/pages/pages/",
          "/pages/",
        ),
        label: "Módulo 3",
        page: "sitiosModulo3.html",
      },
      {
        href: `${base}pages/sitiosModulo4.html`.replace(
          "/pages/pages/",
          "/pages/",
        ),
        label: "Módulo 4",
        page: "sitiosModulo4.html",
      },
      {
        href: `${base}pages/sitiosModulo5.html`.replace(
          "/pages/pages/",
          "/pages/",
        ),
        label: "Módulo 5",
        page: "sitiosModulo5.html",
      },
      {
        href: `${base}pages/sitiosModulo6.html`.replace(
          "/pages/pages/",
          "/pages/",
        ),
        label: "Módulo 6",
        page: "sitiosModulo6.html",
      },
      {
        href: `${base}pages/sitiosModulo7.html`.replace(
          "/pages/pages/",
          "/pages/",
        ),
        label: "Módulo 7",
        page: "sitiosModulo7.html",
      },
      {
        href: `${base}pages/proyectosClases.html`.replace(
          "/pages/pages/",
          "/pages/",
        ),
        label: "Trabajos en Clase",
        page: "proyectosClases.html",
      },
    ];

    const navLinks = links
      .map(
        ({ href, label, page }) => `
      <li class="nav-item">
        <a class="nav-link ${currentPage === page ? "active" : ""}" href="${href}">
          ${label}
        </a>
      </li>
    `,
      )
      .join("");

    host.innerHTML = `
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div class="container-fluid">
          <a class="navbar-brand d-flex align-items-center gap-2"
             href="https://github.com/KathyAlde21"
             target="_blank"
             rel="noopener">
            <img src="${base}assets/img/github.png"
                 alt="GitHub Logo"
                 width="20"
                 height="20"
                 class="icon-github"
                 loading="lazy">
            <span>GitHub</span>
          </a>
          <button class="navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarNav"
                  aria-controls="navbarNav"
                  aria-expanded="false"
                  aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
              ${navLinks}
            </ul>
          </div>
        </div>
      </nav>
      <div style="height: 56px;"></div> <!-- Espacio para navbar fija -->
    `;
  }
  /* ************* */
  // FOOTER
  /* ************* */
  function renderFooter() {
    const host = document.getElementById("site-footer");
    if (!host) return;

    const base = getBasePath();

      host.innerHTML = `
      <div style="height: 56px;"></div>  <!-- Espacio sobre el footer garantizado -->
      <footer class="bg-dark text-light">
        <div class="container py-2">
          <div class="d-flex justify-content-center align-items-center gap-3 flex-wrap">
            <p class="mb-0">&copy; 2026 Kathy Alderete</p>
            <a class="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
               href="https://github.com/KathyAlde21"
               target="_blank"
               rel="noopener">
              <img src="${base}assets/img/github.png"
                   alt="GitHub Logo"
                   width="20"
                   height="20"
                   class="icon-github"
                   loading="lazy">
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderNavbar();
    renderFooter();
  });
})();
