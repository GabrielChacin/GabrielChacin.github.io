// scripts/main.js

// Crear el mapa centrado en el mundo
const map = L.map('map').setView([20, 0], 2);

// Cargar el archivo GeoJSON de países
fetch('assets/countries.geo.json')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            style: {
                color: '#3388ff',
                weight: 1,
                fillOpacity: 0.5
            }
        }).addTo(map);
    })
    .catch(error => console.error('Error al cargar el archivo GeoJSON:', error));

// Variable para almacenar los datos de tsunamis
let tsunamiData = [];

// Cargar los datos de tsunamis desde el archivo JSON
fetch('data/strongest_tsunamis.json')
    .then(response => response.json())
    .then(data => {
        tsunamiData = data;
        // Mostrar inicialmente los tsunamis de la primera época
        updateTsunamiMarkers(1);
    })
    .catch(error => console.error('Error al cargar los datos de tsunamis:', error));

// Mapeo de épocas a rangos de años
const epochs = {
    1: { start: -1350, end: -680 }, // 1350 a.C. - 680 d.C.
    2: { start: -680, end: -10 },   // 680 a.C. - 10 d.C.
    3: { start: -10, end: 660 },    // 10 d.C. - 660 d.C.
    4: { start: 660, end: 1330 },   // 660 d.C. - 1330 d.C.
    5: { start: 1330, end: 2000 }   // 1330 d.C. - 2000 d.C.
};

// Función para actualizar la visualización de la época
function updateEpochDisplay(value) {
    const epoch = epochs[value];
    document.getElementById('epochDisplay').textContent = `Época ${value} (${epoch.start} a ${epoch.end})`;
    updateTsunamiMarkers(value);
}

// Función para actualizar los marcadores de tsunamis según la época
function updateTsunamiMarkers(epochNumber) {
    // Obtener el rango de años para la época seleccionada
    const { start, end } = epochs[epochNumber];

    // Limpiar los marcadores anteriores
    tsunamiLayer.clearLayers();

    // Filtrar y agregar los tsunamis que coincidan con el rango de la época
    tsunamiData
        .filter(t => t.YEAR >= start && t.YEAR <= end)
        .forEach(t => {
            const marker = L.circleMarker([t.LATITUDE, t.LONGITUDE], {
                color: 'red',
                radius: t.TS_INTENSITY, // Ajusta el radio según la intensidad
                fillOpacity: 0.7
            }).addTo(tsunamiLayer);

            // Agrega un evento para mostrar detalles al hacer clic
            marker.on('click', () => {
                document.getElementById('details').innerHTML = `
                    <h4>${t.LOCATION_NAME}</h4>
                    <p><strong>Año:</strong> ${t.YEAR}</p>
                    <p><strong>Intensidad:</strong> ${t.TS_INTENSITY}</p>
                    <p><strong>Descripción de Daños:</strong> ${t.DAMAGE_TOTAL_DESCRIPTION}</p>
                    <p>${t.COMMENTS}</p>
                `;
            });
        });
}

// Crea una capa de grupo para los marcadores de tsunamis
const tsunamiLayer = L.layerGroup().addTo(map);
