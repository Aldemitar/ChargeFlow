// JavaScript para la Gestión de Clientes

document.addEventListener('DOMContentLoaded', function() {
    console.log('Gestión de Clientes cargado');
    
    // Inicializar funcionalidades
    initializeSearch();
    initializeActionButtons();
    initializeModal();
    initializeLogoutButton();
});

// Función para inicializar la búsqueda
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        console.log('Buscando:', searchTerm);
        
        // Filtrar clientes
        filterClients(searchTerm);
    });
}

// Función para filtrar clientes
function filterClients(searchTerm) {
    const tableRows = document.querySelectorAll('.table-row');
    
    tableRows.forEach(row => {
        const clientName = row.cells[0].textContent.toLowerCase();
        const clientEmail = row.cells[1].textContent.toLowerCase();
        
        const matchesSearch = clientName.includes(searchTerm) || 
                            clientEmail.includes(searchTerm);
        
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
    const viewButtons = document.querySelectorAll('.view-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');
    
    // Botones de editar
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('.table-row');
            const clientName = row.cells[0].textContent;
            console.log('Editando cliente:', clientName);
            
            // Aquí iría la lógica para editar el cliente
            openEditModal(clientName);
        });
    });
    
    // Botones de ver
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('.table-row');
            const clientName = row.cells[0].textContent;
            console.log('Viendo detalles de:', clientName);
            
            // Aquí iría la lógica para ver detalles del cliente
            openClientDetails(clientName);
        });
    });
    
    // Botones de eliminar
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('.table-row');
            const clientName = row.cells[0].textContent;
            
            if (confirm(`¿Estás seguro de que quieres eliminar al cliente ${clientName}?`)) {
                console.log('Eliminando cliente:', clientName);
                
                // Aquí iría la lógica para eliminar el cliente
                // En una implementación real, harías una petición al servidor
                row.remove();
                
                // Mostrar mensaje de éxito
                showNotification(`Cliente ${clientName} eliminado correctamente`, 'success');
            }
        });
    });
}

// Función para inicializar el modal
function initializeModal() {
    const addClientBtn = document.getElementById('addClientBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const clientModal = document.getElementById('clientModal');
    
    // Abrir modal
    addClientBtn.addEventListener('click', function() {
        modalOverlay.classList.add('active');
        clientModal.classList.add('active');
    });
    
    // Cerrar modal
    function closeModal() {
        modalOverlay.classList.remove('active');
        clientModal.classList.remove('active');
    }
    
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
    // Inicializar tabs del modal
    initializeModalTabs();
}

// Función para inicializar tabs del modal
function initializeModalTabs() {
    const modalTabs = document.querySelectorAll('.modal-tab');
    
    modalTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remover clase active de todos los tabs
            modalTabs.forEach(t => t.classList.remove('active'));
            // Agregar clase active al tab clickeado
            this.classList.add('active');
            
            // Aquí iría la lógica para cambiar el contenido del modal según el tab
            const tabText = this.querySelector('span:last-child').textContent;
            console.log('Tab seleccionado:', tabText);
        });
    });
}

// Función para inicializar botón de cerrar sesión
function initializeLogoutButton() {
    const logoutButton = document.querySelector('.logout-btn');
    
    logoutButton.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            console.log('Cerrando sesión...');
            
            // Aquí iría la lógica para cerrar sesión
            // Por ejemplo, hacer una petición al servidor y redirigir
            // window.location.href = '/logout';
        }
    });
}

// Función para abrir modal de edición (placeholder)
function openEditModal(clientName) {
    console.log('Abriendo modal de edición para:', clientName);
    // En una implementación real, aquí abrirías el modal con los datos del cliente cargados
    const modalOverlay = document.getElementById('modalOverlay');
    const clientModal = document.getElementById('clientModal');
    
    modalOverlay.classList.add('active');
    clientModal.classList.add('active');
    
    // Cambiar título del modal
    const modalTitle = document.querySelector('.modal-title');
    modalTitle.textContent = `Editar Cliente: ${clientName}`;
}

// Función para abrir detalles del cliente (placeholder)
function openClientDetails(clientName) {
    console.log('Abriendo detalles de:', clientName);
    // En una implementación real, aquí redirigirías a una página de detalles
    // o abrirías un modal con más información del cliente
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