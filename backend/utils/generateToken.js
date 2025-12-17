// backend/utils/generateToken.js
const jwt = require('jsonwebtoken');

/**
 * Genera un Token JWT para la sesión del usuario.
 * @param {number} id - user_id del usuario
 * @param {string} username - nombre de usuario
 * @param {string} rol - rol del usuario
 * @returns {string} El token JWT firmado
 */
const generateToken = (id, username, rol) => {
    // Usamos el id, username y rol como carga (payload) del token
    return jwt.sign(
        { id, username, rol }, 
        process.env.JWT_SECRET, // Clave secreta definida en tu archivo .env
        { expiresIn: '30d' } // El token expira en 30 días
    );
};

module.exports = generateToken;