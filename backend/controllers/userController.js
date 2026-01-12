const { pool } = require('../db');

/**
 * 1. OBTENER PERFIL DEL USUARIO LOGUEADO
 * Se usa para el Dashboard. Incluye datos básicos y materias si es Tutor.
 */
const getUserProfile = async (req, res) => {
    let connection;
    try {
        // Validación de seguridad para evitar errores de parámetros undefined
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Token inválido o falta ID de usuario.' });
        }

        connection = await pool.getConnection();

        // Obtener datos básicos del usuario (Se eliminó u.email por no existir en TiDB)
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

        // Si el usuario es Tutor, buscamos sus materias registradas
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
                // Manejo de nulos para el Frontend
                fecha_nacimiento: userData.fecha_nacimiento || "N/A",
                materias_a_enseñar: materias 
            } 
        });

    } catch (error) {
        console.error("❌ Error en getUserProfile:", error.message);
        res.status(500).json({ message: 'Error interno del servidor al obtener perfil.' });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * 2. OBTENER LISTA DE TUTORES DISPONIBLES
 * Se usa para la página de búsqueda (SearchTutorPage).
 */
const getAvailableTutors = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        // Obtenemos los tutores con su carrera
        const [tutors] = await connection.execute(
            `SELECT 
                u.user_id AS id, 
                u.nombre, 
                u.username, 
                u.foto_perfil_url, 
                u.semestre, 
                u.institucion, 
                c.nombre_carrera
             FROM users u
             LEFT JOIN carreras c ON u.carrera_id = c.carrera_id
             WHERE u.rol = 'Tutor'`
        );

        // Para evitar el error .length en el frontend, aseguramos que 'materias' siempre sea un array
        // Opcional: Podrías hacer un JOIN aquí, pero por ahora inicializamos vacío para evitar el crash.
        const tutorsWithMaterias = tutors.map(tutor => ({
            ...tutor,
            materias: [] 
        }));

        res.json({ tutors: tutorsWithMaterias });

    } catch (error) {
        console.error("❌ Error en getAvailableTutors:", error.message);
        res.status(500).json({ message: 'Error al obtener la lista de tutores.' });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * 3. OBTENER PERFIL DE UN TUTOR ESPECÍFICO
 * Se usa para ver el detalle de un tutor antes de solicitar tutoría.
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

        if (users.length === 0) {
            return res.status(404).json({ message: 'Tutor no encontrado.' });
        }

        const tutorData = users[0];

        // Obtener las materias que imparte este tutor específicamente
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
                nombre: tutorData.nombre,
                username: tutorData.username,
                foto_perfil_url: tutorData.foto_perfil_url,
                semestre: tutorData.semestre,
                institucion: tutorData.institucion,
                carrera_nombre: tutorData.nombre_carrera || 'No especificada',
                materias: subjects,
                logros: "Mentor Certificado",
                reputacion: "4.8/5.0"
            }
        });

    } catch (error) {
        console.error("❌ Error en getTutorById:", error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    getUserProfile,
    getAvailableTutors,
    getTutorById
};