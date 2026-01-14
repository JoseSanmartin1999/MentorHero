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

        if (users.length === 0) return res.status(404).json({ message: 'Usuario no encontrado.' });

        const userData = users[0];
        let materias = [];
        let reviews = [];
        let promedio = 0;

        if (userData.rol === 'Tutor') {
            const [subjects] = await connection.execute(
                `SELECT m.materia_id, m.nombre_materia 
                 FROM tutor_materias tm
                 JOIN materias m ON tm.materia_id = m.materia_id
                 WHERE tm.tutor_id = ?`,
                [req.user.id]
            );
            materias = subjects;

            const [tutorReviews] = await connection.execute(
                `SELECT r.estrellas, r.comentario, u.nombre as autor, r.fecha
                 FROM calificaciones_tutores r
                 JOIN users u ON r.aprendiz_id = u.user_id
                 WHERE r.tutor_id = ?
                 ORDER BY r.fecha DESC`,
                [req.user.id]
            );
            reviews = tutorReviews;
        } else {
            const [studentReviews] = await connection.execute(
                `SELECT r.estrellas, r.comentario, u.nombre as autor, r.fecha_calificacion as fecha
                 FROM calificaciones_alumnos r
                 JOIN users u ON r.tutor_id = u.user_id
                 WHERE r.alumno_id = ?
                 ORDER BY r.fecha_calificacion DESC`,
                [req.user.id]
            );
            reviews = studentReviews;
        }

        if (reviews.length > 0) {
            const suma = reviews.reduce((acc, curr) => acc + curr.estrellas, 0);
            promedio = (suma / reviews.length).toFixed(1);
        }

        const logros = [];
        if (reviews.length >= 1) logros.push(userData.rol === 'Tutor' ? "Mentor Iniciado" : "Aprendiz Activo");
        if (promedio >= 4.5 && reviews.length >= 3) logros.push("Excelencia Académica");
        if (reviews.length >= 10) logros.push("Veterano Hero");

        res.json({ 
            user: {
                ...userData,
                fecha_nacimiento: userData.fecha_nacimiento || "N/A",
                materias_a_enseñar: materias,
                reviews: reviews,
                promedio_estrellas: promedio,
                logros: logros
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
 * 2. ACTUALIZAR PERFIL (Se mantiene igual)
 */
const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { semestre } = req.body;
    let foto_perfil_url = null;
    if (req.file) foto_perfil_url = req.file.path; 

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

        await connection.execute(query, params);
        res.json({ message: "Perfil actualizado correctamente", foto_perfil_url, semestre });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar" });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * 3. OBTENER LISTA DE TUTORES DISPONIBLES (Corregido para evitar Error 500)
 */
const getAvailableTutors = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        // 1. Obtenemos los tutores con su promedio, agrupando correctamente
        const [tutors] = await connection.execute(
            `SELECT 
                u.user_id AS id, u.nombre, u.username, u.foto_perfil_url, 
                u.semestre, u.institucion, c.nombre_carrera,
                IFNULL(AVG(r.estrellas), 0) as promedio_reputacion
             FROM users u
             LEFT JOIN carreras c ON u.carrera_id = c.carrera_id
             LEFT JOIN calificaciones_tutores r ON u.user_id = r.tutor_id
             WHERE u.rol = 'Tutor'
             GROUP BY u.user_id, c.nombre_carrera` // Agregamos c.nombre_carrera aquí para cumplir con ONLY_FULL_GROUP_BY
        );

        // 2. Buscamos las materias para cada tutor
        const tutorsWithMaterias = await Promise.all(tutors.map(async (tutor) => {
            const [subjects] = await connection.execute(
                `SELECT m.nombre_materia 
                 FROM tutor_materias tm
                 JOIN materias m ON tm.materia_id = m.materia_id
                 WHERE tm.tutor_id = ?`,
                [tutor.id]
            );
            return { 
                ...tutor, 
                materias: subjects,
                promedio_reputacion: parseFloat(tutor.promedio_reputacion).toFixed(1)
            };
        }));

        res.json({ tutors: tutorsWithMaterias });
    } catch (error) {
        console.error("❌ Error en getAvailableTutors:", error.message);
        res.status(500).json({ message: 'Error interno al obtener tutores' });
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
        
        // 1. Datos básicos del tutor
        const [users] = await connection.execute(
            `SELECT u.user_id, u.nombre, u.username, u.foto_perfil_url, u.semestre, u.institucion,
                    c.nombre_carrera, IFNULL(AVG(r.estrellas), 0) as promedio
             FROM users u
             LEFT JOIN carreras c ON u.carrera_id = c.carrera_id 
             LEFT JOIN calificaciones_tutores r ON u.user_id = r.tutor_id
             WHERE u.user_id = ? AND u.rol = 'Tutor'
             GROUP BY u.user_id, c.nombre_carrera`, [id]
        );

        if (users.length === 0) return res.status(404).json({ message: 'Tutor no encontrado' });

        // 2. OBTENER MATERIAS (Esto es lo que te falta)
        const [subjects] = await connection.execute(
            `SELECT m.nombre_materia 
             FROM tutor_materias tm
             JOIN materias m ON tm.materia_id = m.materia_id
             WHERE tm.tutor_id = ?`, [id]
        );

        // 3. OBTENER RESEÑAS (Esto es lo que te falta)
        const [comments] = await connection.execute(
            `SELECT r.estrellas, r.comentario, u.nombre as autor, r.fecha
             FROM calificaciones_tutores r
             JOIN users u ON r.aprendiz_id = u.user_id
             WHERE r.tutor_id = ?
             ORDER BY r.fecha DESC`, [id]
        );

        res.json({
            tutor: {
                ...users[0],
                materias: subjects, // El frontend busca "materias"
                reviews: comments,  // El frontend busca "reviews"
                reputacion: users[0].promedio
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno' });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = { getUserProfile, updateProfile, getAvailableTutors, getTutorById };