// JavaScript para la Gestión de Citas

document.addEventListener('DOMContentLoaded', function () {
    console.log('Gestión de Citas cargado');

    // Inicializar filtros
    initializeFilters();

    // Inicializar botones de acción
    initializeActionButtons();

    // Inicializar botón de crear cita
    initializeCreateButton();

    // Inicializar botón de cerrar sesión
    initializeLogoutButton();
});

// Función para inicializar los filtros
function initializeFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const searchInput = document.querySelector('.search-input');

    // Manejar cambio de filtros
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // Remover clase active de todos los tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            // Agregar clase active al tab clickeado
            this.classList.add('active');

            const filterValue = this.querySelector('.tab-input').value;
            console.log('Filtro seleccionado:', filterValue);

            // Aquí iría la lógica para filtrar las citas
            filterAppointments(filterValue, searchInput.value);
        });
    });

    // Manejar búsqueda
    searchInput.addEventListener('input', function () {
        const activeFilter = document.querySelector('.filter-tab.active .tab-input').value;
        console.log('Búsqueda:', this.value);

        // Aquí iría la lógica para filtrar las citas
        filterAppointments(activeFilter, this.value);
    });
}

// Función para filtrar citas (placeholder)
function filterAppointments(statusFilter, searchTerm) {
    console.log('Filtrando citas - Estado:', statusFilter, 'Búsqueda:', searchTerm);
    // En una implementación real, aquí se filtrarían las citas de la tabla
}

// Función para inicializar botones de acción
function initializeActionButtons() {
    const viewButtons = document.querySelectorAll('.action-btn .action-icon:not(.delete)');
    const deleteButtons = document.querySelectorAll('.action-btn .action-icon.delete');

    // Botones de ver
    viewButtons.forEach(button => {
        button.closest('.action-btn').addEventListener('click', function () {
            const row = this.closest('.table-row');
            const clientName = row.querySelector('.table-cell:nth-child(2)').textContent;
            console.log('Ver detalles de cita para:', clientName);
            // Aquí iría la lógica para mostrar detalles de la cita
        });
    });

    // Botones de eliminar
    deleteButtons.forEach(button => {
        button.closest('.action-btn').addEventListener('click', function () {
            const row = this.closest('.table-row');
            const clientName = row.querySelector('.table-cell:nth-child(2)').textContent;

            if (confirm(`¿Estás seguro de que quieres eliminar la cita de ${clientName}?`)) {
                console.log('Eliminando cita para:', clientName);
                // Aquí iría la lógica para eliminar la cita
                // row.remove(); // Esto eliminaría la fila de la tabla
            }
        });
    });
}

// Función para inicializar botón de crear cita
function initializeCreateButton() {
    const createButton = document.querySelector('.create-appointment-btn');

    createButton.addEventListener('click', function () {
        console.log('Crear nueva cita');
        // Aquí iría la lógica para abrir un modal o redirigir a un formulario de creación de cita
        // window.location.href = '/crear-cita';
    });
}

// Función para inicializar botón de cerrar sesión
function initializeLogoutButton() {
    const logoutButton = document.querySelector('.logout-btn');

    logoutButton.addEventListener('click', function () {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            console.log('Cerrando sesión...');
            // Aquí iría la lógica para cerrar sesión
            // window.location.href = '/logout';
        }
    });
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