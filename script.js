// Arreglo global para almacenar los objetos de los equipos
let inventario = JSON.parse(localStorage.getItem('inventario_equipos')) || [];

// Referencias a los elementos del DOM
const form = document.getElementById('form-equipo');
const tbody = document.getElementById('lista-equipos');
const inputBuscar = document.getElementById('buscar');
const selectFiltro = document.getElementById('filtrar-estado');
const editIndexInput = document.getElementById('edit-index');

// Evento principal: Cargar datos al abrir la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Dibuja los equipos previamente cargados desde el almacenamiento local.
    actualizarTabla();
});

// Valida el formulario y agrega un equipo nuevo o actualiza el seleccionado.
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const serial = document.getElementById('serial').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const tipo = document.getElementById('tipo').value;
    const estado = document.getElementById('estado').value;
    const editIndex = editIndexInput.value;

    // Validación básica de campos vacíos
    if (!serial || !nombre) {
        alert("Por favor, complete todos los campos obligatorios.");
        return;
    }

    const equipo = { serial, nombre, tipo, estado };

    if (editIndex === "") {
        // Validación: No repetir número de serie al crear uno nuevo
        const existe = inventario.some(eq => eq.serial === serial);
        if (existe) {
            alert("El número de serie ya está registrado.");
            return;
        }
        inventario.push(equipo); // Agregar nuevo objeto al arreglo
    } else {
        inventario[editIndex] = equipo; // Modificar registro existente
        editIndexInput.value = "";
        document.getElementById('btn-guardar').textContent = "Guardar Equipo";
    }

    guardarEnLocalStorage();
    actualizarTabla();
    form.reset();
});

// Reconstruye la tabla según los filtros y calcula los indicadores del inventario.
function actualizarTabla() {
    tbody.innerHTML = '';
    const filtroTexto = inputBuscar.value.toLowerCase();
    const filtroEstado = selectFiltro.value;

    let total = 0, disponibles = 0, mantenimiento = 0;

    inventario.forEach((equipo, index) => {
        // Contador para el Panel de Indicadores
        total++;
        if (equipo.estado === 'Disponible') disponibles++;
        if (equipo.estado === 'En Mantenimiento') mantenimiento++;

        // Aplicación de filtros y búsqueda automática
        const coincideTexto = equipo.nombre.toLowerCase().includes(filtroTexto) || equipo.serial.toLowerCase().includes(filtroTexto);
        const coincideEstado = filtroEstado === 'Todos' || equipo.estado === filtroEstado;

        if (coincideTexto && coincideEstado) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${equipo.serial}</td>
                <td>${equipo.nombre}</td>
                <td>${equipo.tipo}</td>
                <td><span class="badge ${equipo.estado.replace(" ", "-").toLowerCase()}">${equipo.estado}</span></td>
                <td>
                    <button class="btn-edit" onclick="prepararEdicion(${index})">Editar</button>
                    <button class="btn-delete" onclick="eliminarEquipo(${index})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        }
    });

    // Actualizar indicadores del panel
    document.getElementById('total-equipos').textContent = total;
    document.getElementById('equipos-disponibles').textContent = disponibles;
    document.getElementById('equipos-mantenimiento').textContent = mantenimiento;
}

// Funciones de control (Modificar, Eliminar y Persistencia)
// Carga los datos del equipo seleccionado en el formulario para editarlos.
window.prepararEdicion = function(index) {
    const equipo = inventario[index];
    document.getElementById('serial').value = equipo.serial;
    document.getElementById('nombre').value = equipo.nombre;
    document.getElementById('tipo').value = equipo.tipo;
    document.getElementById('estado').value = equipo.estado;
    editIndexInput.value = index;
    document.getElementById('btn-guardar').textContent = "Actualizar Equipo";
};

// Pide confirmación antes de eliminar y actualiza la tabla y el almacenamiento.
window.eliminarEquipo = function(index) {
    if (confirm("¿Estás seguro de eliminar este equipo?")) {
        inventario.splice(index, 1);
        guardarEnLocalStorage();
        actualizarTabla();
    }
};

// Guarda el inventario completo para conservarlo al cerrar o recargar la página.
function guardarEnLocalStorage() {
    localStorage.setItem('inventario_equipos', JSON.stringify(inventario));
}

// Eventos en tiempo real para búsqueda y filtro
inputBuscar.addEventListener('input', actualizarTabla);
selectFiltro.addEventListener('change', actualizarTabla);