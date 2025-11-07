const express = require('express');
const { dbGet, dbAll, dbRun } = require('../database/init');
const { verifyToken, checkAdmin } = require('../middleware/auth');
const multer = require('multer');
const xlsx = require('xlsx');

// Configurar multer para recibir archivos temporales en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });


const router = express.Router();

// ✅ Middleware de seguridad
router.use(verifyToken);
router.use(checkAdmin);

// 📋 OBTENER todos los alumnos
router.get('/', async (req, res) => {
  try {
    const alumnos = await dbAll('SELECT * FROM alumnos ORDER BY apellido, nombre');
    res.json(alumnos);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error obteniendo alumnos' });
  }
});

// ➕ CREAR alumno
router.post('/', async (req, res) => {
  try {
    const { dni, nombre, apellido, celular, email, carrera } = req.body;

    if (!dni || !nombre || !apellido) {
      return res.status(400).json({ error: 'DNI, nombre y apellido son obligatorios' });
    }

    const result = await dbRun(
      `INSERT INTO alumnos (dni, nombre, apellido, celular, email, carrera)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [dni, nombre, apellido, celular, email, carrera]
    );

    res.status(201).json({
      id_alumno: result.lastID,
      dni,
      nombre,
      apellido,
      celular,
      email,
      carrera,
      message: 'Alumno creado exitosamente'
    });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'El DNI ya está registrado' });
    }
    console.error('Error:', err);
    res.status(500).json({ error: 'Error creando alumno' });
  }
});

// 🔍 OBTENER alumno por ID
router.get('/:id', async (req, res) => {
  try {
    const alumno = await dbGet('SELECT * FROM alumnos WHERE id_alumno = ?', [req.params.id]);
    if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado' });
    res.json(alumno);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error obteniendo alumno' });
  }
});

// ✏️ ACTUALIZAR alumno
router.put('/:id', async (req, res) => {
  try {
    const { nombre, apellido, celular, email, carrera, activo } = req.body;

    const alumno = await dbGet('SELECT * FROM alumnos WHERE id_alumno = ?', [req.params.id]);
    if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado' });

    await dbRun(
      `UPDATE alumnos 
       SET nombre = ?, apellido = ?, celular = ?, email = ?, carrera = ?, activo = ? 
       WHERE id_alumno = ?`,
      [nombre, apellido, celular, email, carrera, activo ?? 1, req.params.id]
    );

    res.json({ message: 'Alumno actualizado correctamente' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error actualizando alumno' });
  }
});

// ❌ ELIMINAR alumno
router.delete('/:id', async (req, res) => {
  try {
    const alumno = await dbGet('SELECT * FROM alumnos WHERE id_alumno = ?', [req.params.id]);
    if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado' });

    await dbRun('DELETE FROM alumnos WHERE id_alumno = ?', [req.params.id]);
    res.json({ message: 'Alumno eliminado exitosamente' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error eliminando alumno' });
  }
});

// 🔎 BUSCAR por DNI
router.get('/dni/:dni', async (req, res) => {
  try {
    const alumno = await dbGet('SELECT * FROM alumnos WHERE dni = ?', [req.params.dni]);
    if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado' });
    res.json(alumno);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error buscando alumno' });
  }
});


//carga masiva de alumnos desde un excel
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
      const { dni, nombre, apellido, celular, email, carrera } = row;

      // Validar datos mínimos
      if (!dni || !nombre || !apellido) continue;

      try {
        await dbRun(
          `INSERT INTO alumnos (dni, nombre, apellido, celular, email, carrera)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [dni, nombre, apellido, celular || '', email || '', carrera || '']
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
