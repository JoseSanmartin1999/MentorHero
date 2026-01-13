const { pool } = require('../db'); 
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

const registerUser = async (req, res) => {
    const { 
        nombre, 
        fecha_nacimiento, 
        username, 
        password, 
        carrera_id, 
        institucion, 
        semestre, 
        rol, 
        subjects 
    } = req.body;

    const foto_perfil_url = req.file ? req.file.path : null; 
    
    // 1. Validaciones iniciales
    if (!username || !password || !nombre) {
        return res.status(400).json({ message: 'Nombre, usuario y contraseña son obligatorios.' });
    }

    // 🛑 SOLUCIÓN AL ERROR DE ID: Generamos un ID manual único (entero)
    // Usamos el timestamp actual + un aleatorio para asegurar unicidad sin AUTO_INCREMENT
    const manualUserId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);

    let subjectIds = [];
    if (rol === 'Tutor') {
        try {
            const parsedSubjects = typeof subjects === 'string' ? JSON.parse(subjects) : subjects;
            subjectIds = parsedSubjects.map(id => parseInt(id)); 
            if (subjectIds.length < 3) {
                return res.status(400).json({ message: 'Como Tutor, debes seleccionar al menos 3 materias.' });
            }
        } catch (e) {
            return res.status(400).json({ message: 'Formato de materias inválido.' });
        }
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction(); 

        // 2. Verificar si el username ya existe
        const [userCheck] = await connection.execute(
            'SELECT username FROM users WHERE username = ?',
            [username]
        );
        if (userCheck.length > 0) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
        }

        // 3. Hashear contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        // 4. Insertar Usuario incluyendo el user_id manual
        const insertQuery = `
            INSERT INTO users 
            (user_id, nombre, fecha_nacimiento, username, password_hash, carrera_id, institucion, semestre, rol, foto_perfil_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            manualUserId, // 👈 Enviamos el ID generado manualmente
            nombre, 
            fecha_nacimiento, 
            username, 
            password_hash, 
            parseInt(carrera_id) || null, 
            institucion || null, 
            parseInt(semestre) || null, 
            rol, 
            foto_perfil_url
        ];

        await connection.execute(insertQuery, values);
        
        // 5. Insertar Materias si es Tutor usando el mismo manualUserId
        if (rol === 'Tutor' && subjectIds.length > 0) {
            for (const materiaId of subjectIds) {
                await connection.execute(
                    'INSERT INTO tutor_materias (tutor_id, materia_id) VALUES (?, ?)',
                    [manualUserId, materiaId]
                );
            }
        }
        
        await connection.commit(); 
        
        res.status(201).json({
            user_id: manualUserId,
            username: username,
            rol: rol,
            message: 'Registro exitoso con ID generado manualmente.'
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('❌ Error en el registro:', error);
        res.status(500).json({ message: 'Error del servidor al registrar.' });
    } finally {
        if (connection) connection.release(); 
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Usuario y contraseña requeridos.' });

    let connection;
    try {
        connection = await pool.getConnection();
        const [users] = await connection.execute(
            'SELECT user_id, username, password_hash, rol FROM users WHERE username = ? LIMIT 1',
            [username]
        );
        const user = users[0];

        if (user) {
            const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
            if (isPasswordMatch) {
                const token = generateToken(user.user_id, user.username, user.rol);
                return res.json({ 
                    user_id: user.user_id,
                    username: user.username,
                    rol: user.rol,
                    token: token,
                    message: 'Inicio de sesión exitoso.'
                });
            }
        }
        res.status(401).json({ message: 'Credenciales inválidas.' });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error del servidor.' });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = { registerUser, loginUser };