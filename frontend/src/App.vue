<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from './services/api';

const router = useRouter();

onMounted(async () => {
  // Verificar si ya hay un token guardado
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      // Verificar que el token sea válido
      await authService.verify();
    } catch (err) {
      // Token inválido, limpiar y redirigir a login
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      router.push('/');
    }
  }
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#app {
  width: 100%;
  height: 100%;
}
</style>