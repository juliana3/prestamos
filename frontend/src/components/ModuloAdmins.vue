<template>
  <div class="modulo">
    <div class="modulo-header">
      <h2>🔐 Administradores</h2>
      <button @click="mostrarFormulario = true" class="btn-nuevo">+ Nuevo Admin</button>
    </div>

    <!-- Formulario -->
    <div v-if="mostrarFormulario" class="form-modal">
      <div class="form-content">
        <h3>Crear Administrador</h3>
        
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="form.nombre" type="text" placeholder="Nombre" />
        </div>

        <div class="form-group">
          <label>Apellido</label>
          <input v-model="form.apellido" type="text" placeholder="Apellido" />
        </div>

        <div class="form-group">
          <label>Usuario</label>
          <input v-model="form.usuario" type="text" placeholder="Usuario único" />
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <input v-model="form.contraseña" type="password" placeholder="Contraseña segura" />
        </div>

        <div class="form-group">
          <label>Rol</label>
          <select v-model="form.rol">
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </div>

        <div class="form-actions">
          <button @click="guardarAdmin" class="btn-guardar" :disabled="loading">
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
            <th>Usuario</th>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="admin in admins" :key="admin.id_admin">
            <td><strong>{{ admin.usuario }}</strong></td>
            <td>{{ admin.nombre }} {{ admin.apellido }}</td>
            <td><span class="badge" :class="admin.rol">{{ admin.rol }}</span></td>
            <td class="acciones">
              <button @click="eliminarAdmin(admin.id_admin)" class="btn-eliminar">Desactivar</button>
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
import api from '../services/api';

const admins = ref([]);
const mostrarFormulario = ref(false);
const loading = ref(false);
const error = ref('');
const success = ref('');

const form = ref({
  nombre: '',
  apellido: '',
  usuario: '',
  contraseña: '',
  rol: 'admin'
});

onMounted(() => {
  cargarAdmins();
});

const cargarAdmins = async () => {
  try {
    const response = await api.get('/admins');
    admins.value = response.data;
  } catch (err) {
    error.value = 'Error cargando administradores';
  }
};

const guardarAdmin = async () => {
  error.value = '';
  loading.value = true;

  try {
    await api.post('/admins', form.value);
    success.value = '✓ Administrador creado';
    
    cerrarFormulario();
    await cargarAdmins();
  } catch (err) {
    error.value = err.response?.data?.error || 'Error creando administrador';
  } finally {
    loading.value = false;
  }
};

const eliminarAdmin = async (id) => {
  if (!confirm('¿Estás seguro de desactivar este administrador?')) return;

  try {
    await api.delete(`/admins/${id}`);
    success.value = '✓ Administrador desactivado';
    await cargarAdmins();
  } catch (err) {
    error.value = 'Error desactivando administrador';
  }
};

const cerrarFormulario = () => {
  mostrarFormulario.value = false;
  form.value = { nombre: '', apellido: '', usuario: '', contraseña: '', rol: 'admin' };
  error.value = '';
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

.badge.admin {
  background: #e3f2fd;
  color: #1976d2;
}

.badge.superadmin {
  background: #f3e5f5;
  color: #7b1fa2;
}

.acciones {
  display: flex;
  gap: 8px;
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