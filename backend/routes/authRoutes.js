// backend/routes/authRoutes.js

const express = require('express');
const { registerUser } = require('../controllers/authController');
// Importar el middleware de Multer configurado con Cloudinary
const upload = require('../config/cloudinaryConfig'); 
const router = express.Router();

// Ruta para el registro de usuarios
// POST /api/auth/register

/*
 * upload.single('foto') es el middleware de Multer.
 * 1. Él intercepta la petición.
 * 2. Procesa el campo de archivo llamado 'foto'.
 * 3. Sube ese archivo a Cloudinary.
 * 4. Si es exitoso, agrega el objeto 'req.file' (con la URL de Cloudinary) a la petición.
 * 5. Llama a la siguiente función (registerUser).
 */
router.post('/register', upload.single('foto'), registerUser); // <-- Middleware insertado

module.exports = router;