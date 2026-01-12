const express = require('express');
const router = express.Router();
// 🛑 Se agregaron 'getSolicitudesTutor' y 'actualizarStatus' a la importación
const { 
    crearSolicitud, 
    getSolicitudesTutor, 
    actualizarStatus 
} = require('../controllers/solicitudController');
const { protect } = require('../middleware/authMiddleware');

// --- Rutas para el Aprendiz ---
// Ruta para enviar una nueva solicitud
router.post('/crear', protect, crearSolicitud);

// --- Rutas para el Tutor ---
// Ruta para que el tutor vea sus solicitudes recibidas
router.get('/tutor', protect, getSolicitudesTutor);

// Ruta para que el tutor acepte o rechace una solicitud específica
router.patch('/actualizar/:id', protect, actualizarStatus);

router.get('/aprendiz', protect, getSolicitudesAprendiz);
module.exports = router;