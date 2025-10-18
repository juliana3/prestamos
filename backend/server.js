// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initTables, createDefaultAdmin } = require('./src/database/init');

// Importar rutas
const authRoutes = require('./src/routes/auth');
const usuariosRoutes = require('./src/routes/usuarios');
const carrosRoutes = require('./src/routes/carros');
const computadorasRoutes = require('./src/routes/computadoras');
const prestamosRoutes = require('./src/routes/prestamos');
const adminsRoutes = require('./src/routes/admins');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/carros', carrosRoutes);
app.use('/api/computadoras', computadorasRoutes);
app.use('/api/prestamos', prestamosRoutes);
app.use('/api/admins', adminsRoutes);

app.use(cors());

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: '✓ Servidor funcionando correctamente' });
});

// Inicializar base de datos
const startServer = async () => {
  try {
    await initTables();
    await createDefaultAdmin();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📍 URL API: http://localhost:${PORT}/api\n`);
    });
  } catch (err) {
    console.error('❌ Error al iniciar:', err);
    process.exit(1);
  }
};

startServer();