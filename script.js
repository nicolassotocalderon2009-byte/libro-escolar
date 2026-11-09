/* =========================================
   ANUARIO ESCOLAR DIGITAL INTERACTIVO
   Integración dinámica con Datos.js
========================================= */

// Lee el array de ESTUDIANTES de Datos.js
const listaEstudiantes = typeof ESTUDIANTES !== 'undefined' ? ESTUDIANTES : [];
const TOTAL_PAGINAS = listaEstudiantes.length + 1; // Portada + estudiantes

const contenedor = document.getElementById("paginas");
const portada = document.getElementById("portada");
const botonAnterior = document.getElementById("anterior");
const botonSiguiente = document.getElementById("siguiente");
const numero = document.getElementById("numero");
const totalPaginasEl = document.getElementById("total-paginas");
const botonGuardar = document.getElementById("guardar");
const botonImprimir = document.getElementById("imprimir");
const mensaje = document.getElementById("mensaje");

const CLAVE = "anuario_escolar_2026";
let paginaActual = 0;
let paginas = [];

/* =========================================
   PLANTILLA DE CADA ESTUDIANTE
========================================= */
function crearPaginaEstudiante(estudiante, numeroPagina) {
    const pagina = document.createElement("section");
    pagina.className = "pagina";
    pagina.dataset.numero = numeroPagina;

    // Foto desde Google Drive
    const fotoSrc = estudiante.fotoDrive 
        ? `https://lh3.googleusercontent.com/d/${estudiante.fotoDrive}` 
        : '';

    const fotoHTML = fotoSrc 
        ? `<img src="${fotoSrc}" alt="Foto de ${estudiante.nombre}">`
        : `<span>＋<br>CLIC PARA CAMBIAR FOTO</span>`;

    pagina.innerHTML = `
        <header class="encabezado">
            <span contenteditable="true">GENERACIÓN 2026</span>
            <span>✦</span>
        </header>

        <div class="contenido">
            <div class="columna-foto">
                <button class="foto" type="button">
                    ${fotoHTML}
                </button>
                <input type="file" class="foto-input" accept="image/*">
                <p class="texto-foto" contenteditable="true">Un recuerdo para siempre</p>
            </div>

            <div class="informacion">
                <span class="etiqueta">ESTUDIANTE</span>
                <h2 class="nombre" contenteditable="true">${estudiante.nombre || 'Nombre del estudiante'}</h2>
                <div class="decoracion"></div>

                <div class="campo">
                    <h3>Mi frase</h3>
                    <p contenteditable="true">${estudiante.frase || 'Escribe aquí tu frase favorita.'}</p>
                </div>

                <div class="campo">
                    <h3>Mi recuerdo favorito</h3>
                    <p contenteditable="true">${estudiante.recuerdo || 'Escribe aquí el recuerdo más especial.'}</p>
                </div>

                <div class="campo">
                    <h3>Mis aspiraciones</h3>
                    <p contenteditable="true">${estudiante.aspiraciones || 'Escribe tus sueños y metas para el futuro.'}</p>
                </div>

                <div class="campo">
                    <h3>Mis agradecimientos</h3>
                    <p contenteditable="true">${estudiante.agradecimientos || 'Dedica unas palabras a las personas que hicieron parte de tu formación.'}</p>
                </div>

                <div class="firma">
                    <p>Con cariño:</p>
                    <p class="nombre-firma" contenteditable="true">${estudiante.nombre || 'Tu firma'}</p>
                    <div class="linea-firma"></div>
                </div>
            </div>
        </div>

        <footer class="pie">
            <span contenteditable="true">MI HISTORIA ESCOLAR</span>
            <span>${String(numeroPagina + 1).padStart(2, "0")}</span>
        </footer>
    `;

    return pagina;
}

/* =========================================
   GENERAR PÁGINAS DEL LIBRO
========================================= */
function generarLibro() {
    contenedor.innerHTML = "";
    listaEstudiantes.forEach((estudiante, index) => {
        const nuevaPagina = crearPaginaEstudiante(estudiante, index + 1);
        contenedor.appendChild(nuevaPagina);
    });

    paginas = Array.from(contenedor.querySelectorAll(".pagina"));
    if (totalPaginasEl) {
        totalPaginasEl.textContent = TOTAL_PAGINAS;
    }
}

/* =========================================
   PASAR LAS PÁGINAS
========================================= */
function mostrarPagina(indice) {
    paginaActual = Math.max(0, Math.min(TOTAL_PAGINAS - 1, indice));

    portada.style.display = paginaActual === 0 ? "block" : "none";

    paginas.forEach((pagina, indicePagina) => {
        pagina.classList.toggle("activa", indicePagina === paginaActual - 1);
    });

    numero.textContent = paginaActual + 1;
    botonAnterior.disabled = paginaActual === 0;
    botonSiguiente.disabled = paginaActual === TOTAL_PAGINAS - 1;
}

botonSiguiente.addEventListener("click", () => mostrarPagina(paginaActual + 1));
botonAnterior.addEventListener("click", () => mostrarPagina(paginaActual - 1));

document.addEventListener("keydown", (evento) => {
    if (evento.key === "ArrowRight") mostrarPagina(paginaActual + 1);
    if (evento.key === "ArrowLeft") mostrarPagina(paginaActual - 1);
});

/* =========================================
   CAMBIAR FOTOGRAFÍAS DE FORMA LOCAL
========================================= */
function activarFotos() {
    paginas.forEach((pagina) => {
        const botonFoto = pagina.querySelector(".foto");
        const inputFoto = pagina.querySelector(".foto-input");

        botonFoto.addEventListener("click", () => inputFoto.click());

        inputFoto.addEventListener("change", () => {
            const archivo = inputFoto.files[0];
            if (!archivo) return;
            if (!archivo.type.startsWith("image/")) {
                alert("Selecciona una fotografía válida.");
                return;
            }

            const lector = new FileReader();
            lector.onload = (evento) => {
                const imagen = new Image();
                imagen.onload = () => {
                    const maximo = 1000;
                    const escala = Math.min(1, maximo / Math.max(imagen.width, imagen.height));
                    const canvas = document.createElement("canvas");
                    canvas.width = imagen.width * escala;
                    canvas.height = imagen.height * escala;
                    const contexto = canvas.getContext("2d");
                    contexto.drawImage(imagen, 0, 0, canvas.width, canvas.height);

                    const fotoFinal = canvas.toDataURL("image/jpeg", 0.75);
                    botonFoto.innerHTML = `<img src="${fotoFinal}" alt="Foto del estudiante">`;
                    guardarAutomaticamente();
                };
                imagen.src = evento.target.result;
            };
            lector.readAsDataURL(archivo);
        });
    });
}

/* =========================================
   GUARDADO LOCAL ADICIONAL (EDICIONES RAPIDAS)
========================================= */
function obtenerDatos() {
    return {
        portada: portada.innerHTML,
        paginas: paginas.map((pagina) => ({ contenido: pagina.innerHTML }))
    };
}

function guardarAutomaticamente() {
    try {
        const datos = obtenerDatos();
        localStorage.setItem(CLAVE, JSON.stringify(datos));
    } catch (error) {
        mensaje.textContent = "Guardado local lleno. Para guardado permanente, edita Datos.js.";
    }
}

function cargarDatos() {
    const guardado = localStorage.getItem(CLAVE);
    if (!guardado) return;

    try {
        const datos = JSON.parse(guardado);
        if (datos.portada) portada.innerHTML = datos.portada;
        if (Array.isArray(datos.paginas)) {
            datos.paginas.forEach((dato, indice) => {
                if (paginas[indice] && dato.contenido) {
                    paginas[indice].innerHTML = dato.contenido;
                }
            });
        }
    } catch (error) {
        console.error("Error al recuperar datos guardados en navegador:", error);
    }
}

botonGuardar.addEventListener("click", () => {
    try {
        guardarAutomaticamente();
        mensaje.textContent = "¡Cambios temporales guardados en este navegador!";
        setTimeout(() => { mensaje.textContent = ""; }, 3000);
    } catch (error) {
        mensaje.textContent = "No fue posible guardar los cambios.";
    }
});

document.addEventListener("input", (evento) => {
    if (evento.target.isContentEditable) {
        guardarAutomaticamente();
    }
});

botonImprimir.addEventListener("click", () => {
    guardarAutomaticamente();
    window.print();
});

/* =========================================
   INICIAR ANUARIO
========================================= */
generarLibro();
cargarDatos();
activarFotos();
mostrarPagina(0);