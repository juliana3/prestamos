<template>
  <div class="modulo">
    <div class="modulo-header">
      <h2>💻 Computadoras</h2>
      <button @click="mostrarFormulario = true" class="btn-nuevo">+ Nueva Computadora</button>
    </div>

    <!-- Formulario -->
    <div v-if="mostrarFormulario" class="form-modal">
      <div class="form-content">
        <h3>{{ editando ? 'Editar Computadora' : 'Nueva Computadora' }}</h3>
        
        <div class="form-group">
          <label>Número de Inventario</label>
          <input v-model="form.numero_inventario" type="text" :disabled="editando" placeholder="PC-001" />
        </div>

        <div class="form-group">
          <label>Carro</label>
          <select v-model="form.id_carro">
            <option value="">-- Selecciona un carro --</option>
            <option v-for="carro in carros" :key="carro.id_carro" :value="carro.id_carro">
              {{ carro.nombre }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Estado</label>
          <select v-model="form.estado">
            <option value="disponible">Disponible</option>
            <option value="prestada">Prestada</option>
            <option value="en reparación">En Reparación</option>
          </select>
        </div>

        <div class="form-actions">
          <button @click="guardarComputadora" class="btn-guardar" :disabled="loading">
            {{ loading ? 'Guardando...' : 'Guardar' }}
          </button>
          <button @click="cerrarFormulario" class="btn-cancelar">Cancelar</button>
        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="tabla-container">
      <table class="tabla">
        <thead>
          <tr>
            <th>Inventario</th>
            <th>Carro</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pc in computadoras" :key="pc.id_computadora">
            <td>{{ pc.numero_inventario }}</td>
            <td>{{ pc.nombre }}</td>
            <td><span class="badge" :class="pc.estado">{{ pc.estado }}</span></td>
            <td class="acciones">
              <button @click="editarComputadora(pc)" class="btn-editar">Editar</button>
              <button @click="eliminarComputadora(pc.id_computadora)" class="btn-eliminar">Eliminar</button>
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
import { computadorasService, carrosService } from '../services/api';

const computadoras = ref([]);
const carros = ref([]);
const mostrarFormulario = ref(false);
const editando = ref(false);
const loading = ref(false);
const error = ref('');
const success = ref('');

const form = ref({
  numero_inventario: '',
  id_carro: '',
  estado: 'disponible'
});

const formOriginal = ref({});

onMounted(() => {
  cargarComputadoras();
  cargarCarros();
});

const cargarComputadoras = async () => {
  try {
    const response = await computadorasService.getAll();
    computadoras.value = response.data;
  } catch (err) {
    error.value = 'Error cargando computadoras';
  }
};

const cargarCarros = async () => {
  try {
    const response = await carrosService.getAll();
    carros.value = response.data;
  } catch (err) {
    console.error('Error cargando carros:', err);
  }
};

const editarComputadora = (pc) => {
  editando.value = true;
  mostrarFormulario.value = true;
  form.value = { ...pc };
  formOriginal.value = pc;
};

const guardarComputadora = async () => {
  error.value = '';
  loading.value = true;

  try {
    if (editando.value) {
      await computadorasService.update(formOriginal.value.id_computadora, form.value);
      success.value = '✓ Computadora actualizada';
    } else {
      await computadorasService.create(form.value);
      success.value = '✓ Computadora creada';
    }

    cerrarFormulario();
    await cargarComputadoras();
  } catch (err) {
    error.value = err.response?.data?.error || 'Error guardando computadora';
  } finally {
    loading.value = false;
  }
};

const cerrarFormulario = () => {
  mostrarFormulario.value = false;
  editando.value = false;
  form.value = { numero_inventario: '', id_carro: '', estado: 'disponible' };
  error.value = '';
};

const eliminarComputadora = async (id) => {
  if (!confirm('¿Estás seguro?')) return;

  try {
    await computadorasService.delete(id);
    success.value = '✓ Computadora eliminada';
    await cargarComputadoras();
  } catch (err) {
    error.value = 'Error eliminando computadora';
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

.badge.disponible {
  background: #d4edda;
  color: #155724;
}

.badge.prestada {
  background: #fff3cd;
  color: #856404;
}

.badge.en\ reparación {
  background: #f8d7da;
  color: #721c24;
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
}

.alert-success {
  background: #efe;
  color: #3c3;
}
</style>