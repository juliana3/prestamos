// backend/src/routes/usuarios.js
const express = require('express');
const { dbGet, dbAll, dbRun } = require('../database/init');
const { verifyToken, checkAdmin } = require('../middleware/auth');

const router = express.Router();

// Todos los endpoints requieren autenticación
router.use(verifyToken);
router.use(checkAdmin);

// OBTENER todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await dbAll('SELECT * FROM usuarios ORDER BY apellido, nombre');
    res.json(usuarios);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
});

// CREAR usuario
router.post('/', async (req, res) => {
  try {
    const { dni, nombre, apellido, tipo } = req.body;

    // Validar campos obligatorios
    if (!dni || !nombre || !apellido || !tipo) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Validar que tipo sea válido
    if (!['alumno', 'docente'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo debe ser "alumno" o "docente"' });
    }

    const result = await dbRun(
      'INSERT INTO usuarios (dni, nombre, apellido, tipo) VALUES (?, ?, ?, ?)',
      [dni, nombre, apellido, tipo]
    );

    res.status(201).json({
      id_usuario: result.lastID,
      dni,
      nombre,
      apellido,
      tipo,
      message: 'Usuario creado exitosamente'
    });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'El DNI ya existe' });
    }
    console.error('Error:', err);
    res.status(500).json({ error: 'Error creando usuario' });
  }
});

// OBTENER usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const usuario = await dbGet('SELECT * FROM usuarios WHERE id_usuario = ?', [req.params.id]);
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error obteniendo usuario' });
  }
});

// ACTUALIZAR usuario
router.put('/:id', async (req, res) => {
  try {
    const { nombre, apellido, tipo } = req.body;

    if (!nombre || !apellido || !tipo) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const usuario = await dbGet('SELECT * FROM usuarios WHERE id_usuario = ?', [req.params.id]);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await dbRun(
      'UPDATE usuarios SET nombre = ?, apellido = ?, tipo = ? WHERE id_usuario = ?',
      [nombre, apellido, tipo, req.params.id]
    );

    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error actualizando usuario' });
  }
});

// ELIMINAR usuario
router.delete('/:id', async (req, res) => {
  try {
    const usuario = await dbGet('SELECT * FROM usuarios WHERE id_usuario = ?', [req.params.id]);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await dbRun('DELETE FROM usuarios WHERE id_usuario = ?', [req.params.id]);

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error eliminando usuario' });
  }
});

// BUSCAR usuario por DNI
router.get('/dni/:dni', async (req, res) => {
  try {
    const usuario = await dbGet('SELECT * FROM usuarios WHERE dni = ?', [req.params.dni]);
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error buscando usuario' });
  }
});

module.exports = router;