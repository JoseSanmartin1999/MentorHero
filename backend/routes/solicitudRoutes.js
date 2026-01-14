// backend/routes/solicitudRoutes.js
const express = require('express');
const router = express.Router();
const { 
    crearSolicitud, 
    getSolicitudesTutor, 
    actualizarStatus, 
    getSolicitudesAprendiz,
    finalizarYCalificar,
    calificarTutor // 👈 Importación correcta
} = require('../controllers/solicitudController');
const { protect } = require('../middleware/authMiddleware');

// Rutas base
router.post('/', protect, crearSolicitud);
router.get('/tutor', protect, getSolicitudesTutor);
router.get('/aprendiz', protect, getSolicitudesAprendiz);
router.patch('/:id/status', protect, actualizarStatus);

// Rutas de finalización y feedback
router.post('/finalizar', protect, finalizarYCalificar); 

// 🚀 NUEVA RUTA: Permite al aprendiz calificar al tutor una vez finalizada la sesión
router.post('/calificar-tutor', protect, calificarTutor); 

module.exports = router;