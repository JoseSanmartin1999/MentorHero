const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT) || 4000,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    },
    // Esto ayuda a TiDB a identificar el cluster si el prefijo falla en el handshake
    connectTimeout: 10000 
};

const pool = mysql.createPool(dbConfig);

async function testConnection() {
    try {
        // Intentamos una consulta simple para validar el prefijo
        const connection = await pool.getConnection();
        console.log('✅ Conexión exitosa a TiDB Cloud (Prefijo verificado).');
        connection.release();
    } catch (error) {
        console.error('❌ Error al conectar a TiDB Cloud:', error.message);
        if (error.message.includes('prefix')) {
            console.error('👉 Tip: Asegúrate de que el nombre de usuario en el .env sea exactamente: 3kp7Cdx6agBW3Cd.root (sin comillas).');
        }
        process.exit(1); 
    }
}

module.exports = { pool, testConnection };