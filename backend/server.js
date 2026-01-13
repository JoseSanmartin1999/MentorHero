const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 
const { testConnection } = require('./db'); 
const authRoutes = require('./routes/authRoutes'); 
const userRoutes = require('./routes/userRoutes');
const solicitudRoutes = require('./routes/solicitudRoutes'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await testConnection(); 

    // ==========================================================
    // 2. MIDDLEWARES
    // ==========================================================
    
    app.use(cors({
        origin: 'http://localhost:3000', 
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    }));

    // 🛑 CAMBIO 1: Soporte para JSON
    app.use(express.json()); 

    // 🛑 CAMBIO 2: Soporte para datos de formularios (IMPORTANTE para Multer/Cloudinary)
    // Esto permite procesar campos de texto que vienen junto a la imagen
    app.use(express.urlencoded({ extended: true }));

    // ==========================================================
    // 3. RUTAS
    // ==========================================================
    
    app.get('/', (req, res) => {
        res.send('Servidor MentorHero Backend funcionando!');
    });

    // Rutas de Autenticación
    app.use('/api/auth', authRoutes);
    
    // Rutas de Usuario (Aquí está /update-profile)
    app.use('/api/users', userRoutes);

    // Gestión de Solicitudes
    app.use('/api/solicitudes', solicitudRoutes);

    // 🛑 CAMBIO 3: Manejador de rutas no encontradas (DEBUG)
    // Si tu frontend sigue dando 404, verás el error exacto en tu terminal de VS Code
    app.use((req, res) => {
        console.log(`⚠️ Ruta no encontrada: ${req.method} ${req.url}`);
        res.status(404).json({ message: `La ruta ${req.url} no existe en este servidor.` });
    });

    // ==========================================================
    // 4. INICIAR SERVIDOR
    // ==========================================================

    app.listen(PORT, () => {
        console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`);
        console.log(`✅ Rutas de usuario cargadas en /api/users`);
    });
};

startServer();