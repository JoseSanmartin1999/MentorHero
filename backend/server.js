// backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const { testConnection } = require('./db'); // Usando la conexión a MySQL
const authRoutes = require('./routes/authRoutes'); // Rutas de autenticación
const cors = require('cors'); 

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(cors({
    origin: 'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

app.use(express.json());

// Probar la conexión a la DB
testConnection(); 

// RUTAS
app.get('/', (req, res) => {
    res.send('Servidor MentorHero Backend funcionando!');
});

// Enlaza la ruta /api/auth a nuestro archivo authRoutes.js
app.use('/api/auth', authRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`));