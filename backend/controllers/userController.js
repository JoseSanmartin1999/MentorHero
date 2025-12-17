// backend/controllers/userController.js

const { pool } = require('../db'); // Asegúrate de importar pool

const getUserProfile = async (req, res) => {
    // req.user viene del middleware 'protect' y contiene { id, username, rol }
    const userId = req.user.id; 

    let connection;
    try {
        connection = await pool.getConnection();
        
        // 🛑 CONSULTA MEJORADA: Traer todos los datos del perfil
        const query = `
            SELECT 
                nombre, 
                fecha_nacimiento, 
                username, 
                rol, 
                semestre, 
                institucion, 
                foto_perfil_url,
                carrera_id 
            FROM users 
            WHERE user_id = ?
        `;
        
        const [users] = await connection.execute(query, [userId]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        
        const userProfile = users[0];

        res.json({
            message: 'Perfil de usuario cargado con éxito.',
            user: {
                id: userId,
                // Devolver todos los campos necesarios al frontend
                nombre: userProfile.nombre,
                username: userProfile.username,
                rol: userProfile.rol,
                semestre: userProfile.semestre,
                institucion: userProfile.institucion,
                fecha_nacimiento: userProfile.fecha_nacimiento,
                foto_perfil_url: userProfile.foto_perfil_url
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