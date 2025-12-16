// backend/db.js

const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la conexión usando las variables de entorno de Clever Cloud
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT, // Añadimos el puerto 3306
    waitForConnections: true,
    connectionLimit: 10, // Un pool de 10 conexiones es estándar
    queueLimit: 0
};

// Crear un pool de conexiones para manejar múltiples peticiones eficientemente
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión al iniciar el servidor
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión exitosa a la base de datos MySQL de Clever Cloud.');
        connection.release(); // Liberar la conexión
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos de Clever Cloud:', error.message);
        // Si la conexión falla, el error se propaga para evitar que el servidor inicie sin DB
        process.exit(1); 
    }
}

module.exports = {
    pool,
    testConnection
};