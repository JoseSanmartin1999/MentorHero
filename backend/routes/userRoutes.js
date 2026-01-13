const express = require('express');
const router = express.Router();

const { 
    getUserProfile, 
    getAvailableTutors, 
    getTutorById, 
    updateProfile 
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// 1. Obtener perfil propio (Ruta estática)
router.get('/profile', protect, getUserProfile);

// 2. Obtener lista de tutores (Ruta estática)
router.get('/tutors', protect, getAvailableTutors); 

// 🚀 3. ACTUALIZAR PERFIL (Subida antes que la ruta dinámica)
// Se coloca aquí para que Express no confunda "update-profile" con un ":id"
router.patch('/update-profile', protect, upload.single('foto'), updateProfile);

// 4. Obtener perfil de un tutor por ID (Ruta dinámica)
// IMPORTANTE: Siempre al final de las rutas de perfil
router.get('/profile/:id', protect, getTutorById); 

module.exports = router;