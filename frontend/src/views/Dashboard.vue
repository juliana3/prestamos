<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <h1>📚 Panel de Gestión</h1>
        <div class="user-info">
          <span>{{ admin.nombre }} ({{ admin.rol }})</span>
          <button @click="logout" class="btn-logout">Cerrar Sesión</button>
        </div>
      </div>
    </header>

    <!-- Contenido Principal -->
    <main class="main-content">
      <div class="sidebar">
        <!-- Menu de navegación -->
        <nav class="menu">
          <button
            @click="currentModule = 'inicio'"
            :class="['menu-item', { active: currentModule === 'inicio' }]"
          >
            📊 Inicio
          </button>
          <button
            @click="currentModule = 'prestamos'"
            :class="['menu-item', { active: currentModule === 'prestamos' }]"
          >
            🎧 Nuevo Préstamo
          </button>
          <button
            @click="currentModule = 'devoluciones'"
            :class="['menu-item', { active: currentModule === 'devoluciones' }]"
          >
            ↩️ Devoluciones
          </button>
          <button
            @click="currentModule = 'usuarios'"
            :class="['menu-item', { active: currentModule === 'usuarios' }]"
          >
            👥 Usuarios
          </button>
          <button
            @click="currentModule = 'computadoras'"
            :class="['menu-item', { active: currentModule === 'computadoras' }]"
          >
            💻 Computadoras
          </button>
          <button
            @click="currentModule = 'carros'"
            :class="['menu-item', { active: currentModule === 'carros' }]"
          >
            🛒 Carros
          </button>
          <button
            @click="currentModule = 'historial'"
            :class="['menu-item', { active: currentModule === 'historial' }]"
          >
            📋 Historial
          </button>
          <button
            @click="currentModule = 'qr'"
            :class="['menu-item', { active: currentModule === 'qr' }]"
          >
            📱 Escanear QR
          </button>
          <button
            v-if="admin.rol === 'superadmin'"
            @click="currentModule = 'admins'"
            :class="['menu-item', { active: currentModule === 'admins' }]"
          >
            🔐 Administradores
          </button>
        </nav>
      </div>

      <!-- Contenido del módulo -->
      <div class="content">
        <ModuloInicio v-if="currentModule === 'inicio'" />
        <ModuloPrestamos v-if="currentModule === 'prestamos'" />
        <ModuloDevoluciones v-if="currentModule === 'devoluciones'" />
        <ModuloUsuarios v-if="currentModule === 'usuarios'" />
        <ModuloComputadoras v-if="currentModule === 'computadoras'" />
        <ModuloCarros v-if="currentModule === 'carros'" />
        <ModuloHistorial v-if="currentModule === 'historial'" />
        <ModuloQR v-if="currentModule === 'qr'" />
        <ModuloAdmins v-if="currentModule === 'admins' && admin.rol === 'superadmin'" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ModuloInicio from '../components/ModuloInicio.vue';
import ModuloPrestamos from '../components/ModuloPrestamos.vue';
import ModuloDevoluciones from '../components/ModuloDevoluciones.vue';
import ModuloUsuarios from '../components/ModuloUsuarios.vue';
import ModuloComputadoras from '../components/ModuloComputadoras.vue';
import ModuloCarros from '../components/ModuloCarros.vue';
import ModuloHistorial from '../components/ModuloHistorial.vue';
import ModuloAdmins from '../components/ModuloAdmins.vue';
import ModuloQR from '../components/ModuloQR.vue';

const router = useRouter();
const admin = ref({});
const currentModule = ref('inicio');

onMounted(() => {
  const adminData = localStorage.getItem('admin');
  if (adminData) {
    admin.value = JSON.parse(adminData);
  }
});

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('admin');
  router.push('/');
};
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-logout {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  background: white;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.menu {
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 5px;
}

.menu-item {
  padding: 12px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  border-radius: 6px;
  transition: all 0.2s;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.menu-item:hover {
  background: #f0f0f0;
}

.menu-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .sidebar {
    width: 180px;
  }

  .header-content {
    flex-direction: column;
    gap: 15px;
  }

  .user-info {
    width: 100%;
    justify-content: space-between;
  }
}
</style>