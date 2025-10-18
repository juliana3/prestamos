<template>
  <div class="modulo">
    <h2>🎧 Nuevo Préstamo</h2>

    <div class="form-container">
      <!-- Búsqueda de usuario -->
      <div class="form-group">
        <label>Buscar Usuario por DNI</label>
        <div class="search-box">
          <input
            v-model="dni"
            type="text"
            placeholder="Ingresa el DNI"
            @keyup.enter="buscarUsuario"
          />
          <button @click="buscarUsuario" class="btn-search">Buscar</button>
        </div>

        <div v-if="usuarioEncontrado" class="usuario-info">
          <p><strong>{{ usuarioEncontrado.nombre }} {{ usuarioEncontrado.apellido }}</strong></p>
          <p>Tipo: {{ usuarioEncontrado.tipo }}</p>
        </div>
      </div>

      <!-- Seleccionar computadora -->
      <div v-if="usuarioEncontrado" class="form-group">
        <label>Seleccionar Computadora</label>
        <select v-model="idComputadora" class="select">
          <option value="">-- Selecciona una computadora --</option>
          <option v-for="pc in computadorasDisponibles" :key="pc.id_computadora" :value="pc.id_computadora">
            {{ pc.numero_inventario }} ({{ pc.ubicacion }})
          </option>
        </select>
      </div>

      <!-- Botón crear préstamo -->
      <div v-if="usuarioEncontrado && idComputadora" class="form-actions">
        <button @click="crearPrestamo" class="btn-primary" :disabled="loading">
          {{ loading ? 'Procesando...' : 'Crear Préstamo' }}
        </button>
      </div>

      <!-- Mensajes -->
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usuariosService, computadorasService, prestamosService } from '../services/api';

const dni = ref('');
const usuarioEncontrado = ref(null);
const computadorasDisponibles = ref([]);
const idComputadora = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

onMounted(async () => {
  await cargarComputadoras();
});

const cargarComputadoras = async () => {
  try {
    const response = await computadorasService.getAll();
    computadorasDisponibles.value = response.data.filter(pc => pc.estado === 'disponible');
  } catch (err) {
    error.value = 'Error cargando computadoras';
  }
};

const buscarUsuario = async () => {
  error.value = '';
  usuarioEncontrado.value = null;

  if (!dni.value.trim()) {
    error.value = 'Ingresa un DNI';
    return;
  }

  try {
    const response = await usuariosService.getByDni(dni.value);
    usuarioEncontrado.value = response.data;
  } catch (err) {
    error.value = 'Usuario no encontrado';
    usuarioEncontrado.value = null;
  }
};

const crearPrestamo = async () => {
  if (!usuarioEncontrado.value || !idComputadora.value) {
    error.value = 'Completa todos los campos';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    await prestamosService.create({
      id_usuario: usuarioEncontrado.value.id_usuario,
      id_computadora: idComputadora.value
    });

    success.value = '✓ Préstamo creado exitosamente';
    dni.value = '';
    usuarioEncontrado.value = null;
    idComputadora.value = '';
    
    await cargarComputadoras();
  } catch (err) {
    error.value = err.response?.data?.error || 'Error creando préstamo';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.modulo {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
}

.modulo h2 {
  margin-bottom: 20px;
  color: #333;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-box input {
  flex: 1;
}

.btn-search {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-search:hover {
  background: #5568d3;
}

.usuario-info {
  background: #f0f0f0;
  padding: 10px;
  border-radius: 6px;
  border-left: 4px solid #667eea;
}

.usuario-info p {
  margin: 5px 0;
  font-size: 14px;
}

.form-actions {
  margin-top: 10px;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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