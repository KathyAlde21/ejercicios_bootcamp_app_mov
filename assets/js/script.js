import { proyectos } from './proyectos.js';

const contenedor = document.getElementById('proyectos-container');

proyectos.forEach(p => {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    col.innerHTML = `
        <div class="card h-100 shadow-sm">
            <img src="${p.imagen}" class="card-img-top" alt="Imagen ${p.nombre}">
            <div class="card-body">
                <h5 class="card-title">${p.nombre}</h5>
                <p class="card-text">${p.descripcion}</p>
            </div>
            <div class="card-footer text-center">
                <button class="btn btn-outline-primary" onclick="window.open('${p.link}', '_blank')">Ver Proyecto</button>
            </div>
        </div>
    `;
    contenedor.appendChild(col);
});
//const contenedor = document.getElementById('proyectos-container');