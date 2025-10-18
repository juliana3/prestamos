<template>
  <div class="modulo">
    <div class="modulo-header">
      <h2>🛒 Carros</h2>
      <button @click="mostrarFormulario = true" class="btn-nuevo">+ Nuevo Carro</button>
    </div>

    <!-- Formulario -->
    <div v-if="mostrarFormulario" class="form-modal">
      <div class="form-content">
        <h3>{{ editando ? 'Editar Carro' : 'Nuevo Carro' }}</h3>
        
        <div class="form-group">
          <label>Ubicación</label>
          <input v-model="form.ubicacion" type="text" placeholder="Sala de Informática A" />
        </div>

        <div class="form-actions">
          <button @click="guardarCarro" class="btn-guardar" :disabled="loading">
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
            <th>ID</th>
            <th>Ubicación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="carro in carros" :key="carro.id_carro">
            <td>#{{ carro.id_carro }}</td>
            <td>{{ carro.ubicacion }}</td>
            <td class="acciones">
              <button @click="editarCarro(carro)" class="btn-editar">Editar</button>
              <button @click="eliminarCarro(carro.id_carro)" class="btn-eliminar">Eliminar</button>
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
import { carrosService } from '../services/api';

const carros = ref([]);
const mostrarFormulario = ref(false);
const editando = ref(false);
const loading = ref(false);
const error = ref('');
const success = ref('');

const form = ref({
  ubicacion: ''
});

const formOriginal = ref({});

onMounted(() => {
  cargarCarros();
});

const cargarCarros = async () => {
  try {
    const response = await carrosService.getAll();
    carros.value = response.data;
  } catch (err) {
    error.value = 'Error cargando carros';
  }
};

const editarCarro = (carro) => {
  editando.value = true;
  mostrarFormulario.value = true;
  form.value = { ...carro };
  formOriginal.value = carro;
};

const guardarCarro = async () => {
  error.value = '';
  loading.value = true;

  try {
    if (editando.value) {
      await carrosService.update(formOriginal.value.id_carro, form.value);
      success.value = '✓ Carro actualizado';
    } else {
      await carrosService.create(form.value);
      success.value = '✓ Carro creado';
    }

    cerrarFormulario();
    await cargarCarros();
  } catch (err) {
    error.value = err.response?.data?.error || 'Error guardando carro';
  } finally {
    loading.value = false;
  }
};

const cerrarFormulario = () => {
  mostrarFormulario.value = false;
  editando.value = false;
  form.value = { ubicacion: '' };
  error.value = '';
};

const eliminarCarro = async (id) => {
  if (!confirm('¿Estás seguro?')) return;

  try {
    await carrosService.delete(id);
    success.value = '✓ Carro eliminado';
    await cargarCarros();
  } catch (err) {
    error.value = err.response?.data?.error || 'Error eliminando carro';
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

.form-group input {
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