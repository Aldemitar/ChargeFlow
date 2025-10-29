// JavaScript para el Dashboard de Operaciones

document.addEventListener('DOMContentLoaded', function () {
    console.log('Dashboard de Operaciones cargado');

    // Aquí puedes agregar cualquier funcionalidad JavaScript que necesites
    // Por ejemplo: interacciones con las tarjetas, actualizaciones en tiempo real, etc.

    // Ejemplo: Agregar funcionalidad de arrastrar a las tareas
    const taskItems = document.querySelectorAll('.task-item');

    taskItems.forEach(item => {
        item.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text/plain', this.id);
            this.classList.add('dragging');
        });

        item.addEventListener('dragend', function () {
            this.classList.remove('dragging');
        });
    });

    // Ejemplo: Funcionalidad del botón de cerrar sesión
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                // Aquí iría la lógica para cerrar sesión
                console.log('Cerrando sesión...');
                // window.location.href = '/logout';
            }
        });
    }

    // Ejemplo: Alternar modo oscuro/claro (si se implementara)
    const toggleDarkMode = () => {
        document.body.classList.toggle('dark');
        // Guardar preferencia en localStorage
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('darkMode', isDark);
    };

    // Cargar preferencia de modo oscuro
    const darkModePreference = localStorage.getItem('darkMode');
    if (darkModePreference === 'true') {
        document.body.classList.add('dark');
    }
});