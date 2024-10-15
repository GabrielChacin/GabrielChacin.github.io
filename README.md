Hola, soy el archivo inicial necesrio para subir a pages

Podria ser util despues:
    <!-- Script para mostrar/ocultar el rectángulo -->
    <script>
        function toggleSideBox() {
            const sideBox = document.getElementById('sideBox');
            if (sideBox.style.display === 'none' || sideBox.style.display === '') {
                sideBox.style.display = 'block';
            } else {
                sideBox.style.display = 'none';
            }
        }
        function updateYearDisplay(year) {
            document.getElementById('yearDisplay').textContent = year;
            // Aquí podrías agregar la lógica para actualizar el mapa según el año
            console.log(`Año seleccionado: ${year}`);
        }
    </script>

.content-row {
    display: flex;
    justify-content: left; /* Centramos los elementos */
    gap: 40px; /* Espacio entre el mapa y el side-box */
    align-items: left;
    width: 100%;
}


/* Estilo para la barra deslizante en la sección de la línea de tiempo */
.time-line {
    width: 70%;
    padding: 20px;
    background-color: #e0e0e0;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px; /* Espacio entre los elementos */
    margin-bottom: 30px;
}

input[type="range"] {
    width: 300px;
    -webkit-appearance: none;
    appearance: none;
    height: 8px;
    background: #004080;
    outline: none;
    opacity: 0.9;
    border-radius: 5px;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 15px;
    height: 15px;
    background: #f0f0f0;
    cursor: pointer;
    border-radius: 50%;
    border: 2px solid #004080;
}

input[type="range"]::-moz-range-thumb {
    width: 15px;
    height: 15px;
    background: #f0f0f0;
    cursor: pointer;
    border-radius: 50%;
    border: 2px solid #004080;
}

/* Estilo para el valor del año que se muestra al lado de la barra */
#yearDisplay {
    font-size: 1.2em;
    color: #004080;
    font-weight: bold;
}

/* Estilo para el contenedor del mapa */
.map-container {
    display: flex;
    justify-content: center;
    width: 70%;
    height: 60vh;
    background-color: #38448f;
    border: 2px solid #ccc;
    border-radius: 30px;
    overflow: hidden; /* Asegura que no se salga del contenedor */
}

#world-map {
    width: 100%; /* Ajusta el ancho al 100% del contenedor */
    height: 100%; /* Ajusta el alto al 100% del contenedor */
}

/* Estilo para el side-box */
.side-box {
    width: 250px;
    height: 60vh;
    background-color: #306ba7;
    display: none; /* Inicialmente oculto */
    border-radius: 30px;
}