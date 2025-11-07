<template>
  <div class="modulo">
    <h2>Bienvenido al sistema de gestión de préstamos</h2>

    <!-- Tarjetas de estadísticas -->
    <div class="stats-grid">
      <div
        v-for="stat in statList"
        :key="stat.label"
        class="stat-card"
        :style="{ borderLeftColor: stat.color }"
      >
        <h3>{{ stat.label }}</h3>
        <p class="stat-number">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="charts-grid" v-if="dataLoaded">
      <!-- Computadoras Sanas / En Reparación -->
      <div class="chart-card">
        <h3>Computadoras Sanas / En Reparación</h3>
        <Doughnut :data="computadorasChart" :chart-options="chartOptions" />
      </div>

      <!-- Computadoras Disponibles / Prestadas -->
      <div class="chart-card">
        <h3>Computadoras Disponibles / Prestadas</h3>
        <Doughnut :data="prestadasChart" :chart-options="chartOptions" />
        <p class="chart-info">{{ prestadas }} de {{ totalComputadoras }} computadoras prestadas</p>
      </div>

      <!-- Alumnos que sacan computadoras -->
      <div class="chart-card">
        <h3>Alumnos que sacan computadoras</h3>
        <Doughnut :data="alumnosChart" :chart-options="chartOptions" />
        <p class="chart-info">{{ porcentajeAlumnos }}% del total de alumnos</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { alumnosService, computadorasService, prestamosService } from '../services/api';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const dataLoaded = ref(false);

// Tarjetas de estadísticas
const stats = ref({
  usuarios: 0,
  disponibles: 0,
  activos: 0,
  reparacion: 0
});

const statList = computed(() => [
  { label: 'Usuarios Registrados', value: stats.value.usuarios, color: '#667eea' },
  { label: 'Computadoras Disponibles', value: stats.value.disponibles, color: '#28a745' },
  { label: 'Préstamos Activos', value: stats.value.activos, color: '#ffc107' },
  { label: 'En Reparación', value: stats.value.reparacion, color: '#dc3545' }
]);

// Gráficos
const computadorasChart = ref({ labels: ['Sanas', 'En Reparación'], datasets: [{ data: [0,0], backgroundColor: ['#28a745','#dc3545'] }] });
const prestadasChart = ref({ labels: ['Prestadas', 'Disponibles'], datasets: [{ data: [0,0], backgroundColor: ['#ffc107','#28a745'] }] });
const alumnosChart = ref({ labels: ['Sacaron', 'No sacaron'], datasets: [{ data: [0,0], backgroundColor: ['#667eea','#888'] }] });

const chartOptions = {
  responsive: true,
  plugins: { legend: { position: 'bottom' }, title: { display: false } }
};

const prestadas = ref(0);
const totalComputadoras = ref(0);
const porcentajeAlumnos = ref(0);

onMounted(async () => {
  try {
    const [alumnosRes, computadorasRes, prestamosRes] = await Promise.all([
      alumnosService.getAll(),
      computadorasService.getAll(),
      prestamosService.getAll()
    ]);

    // --- Tarjetas ---
    stats.value.usuarios = alumnosRes.data.length;
    stats.value.disponibles = computadorasRes.data.filter(c => c.estado.toLowerCase() === 'disponible').length;
    stats.value.activos = prestamosRes.data.filter(p => p.estado.toLowerCase() === 'activo').length;
    stats.value.reparacion = computadorasRes.data.filter(c => c.estado.toLowerCase() === 'en reparación').length;

    // --- Computadoras Sanas / En Reparación ---
    const sanas = stats.value.disponibles;
    const reparacion = stats.value.reparacion;
    computadorasChart.value.datasets[0].data = [sanas, reparacion];

    // --- Computadoras Prestadas ---
    prestadas.value = stats.value.activos;
    totalComputadoras.value = computadorasRes.data.length;
    prestadasChart.value.datasets[0].data = [prestadas.value, totalComputadoras.value - prestadas.value];

    // --- Alumnos que sacan computadoras ---
    const alumnosQueSacaron = new Set(prestamosRes.data.map(p => p.alumnoId));
    porcentajeAlumnos.value = ((alumnosQueSacaron.size / alumnosRes.data.length) * 100).toFixed(1);
    alumnosChart.value.datasets[0].data = [alumnosQueSacaron.size, alumnosRes.data.length - alumnosQueSacaron.size];

    dataLoaded.value = true;
  } catch (err) {
    console.error('Error cargando estadísticas:', err);
  }
});
</script>

<style scoped>
.modulo {
  padding: 20px;
  font-family: 'Segoe UI', sans-serif;
}

h2 {
  margin-bottom: 30px;
  color: #1a1a1a;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  border-left: 5px solid;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.12);
}

.stat-card h3 {
  font-size: 13px;
  color: #888;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.chart-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  text-align: center;
}

.chart-info {
  margin-top: 10px;
  font-size: 14px;
  color: #555;
}
</style>
