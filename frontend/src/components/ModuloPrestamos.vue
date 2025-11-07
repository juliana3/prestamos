<template>
  <div class="modulo">
    <div class="modulo-header">
      <h2>Préstamos</h2>
      <button @click="mostrarFormulario = true" class="btn-nuevo">+ Nuevo Préstamo</button>

    </div>

    <!-- Formulario de crear préstamo -->
    <div v-if="mostrarFormulario" class="form-modal">
      <div class="form-content">
        <h3>Nuevo Préstamo</h3>

        <!-- Seleccionar tipo de usuario -->
        <div class="form-group">
          <label>Tipo de usuario</label>
          <select v-model="tipoUsuarioSeleccionado" @change="reiniciarBusqueda">
            <option disabled value="">Seleccionar tipo</option>
            <option value="docente">Docente</option>
            <option value="alumno">Alumno</option>
          </select>
        </div>

        <!-- Dropdown usuario -->
        <div class="form-group" v-if="tipoUsuarioSeleccionado">
          <label>Usuario</label>
          <select v-model="usuarioSeleccionado">
            <option disabled value="">Seleccionar usuario</option>
            <option
              v-for="u in usuarios"
              :key="tipoUsuarioSeleccionado === 'alumno' ? u.id_alumno : u.id_docente"
              :value="u"
            >
              {{ u.apellido }}, {{ u.nombre }}
            </option>
          </select>
        </div>

        <!--Si el usuario es alumno, seleccionar docente a crago-->
        <div class="form-group" v-if="tipoUsuarioSeleccionado === 'alumno'">
          <label>Docente a cargo</label>
          <select v-model="docenteACargoSeleccionado">
            <option disabled value="">Seleccionar docente</option>
            <option v-for="doc in docentes" :key="doc.id_docente" :value="doc.id_docente">
              {{ doc.apellido }}, {{ doc.nombre }}
            </option>
          </select>
        </div>

        <!-- Dropdown computadoras disponibles -->
        <div class="form-group">
          <label>Computadora</label>
          <select v-model="computadoraSeleccionada">
            <option disabled value="">Seleccionar computadora</option>
            <option
              v-for="pc in computadorasDisponibles"
              :key="pc.id_computadora"
              :value="pc.id_computadora"
            >
              {{ pc.numero_inventario }}
            </option>
          </select>
        </div>

        <div class="form-actions">
          <button @click="crearPrestamo" class="btn-guardar" :disabled="loading">
            {{ loading ? 'Guardando...' : 'Guardar' }}
          </button>
          <button @click="cerrarFormulario" class="btn-cancelar">Cancelar</button>

        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div v-if="success" class="alert alert-success">{{ success }}</div>
      </div>
    </div>

    <!-- Tabla de préstamos activos -->
    <div class="tabla-container">
      <table class="tabla">
        <thead>
          <tr>
            <th>Nombre y apellido</th>
            <th>Tipo</th>
            <th>Docente a cargo</th>
            <th>Computadora</th>
            <th>Carro</th>
            <th>Fecha inicio</th>
            <th>Fecha fin</th>
            <th>Acciones</th>  
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in prestamos" :key="p.id_prestamo">
            <td>{{ p.apellido }}, {{ p.nombre }}</td>
            <td>{{ p.tipo }}</td>
            <td>
              <span v-if="p.tipo === 'alumno'">
                {{ p.docente_apellido ? p.docente_apellido + ', ' + p.docente_nombre : '-' }}
              </span>
              <span v-else>-</span>

            </td>
            <td>{{ p.numero_inventario }}</td>
            <td>{{ p.carro_nombre || '-' }}</td>
            <td>{{ formatearFecha(p.fecha_inicio) }}</td>
            <td>{{ p.fecha_fin ? formatearFecha(p.fecha_fin) : '-' }}</td>
            <td>
              <button v-if="p.estado === 'activo'" @click="devolverPrestamo(p.id_prestamo)" class="btn-eliminar">
                Devolver
              </button>
              <span v-else>Devuelto</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { alumnosService, docentesService, computadorasService, prestamosService } from '../services/api';

const prestamos = ref([]);
const computadorasDisponibles = ref([]);
const usuarios = ref([]);
const docentes = ref([]); 

const mostrarFormulario = ref(false);
const loading = ref(false);
const error = ref('');
const success = ref('');

const tipoUsuarioSeleccionado = ref('');
const usuarioSeleccionado = ref(null);
const docenteACargoSeleccionado = ref('');
const computadoraSeleccionada = ref('');

onMounted(() => {
  cargarPrestamos();
  cargarComputadoras();
  cargarDocentes();
});


const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};


//Cargar docentes para el selector de alumno
const cargarDocentes = async () => {
  try {
    const res = await docentesService.getAll();
    docentes.value = res.data;
  } catch (err) {
    console.error('Error cargando docentes:', err);
  }
};

// Reinicia búsqueda y carga usuarios cuando se cambia el tipo
const reiniciarBusqueda = async () => {
  usuarioSeleccionado.value = '';

  if (tipoUsuarioSeleccionado.value === 'alumno') {
    const res = await alumnosService.getAll();
    usuarios.value = res.data;
  } else if (tipoUsuarioSeleccionado.value === 'docente') {
    const res = await docentesService.getAll();
    usuarios.value = res.data;
  } else {
    usuarios.value = [];
  }
};

const cerrarFormulario = () => {
  mostrarFormulario.value = false;
  tipoUsuarioSeleccionado.value = '';
  usuarioSeleccionado.value = '';
  docenteACargoSeleccionado.value = '';
  computadoraSeleccionada.value = '';
  error.value = '';
  success.value = '';
};

// Cargar computadoras disponibles
const cargarComputadoras = async () => {
  try {
    const res = await computadorasService.getDisponibles();
    computadorasDisponibles.value = res.data;
  } catch (err) {
    console.error('Error cargando computadoras disponibles:', err);
  }
};

// Cargar préstamos activos
const cargarPrestamos = async () => {
  try {
    const res = await prestamosService.getActivos();
    console.log("📦 Prestamos activos:", res.data); 
    prestamos.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

// Crear nuevo préstamo
const crearPrestamo = async () => {
  if (!usuarioSeleccionado.value || !computadoraSeleccionada.value) {
    error.value = 'Seleccioná un usuario y una computadora';
    return;
  }

  error.value = '';
  loading.value = true;

  try {
    const payload = {
      id_usuario: tipoUsuarioSeleccionado.value === 'alumno'
      ? usuarioSeleccionado.value.id_alumno
      : usuarioSeleccionado.value.id_docente,
      tipo_usuario: tipoUsuarioSeleccionado.value,
      id_computadora: computadoraSeleccionada.value,
    };
    // Detectar el ID correcto según tipo

    if (tipoUsuarioSeleccionado.value === 'alumno') {
      payload.id_docente = docenteACargoSeleccionado.value;
    }

    // Crear el préstamo enviando el ID correcto
    await prestamosService.create(payload);

    success.value = 'Préstamo creado exitosamente';

    await cargarPrestamos();
    await cargarComputadoras();

    // Cerrar modal y limpiar campos
    cerrarFormulario();

  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.error || 'Error creando préstamo';
  } finally {
    loading.value = false;
  }
};

// Devolver préstamo
const devolverPrestamo = async (id) => {
  try {
    await prestamosService.devolver(id);

    // Esperar un breve momento para que SQLite libere el lock y confirme los cambios
    await new Promise(resolve => setTimeout(resolve, 300));

    await cargarPrestamos();
    await cargarComputadoras();

    success.value = 'Computadora devuelta exitosamente';
  } catch (err) {
    console.error(err);
  }
};
</script>

<style scoped>

.modulo {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.modulo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-nuevo {
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.btn-nuevo:hover {
  background: #218838;
}

.form-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.form-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 15px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-guardar {
  flex: 1;
  padding: 10px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-cancelar {
  flex: 1;
  padding: 10px;
  background: #ddd;
  color: #333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.tabla-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.tabla th {
  background: #f5f5f5;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #ddd;
}

.tabla td {
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

.tabla tr:hover {
  background: #f9f9f9;
}

.btn-eliminar {
  padding: 6px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.alert {
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
}
.alert-error {
  background: #fee;
  color: #c33;
}
.alert-success {
  background: #efe;
  color: #3c3;
}
</style>
