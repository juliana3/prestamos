// frontend/src/services/api.js
import axios from 'axios';

const API_URL = 'http://192.168.100.25:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token en cada solicitud
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    window.location.href = '/';
  }
  return Promise.reject(error);
});

// ==================== AUTENTICACIÓN ====================
export const authService = {
  login: (usuario, contraseña) => api.post('/auth/login', { usuario, contraseña }),
  verify: () => api.get('/auth/verify'),
  logout: () => api.post('/auth/logout')
};

// ==================== USUARIOS ====================
export const usuariosService = {
  getAll: () => api.get('/usuarios'),
  getById: (id) => api.get(`/usuarios/${id}`),
  getByDni: (dni) => api.get(`/usuarios/dni/${dni}`),
  create: (data) => api.post('/usuarios', data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  delete: (id) => api.delete(`/usuarios/${id}`)
};

// ==================== CARROS ====================
export const carrosService = {
  getAll: () => api.get('/carros'),
  getById: (id) => api.get(`/carros/${id}`),
  create: (data) => api.post('/carros', data),
  update: (id, data) => api.put(`/carros/${id}`, data),
  delete: (id) => api.delete(`/carros/${id}`)
};

// ==================== COMPUTADORAS ====================
export const computadorasService = {
  getAll: () => api.get('/computadoras'),
  getById: (id) => api.get(`/computadoras/${id}`),
  create: (data) => api.post('/computadoras', data),
  update: (id, data) => api.put(`/computadoras/${id}`, data),
  delete: (id) => api.delete(`/computadoras/${id}`)
};

// ==================== PRÉSTAMOS ====================
export const prestamosService = {
  getAll: () => api.get('/prestamos'),
  getActivos: () => api.get('/prestamos/activos'),
  getByDni: (dni) => api.get(`/prestamos/usuario/${dni}`),
  getHistorialByDni: (dni) => api.get(`/prestamos/historial/${dni}`),
  create: (data) => api.post('/prestamos', data),
  devolver: (id) => api.post(`/prestamos/${id}/devolver`)
};

export default api;