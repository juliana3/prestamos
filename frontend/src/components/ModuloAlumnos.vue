<template>
  <div class="modulo">
    <div class="modulo-header">
      <h2>Alumnos</h2>
      <button @click="mostrarFormulario = true" class="btn-nuevo">+ Nuevo Alumno</button>
      <!--ACA VAA UN BOTON PARA PERMITIR CARGA MASIVA-->
        <input
        ref="inputExcel"
        type="file"
        accept=".xlsx, .xls, .csv"
        @change="cargarDesdeExcel"
        style="display: none;"
        />
        <button @click="inputExcel.click()" class="btn-carga-masiva">
        📁 Cargar Excel
        </button>

    </div>

    <!-- Formulario de crear/editar -->
    <div v-if="mostrarFormulario" class="form-modal">
      <div class="form-content">
        <h3>{{ editando ? 'Editar Alumno' : 'Nuevo Alumnno' }}</h3>
        
        <div class="form-group">
          <label>DNI</label>
          <input v-model="form.dni" type="text" :disabled="editando" placeholder="DNI" />
        </div>

        <div class="form-group">
          <label>Nombre</label>
          <input v-model="form.nombre" type="text" placeholder="Nombre" />
        </div>

        <div class="form-group">
          <label>Apellido</label>
          <input v-model="form.apellido" type="text" placeholder="Apellido" />
        </div>

        <div class="form-group">
          <label>Celular</label>
          <input v-model="form.celular" type="text" placeholder="Celular" />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="text" placeholder="Email" />
        </div>

        <div class="form-group">
          <label>Carrera</label>
          <input v-model="form.carrera" type="text" placeholder="Carrera" />
        </div>


        <div class="form-actions">
          <button @click="guardarAlumno" class="btn-guardar" :disabled="loading">
            {{ loading ? 'Guardando...' : 'Guardar' }}
          </button>
          <button @click="cerrarFormulario" class="btn-cancelar">Cancelar</button>
        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div class="tabla-container">
      <table class="tabla">
        <thead>
          <tr>
            <th>DNI</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Celular</th>
            <th>Email</th>
            <th>Carrera</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="alumno in alumnos" :key="alumno.id_alumno">
            <td>{{ alumno.dni }}</td>
            <td>{{ alumno.nombre }}</td>
            <td>{{ alumno.apellido }}</td>
            <td>{{ alumno.celular }}</td>
            <td>{{ alumno.email }}</td>
            <td>{{ alumno.carrera }}</td>
            <td class="acciones">
              <template v-if="alumno.id_alumno">
                <button @click="editarAlumno(alumno)" class="btn-editar">Editar</button>
                <button @click="eliminarAlumno(alumno.id_alumno)" class="btn-eliminar">Eliminar</button>
              </template>
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
import { alumnosService } from '../services/api';
import * as XLSX from 'xlsx';
const inputExcel = ref(null);


const alumnos = ref([]);
const mostrarFormulario = ref(false);
const editando = ref(false);
const loading = ref(false);
const error = ref('');
const success = ref('');

const form = ref({
  dni: '',
  nombre: '',
  apellido: '',
  celular: '',
  email: '',
  carrera: '',
});

const formOriginal = ref({});

onMounted(() => {
  cargarAlumnos();
});

const cargarAlumnos = async () => {
  try {
    const response = await alumnosService.getAll();
    alumnos.value = response.data;
  } catch (err) {
    error.value = 'Error cargando alumnos';
  }
};

const editarAlumno = (alumno) => {
  editando.value = true;
  mostrarFormulario.value = true;
  form.value = { ...alumno };
  formOriginal.value = alumno;
};

const guardarAlumno = async () => {
  error.value = '';
  loading.value = true;

  try {
    if (editando.value) {
      await alumnosService.update(formOriginal.value.id_alumno, form.value);
      success.value = '✓ Alumno actualizado';
    } else {
      await alumnosService.create(form.value);
      success.value = '✓ Alumno creado';
    }

    cerrarFormulario();
    await cargarAlumnos();
  } catch (err) {
    error.value = err.response?.data?.error || 'Error guardando alumno';
  } finally {
    loading.value = false;
  }
};

const cerrarFormulario = () => {
  mostrarFormulario.value = false;
  editando.value = false;
  form.value = { dni: '', nombre: '', apellido: '', celular: '', email: '', carrera: '' };
  error.value = '';
};

const eliminarAlumno = async (id) => {
  if (!confirm('¿Estás seguro de eliminar este alumno?')) return;

  try {
    await alumnosService.delete(id);
    success.value = '✓ Alumno eliminado';
    await cargarAlumnos();
  } catch (err) {
    error.value = 'Error eliminando alumno';
  }
};

const cargarDesdeExcel = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  console.log('📂 Archivo seleccionado:', file.name);


  try {
    await alumnosService.bulkUpload(file);
    const response = await alumnosService.bulkUpload(file);
    console.log('✅ Respuesta del backend:', response.data);

    success.value = '✓ Archivo cargado correctamente';
    await cargarAlumnos();
  } catch (err) {
    console.error('❌ Error al subir archivo:', err);
    error.value = err.response?.data?.error || 'Error subiendo el archivo Excel.';
  } finally {
    event.target.value = '';
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

.modulo h2 {
  margin: 0;
  color: #333;
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

.btn-carga-masiva {
  padding: 10px 20px;
  background: #e122a8;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.btn-carga-masiva:hover {
  background: #e307a1;
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

.form-content h3 {
  margin-bottom: 20px;
  color: #333;
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

.form-group input,
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

.btn-guardar:hover:not(:disabled) {
  background: #5568d3;
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

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.badge.alumno {
  background: #e3f2fd;
  color: #1976d2;
}

.badge.docente {
  background: #f3e5f5;
  color: #7b1fa2;
}

.acciones {
  display: flex;
  gap: 8px;
}

.btn-editar {
  padding: 6px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
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
  border: 1px solid #fcc;
}

.alert-success {
  background: #efe;
  color: #3c3;
  border: 1px solid #cfc;
}
</style>