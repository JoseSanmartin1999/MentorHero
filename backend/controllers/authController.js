// backend/controllers/authController.js

const { pool } = require('../db'); 
const bcrypt = require('bcryptjs');

// --- Función Auxiliar para la Validación de Edad ---
const calculateAge = (dateOfBirth) => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    // Ajusta la edad si aún no ha cumplido años este mes/día
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
};

// --- Lógica del Registro de Usuario (Versión con Foto de Perfil) ---
const registerUser = async (req, res) => {
    // Los campos de texto llegan en req.body; el archivo subido en req.file
    const { 
        nombre, fecha_nacimiento, username, password, 
        repetir_password, carrera_id, institucion, semestre, rol 
    } = req.body;

    // Capturar la URL de Cloudinary si la imagen fue subida con éxito por Multer
    const foto_perfil_url = req.file ? req.file.path : null; 
    
    // --- 1. VALIDACIONES DE REQUISITOS OBLIGATORIOS Y BÁSICOS ---
    
    // Verificación de campos obligatorios (sin incluir la foto, ya que es opcional)
    if (!nombre || !fecha_nacimiento || !username || !password || !repetir_password || 
        !carrera_id || !institucion || !semestre || !rol) {
        // NOTA: Si Multer ya subió la imagen, deberíamos borrarla aquí, pero lo dejaremos simple por ahora.
        return res.status(400).json({ message: 'Todos los campos de texto son obligatorios.' });
    }

    // Contraseñas y Longitud (Mínimo 8 caracteres)
    if (password !== repetir_password) {
        return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
    }
    if (password.length < 8) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    // --- 2. VALIDACIONES DE REGLAS DE NEGOCIO (RegEx) ---
    // ... (Todas las validaciones anteriores se mantienen sin cambios)

    // Nombre e Institución (Solo alfabéticos y espacios)
    const alphaRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!alphaRegex.test(nombre)) {
        return res.status(400).json({ message: 'El nombre solo debe contener caracteres alfabéticos.' });
    }
    if (!alphaRegex.test(institucion)) {
        return res.status(400).json({ message: 'La institución solo debe contener caracteres alfabéticos.' });
    }

    // Nombre de Usuario (Solo alfanuméricos)
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
        return res.status(400).json({ message: 'El nombre de usuario solo debe contener caracteres alfanuméricos.' });
    }

    // Carrera ID (Solo numéricos)
    if (!/^\d+$/.test(carrera_id.toString())) {
        return res.status(400).json({ message: 'El ID de carrera solo debe contener caracteres numéricos.' });
    }
    const carreraIdNum = parseInt(carrera_id);

    // Semestre (Rango 1 a 8)
    const sem = parseInt(semestre);
    if (isNaN(sem) || sem < 1 || sem > 8) {
        return res.status(400).json({ message: 'El semestre debe ser un número entre 1 y 8.' });
    }

    // Rol (Valores permitidos)
    const allowedRoles = ['Aprendiz', 'Tutor', 'Administrador'];
    if (!allowedRoles.includes(rol)) {
        return res.status(400).json({ message: `El rol debe ser uno de: ${allowedRoles.join(', ')}.` });
    }

    // Fecha de Nacimiento (Edad mínima 17 y no fecha futura)
    const dobDate = new Date(fecha_nacimiento);
    const today = new Date();
    
    if (dobDate > today) {
        return res.status(400).json({ message: 'La fecha de nacimiento no puede ser una fecha futura.' });
    }
    const age = calculateAge(fecha_nacimiento);
    if (age < 17) {
        return res.status(400).json({ message: 'Debe tener al menos 17 años para registrarse.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // --- 3. VERIFICAR DUPLICADOS ---
        const [userCheck] = await connection.execute(
            'SELECT username FROM users WHERE username = ?',
            [username]
        );

        if (userCheck.length > 0) {
            // Si el nombre de usuario ya existe, necesitamos borrar la foto que ya se subió a Cloudinary
            // (Esta es una mejora de la lógica de error, que requiere el ID público de la imagen)
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
        }

        // --- 4. HASHEAR CONTRASEÑA ---
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // --- 5. INSERTAR USUARIO (AHORA CON foto_perfil_url) ---
        const insertQuery = `
            INSERT INTO users 
            (nombre, fecha_nacimiento, username, password_hash, carrera_id, institucion, semestre, rol, foto_perfil_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            nombre, fecha_nacimiento, username, password_hash, 
            carreraIdNum, institucion, sem, rol, foto_perfil_url // <-- Nueva URL
        ];

        const [result] = await connection.execute(insertQuery, values);
        
        // --- 6. RESPUESTA EXITOSA ---
        res.status(201).json({
            user_id: result.insertId,
            username: username,
            rol: rol,
            foto_perfil_url: foto_perfil_url, // <-- Devolver la URL
            message: 'Usuario registrado exitosamente en MySQL.'
        });

    } catch (error) {
        console.error('Error al registrar usuario en MySQL:', error);
        res.status(500).json({ message: 'Error del servidor al intentar el registro. Verifique sus datos.' });
    } finally {
        if (connection) connection.release(); 
    }
};

module.exports = {
    registerUser
};