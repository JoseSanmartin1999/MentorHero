// backend/routes/userRoutes.js
const express = require('express');
const { getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // <-- Importar el middleware
const router = express.Router();

// Definición de la ruta:
// 1. Se llama primero al middleware 'protect'.
// 2. Si el token es válido, se llama a 'getUserProfile'.
// GET /api/users/profile
router.get('/profile', protect, getUserProfile); 

module.exports = router;