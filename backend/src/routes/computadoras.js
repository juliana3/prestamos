// backend/src/routes/computadoras.js
const express = require('express');
const { dbGet, dbAll, dbRun } = require('../database/init');
const { verifyToken, checkAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);
router.use(checkAdmin);

// OBTENER todas las computadoras
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT c.*, ca.nombre
      FROM computadoras c
      LEFT JOIN carros ca ON c.id_carro = ca.id_carro
      ORDER BY c.numero_inventario
    `;
    const computadoras = await dbAll(query);
    res.json(computadoras);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error obteniendo computadoras' });
  }
});

// CREAR computadora
router.post('/', async (req, res) => {
  try {
    const { numero_inventario, id_carro, estado } = req.body;

    if (!numero_inventario || !id_carro) {
      return res.status(400).json({ error: 'Número de inventario e id_carro requeridos' });
    }

    // Verificar que el carro existe
    const carro = await dbGet('SELECT * FROM carros WHERE id_carro = ?', [id_carro]);
    if (!carro) {
      return res.status(404).json({ error: 'Carro no encontrado' });
    }

    const result = await dbRun(
      'INSERT INTO computadoras (numero_inventario, id_carro, estado) VALUES (?, ?, ?)',
      [numero_inventario, id_carro, estado || 'disponible']
    );

    res.status(201).json({
      id_computadora: result.lastID,
      numero_inventario,
      id_carro,
      estado: estado || 'disponible',
      message: 'Computadora creada exitosamente'
    });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'El número de inventario ya existe' });
    }
    console.error('Error:', err);
    res.status(500).json({ error: 'Error creando computadora' });
  }
});

// OBTENER solo computadoras disponibles
router.get('/disponibles', async (req, res) => {
  try {
    const computadoras = await dbAll(`
      SELECT c.*, ca.nombre
      FROM computadoras c
      LEFT JOIN carros ca ON c.id_carro = ca.id_carro
      WHERE c.estado = 'disponible'
      ORDER BY c.numero_inventario
    `);
    res.json(computadoras);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error obteniendo computadoras disponibles' });
  }
});

// OBTENER computadora por ID
router.get('/:id', async (req, res) => {
  try {
    const query = `
      SELECT c.*, ca.nombre 
      FROM computadoras c
      LEFT JOIN carros ca ON c.id_carro = ca.id_carro
      WHERE c.id_computadora = ?
    `;
    const pc = await dbGet(query, [req.params.id]);
    
    if (!pc) {
      return res.status(404).json({ error: 'Computadora no encontrada' });
    }

    res.json(pc);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error obteniendo computadora' });
  }
});

// ACTUALIZAR computadora
router.put('/:id', async (req, res) => {
  try {
    const { numero_inventario, id_carro, estado } = req.body;

    if (!numero_inventario || !id_carro) {
      return res.status(400).json({ error: 'Número de inventario e id_carro requeridos' });
    }

    const pc = await dbGet('SELECT * FROM computadoras WHERE id_computadora = ?', [req.params.id]);
    if (!pc) {
      return res.status(404).json({ error: 'Computadora no encontrada' });
    }

    // Verificar que el carro existe
    const carro = await dbGet('SELECT * FROM carros WHERE id_carro = ?', [id_carro]);
    if (!carro) {
      return res.status(404).json({ error: 'Carro no encontrado' });
    }

    await dbRun(
      'UPDATE computadoras SET numero_inventario = ?, id_carro = ?, estado = ? WHERE id_computadora = ?',
      [numero_inventario, id_carro, estado || 'disponible', req.params.id]
    );

    res.json({ message: 'Computadora actualizada exitosamente' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'El número de inventario ya existe' });
    }
    console.error('Error:', err);
    res.status(500).json({ error: 'Error actualizando computadora' });
  }
});

// ELIMINAR computadora
router.delete('/:id', async (req, res) => {
  try {
    const pc = await dbGet('SELECT * FROM computadoras WHERE id_computadora = ?', [req.params.id]);
    if (!pc) {
      return res.status(404).json({ error: 'Computadora no encontrada' });
    }

    await dbRun('DELETE FROM computadoras WHERE id_computadora = ?', [req.params.id]);

    res.json({ message: 'Computadora eliminada exitosamente' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error eliminando computadora' });
  }
});




module.exports = router;