// --- Datos iniciales ---
const allData = [
    { fecha: "2025-09-23", servicio: "Carga de Batería", vehiculo: "Tesla Model 3 - ABC-123", tecnico: "Juan Pérez", ingreso: 150, ganancia: 120 },
    { fecha: "2025-10-26", servicio: "Diagnóstico de Batería", vehiculo: "Nissan Leaf - XYZ-789", tecnico: "María García", ingreso: 75, ganancia: 60 },
    { fecha: "2025-04-07", servicio: "Reparación de Motor", vehiculo: "Rivian R1T - RIV-001", tecnico: "Carlos Sánchez", ingreso: 1200, ganancia: 950 },
    { fecha: "2025-06-24", servicio: "Carga de Batería", vehiculo: "BMW i3 - BBB-456", tecnico: "Laura Torres", ingreso: 160, ganancia: 125 },
    { fecha: "2025-08-22", servicio: "Mantenimiento General", vehiculo: "BYD Atto 3 - XYZ-456", tecnico: "Andrés Ruiz", ingreso: 300, ganancia: 230 },
    { fecha: "2025-10-15", servicio: "Diagnóstico de Batería", vehiculo: "Chevrolet Bolt - CHE-789", tecnico: "Pedro López", ingreso: 80, ganancia: 65 },
    { fecha: "2025-10-18", servicio: "Reparación de Motor", vehiculo: "Ford Mustang Mach-E - FOR-123", tecnico: "Carlos Sánchez", ingreso: 1100, ganancia: 890 },
    { fecha: "2025-10-20", servicio: "Carga de Batería", vehiculo: "Hyundai Kona Electric - HYN-456", tecnico: "Juan Pérez", ingreso: 140, ganancia: 115 }
];

let filteredData = [...allData];

// --- Dropdown Filtros ---
const serviceFilterBtn = document.getElementById("serviceFilterBtn");
const serviceFilterDropdown = document.getElementById("serviceFilterDropdown");
const dateRangeBtn = document.getElementById("dateRangeBtn");
const dateFilterDropdown = document.getElementById("dateFilterDropdown");

serviceFilterBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    serviceFilterDropdown.classList.toggle("hidden");
});

dateRangeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dateFilterDropdown.classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
    if (!serviceFilterBtn.contains(e.target) && !serviceFilterDropdown.contains(e.target)) {
        serviceFilterDropdown.classList.add("hidden");
    }
    if (!dateRangeBtn.contains(e.target) && !dateFilterDropdown.contains(e.target)) {
        dateFilterDropdown.classList.add("hidden");
    }
});

// --- Renderizar tabla y actualizar métricas ---
const tableBody = document.querySelector("#tableBody");

function renderTable(data) {
    tableBody.innerHTML = "";
    data.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.fecha}</td>
            <td>${row.servicio}</td>
            <td>${row.vehiculo}</td>
            <td>${row.tecnico}</td>
            <td>$${row.ingreso.toFixed(2)}</td>
            <td class="highlight">$${row.ganancia.toFixed(2)}</td>
        `;
        tableBody.appendChild(tr);
    });

    updateMetrics(data);
}

function updateMetrics(data) {
    const totalGanancia = data.reduce((sum, row) => sum + row.ganancia, 0);
    const totalServicios = data.length;
    const ingresoPromedio = totalServicios > 0 ? totalGanancia / totalServicios : 0;

    document.getElementById("totalGanancia").textContent = `$${totalGanancia.toLocaleString()}`;
    document.getElementById("totalServicios").textContent = totalServicios.toLocaleString();
    document.getElementById("ingresoPromedio").textContent = `$${ingresoPromedio.toFixed(2)}`;
}

// --- Gráfica de Ganancias ---
const ctx = document.getElementById("gananciasChart").getContext("2d");

let chart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Ganancias ($)",
            data: [],
            borderColor: "#39E079",
            backgroundColor: "rgba(57, 224, 121, 0.15)",
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                grid: { color: "#e5e7eb" },
                ticks: { color: "#374151" }
            },
            x: {
                grid: { display: false },
                ticks: { color: "#374151" }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#111827",
                titleColor: "#fff",
                bodyColor: "#d1d5db"
            }
        }
    }
});

function updateChart(data) {
    const grouped = {};
    data.forEach(d => {
        grouped[d.fecha] = (grouped[d.fecha] || 0) + d.ganancia;
    });
    const labels = Object.keys(grouped).sort();
    const valores = labels.map(l => grouped[l]);

    chart.data.labels = labels;
    chart.data.datasets[0].data = valores;
    chart.update();
}

// --- Filtro por rango de fecha ---
document.getElementById("applyDateFilter").addEventListener("click", () => {
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    let filtered = allData;

    if (startDate && endDate) {
        filtered = allData.filter(d => d.fecha >= startDate && d.fecha <= endDate);
    }

    filteredData = filtered;
    renderTable(filteredData);
    updateChart(filteredData);
    dateFilterDropdown.classList.add("hidden");
});

// --- Filtro por servicio ---
document.getElementById("applyServiceFilter").addEventListener("click", () => {
    const selectedServices = Array.from(document.querySelectorAll('input[name="service"]:checked'))
        .map(checkbox => checkbox.value);

    let filtered = allData;

    if (selectedServices.length > 0) {
        filtered = allData.filter(d => selectedServices.includes(d.servicio));
    }

    filteredData = filtered;
    renderTable(filteredData);
    updateChart(filteredData);
    serviceFilterDropdown.classList.add("hidden");
});

// --- Exportar CSV ---
document.getElementById("exportCSV").addEventListener("click", () => {
    const headers = ["Fecha", "Servicio", "Vehículo", "Técnico", "Ingreso", "Ganancia Neta"];
    const csvContent = [
        headers.join(","),
        ...filteredData.map(row => [
            row.fecha,
            `"${row.servicio}"`,
            `"${row.vehiculo}"`,
            `"${row.tecnico}"`,
            row.ingreso.toFixed(2),
            row.ganancia.toFixed(2)
        ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ganancias_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("Archivo CSV exportado exitosamente");
});

// --- Exportar PDF (simulación) ---
document.getElementById("exportPDF").addEventListener("click", () => {
    // En una implementación real, aquí se usaría una librería como jsPDF
    // Por ahora simulamos la exportación

    const totalGanancia = filteredData.reduce((sum, row) => sum + row.ganancia, 0);
    const totalServicios = filteredData.length;

    const reportContent = `
        REPORTE DE GANANCIAS - CHARGE FLOW
        Fecha: ${new Date().toLocaleDateString()}
        =====================================
        
        Total de Servicios: ${totalServicios}
        Ganancia Total: $${totalGanancia.toLocaleString()}
        
        DETALLE DE SERVICIOS:
        ${filteredData.map(row => `
        Fecha: ${row.fecha}
        Servicio: ${row.servicio}
        Vehículo: ${row.vehiculo}
        Técnico: ${row.tecnico}
        Ingreso: $${row.ingreso.toFixed(2)}
        Ganancia: $${row.ganancia.toFixed(2)}
        ---`).join('')}
    `;

    // Simulamos la descarga
    const blob = new Blob([reportContent], { type: "application/pdf" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_ganancias_${new Date().toISOString().split('T')[0]}.pdf`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("Reporte PDF generado exitosamente");
});

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", () => {
    renderTable(filteredData);
    updateChart(filteredData);
});