async function main() {
    try {
        // Obtener el archivo SVG
        const response = await fetch('assets/countries.svg');
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);

        const svgContent = await response.text();

        // Verificar si el contenedor existe
        const mapContainer = document.querySelector('.map-container');
        if (!mapContainer) throw new Error('No se encontró el contenedor del mapa');

        // Insertar el contenido del SVG en el contenedor
        mapContainer.innerHTML = svgContent;

        // Asignar ID al SVG
        const svgElement = mapContainer.children[0];
        if (svgElement) {
            svgElement.setAttribute('id', 'world-map');
        } else {
            throw new Error('No se encontró el SVG dentro del contenedor');
        }
    } catch (error) {
        console.error('Error al cargar el mapa:', error);
    }
}

main();
