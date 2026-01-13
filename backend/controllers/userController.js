const { pool } = require('../db');

/**
 * 1. OBTENER PERFIL DEL USUARIO LOGUEADO
 */
const getUserProfile = async (req, res) => {
    let connection;
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Token inválido o falta ID de usuario.' });
        }

        connection = await pool.getConnection();

        const [users] = await connection.execute(
            `SELECT 
                u.user_id, u.nombre, u.username, u.rol, 
                u.foto_perfil_url, u.semestre, u.institucion,
                u.fecha_nacimiento,
                c.nombre_carrera 
             FROM users u
             LEFT JOIN carreras c ON u.carrera_id = c.carrera_id 
             WHERE u.user_id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const userData = users[0];
        let materias = [];

        if (userData.rol === 'Tutor') {
            const [subjects] = await connection.execute(
                `SELECT m.materia_id, m.nombre_materia 
                 FROM tutor_materias tm
                 JOIN materias m ON tm.materia_id = m.materia_id
                 WHERE tm.tutor_id = ?`,
                [req.user.id]
            );
            materias = subjects;
        }

        res.json({ 
            user: {
                ...userData,
                fecha_nacimiento: userData.fecha_nacimiento || "N/A",
                materias_a_enseñar: materias 
            } 
        });

    } catch (error) {
        console.error("❌ Error en getUserProfile:", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * 2. ACTUALIZAR PERFIL (FOTO Y SEMESTRE)
 */
const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { semestre } = req.body;
    let foto_perfil_url = null;

    if (req.file) {
        // Asumiendo que usas Cloudinary o almacenamiento local, req.file.path tiene la URL/Ruta
        foto_perfil_url = req.file.path; 
    }

    let connection;
    try {
        connection = await pool.getConnection();
        
        let query = "UPDATE users SET semestre = ?";
        let params = [parseInt(semestre)];

        if (foto_perfil_url) {
            query += ", foto_perfil_url = ?";
            params.push(foto_perfil_url);
        }

        query += " WHERE user_id = ?";
        params.push(userId);

        const [result] = await connection.execute(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json({ 
            message: "Perfil actualizado correctamente", 
            foto_perfil_url: foto_perfil_url || undefined,
            semestre: semestre
        });
    } catch (error) {
        console.error("❌ Error en updateProfile:", error.message);
        res.status(500).json({ message: "Error al actualizar el perfil" });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * 3. OBTENER LISTA DE TUTORES DISPONIBLES
 */
const getAvailableTutors = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [tutors] = await connection.execute(
            `SELECT 
                u.user_id AS id, u.nombre, u.username, u.foto_perfil_url, 
                u.semestre, u.institucion, c.nombre_carrera
             FROM users u
             LEFT JOIN carreras c ON u.carrera_id = c.carrera_id
             WHERE u.rol = 'Tutor'`
        );

        const tutorsWithMaterias = tutors.map(tutor => ({
            ...tutor,
            materias: [] 
        }));

        res.json({ tutors: tutorsWithMaterias });
    } catch (error) {
        console.error("❌ Error en getAvailableTutors:", error.message);
        res.status(500).json({ message: 'Error al obtener tutores.' });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * 4. OBTENER DETALLE DE UN TUTOR POR ID
 */
const getTutorById = async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await pool.getConnection();
        const [users] = await connection.execute(
            `SELECT 
                u.user_id, u.nombre, u.username, u.foto_perfil_url, u.semestre, u.institucion,
                c.nombre_carrera 
             FROM users u
             LEFT JOIN carreras c ON u.carrera_id = c.carrera_id 
             WHERE u.user_id = ? AND u.rol = 'Tutor'`,
            [id]
        );

        if (users.length === 0) return res.status(404).json({ message: 'Tutor no encontrado.' });

        const tutorData = users[0];
        const [subjects] = await connection.execute(
            `SELECT m.materia_id, m.nombre_materia 
             FROM tutor_materias tm
             JOIN materias m ON tm.materia_id = m.materia_id
             WHERE tm.tutor_id = ?`,
            [id]
        );

        res.json({
            tutor: {
                id: parseInt(id),
                ...tutorData,
                materias: subjects,
                logros: "Mentor Certificado",
                reputacion: "4.8/5.0"
            }
        });
    } catch (error) {
        console.error("❌ Error en getTutorById:", error.message);
        res.status(500).json({ message: 'Error interno.' });
    } finally {
        if (connection) connection.release();
    }
};

// Exportación única y limpia
module.exports = {
    getUserProfile,
    updateProfile,
    getAvailableTutors,
    getTutorById
};