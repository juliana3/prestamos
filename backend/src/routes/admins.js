// backend/src/routes/admins.js
const express = require('express');
const bcrypt = require('bcrypt');
const { dbGet, dbAll, dbRun } = require('../database/init');
const { verifyToken, checkSuperAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);
router.use(checkSuperAdmin);

// OBTENER todos los administradores
router.get('/', async (req, res) => {
  try {
    const admins = await dbAll(
      'SELECT id_admin, nombre, apellido, usuario, rol, activo FROM administradores ORDER BY fecha_creacion DESC'
    );
    res.json(admins);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error obteniendo administradores' });
  }
});

// CREAR administrador
router.post('/', async (req, res) => {
  try {
    const { nombre, apellido, usuario, contraseña, rol } = req.body;

    if (!nombre || !apellido || !usuario || !contraseña) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (!['admin', 'superadmin'].includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    const hashedPass = await bcrypt.hash(contraseña, 10);

    const result = await dbRun(
      'INSERT INTO administradores (nombre, apellido, usuario, contraseña, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, usuario, hashedPass, rol || 'admin']
    );

    res.status(201).json({
      id_admin: result.lastID,
      usuario,
      nombre,
      rol,
      message: 'Administrador creado exitosamente'
    });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }
    console.error('Error:', err);
    res.status(500).json({ error: 'Error creando administrador' });
  }
});

// DESACTIVAR administrador
router.delete('/:id', async (req, res) => {
  try {
    const admin = await dbGet('SELECT * FROM administradores WHERE id_admin = ?', [req.params.id]);
    if (!admin) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }

    // No permitir desactivar el propio usuario
    if (req.admin.id_admin === parseInt(req.params.id)) {
      return res.status(400).json({ error: 'No puedes desactivar tu propio usuario' });
    }

    await dbRun('UPDATE administradores SET activo = 0 WHERE id_admin = ?', [req.params.id]);

    res.json({ message: 'Administrador desactivado exitosamente' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error desactivando administrador' });
  }
});

// RESETEAR contraseña
router.post('/:id/reset-password', async (req, res) => {
  try {
    const { nueva_contraseña } = req.body;

    if (!nueva_contraseña) {
      return res.status(400).json({ error: 'Nueva contraseña requerida' });
    }

    const hashedPass = await bcrypt.hash(nueva_contraseña, 10);
    await dbRun('UPDATE administradores SET contraseña = ? WHERE id_admin = ?', [hashedPass, req.params.id]);

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error actualizando contraseña' });
  }
});

module.exports = router;