// Funcionalidad para el perfil de técnico

document.addEventListener('DOMContentLoaded', function () {
    // Inicializar tema (claro/oscuro)
    initTheme();

    // Configurar eventos de botones
    setupButtons();

    // Configurar filtros de tabla
    setupFilters();
});

// Inicializar tema
function initTheme() {
    // Comprobar si hay una preferencia guardada
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Alternar tema
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Alternar entre tema claro y oscuro
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Configurar eventos de botones
function setupButtons() {
    // Botón de cerrar sesión
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                // Aquí iría la lógica para cerrar sesión
                console.log('Cerrando sesión...');
                // Redireccionar al login
                window.location.href = '../../login.html';
            }
        });
    }

    // Botón de editar perfil
    const editBtn = document.querySelector('.btn-primary');
    if (editBtn) {
        editBtn.addEventListener('click', function () {
            // Aquí iría la lógica para editar el perfil
            console.log('Editando perfil...');
            alert('Funcionalidad de edición en desarrollo');
        });
    }

    // Botón de desactivar técnico
    const deactivateBtn = document.querySelector('.btn-warning');
    if (deactivateBtn) {
        deactivateBtn.addEventListener('click', function () {
            if (confirm('¿Estás seguro de que deseas desactivar este técnico?')) {
                // Aquí iría la lógica para desactivar el técnico
                console.log('Desactivando técnico...');

                // Cambiar estado visual
                const statusElement = document.querySelector('.status');
                if (statusElement) {
                    statusElement.textContent = 'Inactivo';
                    statusElement.classList.remove('active');
                    statusElement.classList.add('inactive');

                    // Actualizar texto del botón
                    deactivateBtn.innerHTML = '<span class="material-icons">power_settings_new</span><span>Activar</span>';
                    deactivateBtn.classList.remove('btn-warning');
                    deactivateBtn.classList.add('btn-success');
                }
            }
        });
    }

    // Botón de eliminar técnico
    const deleteBtn = document.querySelector('.btn-danger');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function () {
            if (confirm('¿Estás seguro de que deseas eliminar este técnico? Esta acción no se puede deshacer.')) {
                // Aquí iría la lógica para eliminar el técnico
                console.log('Eliminando técnico...');
                alert('Técnico eliminado (simulación)');

                // Redireccionar a la lista de técnicos
                window.location.href = '../admin/tecnicoAdmin.html';
            }
        });
    }
}

// Configurar filtros de tabla
function setupFilters() {
    const filterBtn = document.querySelector('.filter-btn');
    const searchInput = document.querySelector('.search-input');
    const statusSelect = document.querySelector('.status-select');
    const dateInput = document.querySelector('.date-input');

    if (filterBtn) {
        filterBtn.addEventListener('click', function () {
            applyFilters();
        });
    }

    // Aplicar filtros al presionar Enter en el campo de búsqueda
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    }
}

// Aplicar filtros a la tabla
function applyFilters() {
    const searchInput = document.querySelector('.search-input');
    const statusSelect = document.querySelector('.status-select');
    const dateInput = document.querySelector('.date-input');

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const statusFilter = statusSelect ? statusSelect.value : 'Todos los estados';
    const dateFilter = dateInput ? dateInput.value : '';

    const tableRows = document.querySelectorAll('.appointments-table tbody tr');

    tableRows.forEach(row => {
        let showRow = true;

        // Filtrar por término de búsqueda (ID o Cliente)
        if (searchTerm) {
            const id = row.cells[0].textContent.toLowerCase();
            const client = row.cells[1].textContent.toLowerCase();

            if (!id.includes(searchTerm) && !client.includes(searchTerm)) {
                showRow = false;
            }
        }

        // Filtrar por estado
        if (statusFilter !== 'Todos los estados') {
            const status = row.cells[3].textContent;
            if (status !== statusFilter) {
                showRow = false;
            }
        }

        // Filtrar por fecha
        if (dateFilter) {
            const date = row.cells[2].textContent;
            if (date !== dateFilter) {
                showRow = false;
            }
        }

        // Mostrar u ocultar fila según los filtros
        row.style.display = showRow ? '' : 'none';
    });

    // Mostrar mensaje si no hay resultados
    const visibleRows = Array.from(tableRows).filter(row => row.style.display !== 'none');
    if (visibleRows.length === 0) {
        showNoResultsMessage();
    } else {
        removeNoResultsMessage();
    }
}

// Mostrar mensaje cuando no hay resultados
function showNoResultsMessage() {
    removeNoResultsMessage();

    const tableBody = document.querySelector('.appointments-table tbody');
    const messageRow = document.createElement('tr');
    messageRow.innerHTML = `
        <td colspan="5" class="text-center py-4 text-gray-500">
            No se encontraron citas que coincidan con los filtros aplicados.
        </td>
    `;
    tableBody.appendChild(messageRow);
}

// Eliminar mensaje de no resultados
function removeNoResultsMessage() {
    const existingMessage = document.querySelector('.appointments-table tbody tr td[colspan="5"]');
    if (existingMessage) {
        existingMessage.parentElement.remove();
    }
}

// Función para exportar datos (podría usarse para exportar el historial de citas)
function exportAppointments() {
    // Aquí iría la lógica para exportar los datos de las citas
    console.log('Exportando datos de citas...');
    alert('Funcionalidad de exportación en desarrollo');
}

// Función para imprimir el perfil
function printProfile() {
    window.print();
}