// Funcionalidad para el Dashboard

document.addEventListener('DOMContentLoaded', function () {
    // Inicializar tema (claro/oscuro)
    initTheme();

    // Configurar eventos de botones
    setupButtons();

    // Inicializar gráficos
    initCharts();
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
}

// Inicializar gráficos
function initCharts() {
    // Gráfico de Ingresos Totales
    const ingresosChart = document.getElementById('ingresosChart');
    if (ingresosChart) {
        new Chart(ingresosChart, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Ingresos',
                    data: [1200000, 1350000, 1450000, 1650000, 1850000, 2345678],
                    borderColor: '#39e079',
                    backgroundColor: 'rgba(57, 224, 121, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return '$' + (value / 1000000).toFixed(1) + 'M';
                            }
                        }
                    }
                }
            }
        });
    }

    // Gráfico de Margen de Beneficio
    const margenChart = document.getElementById('margenChart');
    if (margenChart) {
        new Chart(margenChart, {
            type: 'doughnut',
            data: {
                labels: ['Beneficio', 'Costos'],
                datasets: [{
                    data: [35, 65],
                    backgroundColor: [
                        '#39e079',
                        '#f6f8f7'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Gráfico de Tendencia Mensual
    const mensualesChart = document.getElementById('mensualesChart');
    if (mensualesChart) {
        new Chart(mensualesChart, {
            type: 'bar',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                datasets: [{
                    label: 'Ingresos Mensuales',
                    data: [195000, 210000, 230000, 245000, 260000, 280000, 295000, 310000, 325000, 340000, 355000, 370000],
                    backgroundColor: '#39e079',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return '$' + (value / 1000).toFixed(0) + 'K';
                            }
                        }
                    }
                }
            }
        });
    }
}

// Función para actualizar datos en tiempo real (simulación)
function updateDashboardData() {
    // Aquí iría la lógica para actualizar los datos del dashboard
    console.log('Actualizando datos del dashboard...');
}

// Función para exportar reporte
function exportReport() {
    // Aquí iría la lógica para exportar el reporte
    console.log('Exportando reporte...');
    alert('Funcionalidad de exportación en desarrollo');
}