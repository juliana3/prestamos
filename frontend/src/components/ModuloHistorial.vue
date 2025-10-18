<template>
  <div class="modulo">
    <h2>📋 Historial de Préstamos</h2>

    <!-- Búsqueda -->
    <div class="search-box">
      <input
        v-model="dni"
        type="text"
        placeholder="Buscar por DNI (dejar vacío para ver todos)"
        @keyup.enter="buscar"
      />
      <button @click="buscar" class="btn-search">Buscar</button>
    </div>

    <!-- Tabla -->
    <div class="tabla-container">
      <table class="tabla">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>DNI</th>
            <th>Computadora</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prestamo in prestamos" :key="prestamo.id_prestamo">
            <td>{{ prestamo.nombre }} {{ prestamo.apellido }}</td>
            <td>{{ prestamo.dni }}</td>
            <td>{{ prestamo.numero_inventario }}</td>
            <td>{{ formatDate(prestamo.fecha_inicio) }}</td>
            <td>{{ prestamo.fecha_fin ? formatDate(prestamo.fecha_fin) : '-' }}</td>
            <td><span class="badge" :class="prestamo.estado">{{ prestamo.estado }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="prestamos.length === 0 && !error" class="alert alert-info">
      No hay registros de préstamos
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { prestamosService } from '../services/api';

const dni = ref('');
const prestamos = ref([]);
const error = ref('');

onMounted(() => {
  buscar();
});

const buscar = async () => {
  error.value = '';
  prestamos.value = [];

  try {
    if (dni.value.trim()) {
      const response = await prestamosService.getHistorialByDni(dni.value);
      prestamos.value = response.data;
    } else {
      const response = await prestamosService.getAll();
      prestamos.value = response.data;
    }
  } catch (err) {
    if (err.response?.status === 404) {
      prestamos.value = [];
    } else {
      error.value = 'Error cargando historial';
    }
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.modulo {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.modulo h2 {
  margin-bottom: 20px;
  color: #333;
}

.search-box {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
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

.badge.activo {
  background: #ffeaa7;
  color: #d63031;
}

.badge.devuelto {
  background: #d4edda;
  color: #155724;
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

.alert-info {
  background: #eef;
  color: #33c;
  border: 1px solid #ccf;
}
</style>