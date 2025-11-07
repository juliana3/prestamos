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
    SELECT 
      p.id_prestamo,
      p.fecha_inicio,
      p.fecha_fin,
      p.estado,

      CASE 
        WHEN p.id_alumno IS NOT NULL THEN 'alumno'
        WHEN p.id_docente IS NOT NULL AND p.id_alumno IS NULL THEN 'docente'
      END AS tipo,

      COALESCE(a.nombre, da.nombre) AS nombre,
      COALESCE(a.apellido, da.apellido) AS apellido,

      -- docente a cargo (solo si el préstamo lo hizo un alumno)
      da.nombre AS docente_nombre,
      da.apellido AS docente_apellido,

      c.numero_inventario,
      c.estado AS estado_computadora,
      ca.nombre AS carro_nombre

    FROM prestamos p
    LEFT JOIN alumnos a ON p.id_alumno = a.id_alumno
    LEFT JOIN docentes da ON p.id_docente = da.id_docente
    LEFT JOIN computadoras c ON p.id_computadora = c.id_computadora
    LEFT JOIN carros ca ON c.id_carro = ca.id_carro
    ORDER BY p.fecha_inicio DESC;
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
      SELECT 
        p.id_prestamo,
        p.fecha_inicio,
        p.fecha_fin,
        p.estado,

        CASE 
          WHEN p.id_alumno IS NOT NULL THEN 'alumno'
          WHEN p.id_docente IS NOT NULL THEN 'docente'
        END AS tipo,

        COALESCE(a.nombre, da.nombre) AS nombre,
        COALESCE(a.apellido, da.apellido) AS apellido,

        da.nombre AS docente_nombre,
        da.apellido AS docente_apellido,

        c.numero_inventario,
        c.estado AS estado_computadora,
        ca.nombre AS carro_nombre

      FROM prestamos p
      LEFT JOIN alumnos a ON p.id_alumno = a.id_alumno
      LEFT JOIN docentes da ON p.id_docente = da.id_docente
      LEFT JOIN computadoras c ON p.id_computadora = c.id_computadora
      LEFT JOIN carros ca ON c.id_carro = ca.id_carro
      WHERE LOWER(TRIM(p.estado)) = 'activo'
      ORDER BY p.fecha_inicio DESC;
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
    const { id_usuario, tipo_usuario, id_computadora, id_docente } = req.body;


    if (!id_usuario || !tipo_usuario || !id_computadora) {
      return res.status(400).json({ error: 'id_usuario, tipo_usuario e id_computadora requeridos' });
    }

    const id_alumno = tipo_usuario === 'alumno' ? id_usuario : null;
    const id_docenteFinal =
      tipo_usuario === 'alumno'
        ? id_docente // alumno => docente a cargo
        : tipo_usuario === 'docente'
        ? id_usuario // docente => él mismo
        : null;


    // Buscar usuario según tipo
    let usuario;

    if (tipo_usuario === 'alumno') {
      usuario = await dbGet('SELECT * FROM alumnos WHERE id_alumno = ?', [id_usuario]);
    } else if (tipo_usuario === 'docente') {
      usuario = await dbGet('SELECT * FROM docentes WHERE id_docente = ?', [id_usuario]);
    } else {
      return res.status(400).json({ error: 'Tipo de usuario inválido' });
    }

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validar computadora
    const pc = await dbGet('SELECT * FROM computadoras WHERE id_computadora = ?', [id_computadora]);
    if (!pc) {
      return res.status(404).json({ error: 'Computadora no encontrada' });
    }
    if (pc.estado !== 'disponible') {
      return res.status(400).json({ error: 'Computadora no disponible' });
    }

    // Verificar si el usuario ya tiene un préstamo activo
    let prestamoActivo;

    if (tipo_usuario === 'alumno') {
      // El alumno no puede tener otro préstamo activo
      prestamoActivo = await dbGet(
        'SELECT * FROM prestamos WHERE id_alumno = ? AND estado = ?',
        [id_usuario, 'activo']
      );
    } else if (tipo_usuario === 'docente') {
      // El docente solo se bloquea si tiene un préstamo activo propio (sin alumno)
      prestamoActivo = await dbGet(
        'SELECT * FROM prestamos WHERE id_docente = ? AND id_alumno IS NULL AND estado = ?',
        [id_usuario, 'activo']
      );
    }

    if (prestamoActivo) {
      return res.status(400).json({ error: 'El usuario ya tiene un préstamo activo' });
    }


    // Crear préstamo
    const result = await dbRun(
      'INSERT INTO prestamos (id_alumno, id_docente, id_computadora, estado) VALUES (?, ?, ?, ?)',
      [id_alumno, id_docenteFinal, id_computadora, 'activo']
    );

    // Actualizar estado de la computadora
    await dbRun(
      'UPDATE computadoras SET estado = ? WHERE id_computadora = ?',
      ['prestada', id_computadora]
    );

    res.status(201).json({
      id_prestamo: result.lastID,
      usuario: `${usuario.nombre} ${usuario.apellido}`,
      tipo: tipo_usuario,
      computadora: pc.numero_inventario,
      message: 'Préstamo creado exitosamente'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando préstamo' });
  }
});


// DEVOLVER computadora
router.post('/:id/devolver', async (req, res) => {
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const { dbGet } = require('../database/init');
  const id = req.params.id;

  try {
    const dbPath = path.join(__dirname, '../../database.db');
    const tempDb = new sqlite3.Database(dbPath); // conexión nueva y aislada

    const prestamo = await dbGet('SELECT * FROM prestamos WHERE id_prestamo = ?', [id]);
    if (!prestamo) return res.status(404).json({ error: 'Préstamo no encontrado' });
    if (prestamo.estado === 'devuelto') return res.status(400).json({ error: 'Ya fue devuelto' });

    const ahora = new Date().toISOString();

    await new Promise((resolve, reject) => {
      tempDb.run(
        'UPDATE prestamos SET estado = ?, fecha_fin = ? WHERE id_prestamo = ?',
        ['devuelto', ahora, id],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    await new Promise((resolve, reject) => {
      tempDb.run(
        'UPDATE computadoras SET estado = ? WHERE id_computadora = ?',
        ['disponible', prestamo.id_computadora],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    tempDb.close(); // 🔒 cerramos conexión temporal

    console.log(`✅ Préstamo #${id} devuelto correctamente`);
    res.json({ message: 'Computadora devuelta exitosamente' });
  } catch (err) {
    console.error('❌ Error devolviendo computadora:', err);
    res.status(500).json({ error: 'Error devolviendo computadora' });
  }
});



// OBTENER préstamos activos de un usuario por DNI
router.get('/usuario/:dni', async (req, res) => {
  try {
    const dni = req.params.dni;

    // Buscar en alumnos
    let usuario = await dbGet('SELECT id_alumno AS id_usuario, nombre, apellido, "alumno" AS tipo FROM alumnos WHERE dni = ?', [dni]);
    // Si no se encuentra, buscar en docentes
    if (!usuario) {
      usuario = await dbGet('SELECT id_docente AS id_usuario, nombre, apellido, "docente" AS tipo FROM docentes WHERE dni = ?', [dni]);
    }

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Traer préstamos activos de ese usuario
    const prestamos = await dbAll(`
      SELECT p.*, c.numero_inventario
      FROM prestamos p
      JOIN computadoras c ON p.id_computadora = c.id_computadora
      WHERE (p.id_alumno = ? OR p.id_docente = ?) AND p.estado = 'activo'
    `, [usuario.id_usuario, usuario.id_usuario]);

    if (prestamos.length === 0) {
      return res.status(404).json({ error: 'Sin préstamos activos' });
    }

    res.json({ usuario, prestamos });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error obteniendo préstamos del usuario' });
  }
});


// OBTENER historial completo de préstamos
router.get('/historial', async (req, res) => {
  try {
    const prestamos = await dbAll(`
      SELECT 
        p.id_prestamo,
        COALESCE(a.nombre, d.nombre) AS nombre,
        COALESCE(a.apellido, d.apellido) AS apellido,
        CASE 
          WHEN a.id_alumno IS NOT NULL THEN 'alumno'
          ELSE 'docente'
        END AS tipo,
        COALESCE(a.dni, d.dni) AS dni,
        c.numero_inventario,
        p.fecha_inicio,
        p.fecha_fin,
        p.estado
      FROM prestamos p
      LEFT JOIN alumnos a ON p.id_alumno = a.id_alumno
      LEFT JOIN docentes d ON p.id_docente = d.id_docente
      JOIN computadoras c ON p.id_computadora = c.id_computadora
      ORDER BY p.fecha_inicio DESC
    `);

    res.json(prestamos);
  } catch (err) {
    console.error('Error obteniendo historial:', err);
    res.status(500).json({ error: 'Error obteniendo historial' });
  }
});



module.exports = router;