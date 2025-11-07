const express = require('express');
const { dbGet, dbAll, dbRun } = require('../database/init');
const { verifyToken, checkAdmin } = require('../middleware/auth');
const multer = require('multer');
const xlsx = require('xlsx');

// Configurar multer para recibir archivos temporales en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });


const router = express.Router();

router.use(verifyToken);
router.use(checkAdmin);

// 📋 OBTENER todos los docentes
router.get('/', async (req, res) => {
  try {
    const docentes = await dbAll('SELECT * FROM docentes ORDER BY apellido, nombre');
    res.json(docentes);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error obteniendo docentes' });
  }
});

// ➕ CREAR docente
router.post('/', async (req, res) => {
  try {
    const { dni, nombre, apellido, celular, email, departamento } = req.body;

    if (!dni || !nombre || !apellido) {
      return res.status(400).json({ error: 'DNI, nombre y apellido son obligatorios' });
    }

    const result = await dbRun(
      `INSERT INTO docentes (dni, nombre, apellido, celular, email)
       VALUES (?, ?, ?, ?, ?)`,
      [dni, nombre, apellido, celular, email]
    );

    res.status(201).json({
      id_docente: result.lastID,
      dni,
      nombre,
      apellido,
      celular,
      email,
      message: 'Docente creado exitosamente'
    });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'El DNI ya está registrado' });
    }
    console.error('Error:', err);
    res.status(500).json({ error: 'Error creando docente' });
  }
});

// 🔍 OBTENER docente por ID
router.get('/:id', async (req, res) => {
  try {
    const docente = await dbGet('SELECT * FROM docentes WHERE id_docente = ?', [req.params.id]);
    if (!docente) return res.status(404).json({ error: 'Docente no encontrado' });
    res.json(docente);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error obteniendo docente' });
  }
});

// ✏️ ACTUALIZAR docente
router.put('/:id', async (req, res) => {
  try {
    const { nombre, apellido, celular, email, departamento, activo } = req.body;

    const docente = await dbGet('SELECT * FROM docentes WHERE id_docente = ?', [req.params.id]);
    if (!docente) return res.status(404).json({ error: 'Docente no encontrado' });

    await dbRun(
      `UPDATE docentes 
       SET nombre = ?, apellido = ?, celular = ?, email = ?, activo = ? 
       WHERE id_docente = ?`,
      [nombre, apellido, celular, email, activo ?? 1, req.params.id]
    );

    res.json({ message: 'Docente actualizado correctamente' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error actualizando docente' });
  }
});

// ❌ ELIMINAR docente
router.delete('/:id', async (req, res) => {
  try {
    const docente = await dbGet('SELECT * FROM docentes WHERE id_docente = ?', [req.params.id]);
    if (!docente) return res.status(404).json({ error: 'Docente no encontrado' });

    await dbRun('DELETE FROM docentes WHERE id_docente = ?', [req.params.id]);
    res.json({ message: 'Docente eliminado exitosamente' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error eliminando docente' });
  }
});

// 🔎 BUSCAR por DNI
router.get('/dni/:dni', async (req, res) => {
  try {
    const docente = await dbGet('SELECT * FROM docentes WHERE dni = ?', [req.params.dni]);
    if (!docente) return res.status(404).json({ error: 'Docente no encontrado' });
    res.json(docente);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error buscando docente' });
  }
});


//carga masiva de docentes desde un excel
router.post('/carga-masiva', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    // Leer el Excel desde el buffer
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (!data.length) {
      return res.status(400).json({ error: 'El archivo está vacío o mal formateado' });
    }

    let insertados = 0;
    for (const row of data) {
      const { dni, nombre, apellido, celular, email} = row;

      // Validar datos mínimos
      if (!dni || !nombre || !apellido) continue;

      try {
        await dbRun(
          `INSERT INTO docentes (dni, nombre, apellido, celular, email)
           VALUES (?, ?, ?, ?, ?)`,
          [dni, nombre, apellido, celular || '', email || '']
        );
        insertados++;
      } catch (err) {
        // Ignorar duplicados (DNI repetido)
        if (!err.message.includes('UNIQUE')) {
          console.error('Error insertando fila:', row, err);
        }
      }
    }

    res.json({ message: `Carga masiva completada (${insertados} registros insertados)` });
  } catch (err) {
    console.error('Error procesando Excel:', err);
    res.status(500).json({ error: 'Error procesando el archivo Excel' });
  }
});
module.exports = router;
