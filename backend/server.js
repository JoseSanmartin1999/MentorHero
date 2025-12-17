// backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 
// Importar la función de conexión a DB y el pool
const { testConnection } = require('./db'); 
const authRoutes = require('./routes/authRoutes'); 
const userRoutes = require('./routes/userRoutes');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================================
// 1. FUNCIÓN PRINCIPAL DE INICIO
// ==========================================================

const startServer = async () => {
    // Probar la conexión a la DB y esperar a que sea exitosa
    // Si la conexión falla, testConnection() terminará el proceso (process.exit(1))
    await testConnection(); 

    // ==========================================================
    // 2. MIDDLEWARES
    // ==========================================================
    
    // CORS: Para permitir peticiones desde el frontend (http://localhost:3000)
    app.use(cors({
        origin: 'http://localhost:3000', 
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    }));

    // Body Parser: Para que Express lea JSON de las peticiones
    app.use(express.json()); 

    // ==========================================================
    // 3. RUTAS
    // ==========================================================
    
    // Ruta de prueba (/)
    app.get('/', (req, res) => {
        res.send('Servidor MentorHero Backend funcionando!');
    });

    // Rutas de Autenticación (Registro, Login)
    app.use('/api/auth', authRoutes);
    
    // Rutas de Usuario (Protegidas)
    app.use('/api/users', userRoutes);

    // ==========================================================
    // 4. INICIAR SERVIDOR
    // ==========================================================

    app.listen(PORT, () => console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`));
};

// Ejecutar la función de inicio
startServer();