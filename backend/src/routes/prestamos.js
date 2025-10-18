// backend/src/routes/prestamos.js
const express = require('express');
const { dbGet, dbAll, dbRun } = require('../database/init');
const { verifyToken, checkAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);
router.use(checkAdmin);

// OBTENER todos los préstamos
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT p.*, u.dni, u.nombre, u.apellido, u.tipo, c.numero_inventario
      FROM prestamos p
      JOIN usuarios u ON p.id_usuario = u.id_usuario
      JOIN computadoras c ON p.id_computadora = c.id_computadora
      ORDER BY p.fecha_inicio DESC
    `;
    const prestamos = await dbAll(query);
    res.json(prestamos);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error obteniendo préstamos' });
  }
});

// OBTENER solo préstamos activos
router.get('/activos', async (req, res) => {
  try {
    const query = `
      SELECT p.*, u.dni, u.nombre, u.apellido, u.tipo, c.numero_inventario
      FROM prestamos p
      JOIN usuarios u ON p.id_usuario = u.id_usuario
      JOIN computadoras c ON p.id_computadora = c.id_computadora
      WHERE p.estado = 'activo'
      ORDER BY p.fecha_inicio DESC
    `;
    const prestamos = await dbAll(query);
    res.json(prestamos);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error obteniendo préstamos activos' });
  }
});

// CREAR préstamo (flujo principal de préstamo)
router.post('/', async (req, res) => {
  try {
    const { id_usuario, id_computadora } = req.body;

    // Validar que vengan los datos
    if (!id_usuario || !id_computadora) {
      return res.status(400).json({ error: 'id_usuario e id_computadora requeridos' });
    }

    // Validar que el usuario existe
    const usuario = await dbGet('SELECT * FROM usuarios WHERE id_usuario = ?', [id_usuario]);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validar que la computadora existe
    const pc = await dbGet('SELECT * FROM computadoras WHERE id_computadora = ?', [id_computadora]);
    if (!pc) {
      return res.status(404).json({ error: 'Computadora no encontrada' });
    }

    // Validar que la computadora está disponible
    if (pc.estado !== 'disponible') {
      return res.status(400).json({ error: `Computadora no disponible. Estado: ${pc.estado}` });
    }

    // Verificar si el usuario ya tiene un préstamo activo
    const prestamoActivo = await dbGet(
      'SELECT * FROM prestamos WHERE id_usuario = ? AND estado = ?',
      [id_usuario, 'activo']
    );
    if (prestamoActivo) {
      return res.status(400).json({ error: 'El usuario ya tiene un préstamo activo' });
    }

    // Crear el préstamo
    const result = await dbRun(
      'INSERT INTO prestamos (id_usuario, id_computadora) VALUES (?, ?)',
      [id_usuario, id_computadora]
    );

    // Actualizar estado de la computadora a 'prestada'
    await dbRun(
      'UPDATE computadoras SET estado = ? WHERE id_computadora = ?',
      ['prestada', id_computadora]
    );

    res.status(201).json({
      id_prestamo: result.lastID,
      usuario: `${usuario.nombre} ${usuario.apellido}`,
      computadora: pc.numero_inventario,
      message: 'Préstamo creado exitosamente'
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error creando préstamo' });
  }
});

// DEVOLVER computadora (cerrar préstamo)
router.post('/:id/devolver', async (req, res) => {
  try {
    const prestamo = await dbGet('SELECT * FROM prestamos WHERE id_prestamo = ?', [req.params.id]);
    
    if (!prestamo) {
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }

    if (prestamo.estado === 'devuelto') {
      return res.status(400).json({ error: 'Este préstamo ya fue devuelto' });
    }

    // Actualizar préstamo (marcar como devuelto y poner fecha_fin)
    const ahora = new Date().toISOString();
    await dbRun(
      'UPDATE prestamos SET estado = ?, fecha_fin = ? WHERE id_prestamo = ?',
      ['devuelto', ahora, req.params.id]
    );

    // Actualizar estado de la computadora a 'disponible'
    await dbRun(
      'UPDATE computadoras SET estado = ? WHERE id_computadora = ?',
      ['disponible', prestamo.id_computadora]
    );

    res.json({ message: 'Computadora devuelta exitosamente' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error devolviendo computadora' });
  }
});

// OBTENER préstamos activos de un usuario (por DNI)
router.get('/usuario/:dni', async (req, res) => {
  try {
    const query = `
      SELECT p.*, u.dni, u.nombre, u.apellido, u.tipo, c.numero_inventario
      FROM prestamos p
      JOIN usuarios u ON p.id_usuario = u.id_usuario
      JOIN computadoras c ON p.id_computadora = c.id_computadora
      WHERE u.dni = ? AND p.estado = 'activo'
    `;
    const prestamos = await dbAll(query, [req.params.dni]);
    
    if (prestamos.length === 0) {
      return res.status(404).json({ error: 'Sin préstamos activos' });
    }

    res.json(prestamos);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error obteniendo préstamos del usuario' });
  }
});

// OBTENER historial de préstamos de un usuario
router.get('/historial/:dni', async (req, res) => {
  try {
    const query = `
      SELECT p.*, u.dni, u.nombre, u.apellido, u.tipo, c.numero_inventario
      FROM prestamos p
      JOIN usuarios u ON p.id_usuario = u.id_usuario
      JOIN computadoras c ON p.id_computadora = c.id_computadora
      WHERE u.dni = ?
      ORDER BY p.fecha_inicio DESC
    `;
    const prestamos = await dbAll(query, [req.params.dni]);
    res.json(prestamos);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error obteniendo historial' });
  }
});

module.exports = router;