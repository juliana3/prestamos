<template>
  <div class="login-wrapper">
    <div class="login-container">
      <!-- Logo y Título -->
      <div class="login-header">
        <div class="logo"></div>
        <h1>Gestor de prestamos de computadoras</h1>
        <p>Ingresa tus credenciales para acceder al sistema</p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Usuario</label>
          <input
            v-model="form.usuario"
            type="text"
            placeholder="Ingresa tu usuario"
            required
          />
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <input
            v-model="form.contraseña"
            type="password"
            placeholder="Ingresa tu contraseña"
            required
          />
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? '⏳ Iniciando Sesión...' : ' Iniciar Sesión' }}
        </button>

        <div v-if="error" class="alert alert-error">
          ⚠️ {{ error }}
        </div>
      </form>

      <!-- Credenciales de prueba -->
      <div class="demo-credentials">
        <p><strong>Usuario por defecto:</strong> superadmin</p>
        <p><strong>Contraseña:</strong> admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/api';

const router = useRouter();
const form = ref({ usuario: '', contraseña: '' });
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  error.value = '';
  loading.value = true;

  try {
    const response = await authService.login(form.value.usuario, form.value.contraseña);
    const { token, admin } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('admin', JSON.stringify(admin));

    router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al iniciar sesión';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
  padding: 20px;
}

.login-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 50px 40px;
  width: 100%;
  max-width: 420px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  font-size: 48px;
  margin-bottom: 15px;
}

.login-header h1 {
  margin: 0;
  font-size: 28px;
  color: #1a1a1a;
  font-weight: 700;
}

.login-header p {
  margin: 8px 0 0 0;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 14px;
}

.form-group input {
  padding: 12px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-login {
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert {
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 14px;
}

.alert-error {
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.demo-credentials {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid #667eea;
}

.demo-credentials p {
  margin: 4px 0;
  font-size: 13px;
  color: #555;
}

.demo-credentials strong {
  color: #1a1a1a;
}
</style>