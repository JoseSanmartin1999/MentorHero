const express = require('express');
const router = express.Router();
// 🛑 IMPORTANTE: Incluir las 4 funciones en la desestructuración
const { 
    crearSolicitud, 
    getSolicitudesTutor, 
    actualizarStatus,
    getSolicitudesAprendiz 
} = require('../controllers/solicitudController');
const { protect } = require('../middleware/authMiddleware');

// Rutas para el Aprendiz
router.post('/crear', protect, crearSolicitud);
router.get('/aprendiz', protect, getSolicitudesAprendiz);

// Rutas para el Tutor
router.get('/tutor', protect, getSolicitudesTutor);
router.patch('/actualizar/:id', protect, actualizarStatus);

module.exports = router;