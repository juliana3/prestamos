//construccion de la base de datos
// backend/src/database/init.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database.db');

// Crear/conectar a la base de datos
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('❌ Error conectando a la BD:', err);
    process.exit(1);
  }
  console.log('✓ SQLite conectado en:', dbPath);

  // Configuraciones robustas para concurrencia
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA busy_timeout = 10000;
  `, (err) => {
    if (err) console.error('⚠️ Error aplicando PRAGMAs:', err.message);
    else console.log('⚙️ Modo WAL y timeout configurados correctamente');
  });
});


// Funciones auxiliares para trabajar con promesas
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Inicializar tablas
const initTables = async () => {
  try {
    console.log('🔄 Creando tablas...');

    // Tabla ALUMNOS
    await dbRun(`
      CREATE TABLE IF NOT EXISTS alumnos (
        id_alumno INTEGER PRIMARY KEY AUTOINCREMENT,
        dni TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        celular TEXT,
        email TEXT,
        carrera TEXT,
        activo INTEGER DEFAULT 1,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        id_docente INTEGER,
        FOREIGN KEY (id_docente) REFERENCES docentes(id_docente) ON DELETE SET NULL
      )
    `);
    console.log('✓ Tabla alumnos creada');

    // Tabla DOCENTES
    await dbRun(`
      CREATE TABLE IF NOT EXISTS docentes (
        id_docente INTEGER PRIMARY KEY AUTOINCREMENT,
        dni TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        celular TEXT,
        email TEXT,
        activo INTEGER DEFAULT 1,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla docentes creada');

    // Tabla Carros
    await dbRun(`
      CREATE TABLE IF NOT EXISTS carros (
        id_carro INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        nombre TEXT NOT NULL
      )
    `);
    console.log('✓ Tabla carros creada');

    // Tabla Computadoras
    await dbRun(`
      CREATE TABLE IF NOT EXISTS computadoras (
        id_computadora INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_inventario TEXT UNIQUE NOT NULL,
        id_carro INTEGER NOT NULL,
        estado TEXT NOT NULL DEFAULT 'disponible' CHECK(estado IN ('disponible', 'prestada', 'en reparación')),
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_carro) REFERENCES carros(id_carro) ON DELETE CASCADE
      )
    `);
    console.log('✓ Tabla computadoras creada');

    
  // Tabla PRESTAMOS
    await dbRun(`
      CREATE TABLE IF NOT EXISTS prestamos (
        id_prestamo INTEGER PRIMARY KEY AUTOINCREMENT,
        id_alumno INTEGER,
        id_docente INTEGER,
        id_computadora INTEGER NOT NULL,
        fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_fin DATETIME,
        estado TEXT NOT NULL DEFAULT 'activo' CHECK(estado IN ('activo', 'devuelto')),
        observaciones TEXT,
        FOREIGN KEY (id_alumno) REFERENCES alumnos(id_alumno) ON DELETE SET NULL,
        FOREIGN KEY (id_docente) REFERENCES docentes(id_docente) ON DELETE SET NULL,
        FOREIGN KEY (id_computadora) REFERENCES computadoras(id_computadora) ON DELETE CASCADE
      )
    `);
    console.log('✓ Tabla prestamos creada');


    // Tabla Administradores
    await dbRun(`
      CREATE TABLE IF NOT EXISTS administradores (
        id_admin INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        usuario TEXT UNIQUE NOT NULL,
        contraseña TEXT NOT NULL,
        rol TEXT NOT NULL DEFAULT 'admin' CHECK(rol IN ('admin', 'superadmin')),
        activo INTEGER DEFAULT 1,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla administradores creada');

    console.log('✓ Todas las tablas creadas correctamente');
  } catch (err) {
    console.error('❌ Error creando tablas:', err.message);
  }
};

// Crear superadmin por defecto
const createDefaultAdmin = async () => {
  try {
    const bcrypt = require('bcrypt');
    
    const adminExiste = await dbGet('SELECT * FROM administradores WHERE usuario = ?', ['superadmin']);
    
    if (!adminExiste) {
      const hashedPass = await bcrypt.hash('admin123', 10);
      await dbRun(
        'INSERT INTO administradores (nombre, apellido, usuario, contraseña, rol) VALUES (?, ?, ?, ?, ?)',
        ['Super', 'Admin', 'superadmin', hashedPass, 'superadmin']
      );
      console.log('✓ Superadmin creado');
      console.log('   👤 Usuario: superadmin');
      console.log('   🔑 Contraseña: admin123');
    } else {
      console.log('✓ Superadmin ya existe');
    }
  } catch (err) {
    console.error('❌ Error creando superadmin:', err.message);
  }
};

// Exportar
module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll,
  initTables,
  createDefaultAdmin
};