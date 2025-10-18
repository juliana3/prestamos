// backend/src/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { dbGet, dbRun } = require('../database/init');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// LOGIN - Generar token JWT
router.post('/login', async (req, res) => {
  try {
    const { usuario, contraseña } = req.body;

    // Validar que vengan usuario y contraseña
    if (!usuario || !contraseña) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    // Buscar el administrador en la BD
    const admin = await dbGet(
      'SELECT * FROM administradores WHERE usuario = ? AND activo = 1',
      [usuario]
    );

    if (!admin) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Comparar contraseña con hash almacenado
    const validPassword = await bcrypt.compare(contraseña, admin.contraseña);
    if (!validPassword) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id_admin: admin.id_admin,
        usuario: admin.usuario,
        rol: admin.rol,
        nombre: admin.nombre
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Devolver token e info del admin
    res.json({
      token,
      admin: {
        id_admin: admin.id_admin,
        nombre: admin.nombre,
        apellido: admin.apellido,
        usuario: admin.usuario,
        rol: admin.rol
      }
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// VERIFY - Verificar si el token es válido
router.get('/verify', verifyToken, (req, res) => {
  res.json({
    valid: true,
    admin: req.admin
  });
});

// LOGOUT - El frontend elimina el token (aquí es solo confirmación)
router.post('/logout', verifyToken, (req, res) => {
  res.json({ message: 'Sesión cerrada correctamente' });
});

module.exports = router;