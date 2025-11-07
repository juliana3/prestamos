// backend/src/routes/carros.js
const express = require('express');
const { dbGet, dbAll, dbRun } = require('../database/init');
const { verifyToken, checkAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);
router.use(checkAdmin);

// OBTENER todos los carros
router.get('/', async (req, res) => {
  try {
    const carros = await dbAll('SELECT * FROM carros ORDER BY nombre ASC');
    res.json(carros);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error obteniendo carros' });
  }
});

// CREAR carro
router.post('/', async (req, res) => {
  try {
    
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'Nombre requerido' });
    }

    const result = await dbRun(
      'INSERT INTO carros (nombre) VALUES (?)',
      [nombre]
    );

    res.status(201).json({
      id_carro: result.lastID,
      nombre,
      message: 'Carro creado exitosamente'
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error creando carro' });
  }
});

// OBTENER carro por ID
router.get('/:id', async (req, res) => {
  try {
    const carro = await dbGet('SELECT * FROM carros WHERE id_carro = ?', [req.params.id]);
    
    if (!carro) {
      return res.status(404).json({ error: 'Carro no encontrado' });
    }

    res.json(carro);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error obteniendo carro' });
  }
});

// ACTUALIZAR carro
router.put('/:id', async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'Nombre requerido' });
    }

    const carro = await dbGet('SELECT * FROM carros WHERE id_carro = ?', [req.params.id]);
    if (!carro) {
      return res.status(404).json({ error: 'Carro no encontrado' });
    }

    await dbRun(
      'UPDATE carros SET nombre = ? WHERE id_carro = ?',
      [nombre, req.params.id]
    );

    // Aquí podrías actualizar otras columnas existentes si las tenés
    res.json({ message: 'Carro actualizado exitosamente' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error actualizando carro' });
  }
});

// ELIMINAR carro
router.delete('/:id', async (req, res) => {
  try {
    const carro = await dbGet('SELECT * FROM carros WHERE id_carro = ?', [req.params.id]);
    if (!carro) {
      return res.status(404).json({ error: 'Carro no encontrado' });
    }

    // Verificar si tiene computadoras asociadas
    const computadoras = await dbAll(
      'SELECT COUNT(*) as count FROM computadoras WHERE id_carro = ?',
      [req.params.id]
    );
    if (computadoras[0].count > 0) {
      return res.status(400).json({ error: 'No se puede eliminar un carro que tiene computadoras' });
    }

    await dbRun('DELETE FROM carros WHERE id_carro = ?', [req.params.id]);
    res.json({ message: 'Carro eliminado exitosamente' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error eliminando carro' });
  }
});
module.exports = router;