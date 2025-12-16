// backend/config/cloudinaryConfig.js

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config(); // Asegura que las variables del .env sean cargadas

// 1. Configurar Cloudinary con tus credenciales (usando process.env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configurar el almacenamiento de Multer para Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'MentorHero_Avatars', 
        allowed_formats: ['jpg', 'png', 'jpeg'],
        // Puedes agregar más transformaciones aquí si es necesario
    },
});

const upload = multer({ storage: storage });

module.exports = upload;