const { pool } = require('../db');

/**
 * 1. CREAR SOLICITUD (Para el Aprendiz)
 */
const crearSolicitud = async (req, res) => {
    const aprendiz_id = req.user.id; 
    const { tutor_id, materia_id, temas, fecha, hora, tiempo } = req.body;

    const tiempoNum = parseInt(tiempo);
    if (isNaN(tiempoNum) || tiempoNum < 60 || tiempoNum > 120) {
        return res.status(400).json({ message: 'El tiempo debe ser un número entre 60 y 120 minutos.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.execute(
            `INSERT INTO solicitudes_tutoria 
            (aprendiz_id, tutor_id, materia_id, temas, fecha_tutoria, hora_tutoria, tiempo_requerido) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [aprendiz_id, tutor_id, materia_id, temas, fecha, hora, tiempoNum]
        );

        res.status(201).json({ message: 'Tutoría solicitada con éxito.' });
    } catch (error) {
        console.error('❌ Error en crearSolicitud:', error.message);
        res.status(500).json({ message: 'Error interno al procesar la solicitud.' });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * 2. OBTENER SOLICITUDES DEL TUTOR (Bandeja de Entrada)
 */
const getSolicitudesTutor = async (req, res) => {
    const tutor_id = req.user.id;
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute(
            `SELECT 
                s.solicitud_id, s.aprendiz_id, s.temas, s.fecha_tutoria, s.hora_tutoria, 
                s.tiempo_requerido, s.status, s.mensaje_tutor, s.created_at,
                u.nombre AS nombre_aprendiz,
                m.nombre_materia
             FROM solicitudes_tutoria s
             JOIN users u ON s.aprendiz_id = u.user_id
             JOIN materias m ON s.materia_id = m.materia_id
             WHERE s.tutor_id = ? AND s.status IN ('pendiente', 'aceptada')
             ORDER BY s.created_at ASC`, 
            [tutor_id]
        );
        res.json(rows);
    } catch (error) {
        console.error('❌ Error en getSolicitudesTutor:', error.message);
        res.status(500).json({ message: 'Error al obtener tus solicitudes.' });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * 3. ACTUALIZAR ESTADO (Aceptar/Rechazar)
 */
const actualizarStatus = async (req, res) => {
    const { id } = req.params;
    const { status, mensaje_tutor } = req.body; 
    const tutor_id = req.user.id;

    const estadosValidos = ['aceptada', 'rechazada', 'cancelada'];
    if (!estadosValidos.includes(status)) {
        return res.status(400).json({ message: 'Estado no válido para esta acción.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            `UPDATE solicitudes_tutoria 
             SET status = ?, mensaje_tutor = ? 
             WHERE solicitud_id = ? AND tutor_id = ?`,
            [status, mensaje_tutor || null, id, tutor_id]
        );

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: 'No tienes permiso o la solicitud no existe.' });
        }

        res.json({ message: `Solicitud marcada como ${status}.` });
    } catch (error) {
        console.error('❌ Error en actualizarStatus:', error.message);
        res.status(500).json({ message: 'Error al actualizar el estado.' });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * 4. FINALIZAR Y CALIFICAR ALUMNO
 */
const finalizarYCalificar = async (req, res) => {
    const tutor_id = req.user.id;
    const { solicitud_id, alumno_id, estrellas, resultado, comentario } = req.body;

    if (!solicitud_id || !alumno_id || !estrellas || !resultado) {
        return res.status(400).json({ message: 'Faltan datos obligatorios para calificar.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        await connection.execute(
            `INSERT INTO calificaciones_alumnos 
            (solicitud_id, tutor_id, alumno_id, estrellas, resultado, comentario) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [solicitud_id, tutor_id, alumno_id, estrellas, resultado, comentario || null]
        );

        await connection.execute(
            `UPDATE solicitudes_tutoria SET status = 'finalizada' 
             WHERE solicitud_id = ? AND tutor_id = ?`,
            [solicitud_id, tutor_id]
        );

        await connection.commit();
        res.json({ message: 'Tutoría finalizada y calificada correctamente.' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('❌ Error en finalizarYCalificar:', error.message);
        res.status(500).json({ message: 'Error al finalizar la tutoría.' });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * 5. OBTENER SOLICITUDES DEL APRENDIZ
 */
const getSolicitudesAprendiz = async (req, res) => {
    const aprendiz_id = req.user.id;
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute(
            `SELECT 
                s.solicitud_id, s.tutor_id, s.temas, s.fecha_tutoria, s.hora_tutoria, 
                s.tiempo_requerido, s.status, s.mensaje_tutor, s.created_at,
                s.calificada_por_aprendiz, -- 👈 AGREGADO: Necesario para el banner del frontend
                u.nombre AS nombre_tutor,
                m.nombre_materia
             FROM solicitudes_tutoria s
             JOIN users u ON s.tutor_id = u.user_id
             JOIN materias m ON s.materia_id = m.materia_id
             WHERE s.aprendiz_id = ?
             ORDER BY s.created_at DESC`,
            [aprendiz_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener tus solicitudes.' });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * 6. CALIFICAR AL TUTOR
 */
const calificarTutor = async (req, res) => {
    const aprendiz_id = req.user.id;
    const { solicitud_id, tutor_id, estrellas, comentario } = req.body;

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.execute(
            `INSERT INTO calificaciones_tutores 
            (solicitud_id, aprendiz_id, tutor_id, estrellas, comentario) 
            VALUES (?, ?, ?, ?, ?)`,
            [solicitud_id, aprendiz_id, tutor_id, estrellas, comentario || null]
        );

        await connection.execute(
            `UPDATE solicitudes_tutoria SET calificada_por_aprendiz = 1 
             WHERE solicitud_id = ?`, [solicitud_id]
        );

        res.json({ message: 'Gracias por calificar a tu tutor.' });
    } catch (error) {
        console.error('❌ Error en calificarTutor:', error);
        res.status(500).json({ message: 'Error al procesar la calificación.' });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = { 
    crearSolicitud, 
    getSolicitudesTutor, 
    actualizarStatus, 
    getSolicitudesAprendiz,
    finalizarYCalificar,
    calificarTutor 
};