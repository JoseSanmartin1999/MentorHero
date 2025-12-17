// backend/routes/authRoutes.js (MODIFICADO)

const express = require('express');
// Importar loginUser
const { registerUser, loginUser } = require('../controllers/authController'); 
const upload = require('../config/cloudinaryConfig'); 
const router = express.Router();

// Ruta para el registro (con middleware de foto)
// POST /api/auth/register
router.post('/register', upload.single('foto'), registerUser);

// Ruta para el inicio de sesión
// POST /api/auth/login
router.post('/login', loginUser); // <-- NUEVA RUTA: No necesita middleware de archivo

module.exports = router;