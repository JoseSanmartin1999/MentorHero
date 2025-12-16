// frontend/src/ConnectionTest.js

import React, { useState, useEffect } from 'react';

// URL de tu servidor backend (donde corre server.js)
const BACKEND_URL = 'http://localhost:5000/';

function ConnectionTest() {
    const [message, setMessage] = useState('Intentando conectar con el servidor backend...');
    const [status, setStatus] = useState('loading'); // loading, success, error

    useEffect(() => {
        // La función que realiza la petición al backend
        const fetchBackendData = async () => {
            try {
                // Realiza la petición GET a la ruta base (/) del backend
                const response = await fetch(BACKEND_URL);
                
                if (!response.ok) {
                    // Si el servidor responde pero con un error HTTP (ej. 404, 500)
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                
                // Si la respuesta es exitosa (código 200), leemos el texto
                const data = await response.text();
                setMessage(`Respuesta del Backend: "${data}"`);
                setStatus('success');
            } catch (error) {
                // Si la conexión falla (servidor apagado, CORS, error de red)
                setMessage(`❌ Error de Conexión: Asegúrate de que el Backend esté corriendo en el puerto 5000. Detalles: ${error.message}`);
                setStatus('error');
            }
        };

        fetchBackendData();
    }, []);

    // Estilos sencillos basados en el estado
    const styleMap = {
        loading: { color: 'gray' },
        success: { color: 'green', fontWeight: 'bold' },
        error: { color: 'red', fontWeight: 'bold' }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Verificación de Conexión Frontend ↔️ Backend</h2>
            <p>Intentando contactar a: <code>{BACKEND_URL}</code></p>
            <p style={styleMap[status]}>
                **Estado de la Prueba:** {status.toUpperCase()}
            </p>
            <p>
                {message}
            </p>
        </div>
    );
}

export default ConnectionTest;