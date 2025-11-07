// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initTables, createDefaultAdmin } = require('./src/database/init');

// Importar rutas
const authRoutes = require('./src/routes/auth');
const carrosRoutes = require('./src/routes/carros');
const computadorasRoutes = require('./src/routes/computadoras');
const prestamosRoutes = require('./src/routes/prestamos');
const adminsRoutes = require('./src/routes/admins');
const alumnosRoutes = require('./src/routes/alumnos');
const docentesRoutes = require('./src/routes/docentes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());


// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: '✓ Servidor funcionando correctamente' });
});


// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/carros', carrosRoutes);
app.use('/api/computadoras', computadorasRoutes);
app.use('/api/prestamos', prestamosRoutes);
app.use('/api/admins', adminsRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/docentes', docentesRoutes);


// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path 
  });
});


// Inicializar base de datos
const startServer = async () => {
  try {
    console.log('🔄 Inicializando base de datos...');
    await initTables();
    await createDefaultAdmin();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📍 API disponible en http://localhost:${PORT}/api`);
      console.log(`🔧 Modo: ${process.env.NODE_ENV || 'development'}`);
      console.log(`${'='.repeat(50)}\n`);
    });
  } catch (err) {
    console.error('❌ Error fatal al iniciar servidor:', err);
    process.exit(1);
  }
};

startServer();