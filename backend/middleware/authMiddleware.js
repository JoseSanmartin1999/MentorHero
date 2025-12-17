// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * Middleware para proteger rutas privadas.
 * 1. Verifica la existencia de un token JWT en el encabezado 'Authorization'.
 * 2. Valida el token usando la clave secreta.
 * 3. Si es válido, adjunta la información del usuario (id, username, rol) a req.user.
 */
const protect = (req, res, next) => {
    let token;

    // El token se envía generalmente en el formato: "Bearer <token_valor>"
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Extraer solo el token (quitando 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // Verificar el token con la clave secreta del .env
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Adjuntar la información decodificada del usuario a la solicitud
            // (Esta info es el payload: { id, username, rol })
            req.user = decoded; 

            // Continuar con el siguiente middleware o controlador de ruta
            next();
        } catch (error) {
            console.error('Error al verificar el token:', error);
            // Error si el token es inválido o ha expirado
            return res.status(401).json({ message: 'No autorizado, token fallido o expirado.' });
        }
    }

    if (!token) {
        // Error si no se proporciona ningún token
        return res.status(401).json({ message: 'No autorizado, no hay token.' });
    }
};

module.exports = { protect };