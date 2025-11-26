// JavaScript para la Gestión de Vehículos (tecnicoVehiculos.js)

document.addEventListener('DOMContentLoaded', function () {
    console.log('Gestión de Vehículos cargado');

    // Inicializar funcionalidades
    initializeSearch();
    initializeActionButtons();
    initializeAddButton(); // Inicializa el botón de Añadir Vehículo
    initializeLogoutButton();
});

// --- Funcionalidad de Búsqueda (Filtro por JS en el lado del cliente) ---
// NOTA: Para una búsqueda real que funcione con la paginación de FastAPI,
// la búsqueda debe hacerse mediante el formulario HTML (re-envío al servidor).
// Esta función de JS solo filtra los resultados ya cargados en la página actual.
function initializeSearch() {
    // Usamos el input de búsqueda que no tiene un manejador de submit directo,
    // por lo que el filtrado por JS es un buen fallback/complemento.
    const searchInput = document.querySelector('.search-input');

    // Si se está usando el filtro del lado del servidor (FastAPI), este evento
    // puede interferir, ya que el reenvío del formulario es la forma correcta.
    // Si la búsqueda se gestiona por el backend, este bloque se puede comentar
    // o modificar para hacer un submit directo al cambiar el valor.
    searchInput.addEventListener('input', function (event) {
        // Para que funcione con el endpoint de FastAPI, el evento debería
        // mandar el formulario: event.target.closest('form').submit();
        // Sin embargo, mantendremos el filtro JS local por si es necesario.

        const searchTerm = this.value.toLowerCase();
        console.log('Buscando en página actual:', searchTerm);

        // Filtrar vehículos en la tabla actual
        filterVehicles(searchTerm);
    });
}

// Función para filtrar vehículos por ID, Marca, Modelo o Cliente Asociado
function filterVehicles(searchTerm) {
    // Excluye la fila de "No hay vehículos"
    const tableRows = document.querySelectorAll('.table-body .table-row:not(:last-child)'); 

    tableRows.forEach(row => {
        // Indices de las celdas en el HTML de vehículos:
        // ID: 0, Marca: 1, Modelo: 2, Año: 3, Cliente Asociado: 4, Estado: 5, Acciones: 6
        const vehicleId = row.cells[0]?.textContent.toLowerCase() || '';
        const vehicleBrand = row.cells[1]?.textContent.toLowerCase() || '';
        const vehicleModel = row.cells[2]?.textContent.toLowerCase() || '';
        const client = row.cells[4]?.textContent.toLowerCase() || '';

        const matchesSearch = vehicleId.includes(searchTerm) ||
            vehicleBrand.includes(searchTerm) ||
            vehicleModel.includes(searchTerm) ||
            client.includes(searchTerm);

        // Muestra u oculta la fila según si coincide con el término de búsqueda
        if (matchesSearch || searchTerm === '') {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// --- Funcionalidad de Botones de Acción (Editar/Eliminar) ---
function initializeActionButtons() {
    const editButtons = document.querySelectorAll('.edit-btn');
    
    // Botones de editar
    editButtons.forEach(button => {
        button.addEventListener('click', function () {
            const vehicleId = this.dataset.id; // Asume que el ID está en el data-id del botón
            
            console.log('Editando vehículo:', vehicleId);

            // Aquí iría la lógica para editar el vehículo
            openEditModal(vehicleId);
        });
    });

    // NOTA: El botón de eliminar ya está envuelto en un <form> con un
    // 'onsubmit' de confirmación en el HTML, lo cual es la forma recomendada
    // para manejar peticiones POST/DELETE en templates Jinja/Flask/FastAPI.
    // Por lo tanto, no se necesita un manejador de evento 'click' adicional para la eliminación aquí.
}

// --- Botón de Añadir Vehículo ---
function initializeAddButton() {
    // El HTML usa id="addVehicleBtn"
    const addButton = document.getElementById('addVehicleBtn'); 

    if (addButton) {
        addButton.addEventListener('click', function () {
            console.log('Añadir nuevo vehículo');

            // Aquí iría la lógica para abrir un formulario de añadir vehículo
            openAddVehicleModal();
        });
    }
}

// --- Botón de Cerrar Sesión ---
function initializeLogoutButton() {
    const logoutButton = document.querySelector('.logout-btn');

    logoutButton.addEventListener('click', function (event) {
        // En este caso, el HTML ya tiene el <form> apuntando a /login/logout
        // Este if/confirm evitaría el submit del form
        // if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        //     console.log('Cerrando sesión...');
        //     // El formulario se enviará
        // } else {
        //     event.preventDefault(); // Previene el envío si se cancela
        // }
        // Se deja el comportamiento por defecto del HTML (envío de form)
        console.log('Cerrando sesión...');
    });
}

// --- Funciones de Modal/Notificación (Placeholders) ---

// Función para abrir modal de edición (placeholder)
function openEditModal(vehicleId) {
    console.log('Abriendo modal de edición para vehículo ID:', vehicleId);
    // En una implementación real, aquí abrirías un modal con el formulario de edición
    // y cargarías los datos del vehículo haciendo una petición GET a /api/v1/tecnico/vehiculos/{vehicleId}
}

// Función para abrir modal de añadir vehículo (placeholder)
function openAddVehicleModal() {
    console.log('Abriendo modal para añadir vehículo');
    // En una implementación real, aquí abrirías un modal con el formulario de añadir vehículo
}

// Función para mostrar notificaciones (Mantenida del original)
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