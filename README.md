🚀 MentorHero: Plataforma de Tutoría y MentoríaMentorHero 
Es una plataforma web dedicada a conectar a estudiantes (Aprendices) con compañeros de nivel superior (Tutores) dentro de su institución para ofrecer y recibir apoyo en materias específicas de los primeros semestres.

##🌟 Características Clave* **Autenticación Segura (JWT):** Inicio y cierre de sesión seguro utilizando JSON Web Tokens.
* **Registro Condicional:** Diferenciación de roles (`Aprendiz` o `Tutor`) durante el registro. El rol `Administrador` está restringido en la ruta de registro.
* **Gestión de Materias para Tutores:** Los Tutores deben seleccionar un mínimo de 3 materias que dominen (de los primeros tres semestres) durante el registro.
* **Carga de Imágenes (Cloudinary):** Los usuarios pueden subir una foto de perfil, gestionada y almacenada en Cloudinary.
* **Rutas Protegidas:** Acceso al Dashboard y perfiles restringido solo a usuarios autenticados mediante el Middleware JWT.

##🛠️ Tecnologías Utilizadas| Componente | Backend | Frontend | Base de Datos |
| --- | --- | --- | --- |
| **Tecnología Principal** | Node.js | React.js | MySQL (Clever Cloud) |
| **Framework/Librerías** | Express, `mysql2` (Pool), `bcryptjs`, `jsonwebtoken` | React Router DOM, Bootstrap |  |
| **Otros** | Cloudinary (Almacenamiento de archivos) |  |  |

---

##⚙️ Configuración del Proyecto###1. Requisitos PreviosAsegúrate de tener instalado:

* Node.js (v18+)
* npm (Node Package Manager)
* MySQL Server
* Acceso a una cuenta de **Cloudinary**.

###2. Variables de EntornoDebes crear un archivo `.env` en la carpeta **`backend/`** con las siguientes variables:

```env
# Credenciales de la Base de Datos MySQL (Clever Cloud)
DB_HOST=bgzackmjekn94rwmwjas-mysql.services.clever-cloud.com
DB_USER=uxtvtkmxcl4ayjev
DB_PASSWORD=Z9uQYMfdqEUVUD2l30Y9
DB_NAME=bgzackmjekn94rwmwjas
DB_PORT=3306 

# Puerto del servidor backend
PORT=5000 

# Clave secreta para JWT (Debe ser larga y aleatoria)
JWT_SECRET=una_clave_secreta_muy_larga_y_compleja_para_mentorhero

# Configuración de Cloudinary
CLOUDINARY_CLOUD_NAME=dfuk35w6v
CLOUDINARY_API_KEY=848587619474894
CLOUDINARY_API_SECRET=Zth95Bz2HmlK6j5Oc_2AIuBW1cY

```

---

##💾 Configuración de la Base de Datos (MySQL)Se requiere la siguiente estructura de tablas para que el sistema de registro y tutoría funcione:

###a. Tabla `users` (Usuarios)Esta es la tabla principal, donde se almacena el hash de la contraseña y la URL de la foto de perfil.

```sql
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE, -- 📌 Debe tener índice UNIQUE para logins rápidos
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

###b. Tabla `materias` (Asignaturas)Contiene la lista de asignaturas disponibles para tutoría (se recomienda poblar con materias de los primeros 3 semestres).

```sql
CREATE TABLE materias (
    materia_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_materia VARCHAR(100) NOT NULL UNIQUE
);

```

###c. Tabla `tutor_materias` (Relación M:M)Relaciona a los Tutores (`user_id`) con las materias (`materia_id`) que seleccionaron.

```sql
CREATE TABLE tutor_materias (
    tutor_id INT,
    materia_id INT,
    PRIMARY KEY (tutor_id, materia_id),
    FOREIGN KEY (tutor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (materia_id) REFERENCES materias(materia_id) ON DELETE CASCADE
);

```

##▶️ Ejecución del Proyecto###1. Iniciar el Backend```bash
# Navega a la carpeta del backend
cd backend

# Instala dependencias (si no lo has hecho)
npm install

# Inicia el servidor
npm start 
# o 
node server.js

```

El servidor se ejecutará en `http://localhost:5000`.

###2. Iniciar el Frontend```bash
# Navega a la carpeta del frontend
cd frontend

# Instala dependencias (si no lo has hecho)
npm install

# Inicia la aplicación React
npm start

```

La aplicación se abrirá automáticamente en `http://localhost:3000`.

---

##🗺️ Estructura del Backend (Actual)```
backend/
├───config/
│   ├───cloudinaryConfig.js      # Configuración de Multer para subir a Cloudinary
├───controllers/
│   ├───authController.js        # Lógica de Registro (con materias/foto) y Login (JWT)
│   ├───userController.js        # Lógica para obtener el Perfil (Ruta Protegida)
├───middleware/
│   ├───authMiddleware.js        # Middleware para verificar el JWT (ruta '/profile')
├───routes/
│   ├───authRoutes.js            # Rutas: /api/auth/register, /api/auth/login
│   ├───userRoutes.js            # Rutas: /api/users/profile (Protegida)
├───utils/
│   ├───generateToken.js         # Función para crear el JWT
├───.env                         # Variables de entorno (DB, JWT, Cloudinary)
├───db.js                        # Configuración del Pool de Conexiones MySQL
└───server.js                    # Servidor principal (Express)

```