<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="header-left">
          <h1>Gestor de prestamos de Computadoras</h1>
        </div>
        <div class="header-right">
          <span class="user-badge">{{ admin.nombre }}</span>
          <button @click="logout" class="btn-logout">Cerrar Sesión</button>
        </div>
      </div>
    </header>

    <!-- Contenido Principal -->
    <main class="main-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <nav class="menu">
          <button
            @click="currentModule = 'inicio'"
            :class="['menu-item', { active: currentModule === 'inicio' }]"
          >
            <span class="icon"></span> Panel principal
          </button>
          <button
            @click="currentModule = 'computadoras'"
            :class="['menu-item', { active: currentModule === 'computadoras' }]"
          >
            <span class="icon"></span> Computadoras
          </button>
          <button
            @click="currentModule = 'prestamos'"
            :class="['menu-item', { active: currentModule === 'prestamos' }]"
          >
            <span class="icon"></span> Prestamos
          </button>
          <button
            @click="currentModule = 'alumnos'"
            :class="['menu-item', { active: currentModule === 'alumnos' }]"
          >
            <span class="icon"></span> Alumnos
          </button>
          <button
            @click="currentModule = 'docentes'"
            :class="['menu-item', { active: currentModule === 'docentes' }]"
          >
            <span class="icon"></span> Docentes
          </button>

          <button
            @click="currentModule = 'carros'"
            :class="['menu-item', { active: currentModule === 'carros' }]"
          >
            <span class="icon"></span> Carros
          </button>
          <button
            @click="currentModule = 'historial'"
            :class="['menu-item', { active: currentModule === 'historial' }]"
          >
            <span class="icon"></span> Historial
          </button>
          <button
            v-if="admin.rol === 'superadmin'"
            @click="currentModule = 'admins'"
            :class="['menu-item', { active: currentModule === 'admins' }]"
          >
            <span class="icon"></span> Administradores
          </button>
        </nav>
      </aside>

      <!-- Contenido -->
      <section class="content">
        <ModuloInicio v-if="currentModule === 'inicio'" />
        <ModuloPrestamos v-if="currentModule === 'prestamos'" />
        <ModuloAlumnos v-if="currentModule === 'alumnos'" />
        <ModuloDocentes v-if="currentModule === 'docentes'" />        
        <ModuloComputadoras v-if="currentModule === 'computadoras'" />
        <ModuloCarros v-if="currentModule === 'carros'" />
        <ModuloHistorial v-if="currentModule === 'historial'" />
        <ModuloAdmins v-if="currentModule === 'admins' && admin.rol === 'superadmin'" />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ModuloInicio from '../components/ModuloInicio.vue';
import ModuloPrestamos from '../components/ModuloPrestamos.vue';
import ModuloComputadoras from '../components/ModuloComputadoras.vue';
import ModuloAlumnos from '../components/ModuloAlumnos.vue';  
import ModuloDocentes from '../components/ModuloDocentes.vue';
import ModuloCarros from '../components/ModuloCarros.vue';
import ModuloHistorial from '../components/ModuloHistorial.vue';
import ModuloAdmins from '../components/ModuloAdmins.vue';

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
  background: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
}

.header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 30px;
  height: 70px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
}

.header-left h1 {
  margin: 0;
  font-size: 24px;
  color: #1a1a1a;
  font-weight: 700;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-badge {
  background: #f0f0f0;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: #555;
  font-weight: 600;
}

.btn-logout {
  background: #fff;
  border: 2px solid #e0e0e0;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-logout:hover {
  border-color: #667eea;
  color: #667eea;
}

.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  padding: 20px 0;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: none;
  border: none;
  cursor: pointer;
  color: #555;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  background: #f5f5f5;
  color: #667eea;
}

.menu-item.active {
  background: #f0f4ff;
  color: #667eea;
  border-left-color: #667eea;
}

.menu-item .icon {
  font-size: 18px;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 220px;
  }

  .header {
    padding: 0 15px;
  }

  .content {
    padding: 15px;
  }

  .header-left h1 {
    font-size: 18px;
  }
}
</style>