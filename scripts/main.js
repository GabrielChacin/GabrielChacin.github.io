// Función para mostrar/ocultar el rectángulo lateral
document.getElementById('toggleBtn').addEventListener('click', function() {
    const sideBox = document.getElementById('sideBox');
    if (sideBox.style.display === 'none' || sideBox.style.display === '') {
        sideBox.style.display = 'block';
    } else {
        sideBox.style.display = 'none';
    }
});

// Ejemplo de función para cargar el mapa mundial (lógica futura)
function loadWorldMap() {
    // Aquí iría la lógica para cargar el mapa con datos del dataset
    console.log("Cargando mapa mundial...");
}

// Cargar el mapa cuando se cargue la página
window.onload = function() {
    loadWorldMap();
}
