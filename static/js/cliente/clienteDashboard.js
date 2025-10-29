document.addEventListener('DOMContentLoaded', function () {
    // Dropdown functionality
    const avatarButton = document.getElementById('avatar-button');
    const avatarDropdown = document.getElementById('avatar-dropdown');

    if (avatarButton && avatarDropdown) {
        avatarButton.addEventListener('click', function (event) {
            avatarDropdown.classList.toggle('active');
            event.stopPropagation();
        });

        document.addEventListener('click', function (event) {
            if (!avatarButton.contains(event.target) && !avatarDropdown.contains(event.target)) {
                avatarDropdown.classList.remove('active');
            }
        });
    }

    // Sample data for appointments
    const appointmentsData = [
        {
            id: 1,
            month: 'DIC',
            day: '15',
            title: 'Revisión de Batería',
            time: '10:00 AM - Técnico: Carlos R.',
            price: '$150.00',
            status: 'confirmed'
        },
        {
            id: 2,
            month: 'DIC',
            day: '28',
            title: 'Mantenimiento General',
            time: '2:30 PM - Técnico: Ana G.',
            price: '$250.00',
            status: 'in-progress'
        },
        {
            id: 3,
            month: 'ENE',
            day: '10',
            title: 'Revisión de Neumáticos',
            time: '9:00 AM - Técnico: Marta S.',
            price: '$80.00',
            status: 'pending'
        }
    ];

    // Sample data for history
    const historyData = [
        {
            id: 1,
            month: 'NOV',
            day: '05',
            title: 'Reemplazo de Frenos',
            time: '03:00 PM - Técnico: Luis M.',
            price: '$300.00',
            status: 'completed'
        },
        {
            id: 2,
            month: 'OCT',
            day: '12',
            title: 'Diagnóstico Eléctrico',
            time: '11:00 AM - Técnico: Elena P.',
            price: '$100.00',
            status: 'completed'
        }
    ];

    // Function to render appointments
    function renderAppointments() {
        const appointmentsList = document.getElementById('appointments-list');
        if (!appointmentsList) return;

        appointmentsList.innerHTML = appointmentsData.map(appointment => `
            <li class="appointment-item" data-id="${appointment.id}">
                <div class="appointment-content">
                    <div class="date-badge">
                        <span class="date-month">${appointment.month}</span>
                        <span class="date-day">${appointment.day}</span>
                    </div>
                    <div class="appointment-details">
                        <p class="appointment-title">${appointment.title}</p>
                        <p class="appointment-time">${appointment.time}</p>
                    </div>
                </div>
                <div class="appointment-info">
                    <p class="appointment-price">${appointment.price}</p>
                    <span class="status-badge status-${appointment.status}">
                        ${getStatusText(appointment.status)}
                    </span>
                </div>
            </li>
        `).join('');
    }

    // Function to render history
    function renderHistory() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        historyList.innerHTML = historyData.map(history => `
            <li class="history-item" data-id="${history.id}">
                <div class="history-content">
                    <div class="date-badge">
                        <span class="date-month">${history.month}</span>
                        <span class="date-day">${history.day}</span>
                    </div>
                    <div class="history-details">
                        <p class="history-title">${history.title}</p>
                        <p class="history-time">${history.time}</p>
                    </div>
                </div>
                <div class="history-info">
                    <p class="history-price">${history.price}</p>
                    <span class="status-badge status-${history.status}">
                        ${getStatusText(history.status)}
                    </span>
                </div>
            </li>
        `).join('');
    }

    // Helper function to get status text
    function getStatusText(status) {
        const statusMap = {
            'confirmed': 'Confirmada',
            'in-progress': 'En Progreso',
            'pending': 'Pendiente',
            'completed': 'Completada'
        };
        return statusMap[status] || status;
    }

    // Vehicle card interactions
    function setupVehicleInteractions() {
        const vehicleCards = document.querySelectorAll('.vehicle-card');
        const addVehicleCard = document.querySelector('.add-vehicle-card');
        const viewAllCard = document.querySelector('.view-all-card');

        vehicleCards.forEach(card => {
            const button = card.querySelector('.primary-button');
            if (button) {
                button.addEventListener('click', function () {
                    const vehicleName = card.querySelector('.vehicle-name')?.textContent || 'Vehículo';
                    alert(`Mostrando detalles del: ${vehicleName}`);
                });
            }
        });

        // Add vehicle card
        if (addVehicleCard) {
            addVehicleCard.addEventListener('click', function () {
                alert('Funcionalidad: Agregar nuevo vehículo');
            });
        }

        // View all vehicles card
        if (viewAllCard) {
            viewAllCard.addEventListener('click', function () {
                alert('Funcionalidad: Ver todos los vehículos');
            });
        }
    }

    // View all history button
    const viewAllHistoryBtn = document.getElementById('view-all-history');
    if (viewAllHistoryBtn) {
        viewAllHistoryBtn.addEventListener('click', function () {
            alert('Funcionalidad: Ver todo el historial de citas');
        });
    }

    // Appointment interactions
    function setupAppointmentInteractions() {
        document.addEventListener('click', function (e) {
            const appointmentItem = e.target.closest('.appointment-item');
            if (appointmentItem) {
                const appointmentId = appointmentItem.dataset.id;
                const appointment = appointmentsData.find(a => a.id == appointmentId);
                if (appointment) {
                    alert(`Detalles de la cita: ${appointment.title}\nFecha: ${appointment.day} ${appointment.month}\nEstado: ${getStatusText(appointment.status)}`);
                }
            }

            const historyItem = e.target.closest('.history-item');
            if (historyItem) {
                const historyId = historyItem.dataset.id;
                const history = historyData.find(h => h.id == historyId);
                if (history) {
                    alert(`Detalles del historial: ${history.title}\nFecha: ${history.day} ${history.month}\nEstado: ${getStatusText(history.status)}`);
                }
            }
        });
    }

    // Initialize all functionality
    function init() {
        renderAppointments();
        renderHistory();
        setupVehicleInteractions();
        setupAppointmentInteractions();

        console.log('ChargeFlow Dashboard initialized successfully');
    }

    // Start the application
    init();
});