// backend/controllers/userController.js

const { pool } = require('../db'); 

const getUserProfile = async (req, res) => {
    const userId = req.user.id; 

    let connection;
    try {
        connection = await pool.getConnection();
        
        // 1. OBTENER DATOS PRINCIPALES DEL USUARIO
        // Usamos una consulta base simple
        const [users] = await connection.execute(
            `SELECT 
                nombre, fecha_nacimiento, username, rol, semestre, institucion, foto_perfil_url, carrera_id 
            FROM users 
            WHERE user_id = ?`, 
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        
        const userProfile = users[0];
        let tutorSubjects = [];

        // 2. OBTENER MATERIAS DEL TUTOR (CONDICIONAL)
        if (userProfile.rol === 'Tutor') {
            // Utilizamos un JOIN para obtener los nombres de las materias del tutor
            const [subjects] = await connection.execute(
                `SELECT 
                    m.materia_id, m.nombre_materia 
                 FROM tutor_materias tm
                 JOIN materias m ON tm.materia_id = m.materia_id
                 WHERE tm.tutor_id = ?`,
                [userId]
            );
            tutorSubjects = subjects; // Array con { materia_id, nombre_materia }
        }

        // 3. RESPUESTA AL FRONTEND
        res.json({
            message: 'Perfil de usuario cargado con éxito.',
            user: {
                id: userId,
                nombre: userProfile.nombre,
                username: userProfile.username,
                rol: userProfile.rol,
                semestre: userProfile.semestre,
                institucion: userProfile.institucion,
                fecha_nacimiento: userProfile.fecha_nacimiento,
                foto_perfil_url: userProfile.foto_perfil_url,
                carrera_id: userProfile.carrera_id,
                
                // 🛑 NUEVO: Lista de materias para el tutor
                materias_a_enseñar: tutorSubjects 
            }
        });

    } catch (error) {
        console.error('Error al obtener el perfil de usuario:', error);
        res.status(500).json({ message: 'Error del servidor al obtener los datos del perfil.' });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = { getUserProfile };