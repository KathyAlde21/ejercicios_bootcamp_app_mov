//cargando los diferentes sitios.json:
// Modulo 1
fetch('assets/data/sitiosModulo1.json')
  .then(res => res.json())
  .then(data => {
    console.log("Datos del módulo 1:", data);
  })
  .catch(err => console.error("Error cargando JSON:", err));

// Modulo 2
fetch('assets/data/sitiosModulo2.json')
  .then(res => res.json())
  .then(data => {
    console.log("Datos del módulo 2:", data);
  })
  .catch(err => console.error("Error cargando JSON:", err));

// Modulo 3
fetch('assets/data/sitiosModulo3.json')
  .then(res => res.json())
  .then(data => {
    console.log("Datos del módulo 3:", data);
  })
  .catch(err => console.error("Error cargando JSON:", err));


//función que recibe el número de módulo y carga el JSON correspondiente:
function cargarModulo(numModulo) {
  fetch(`assets/data/sitiosModulo${numModulo}.json`)
    .then(res => res.json())
    .then(data => {
      console.log(`Datos del módulo ${numModulo}:`, data);
    })
    .catch(err => console.error("Error:", err));
}

// Ejemplos de uso
cargarModulo(1); // Carga sitiosModulo1.json
cargarModulo(2); // Carga sitiosModulo2.json
cargarModulo(3); // Carga sitiosModulo3.json

//