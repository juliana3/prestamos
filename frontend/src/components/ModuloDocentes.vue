<template>
  <div class="modulo">
    <div class="modulo-header">
      <h2>Docentes</h2>
      <button @click="mostrarFormulario = true" class="btn-nuevo">+ Nuevo Docente</button>
      <!--ACA VAA UN BOTON PARA PERMITIR CARGA MASIVA-->
        <input
        ref="inputExcel"
        type="file"
        accept=".xlsx, .xls, .csv"
        @change="cargarDesdeExcel"
        style="display: none;"
        />
        <button @click="inputExcel.click()" class="btn-carga-masiva">📁 Cargar Excel</button>

    </div>

    <!-- Formulario de crear/editar -->
    <div v-if="mostrarFormulario" class="form-modal">
      <div class="form-content">
        <h3>{{ editando ? 'Editar Docente' : 'Nuevo Docente' }}</h3>
        
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



        <div class="form-actions">
          <button @click="guardarDocente" class="btn-guardar" :disabled="loading">
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
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="docente in docentes" :key="docente.id_docente">
            <td>{{ docente.dni }}</td>
            <td>{{ docente.nombre }}</td>
            <td>{{ docente.apellido }}</td>
            <td>{{ docente.celular }}</td>
            <td>{{ docente.email }}</td>
            <td class="acciones">
              <template v-if="docente.id_docente">
                <button @click="editarDocente(docente)" class="btn-editar">Editar</button>
                <button @click="eliminarDocente(docente.id_docente)" class="btn-eliminar">Eliminar</button>
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
import { docentesService } from '../services/api';
import * as XLSX from 'xlsx';
const inputExcel = ref(null);


const docentes = ref([]);
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
});

const formOriginal = ref({});

onMounted(() => {
  cargarDocentes();
});

const cargarDocentes = async () => {
  try {
    const response = await docentesService.getAll();
    docentes.value = response.data;
  } catch (err) {
    error.value = 'Error cargando docentes';
  }
};

const editarDocente = (docente) => {
  editando.value = true;
  mostrarFormulario.value = true;
  form.value = { ...docente };
  formOriginal.value = docente;
};

const guardarDocente = async () => {
  error.value = '';
  loading.value = true;

  try {
    if (editando.value) {
      await docentesService.update(formOriginal.value.id_docente, form.value);
      success.value = '✓ Docente actualizado';
    } else {
      await docentesService.create(form.value);
      success.value = '✓ Docente creado';
    }

    cerrarFormulario();
    await cargarDocentes();
  } catch (err) {
    error.value = err.response?.data?.error || 'Error guardando docente';
  } finally {
    loading.value = false;
  }
};

const cerrarFormulario = () => {
  mostrarFormulario.value = false;
  editando.value = false;
  form.value = { dni: '', nombre: '', apellido: '', celular: '', email: ''};
  error.value = '';
};

const eliminarDocente = async (id) => {
  if (!confirm('¿Estás seguro de eliminar este docente?')) return;

  try {
    await docentesService.delete(id);
    success.value = '✓ Docente eliminado';
    await cargarDocentes();
  } catch (err) {
    error.value = 'Error eliminando docente';
  }
};

const cargarDesdeExcel = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  console.log('📂 Archivo seleccionado:', file.name);

  try {
    await docentesService.bulkUpload(file);
    const response = await docentesService.bulkUpload(file);
    console.log('✅ Respuesta del backend:', response.data);
    success.value = '✓ Archivo cargado correctamente';
    await cargarDocentes();
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