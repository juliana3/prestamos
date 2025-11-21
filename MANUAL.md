# 📘 Manual de Usuario - Sistema de Préstamos de Computadoras

## Índice

1. [Introducción](#introducción)
2. [Primer Acceso](#primer-acceso)
3. [Navegación General](#navegación-general)
4. [Módulos del Sistema](#módulos-del-sistema)
5. [Tareas Comunes](#tareas-comunes)
6. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Introducción

El Sistema de Gestión de Préstamos de Computadoras es una herramienta diseñada para instituciones educativas que necesitan controlar el inventario y préstamo de equipos computacionales a estudiantes y docentes.

### ¿Quién puede usar el sistema?

El sistema cuenta con dos tipos de usuarios administrativos:

- **Admin**: Puede gestionar préstamos, computadoras, estudiantes y docentes
- **Superadmin**: Tiene acceso completo, incluyendo la gestión de otros administradores

---

## Primer Acceso

### Inicio de Sesión

1. Abre tu navegador web y accede a la URL del sistema
2. Verás la pantalla de inicio de sesión
3. Ingresa tus credenciales:
   - **Usuario**: tu nombre de usuario asignado
   - **Contraseña**: tu contraseña

#### Credenciales Iniciales del Sistema

En la primera instalación, usa estas credenciales:
- **Usuario**: `superadmin`
- **Contraseña**: `admin123`


---

## Navegación General

Una vez dentro del sistema, verás:

- **Barra lateral izquierda**: Menú de navegación con todos los módulos
- **Área principal**: Contenido del módulo seleccionado
- **Barra superior**: Información de usuario y opción de cerrar sesión

### Cerrar Sesión

Haz clic en el botón de cerrar sesión en la barra superior para salir del sistema de forma segura.

---

## Módulos del Sistema

### 📊 Panel Principal (Dashboard)

Tu punto de inicio en el sistema. Aquí encontrarás:

- **Resumen de estadísticas**: Cantidad de computadoras, estudiantes, docentes y préstamos activos
- **Gráficos de tendencias**: Visualización de préstamos a lo largo del tiempo
- **Indicadores clave**: Estado actual del sistema de un vistazo

**¿Qué puedo hacer aquí?**
- Ver el estado general del sistema
- Identificar tendencias de uso
- Acceder rápidamente a otros módulos

---

### 🖥️ Computadoras

Administra el inventario completo de equipos.

#### Ver Listado de Computadoras

- Consulta todas las computadoras registradas
- Visualiza la asignación a carros

#### Agregar una Nueva Computadora

1. Haz clic en el botón **"Agregar Computadora"**
2. Completa el formulario:
   - **Número de inventario**: Identificador único del equipo
   - **Carro**: Asigna a un carro/ubicación
   - **Estado**: Selecciona el estado actual
3. Haz clic en **"Guardar"**

#### Editar una Computadora

1. Localiza la computadora en el listado
2. Haz clic en el botón **"Editar"**
3. Modifica los campos necesarios
4. Guarda los cambios

#### Cambiar Estado de una Computadora

Estados disponibles:
- **Disponible**: Lista para préstamo
- **Prestada**: Actualmente en uso
- **En reparacion**: No disponible temporalmente

#### Eliminar una Computadora

1. Selecciona la computadora
2. Haz clic en **"Eliminar"**
3. Confirma la acción

---

### 📝 Préstamos

Gestiona los préstamos activos y registra nuevas entregas.

#### Crear un Nuevo Préstamo

1. Haz clic en **"Nuevo Préstamo"**
2. Completa la información:
   - **Seleccionar tipo de usuario**: Elige entre alumno o docente
   - **Seleccionar usuario**: Elige un alumno o docente registrado
   - **Seleccionar computadora**: Elige una computadora disponible
   - **Fecha de préstamo**: Se registra automáticamente
3. Haz clic en **"Registrar Préstamo"**

#### Procesar una Devolución

1. Localiza el préstamo en la lista de préstamos activos
2. Haz clic en **"Devolver"**
4. Confirma la devolución

La computadora volverá automáticamente al estado "Disponible".

#### Ver Préstamos Activos

Consulta todos los préstamos que aún no han sido devueltos, con información sobre:
- Usuario que tiene el equipo
- Computadora prestada
- Fecha de préstamo
- Días transcurridos

---

### 👨‍🎓 Alumnos

Administra la base de datos de estudiantes.

#### Agregar un Estudiante Individual

1. Haz clic en **"Agregar Alumno"**
2. Completa el formulario:
   - **DNI**
   - **Nombre**
   - **Apellido**
   - **Celular**
   - **Correo electrónico**
   - **Carrera**
4. Guarda el registro

#### Carga Masiva de Estudiantes

Para agregar múltiples estudiantes a la vez:

1. Haz clic en **"Cargar Excel"**
2. Selecciona tu archivo Excel con los datos
3. El archivo debe tener las siguientes columnas asi tal cual:
   - dni
   - nombre
   - apellido
   - celular
   - email
   - carrera
5. Haz clic en **"Subir"**

El sistema validará y cargará los registros automáticamente.

#### Editar o Eliminar Estudiantes

- **Editar**: Haz clic en el botón "Editar" junto al estudiante
- **Eliminar**: Haz clic en "Eliminar" y confirma

---

### 👨‍🏫 Docentes

Similar al módulo de Alumnos, pero para profesores.

#### Funciones Disponibles

- Agregar docentes individualmente
- Carga masiva mediante Excel
- Editar información de docentes
- Eliminar registros

El formato para la carga masiva es el mismo que para estudiantes (sin la columna de carrera).

---

### Carros

Gestiona las ubicaciones físicas donde se almacenan las computadoras.

#### ¿Qué es un Carro?

Un "carro" es donde se organizan y guardan las computadoras.

#### Agregar un Nuevo Carro

1. Haz clic en **"Agregar Carro"**
2. Ingresa:
   - **Nombre/Número del carro**: Identificador único
3. Guarda el registro


---

### 📚 Historial

Consulta el registro completo de todos los préstamos realizados.

---

### 👥 Administradores

**⚠️ Solo accesible para Superadmin**

Gestiona los usuarios que pueden acceder al sistema.

#### Crear un Nuevo Administrador

1. Haz clic en **"Agregar Administrador"**
2. Completa:
   - **Nombre**
   - **Apellido**
   - **Usuario**: Único en el sistema
   - **Contraseña**: Mínimo 6 caracteres
   - **Rol**: Admin o Superadmin
4. Guarda el usuario


---

## Tareas Comunes

### Realizar un Préstamo Completo

1. Ve a **Alumnos** o **Docentes** y verifica que el usuario esté registrado
2. Ve a **Computadoras** y verifica que haya equipos disponibles
3. Ve a **Préstamos** → **Nuevo Préstamo**
4. Selecciona el usuario y la computadora
5. Registra el préstamo

### Procesar una Devolución

1. Ve a **Préstamos**
2. Localiza el préstamo activo
3. Haz clic en **"Devolver"**
4. Confirma la devolución


### Registrar Nuevos Estudiantes al Inicio de Curso

1. Prepara un archivo Excel con los datos de todos los estudiantes
2. Ve a **Alumnos** → **Cargar Excel**
3. Selecciona el archivo
4. Verifica que se cargaron correctamente
5. Si hay errores, corrígelos y vuelve a intentar

---

## Preguntas Frecuentes

### ¿Qué hago si olvidé mi contraseña?

Contacta a un Superadmin para que restablezca tu contraseña.

### ¿Puedo prestar una computadora que está en mantenimiento?

No. Solo las computadoras con estado "Disponible" pueden ser prestadas.

### ¿Cómo sé cuánto tiempo tiene un préstamo activo?

En el módulo de Préstamos, verás los días transcurridos desde que se realizó cada préstamo.

### ¿Puedo eliminar un préstamo del historial?

No. El historial es un registro permanente con fines de auditoría. Solo se puede modificar el estado (activo/devuelto).

### ¿Qué formato debe tener mi archivo Excel para carga masiva?

El archivo debe ser .xlsx o .xls con las siguientes columnas exactas:
- Para alumnos: dni, nombre, apellido, celular, email, carrera
- Para docentes: dni, nombre, apellido, celular, email

### ¿Puedo tener múltiples préstamos del mismo usuario?

No, un usuario puede tener solo un prestamo activo a la vez.

### ¿Cómo doy de baja una computadora dañada?

1. Ve a **Computadoras**
2. Edita la computadora
3. Cambia el estado a "En reparación"
4. Guarda los cambios

O:
1. Ve a **Computadoras**
2. Haz clic en eliminar la computadora
3. Confirmá y listo

### ¿El sistema me notifica de préstamos vencidos?

Actualmente el sistema muestra los días transcurridos pero no notifica prestamos vencidos.

---

## Soporte Técnico

Si encuentras problemas técnicos o tienes dudas sobre el funcionamiento del sistema:

1. Verifica esta documentación
2. Consulta con tu Superadmin
3. Revisa el repositorio del proyecto en GitHub para reportar bugs o sugerir mejoras

---

**Última actualización**: Noviembre 2025  
**Versión del sistema**: 1.0
