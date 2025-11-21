# 💻 Sistema de Gestión de Préstamos de Computadoras

> Sistema web completo para instituciones educativas que facilita el control de inventario y préstamos de equipos computacionales a estudiantes y docentes.

## 📖 Documentación

Para información detallada sobre el uso del sistema, consulta:

- [Manual de Usuario](./MANUAL.md) - Guía completa de uso
- [Documentación Técnica](https://deepwiki.com/juliana3/prestamos) - Detalles de implementación

---

## 🌟 Características Principales

- 📊 **Dashboard Interactivo** - Visualiza estadísticas en tiempo real y tendencias de préstamos
- 🖥️ **Gestión de Inventario** - Control completo de computadoras y su asignación a carros
- 👥 **Administración de Usuarios** - Manejo de estudiantes y docentes con carga masiva por Excel
- 📝 **Control de Préstamos** - Registro y seguimiento de préstamos activos e históricos
- 🔐 **Sistema de Roles** - Niveles de acceso diferenciados (Admin y Superadmin)
- 📈 **Reportes y Análisis** - Historial completo de préstamos y reportería avanzada


## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 14.0.0
- npm o yarn

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/juliana3/prestamos.git
cd prestamos
```

2. **Instalar dependencias del backend**
```bash
cd backend
npm install
```

3. **Instalar dependencias del frontend**
```bash
cd ../frontend
npm install
```

4. **Configurar variables de entorno**

Crea un archivo `.env` en la carpeta `backend/` con:
```env
PORT=3000
JWT_SECRET=tu_clave_secreta_aqui
```

### Ejecución

1. **Iniciar el servidor backend**
```bash
cd backend
npm start
```
El servidor estará disponible en `http://localhost:3000`

2. **Iniciar el servidor de desarrollo frontend**
```bash
cd frontend
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`

### Credenciales por Defecto

Al iniciar por primera vez, el sistema crea un superadministrador:

- **Usuario:** `superadmin`
- **Contraseña:** `admin123`


## 🛠️ Stack Tecnológico

### Backend
- **Express.js** - Framework web para Node.js
- **SQLite3** - Base de datos embebida con WAL mode
- **JWT** - Autenticación basada en tokens
- **bcrypt** - Hash seguro de contraseñas
- **Multer** - Manejo de carga de archivos Excel

### Frontend
- **Vue 3** - Framework progresivo de JavaScript
- **Vue Router** - Enrutamiento SPA
- **Axios** - Cliente HTTP
- **Chart.js** - Visualizaciones y gráficos
- **XLSX** - Procesamiento de archivos Excel

### Base de Datos
- **SQLite** con optimizaciones:
  - WAL (Write-Ahead Logging) para concurrencia
  - Timeout de 10 segundos para bloqueos
  - Modo sincrónico NORMAL





## 🔒 Seguridad

- Autenticación basada en JWT con tokens seguros
- Contraseñas hasheadas con bcrypt (10 salt rounds)
- Middleware de verificación en todas las rutas protegidas
- Validación de roles para acciones administrativas

