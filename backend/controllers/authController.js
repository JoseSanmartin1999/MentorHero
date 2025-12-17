// backend/controllers/authController.js

const { pool } = require('../db'); 
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

// --- Función Auxiliar para la Validación de Edad ---
const calculateAge = (dateOfBirth) => { /* ... sin cambios ... */ };

// --- Lógica del Registro de Usuario (Versión con Materias de Tutor) ---
const registerUser = async (req, res) => {
    const { 
        nombre, fecha_nacimiento, username, password, 
        repetir_password, carrera_id, institucion, semestre, rol, subjects // <-- Recibiendo 'subjects'
    } = req.body;

    const foto_perfil_url = req.file ? req.file.path : null; 
    
    // Asumimos que las validaciones de campos obligatorios, contraseñas, regex, edad y carrera_id ya están en el controlador.
    
    // 🛑 1. VALIDACIÓN DE ROL Y MATERIAS
    const allowedRoles = ['Aprendiz', 'Tutor']; 
    if (!allowedRoles.includes(rol)) {
        return res.status(400).json({ message: `El rol debe ser uno de: ${allowedRoles.join(' o ')}.` });
    }

    let subjectIds = [];

    if (rol === 'Tutor') {
        if (!subjects) {
            return res.status(400).json({ message: 'Como Tutor, debes seleccionar las materias que domines.' });
        }
        try {
            // El Frontend envía esto como JSON string
            subjectIds = JSON.parse(subjects).map(id => parseInt(id)); 
            
            if (subjectIds.length < 3) {
                return res.status(400).json({ message: 'Como Tutor, debes seleccionar al menos 3 materias.' });
            }
            // Opcional: Aquí podrías añadir un filtro para IDs repetidos
        } catch (e) {
            return res.status(400).json({ message: 'Formato de materias de tutor inválido.' });
        }
    } else if (rol === 'Aprendiz' && subjects) {
        // Un Aprendiz no debe enviar materias
        return res.status(400).json({ message: 'Los Aprendices no pueden seleccionar materias.' });
    }
    // FIN VALIDACIÓN DE ROL Y MATERIAS

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction(); // <-- INICIO DE TRANSACCIÓN

        // --- 2. VERIFICAR DUPLICADOS ---
        const [userCheck] = await connection.execute(
            'SELECT username FROM users WHERE username = ?',
            [username]
        );
        if (userCheck.length > 0) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
        }

        // --- 3. HASHEAR CONTRASEÑA ---
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        // --- 4. INSERTAR USUARIO en users ---
        const insertQuery = `
            INSERT INTO users 
            (nombre, fecha_nacimiento, username, password_hash, carrera_id, institucion, semestre, rol, foto_perfil_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            nombre, fecha_nacimiento, username, password_hash, 
            parseInt(carrera_id), institucion, parseInt(semestre), rol, foto_perfil_url
        ];

        const [result] = await connection.execute(insertQuery, values);
        const newUserId = result.insertId;
        
        // --- 5. INSERTAR MATERIAS EN tutor_materias (Solo si es Tutor) ---
        if (rol === 'Tutor' && subjectIds.length > 0) {
            const tutorSubjectInserts = subjectIds.map(materiaId => {
                // Usamos materia_id para coincidir con tu esquema de tabla
                return connection.execute(
                    'INSERT INTO tutor_materias (tutor_id, materia_id) VALUES (?, ?)',
                    [newUserId, materiaId]
                );
            });
            await Promise.all(tutorSubjectInserts);
        }
        
        await connection.commit(); // <-- CONFIRMAR TRANSACCIÓN
        
        // --- 6. RESPUESTA EXITOSA ---
        res.status(201).json({
            user_id: newUserId,
            username: username,
            rol: rol,
            message: 'Usuario y materias registrados exitosamente.'
        });

    } catch (error) {
        if (connection) {
            await connection.rollback(); // <-- DESHACER TRANSACCIÓN EN CASO DE ERROR
        }
        console.error('Error al registrar usuario y materias en MySQL:', error);
        res.status(500).json({ message: 'Error del servidor al intentar el registro.' });
    } finally {
        if (connection) connection.release(); 
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'El nombre de usuario y la contraseña son obligatorios.' });
    }

    let connection;
    try {
        // 1. Obtener la conexión
        connection = await pool.getConnection();

        // 2. BUSCAR EL USUARIO (Consulta Rápida)
        // Solo seleccionar los campos necesarios: ID, username, hash y rol.
        const [users] = await connection.execute(
            'SELECT user_id, username, password_hash, rol FROM users WHERE username = ? LIMIT 1',
            [username]
        );

        const user = users[0];

        // 3. VERIFICAR CREDENCIALES
        if (user) {
            // El usuario existe. Ahora compara la contraseña hasheada.
            const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
            
            if (isPasswordMatch) {
                
                // 4. GENERAR EL TOKEN JWT (Rápido)
                const token = generateToken(user.user_id, user.username, user.rol);
                
                // 5. RESPUESTA EXITOSA
                return res.json({ // Usar 'return' aquí es una buena práctica
                    user_id: user.user_id,
                    username: user.username,
                    rol: user.rol,
                    token: token,
                    message: 'Inicio de sesión exitoso.'
                });
            }
        }
        
        // Si el usuario no existe o la contraseña no coincide
        // Siempre usamos el mismo error por seguridad (para no dar pistas sobre qué falla).
        res.status(401).json({ message: 'Credenciales inválidas (usuario o contraseña incorrectos).' });


    } catch (error) {
        console.error('Error durante el inicio de sesión en MySQL:', error);
        // Si el error es una excepción de la base de datos o de red.
        res.status(500).json({ message: 'Error del servidor durante el inicio de sesión. Verifique la conexión a DB.' });
    } finally {
        // 6. LIBERAR CONEXIÓN (CRÍTICO PARA EL RENDIMIENTO)
        if (connection) connection.release();
    }
};

module.exports = {
    registerUser,
    loginUser 
};