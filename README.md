# 🚀 MentorHero: Plataforma de Tutoría y Mentoría

**MentorHero** es una plataforma web full-stack dedicada a conectar a estudiantes (Aprendices) con compañeros de nivel superior (Tutores) dentro de su institución educativa. La plataforma facilita el proceso de solicitud, gestión y seguimiento de tutorías en materias específicas de los primeros semestres.

---

## 🌟 Características Principales

### Autenticación y Seguridad
* **Autenticación Segura (JWT):** Sistema completo de registro, login y logout utilizando JSON Web Tokens
* **Rutas Protegidas:** Middleware de autenticación que protege el acceso a dashboards y perfiles
* **Roles de Usuario:** Diferenciación entre `Aprendiz`, `Tutor` y `Administrador`

### Gestión de Usuarios
* **Registro Personalizado:** Formularios adaptados según el rol seleccionado
* **Perfiles de Usuario:** Cada usuario tiene un perfil con información personal y académica
* **Carga de Imágenes:** Integración con Cloudinary para fotos de perfil

### Sistema de Tutorías
* **Búsqueda de Tutores:** Los aprendices pueden buscar tutores por materia
* **Solicitud de Tutorías:** Sistema completo de solicitud con selección de fecha, hora y descripción
* **Gestión de Materias:** Los tutores seleccionan las materias que dominan (mínimo 3)
* **Panel de Tutorías:** 
  - Vista para aprendices: seguimiento de tutorías solicitadas
  - Vista para tutores: gestión de tutorías asignadas
* **Estados de Solicitud:** Pendiente, Aceptada, Rechazada, Completada, Cancelada

---

## 🛠️ Stack Tecnológico

### Backend
| Componente | Tecnología |
|------------|------------|
| **Runtime** | Node.js (v18+) |
| **Framework** | Express.js |
| **Base de Datos** | MySQL (Clever Cloud) |
| **ORM/Driver** | mysql2 (Pool de conexiones) |
| **Autenticación** | JWT (jsonwebtoken), bcryptjs |
| **Almacenamiento** | Cloudinary (imágenes) |
| **Otros** | cors, dotenv, multer |

### Frontend
| Componente | Tecnología |
|------------|------------|
| **Framework** | React.js 19+ |
| **Routing** | React Router DOM v7 |
| **Estilos** | Bootstrap 5.3, CSS personalizado |
| **Testing** | Jest, React Testing Library |
| **HTTP Client** | Fetch API |

---

## ⚙️ Configuración e Instalación

### 1. Requisitos Previos
Asegúrate de tener instalado:
* Node.js (v18 o superior)
* npm (Node Package Manager)
* MySQL Server
* Cuenta de Cloudinary (para almacenamiento de imágenes)

### 2. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd MentorHero
```

### 3. Configuración del Backend

#### 3.1 Instalar Dependencias
```bash
cd backend
npm install
```

#### 3.2 Variables de Entorno
Crea un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```env
# Credenciales de la Base de Datos MySQL (Clever Cloud)
DB_HOST=bgzackmjekn94rwmwjas-mysql.services.clever-cloud.com
DB_USER=uxtvtkmxcl4ayjev
DB_PASSWORD=Z9uQYMfdqEUVUD2l30Y9
DB_NAME=bgzackmjekn94rwmwjas
DB_PORT=3306

# Puerto del servidor backend
PORT=5000

# Clave secreta para JWT (cambiar en producción)
JWT_SECRET=una_clave_secreta_muy_larga_y_compleja_para_mentorhero

# Configuración de Cloudinary
CLOUDINARY_CLOUD_NAME=dfuk35w6v
CLOUDINARY_API_KEY=848587619474894
CLOUDINARY_API_SECRET=Zth95Bz2HmlK6j5Oc_2AIuBW1cY
```

### 4. Configuración del Frontend
```bash
cd frontend
npm install
```

---

## 💾 Configuración de la Base de Datos

### Estructura de Tablas

#### a. Tabla `users` (Usuarios)
```sql
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    carrera_id INT NOT NULL,
    institucion VARCHAR(100) NOT NULL,
    semestre INT NOT NULL,
    rol ENUM('Aprendiz', 'Tutor', 'Administrador') NOT NULL,
    foto_perfil_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (carrera_id)
);
```

#### b. Tabla `materias` (Asignaturas)
```sql
CREATE TABLE materias (
    materia_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_materia VARCHAR(100) NOT NULL UNIQUE
);
```

#### c. Tabla `tutor_materias` (Relación Tutores-Materias)
```sql
CREATE TABLE tutor_materias (
    tutor_id INT,
    materia_id INT,
    PRIMARY KEY (tutor_id, materia_id),
    FOREIGN KEY (tutor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (materia_id) REFERENCES materias(materia_id) ON DELETE CASCADE
);
```

#### d. Tabla `solicitudes_tutoria` (Solicitudes)
```sql
CREATE TABLE solicitudes_tutoria (
    solicitud_id INT AUTO_INCREMENT PRIMARY KEY,
    aprendiz_id INT NOT NULL,
    tutor_id INT NOT NULL,
    materia_id INT NOT NULL,
    fecha_solicitada DATE NOT NULL,
    hora_solicitada TIME NOT NULL,
    descripcion TEXT,
    estado ENUM('Pendiente', 'Aceptada', 'Rechazada', 'Completada', 'Cancelada') DEFAULT 'Pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aprendiz_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (materia_id) REFERENCES materias(materia_id) ON DELETE CASCADE
);
```

---

## ▶️ Ejecución del Proyecto

### Iniciar el Backend
```bash
cd backend
npm start
```
El servidor se ejecutará en `http://localhost:5000`

### Iniciar el Frontend
```bash
cd frontend
npm start
```
La aplicación React se abrirá en `http://localhost:3000`

---

## 📁 Estructura del Proyecto

### Backend
```
backend/
├── config/
│   └── cloudinaryConfig.js        # Configuración de Cloudinary con Multer
├── controllers/
│   ├── authController.js          # Registro y Login (JWT)
│   ├── userController.js          # Gestión de perfiles y tutores
│   └── solicitudController.js     # CRUD de solicitudes de tutoría
├── middleware/
│   └── authMiddleware.js          # Verificación de JWT
├── routes/
│   ├── authRoutes.js              # /api/auth/* (register, login)
│   ├── userRoutes.js              # /api/users/* (profile, tutores)
│   └── solicitudRoutes.js         # /api/solicitudes/* (CRUD tutorías)
├── utils/
│   └── generateToken.js           # Generación de JWT
├── .env                           # Variables de entorno
├── db.js                          # Pool de conexiones MySQL
├── server.js                      # Servidor Express principal
└── package.json
```

### Frontend
```
frontend/
├── public/
│   ├── index.html
│   └── assets/
├── src/
│   ├── components/
│   │   ├── Navbar.js              # Barra de navegación principal
│   │   ├── Footer.js              # Pie de página
│   │   └── forms/
│   │       ├── LoginForm.js       # Formulario de login
│   │       └── RegistrationForm.js # Formulario de registro
│   ├── pages/
│   │   ├── DashboardPage.js       # Dashboard principal
│   │   ├── LoginPage.js           # Página de inicio de sesión
│   │   ├── RegistrationPage.js    # Página de registro
│   │   ├── SearchTutorPage.js     # Búsqueda de tutores
│   │   ├── TutorProfilePage.js    # Perfil detallado del tutor
│   │   ├── SolicitudTutoriaPage.js # Solicitar tutoría
│   │   ├── TutoriasPage.js        # Gestión de tutorías (Tutor)
│   │   └── MisTutoriasAprendiz.js # Mis tutorías (Aprendiz)
│   ├── contexts/
│   │   └── AuthContext.js         # Context de autenticación
│   ├── services/
│   │   └── api.js                 # Configuración de API
│   ├── utils/
│   ├── App.js                     # Componente principal
│   ├── App.css
│   ├── index.js
│   └── index.css
└── package.json
```

---

## 🔌 API Endpoints

### Autenticación (`/api/auth`)
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión

### Usuarios (`/api/users`)
- `GET /api/users/profile` - Obtener perfil del usuario (protegida)
- `GET /api/users/tutores` - Listar tutores disponibles
- `GET /api/users/tutores/:id` - Obtener perfil de un tutor específico

### Solicitudes (`/api/solicitudes`)
- `POST /api/solicitudes` - Crear solicitud de tutoría
- `GET /api/solicitudes/aprendiz` - Obtener solicitudes del aprendiz (protegida)
- `GET /api/solicitudes/tutor` - Obtener solicitudes del tutor (protegida)
- `PUT /api/solicitudes/:id/estado` - Actualizar estado de solicitud

---

## 🎯 Flujo de Usuario

### Para Aprendices
1. Registro con rol "Aprendiz"
2. Búsqueda de tutores por materia
3. Visualización del perfil del tutor
4. Solicitud de tutoría (fecha, hora, descripción)
5. Seguimiento de solicitudes en "Mis Tutorías"

### Para Tutores
1. Registro con rol "Tutor" + selección de materias (mínimo 3)
2. Visualización de solicitudes pendientes
3. Aceptar/rechazar solicitudes
4. Gestión de tutorías aceptadas
5. Marcar tutorías como completadas

---

## 🔐 Seguridad

- Encriptación de contraseñas con `bcryptjs`
- Tokens JWT con expiración de 24 horas
- Middleware de autenticación en rutas protegidas
- Variables de entorno para datos sensibles
- Validación de roles en backend

---

## 🚀 Próximas Mejoras

- [ ] Sistema de notificaciones en tiempo real
- [ ] Chat entre tutor y aprendiz
- [ ] Sistema de calificaciones y reseñas
- [ ] Panel de administración
- [ ] Estadísticas y reportes
- [ ] Calendario de disponibilidad para tutores
- [ ] Búsqueda avanzada con filtros

---

## 👥 Contribuidores

Proyecto desarrollado por estudiantes de la ESPE.

---

## 📄 Licencia

Este proyecto es de uso académico.