const { pool } = require('../db');

// 1. Crear solicitud (Para el Aprendiz)
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

        res.status(201).json({ message: 'Tutoria Solicitada con éxito.' });
    } catch (error) {
        console.error('❌ Error en crearSolicitud:', error.message);
        res.status(500).json({ message: 'Error interno al procesar la solicitud.' });
    } finally {
        if (connection) connection.release();
    }
};

// 2. Obtener solicitudes del Tutor (Bandeja de Entrada)
const getSolicitudesTutor = async (req, res) => {
    const tutor_id = req.user.id;
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute(
            `SELECT 
                s.solicitud_id, s.temas, s.fecha_tutoria, s.hora_tutoria, 
                s.tiempo_requerido, s.status, s.mensaje_tutor, s.created_at,
                u.nombre AS nombre_aprendiz,
                m.nombre_materia
             FROM solicitudes_tutoria s
             JOIN users u ON s.aprendiz_id = u.user_id
             JOIN materias m ON s.materia_id = m.materia_id
             WHERE s.tutor_id = ?
             ORDER BY s.created_at ASC`, // FIFO: Primero en entrar, primero en salir
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

// 3. Actualizar estado y Mensaje (Solo el Tutor dueño)
const actualizarStatus = async (req, res) => {
    const { id } = req.params;
    const { status, mensaje_tutor } = req.body; 
    const tutor_id = req.user.id;

    // Validación de estados permitidos
    const estadosValidos = ['aceptada', 'rechazada', 'finalizada', 'cancelada'];
    if (!estadosValidos.includes(status)) {
        return res.status(400).json({ message: 'Estado no válido.' });
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

        res.json({ message: `Solicitud actualizada a ${status} correctamente.` });
    } catch (error) {
        console.error('❌ Error en actualizarStatus:', error.message);
        res.status(500).json({ message: 'Error al actualizar el estado.' });
    } finally {
        if (connection) connection.release();
    }
};

// 4. Obtener solicitudes enviadas por el Aprendiz
const getSolicitudesAprendiz = async (req, res) => {
    const aprendiz_id = req.user.id;
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute(
            `SELECT 
                s.solicitud_id, s.temas, s.fecha_tutoria, s.hora_tutoria, 
                s.tiempo_requerido, s.status, s.mensaje_tutor, s.created_at,
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

// No olvides actualizar el module.exports al final del archivo:
module.exports = { crearSolicitud, getSolicitudesTutor, actualizarStatus, getSolicitudesAprendiz };