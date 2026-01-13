// frontend/src/utils/auth.js

/**
 * Verifica si hay un token de usuario almacenado.
 * @returns {boolean} True si el usuario está logueado, false en caso contrario.
 */
export const isAuthenticated = () => {
    return localStorage.getItem('userToken') !== null;
};

/**
 * Obtiene el nombre de usuario de la información almacenada.
 * @returns {string | null} El nombre de usuario o null.
 */
export const getUserInfo = () => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        try {
            return JSON.parse(userInfo);
        } catch (e) {
            console.error("Error al parsear userInfo del localStorage", e);
            return null;
        }
    }
    return null;
};

/**
 * Cierra la sesión del usuario.
 */
export const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    // Forzar un refresh para actualizar la interfaz (o usar un Context/Redux)
    window.location.href = '/login'; 
};