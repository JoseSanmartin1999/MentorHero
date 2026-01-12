const express = require('express');
const router = express.Router();
const { getUserProfile, getAvailableTutors, getTutorById } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// 1. Obtener perfil propio (Ruta estática)
router.get('/profile', protect, getUserProfile);

// 2. Obtener lista de tutores (Ruta estática)
router.get('/tutors', protect, getAvailableTutors); 

// 3. Obtener perfil de un tutor por ID (Ruta dinámica)
// IMPORTANTE: Esta debe ir después de /profile para evitar conflictos
router.get('/profile/:id', protect, getTutorById); 

module.exports = router;