<template>
  <div class="modulo">
    <h2>📊 Bienvenido al Sistema</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Usuarios Registrados</h3>
        <p class="stat-number">{{ stats.usuarios }}</p>
      </div>
      <div class="stat-card">
        <h3>Computadoras Disponibles</h3>
        <p class="stat-number">{{ stats.disponibles }}</p>
      </div>
      <div class="stat-card">
        <h3>Préstamos Activos</h3>
        <p class="stat-number">{{ stats.activos }}</p>
      </div>
      <div class="stat-card">
        <h3>En Reparación</h3>
        <p class="stat-number">{{ stats.reparacion }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usuariosService, computadorasService, prestamosService } from '../services/api';

const stats = ref({
  usuarios: 0,
  disponibles: 0,
  activos: 0,
  reparacion: 0
});

onMounted(async () => {
  try {
    const usuarios = await usuariosService.getAll();
    const computadoras = await computadorasService.getAll();
    const prestamos = await prestamosService.getAll();

    stats.value.usuarios = usuarios.data.length;
    stats.value.disponibles = computadoras.data.filter(c => c.estado === 'disponible').length;
    stats.value.activos = prestamos.data.filter(p => p.estado === 'activo').length;
    stats.value.reparacion = computadoras.data.filter(c => c.estado === 'en reparación').length;
  } catch (err) {
    console.error('Error cargando estadísticas:', err);
  }
});
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
}

.stat-number {
  margin: 0;
  font-size: 32px;
  font-weight: bold;
}
</style>