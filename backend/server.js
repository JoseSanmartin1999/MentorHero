// backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 
// Importar la función de conexión a DB y el pool
const { testConnection } = require('./db'); 
const authRoutes = require('./routes/authRoutes'); 
const userRoutes = require('./routes/userRoutes');
// 🛑 NUEVA IMPORTACIÓN: Rutas de solicitudes
const solicitudRoutes = require('./routes/solicitudRoutes'); 

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================================
// 1. FUNCIÓN PRINCIPAL DE INICIO
// ==========================================================

const startServer = async () => {
    // Probar la conexión a la DB y esperar a que sea exitosa
    await testConnection(); 

    // ==========================================================
    // 2. MIDDLEWARES
    // ==========================================================
    
    app.use(cors({
        origin: 'http://localhost:3000', 
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    }));

    app.use(express.json()); 

    // ==========================================================
    // 3. RUTAS
    // ==========================================================
    
    app.get('/', (req, res) => {
        res.send('Servidor MentorHero Backend funcionando!');
    });

    // Rutas de Autenticación (Registro, Login)
    app.use('/api/auth', authRoutes);
    
    // Rutas de Usuario (Perfil, Lista de Tutores)
    app.use('/api/users', userRoutes);

    // 🛑 NUEVA RUTA: Gestión de Solicitudes de Tutoría
    app.use('/api/solicitudes', solicitudRoutes);

    // ==========================================================
    // 4. INICIAR SERVIDOR
    // ==========================================================

    app.listen(PORT, () => console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`));
};

startServer();