<template>
  <div class="modulo">
    <h2>↩️ Devolver Computadora</h2>

    <div class="form-container">
      <!-- Búsqueda de usuario -->
      <div class="form-group">
        <label>Buscar Usuario por DNI</label>
        <div class="search-box">
          <input
            v-model="dni"
            type="text"
            placeholder="Ingresa el DNI"
            @keyup.enter="buscarPrestamosActivos"
          />
          <button @click="buscarPrestamosActivos" class="btn-search">Buscar</button>
        </div>
      </div>

      <!-- Lista de préstamos activos -->
      <div v-if="prestamosActivos.length > 0" class="prestamos-list">
        <h3>Préstamos Activos</h3>
        <div v-for="prestamo in prestamosActivos" :key="prestamo.id_prestamo" class="prestamo-card">
          <div class="prestamo-info">
            <p><strong>{{ prestamo.numero_inventario }}</strong></p>
            <p>Usuario: {{ prestamo.nombre }} {{ prestamo.apellido }}</p>
            <p>Fecha Inicio: {{ formatDate(prestamo.fecha_inicio) }}</p>
          </div>
          <button @click="devolverComputadora(prestamo.id_prestamo)" class="btn-devolver" :disabled="loading">
            {{ loading ? 'Procesando...' : 'Devolver' }}
          </button>
        </div>
      </div>

      <div v-else-if="buscado && prestamosActivos.length === 0" class="alert alert-info">
        No hay préstamos activos para este usuario
      </div>

      <!-- Mensajes -->
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { prestamosService } from '../services/api';

const dni = ref('');
const prestamosActivos = ref([]);
const loading = ref(false);
const error = ref('');
const success = ref('');
const buscado = ref(false);

const buscarPrestamosActivos = async () => {
  error.value = '';
  success.value = '';
  prestamosActivos.value = [];
  buscado.value = true;

  if (!dni.value.trim()) {
    error.value = 'Ingresa un DNI';
    return;
  }

  try {
    const response = await prestamosService.getByDni(dni.value);
    prestamosActivos.value = response.data;
  } catch (err) {
    if (err.response?.status === 404) {
      prestamosActivos.value = [];
    } else {
      error.value = 'Error buscando préstamos';
    }
  }
};

const devolverComputadora = async (idPrestamo) => {
  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    await prestamosService.devolver(idPrestamo);
    success.value = '✓ Computadora devuelta exitosamente';
    
    // Recargar préstamos
    await buscarPrestamosActivos();
  } catch (err) {
    error.value = err.response?.data?.error || 'Error devolviendo computadora';
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('es-AR');
};
</script>

<style scoped>
.modulo {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 600px;
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

.search-box {
  display: flex;
  gap: 10px;
}

.search-box input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
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

.prestamos-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.prestamos-list h3 {
  margin: 0;
  color: #333;
}

.prestamo-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #667eea;
}

.prestamo-info {
  flex: 1;
}

.prestamo-info p {
  margin: 3px 0;
  font-size: 14px;
}

.btn-devolver {
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}

.btn-devolver:hover:not(:disabled) {
  background: #218838;
}

.btn-devolver:disabled {
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

.alert-info {
  background: #eef;
  color: #33c;
  border: 1px solid #ccf;
}
</style>