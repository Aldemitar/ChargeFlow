// JavaScript para la Gestión de Vehículos

document.addEventListener('DOMContentLoaded', function () {
    console.log('Gestión de Vehículos cargado');

    // Inicializar funcionalidades
    initializeSearch();
    initializeActionButtons();
    initializeAddButton();
    initializeLogoutButton();
});

// Función para inicializar la búsqueda
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');

    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        console.log('Buscando:', searchTerm);

        // Filtrar vehículos
        filterVehicles(searchTerm);
    });
}

// Función para filtrar vehículos
function filterVehicles(searchTerm) {
    const tableRows = document.querySelectorAll('.table-row');

    tableRows.forEach(row => {
        const licensePlate = row.cells[0].textContent.toLowerCase();
        const brand = row.cells[1].textContent.toLowerCase();
        const model = row.cells[2].textContent.toLowerCase();
        const client = row.cells[4].textContent.toLowerCase();

        const matchesSearch = licensePlate.includes(searchTerm) ||
            brand.includes(searchTerm) ||
            model.includes(searchTerm) ||
            client.includes(searchTerm);

        if (matchesSearch || searchTerm === '') {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Función para inicializar botones de acción
function initializeActionButtons() {
    const editButtons = document.querySelectorAll('.edit-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');
    const clientLinks = document.querySelectorAll('.client-link');

    // Botones de editar
    editButtons.forEach(button => {
        button.addEventListener('click', function () {
            const row = this.closest('.table-row');
            const licensePlate = row.cells[0].textContent;
            const brand = row.cells[1].textContent;
            const model = row.cells[2].textContent;

            console.log('Editando vehículo:', licensePlate, brand, model);

            // Aquí iría la lógica para editar el vehículo
            openEditModal(licensePlate, brand, model);
        });
    });

    // Botones de eliminar
    deleteButtons.forEach(button => {
        button.addEventListener('click', function () {
            const row = this.closest('.table-row');
            const licensePlate = row.cells[0].textContent;
            const brand = row.cells[1].textContent;
            const model = row.cells[2].textContent;

            if (confirm(`¿Estás seguro de que quieres eliminar el vehículo ${licensePlate} - ${brand} ${model}?`)) {
                console.log('Eliminando vehículo:', licensePlate);

                // Aquí iría la lógica para eliminar el vehículo
                // En una implementación real, harías una petición al servidor
                row.remove();

                // Actualizar contador
                updateVehicleCount();

                // Mostrar mensaje de éxito
                showNotification(`Vehículo ${licensePlate} eliminado correctamente`, 'success');
            }
        });
    });

    // Enlaces de clientes
    clientLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const clientName = this.textContent;
            console.log('Ver detalles del cliente:', clientName);

            // Aquí iría la lógica para ver detalles del cliente
            // Por ejemplo, redirigir a la página de gestión de clientes
            // o abrir un modal con información del cliente
            openClientDetails(clientName);
        });
    });
}

// Función para inicializar botón de añadir vehículo
function initializeAddButton() {
    const addButton = document.querySelector('.add-vehicle-btn');

    addButton.addEventListener('click', function () {
        console.log('Añadir nuevo vehículo');

        // Aquí iría la lógica para abrir un formulario de añadir vehículo
        // Por ejemplo, abrir un modal o redirigir a una página de creación
        openAddVehicleModal();
    });
}

// Función para inicializar botón de cerrar sesión
function initializeLogoutButton() {
    const logoutButton = document.querySelector('.logout-btn');

    logoutButton.addEventListener('click', function () {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            console.log('Cerrando sesión...');

            // Aquí iría la lógica para cerrar sesión
            // Por ejemplo, hacer una petición al servidor y redirigir
            // window.location.href = '/logout';
        }
    });
}

// Función para actualizar contador de vehículos
function updateVehicleCount() {
    const visibleRows = document.querySelectorAll('.table-row[style=""]').length;
    const totalRows = document.querySelectorAll('.table-row').length;
    const paginationInfo = document.querySelector('.pagination-info');

    if (paginationInfo) {
        paginationInfo.textContent = `Mostrando 1-${visibleRows} de ${totalRows} vehículos`;
    }
}

// Función para abrir modal de edición (placeholder)
function openEditModal(licensePlate, brand, model) {
    console.log('Abriendo modal de edición para:', licensePlate, brand, model);
    // En una implementación real, aquí abrirías un modal con el formulario de edición
    // y cargarías los datos del vehículo
}

// Función para abrir modal de añadir vehículo (placeholder)
function openAddVehicleModal() {
    console.log('Abriendo modal para añadir vehículo');
    // En una implementación real, aquí abrirías un modal con el formulario de añadir vehículo
}

// Función para abrir detalles del cliente (placeholder)
function openClientDetails(clientName) {
    console.log('Abriendo detalles del cliente:', clientName);
    // En una implementación real, aquí redirigirías a la página de gestión de clientes
    // o abrirías un modal con información del cliente
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Estilos básicos para la notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;

    // Colores según el tipo
    if (type === 'success') {
        notification.style.backgroundColor = '#10b981';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
    } else {
        notification.style.backgroundColor = '#3b82f6';
    }

    // Añadir al DOM
    document.body.appendChild(notification);

    // Animación de entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Función para alternar modo oscuro (si se implementara)
function toggleDarkMode() {
    document.body.classList.toggle('dark');
    // Guardar preferencia en localStorage
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
}

// Cargar preferencia de modo oscuro al iniciar
const darkModePreference = localStorage.getItem('darkMode');
if (darkModePreference === 'true') {
    document.body.classList.add('dark');
}