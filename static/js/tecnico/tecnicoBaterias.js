// JavaScript para la Gestión de Inventario de Baterías

document.addEventListener('DOMContentLoaded', function () {
    console.log('Gestión de Inventario de Baterías cargado');

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

        // Filtrar baterías
        filterBatteries(searchTerm);
    });
}

// Función para filtrar baterías
function filterBatteries(searchTerm) {
    const tableRows = document.querySelectorAll('.table-row');

    tableRows.forEach(row => {
        const batteryId = row.cells[0].textContent.toLowerCase();
        const batteryType = row.cells[1].textContent.toLowerCase();
        const vehicle = row.cells[4].textContent.toLowerCase();

        const matchesSearch = batteryId.includes(searchTerm) ||
            batteryType.includes(searchTerm) ||
            vehicle.includes(searchTerm);

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

    // Botones de editar
    editButtons.forEach(button => {
        button.addEventListener('click', function () {
            const row = this.closest('.table-row');
            const batteryId = row.cells[0].textContent;
            console.log('Editando batería:', batteryId);

            // Aquí iría la lógica para editar la batería
            // Por ejemplo, abrir un modal de edición
            openEditModal(batteryId);
        });
    });

    // Botones de eliminar
    deleteButtons.forEach(button => {
        button.addEventListener('click', function () {
            const row = this.closest('.table-row');
            const batteryId = row.cells[0].textContent;

            if (confirm(`¿Estás seguro de que quieres eliminar la batería ${batteryId}?`)) {
                console.log('Eliminando batería:', batteryId);

                // Aquí iría la lógica para eliminar la batería
                // En una implementación real, harías una petición al servidor
                row.remove();

                // Mostrar mensaje de éxito
                showNotification(`Batería ${batteryId} eliminada correctamente`, 'success');
            }
        });
    });
}

// Función para inicializar botón de añadir batería
function initializeAddButton() {
    const addButton = document.querySelector('.add-battery-btn');

    addButton.addEventListener('click', function () {
        console.log('Añadir nueva batería');

        // Aquí iría la lógica para abrir un formulario de añadir batería
        // Por ejemplo, abrir un modal o redirigir a una página de creación
        openAddBatteryModal();
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

// Función para abrir modal de edición (placeholder)
function openEditModal(batteryId) {
    console.log('Abriendo modal de edición para:', batteryId);
    // En una implementación real, aquí abrirías un modal con el formulario de edición
    // y cargarías los datos de la batería
}

// Función para abrir modal de añadir batería (placeholder)
function openAddBatteryModal() {
    console.log('Abriendo modal para añadir batería');
    // En una implementación real, aquí abrirías un modal con el formulario de añadir batería
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