// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_super_segura';

// Verificar token JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Verificar que sea superadmin
const checkSuperAdmin = (req, res, next) => {
  if (req.admin.rol !== 'superadmin') {
    return res.status(403).json({ error: 'Acceso denegado. Solo superadmin' });
  }
  next();
};

// Verificar que sea admin o superadmin
const checkAdmin = (req, res, next) => {
  if (req.admin.rol !== 'admin' && req.admin.rol !== 'superadmin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
};

module.exports = {
  verifyToken,
  checkSuperAdmin,
  checkAdmin,
  JWT_SECRET
};