// Crear el mapa centrado en el mundo
const map = L.map('map').setView([20, 0], 2);

// Añadir capa de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

console.log('Mapa inicializado');

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

// Modificar la carga de datos
let tsunamiData = [];

// Modificar la carga de datos para asegurar limpieza
fetch('data/tsunamis-2023-09-11_22-13-51_ 0530.csv')
    .then(response => response.text())
    .then(data => {
        const rows = data.split('\n');
        const headers = rows[0].split(',').map(header => header.trim());
        
        tsunamiData = rows.slice(1)
            .filter(row => row.trim() !== '')
            .map(row => {
                const values = row.split(',');
                const obj = {};
                headers.forEach((header, index) => {
                    const cleanHeader = header
                        .replace(/Nan/g, '')
                        .replace(/\r/g, '')
                        .trim();
                    
                    // Limpiar y formatear valores
                    let value = values[index] ? values[index].trim() : '';
                    
                    // Limpiar coordenadas más agresivamente
                    if (cleanHeader === 'Latitude' || cleanHeader === 'Longitude') {
                        value = value.replace(/[^0-9.-]/g, '');
                        if (value === '-' || value === '') {
                            value = '';
                        }
                    }
                    
                    if (value.includes('−')) {
                        value = value.replace('−', '-');
                    }
                    
                    obj[cleanHeader] = value;
                });
                return obj;
            })
            .filter(item => {
                const lat = parseFloat(item.Latitude);
                const lng = parseFloat(item.Longitude);
                return isValidCoordinate(lat, lng);
            });

        console.log('Primeros registros:', tsunamiData.slice(0, 5).map(t => ({
            Year: t.Year,
            Latitude: t.Latitude,
            Longitude: t.Longitude
        })));

        console.log('Total de registros con coordenadas válidas:', tsunamiData.length);
        
        calculateStats(tsunamiData); // Mover aquí
        updateTsunamiMarkers(1,0);
    })
    .catch(error => console.error('Error al cargar los datos de tsunamis:', error));

function calculateStats(data) {
    const totalTsunamis = data.length;
    const totalDeaths = data.reduce((acc, t) => acc + (parseInt(t.TotalDeaths) || 0), 0);
    const totalDamage = data.reduce((acc, t) => acc + (parseFloat(t.TotalDamage) || 0), 0);
    const avgMagnitude = totalTsunamis > 0 ? data.reduce((acc, t) => acc + (parseFloat(t.EarthquakeMagnitude) || 0), 0) / totalTsunamis : 0;
    
    document.getElementById('totalTsunamis').textContent = `Total de Tsunamis: ${totalTsunamis}`;
    document.getElementById('avgMagnitude').textContent = `Magnitud Promedio: ${avgMagnitude.toFixed(2)}`;
    document.getElementById('totalDeaths').textContent = `Total de Muertes: ${totalDeaths}`;
    document.getElementById('totalDamage').textContent = `Daños Totales ($M): ${totalDamage}`;
}

// Ajustar según el rango de años en tu nuevo dataset
const epochs = {
    1: { start: 1900, end: 1925 },
    2: { start: 1926, end: 1950 },
    3: { start: 1951, end: 1975 },
    4: { start: 1976, end: 2000 },
    5: { start: 2001, end: 2023 }
};

function applyFilters() {
    const epochNumber = document.getElementById('epochSelect').value; // Sin espacio
    const minMagnitude = document.getElementById('magnitudeRange').value;
    updateTsunamiMarkers(epochNumber, minMagnitude);
}

function updateTsunamiMarkers(epochNumber, minMagnitude) {
    const { start, end } = epochs[epochNumber];
    console.log(`Actualizando marcadores para época ${epochNumber} (${start}-${end})`);
    
    tsunamiLayer.clearLayers();

    const filteredData = tsunamiData.filter(t => {
        const year = parseInt(t.Year);
        const magnitude = parseFloat(t.EarthquakeMagnitude);
        const lat = parseFloat(t.Latitude);
        const lng = parseFloat(t.Longitude);
        return year >= start && year <= end && 
               magnitude >= minMagnitude &&
               isValidCoordinate(lat, lng);
    });

    console.log(`Tsunamis filtrados para esta época: ${filteredData.length}`);

    let validCount = 0;
    let invalidCount = 0;

    const waterHeights = filteredData.map(t => 
        parseFloat(t.MaximumWaterHeight) || 0
    ).filter(height => !isNaN(height));

    const minHeight = Math.min(...waterHeights, 0);
    const maxHeight = Math.max(...waterHeights, 1);

    // Crear un grupo de marcadores
    const markers = L.markerClusterGroup();

    filteredData.forEach(t => {
        try {
            const lat = parseFloat(t.Latitude);
            const lng = parseFloat(t.Longitude);

            const baseRadius = 3; // Tamaño base del radio
            const waterHeight = parseFloat(t.MaximumWaterHeight) || 0;
            const scaledRadius = baseRadius + (
                waterHeight > 0 
                    ? Math.min(
                        baseRadius * 2, 
                        baseRadius * (waterHeight / maxHeight) * 2
                    )
                    : baseRadius
            );

            const marker = L.circleMarker([lat, lng], {
                color: getColorByMagnitude(t.EarthquakeMagnitude),
                radius: scaledRadius,
                fillOpacity: 0.7,
                fillColor: getColorByMagnitude(t.EarthquakeMagnitude)
            });

            // Agregar el marcador al grupo
            markers.addLayer(marker);

            // Actualizar el popup con la información relevante
            const earthquakeMagnitude = parseFloat(t.EarthquakeMagnitude) || 'No disponible';
            const waterHeightValue = parseFloat(t.MaximumWaterHeight) || 'No disponible';
            const totalDeaths = parseInt(t.TotalDeaths) || 'No disponible';
            const totalDamage = parseFloat(t.TotalDamage) || 'No disponible';

            marker.bindPopup(`
                <h4>${t.LocationName || 'Ubicación desconocida'}</h4>
                <p><strong>Año:</strong> ${t.Year}</p>
                <p><strong>Magnitud del terremoto:</strong> ${earthquakeMagnitude}</p>
                <p><strong>Altura máxima del agua:</strong> ${waterHeightValue} m</p>
                <p><strong>Muertes:</strong> ${totalDeaths}</p>
                <p><strong>Daños ($M):</strong> ${totalDamage}</p>
            `);

            validCount++;
        } catch (error) {
            console.error('Error al crear marcador:', error, t);
            invalidCount++;
        }
    });

    // Agregar el grupo de marcadores al mapa
    tsunamiLayer.addLayer(markers);

    console.log(`Tsunamis válidos: ${validCount}, inválidos: ${invalidCount}`);
    
    updateEpochLegend(epochNumber, start, end, validCount);
}

function updateEpochLegend(epochNumber, startYear, endYear, tsunamiCount) {
    const existingLegend = document.getElementById('epochLegend');
    if (existingLegend) {
        existingLegend.remove();
    }

    const legendContainer = document.createElement('div');
    legendContainer.id = 'epochLegend';
    legendContainer.className = 'legend';
    
    legendContainer.innerHTML = `
        <h4>Época ${epochNumber}</h4>
        <p><strong>Años:</strong> ${startYear} - ${endYear}</p>
        <p><strong>Tsunamis registrados:</strong> ${tsunamiCount}</p>
        <div class="magnitude-legend">
            <h5>Magnitud del terremoto</h5>
            <div>
                <span class="legend-color" style="background-color: ${getColorByMagnitude(5)}"></span> < 6
            </div>
            <div>
                <span class="legend-color" style="background-color: ${getColorByMagnitude(6.5)}"></span> 6 - 7
            </div>
            <div>
                <span class="legend-color" style="background-color: ${getColorByMagnitude(7.5)}"></span> 7 - 8
            </div>
            <div>
                <span class="legend-color" style="background-color: ${getColorByMagnitude(8.5)}"></span> > 8
            </div>
        </div>
    `;

    map.getContainer().appendChild(legendContainer);
}

function getColorByMagnitude(magnitude) {
    magnitude = parseFloat(magnitude);
    if (isNaN(magnitude)) return '#808080'; // gris para magnitud desconocida
    if (magnitude < 6) return '#ffeb3b';     // amarillo
    if (magnitude < 7) return '#ff9800';     // naranja
    if (magnitude < 8) return '#ff5722';     // naranja oscuro
    return '#f44336';                        // rojo
}

function isValidCoordinate(lat, lng) {
    return !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
}

const tsunamiLayer = L.layerGroup().addTo(map);

console.log('Primeros registros:', tsunamiData.slice(0, 5).map(t => ({
    Year: t.Year,
    Latitude: t.Latitude,
    Longitude: t.Longitude
})));