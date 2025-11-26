// JavaScript para la Gestión de Clientes

document.addEventListener('DOMContentLoaded', function() {
    console.log('Gestión de Clientes cargado');
    
    // Inicializar funcionalidades
    initializeSearch();
    initializeActionButtons();
    initializeModal();
    initializeLogoutButton();
});

// --- Búsqueda y Filtro ---

function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    
    // Búsqueda local para UX (la búsqueda real se hace en el servidor al enviar el GET)
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterClients(searchTerm);
    });
}

function filterClients(searchTerm) {
    const tableRows = document.querySelectorAll('.table-row');
    
    tableRows.forEach(row => {
        const clientName = row.cells[0]?.textContent.toLowerCase() || '';
        const clientEmail = row.cells[1]?.textContent.toLowerCase() || '';
        
        const matchesSearch = clientName.includes(searchTerm) || 
                              clientEmail.includes(searchTerm);
        
        row.style.display = (matchesSearch || searchTerm === '') ? '' : 'none';
    });
}

// --- Botones de Acción (Editar) ---

function initializeActionButtons() {
    const tableBody = document.querySelector('.clients-table tbody');

    // Usamos delegación de eventos
    tableBody.addEventListener('click', async function(event) {
        const target = event.target.closest('.action-btn');
        if (!target) return;
        
        const clienteId = target.dataset.id;

        if (target.classList.contains('edit-btn')) {
            await openClientModal('edit', clienteId);
        } 
        // La lógica de Eliminar (delete-btn) la maneja ahora el formulario HTML directamente.
    });
}

// --- Modal y Formulario (Crear/Editar) ---

function initializeModal() {
    const addClientBtn = document.getElementById('addClientBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const clientModal = document.getElementById('clientModal');
    
    // Abrir modal en modo CREAR
    addClientBtn.addEventListener('click', function() {
        openClientModal('create');
    });
    
    // Cerrar modal
    function closeModal() {
        modalOverlay.classList.remove('active');
        clientModal.classList.remove('active');
        resetClientForm(); // Limpiar y resetear al modo CREAR
    }
    
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    initializeModalTabs();
}

/**
 * Abre el modal y configura el formulario para crear o editar.
 * @param {string} mode 'create' o 'edit'
 * @param {string|null} clienteId ID del cliente si el modo es 'edit'
 */
async function openClientModal(mode, clienteId = null) {
    const modalOverlay = document.getElementById('modalOverlay');
    const clientModal = document.getElementById('clientModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('clientForm');
    
    resetClientForm(); 
    
    if (mode === 'create') {
        modalTitle.textContent = 'Nuevo Cliente';
        // Ya está configurado por defecto para POST a /tecnico/clientes

    } else if (mode === 'edit' && clienteId) {
        modalTitle.textContent = 'Editar Cliente';
        document.getElementById('passwordGroup').style.display = 'none'; // Ocultar contraseña
        document.getElementById('contraseña').removeAttribute('required'); // No requerir contraseña en edición
        
        // Configurar para simular PUT
        form.action = `/tecnico/clientes/${clienteId}`;
        // 👈 CAMBIO CLAVE: Inyectar name="method"
        document.getElementById('methodFields').innerHTML = '<input type="hidden" name="method" value="PUT">';
        
        // ** [LÓGICA DE FETCH REQUERIDA] **
        try {
            // Reemplaza esto con tu endpoint GET real para cargar datos por ID
            const response = await fetch(`/tecnico/clientes/${clienteId}`);
            if (!response.ok) throw new Error('Error al cargar datos');
            const clienteData = await response.json();
            
            fillClientForm(clienteData);
            
        } catch (error) {
            console.error("Error al cargar datos del cliente:", error);
            showNotification('Error al cargar datos del cliente.', 'error');
            return;
        }
    }
    
    modalOverlay.classList.add('active');
    clientModal.classList.add('active');
}

/**
 * Rellena los campos del formulario con los datos del cliente.
 * @param {Object} data Datos del cliente.
 */
function fillClientForm(data) {
    document.getElementById('nombre').value = data.nombre || '';
    document.getElementById('apellido').value = data.apellido || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('telefono').value = data.telefono || '';
    document.getElementById('direccion').value = data.direccion || '';
    // No cargar la contraseña.
}

/**
 * Restablece el formulario al modo de creación.
 */
function resetClientForm() {
    const form = document.getElementById('clientForm');
    const modalTitle = document.getElementById('modalTitle');
    
    form.reset();
    
    // Restaurar a la configuración de creación
    document.getElementById('methodFields').innerHTML = '';
    form.action = "/tecnico/clientes";
    
    // Restaurar la visibilidad y requisito del campo contraseña
    document.getElementById('passwordGroup').style.display = '';
    document.getElementById('contraseña').setAttribute('required', 'required');
    
    modalTitle.textContent = 'Nuevo Cliente';

    // Restablecer tabs
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.modal-tab[data-tab="info"]').classList.add('active');
}

function initializeModalTabs() {
    const modalTabs = document.querySelectorAll('.modal-tab');
    
    modalTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            modalTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const tabName = this.dataset.tab;
            console.log('Tab seleccionado:', tabName);
        });
    });
}

function initializeLogoutButton() {
    const logoutButton = document.querySelector('.logout-btn');
    
    logoutButton.addEventListener('click', function(e) {
        if (!confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            e.preventDefault();
        } else {
            console.log('Cerrando sesión...');
        }
    });
}

// ... (El código de showNotification se mantiene, omitido por brevedad) ...
// ... (El código de toggleDarkMode se mantiene, omitido por brevedad) ...