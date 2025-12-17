import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate para redirigir
import 'bootstrap/dist/css/bootstrap.min.css';

const PROTECTED_URL = 'http://localhost:5000/api/users/profile';
const DEFAULT_AVATAR = 'https://res.cloudinary.com/dfuk35w6v/image/upload/v1700000000/default-avatar.png'; // URL de un avatar por defecto

// Función para formatear la fecha
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    // Formato simple DD/MM/AAAA
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const DashboardPage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProtectedData = async () => {
            const token = localStorage.getItem('userToken');

            if (!token) {
                setError('No tienes sesión iniciada. Redirigiendo a Login...');
                setLoading(false);
                setTimeout(() => navigate('/login'), 1500); // Redirigir si no hay token
                return;
            }

            try {
                const response = await fetch(PROTECTED_URL, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data.user);
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Error al cargar los datos del perfil.');
                    setTimeout(() => navigate('/login'), 2000); // Redirigir ante error 401/403
                }
            } catch (err) {
                setError('Error de conexión con el servidor. El backend puede estar inactivo.');
            } finally {
                setLoading(false);
            }
        };

        fetchProtectedData();
    }, [navigate]);

    // Función de cierre de sesión
    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    if (loading) {
        return <div className="text-center my-5"><span className="spinner-border text-success" role="status"></span> Cargando perfil...</div>;
    }

    if (error) {
        return <div className="alert alert-danger text-center my-5">{error}</div>;
    }

    // Determinar la URL de la imagen
    const avatarUrl = userData.foto_perfil_url ? userData.foto_perfil_url : DEFAULT_AVATAR;

    // Renderizado del Dashboard
    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow-lg border-0">
                        
                        <div className="card-header bg-success text-white text-center py-3">
                            <h2>Bienvenido, {userData.nombre}</h2>
                        </div>
                        
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                {/* Imagen de Perfil */}
                                <img 
                                    src={avatarUrl} 
                                    alt="Foto de Perfil" 
                                    className="rounded-circle border border-5 border-light"
                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                />
                                <h3 className="mt-3 mb-0">{userData.username}</h3>
                                <span className={`badge bg-${userData.rol === 'Tutor' ? 'info' : 'secondary'} text-white`}>
                                    {userData.rol}
                                </span>
                            </div>

                            <hr />

                            <h5 className="mb-3 text-muted">Detalles del Perfil:</h5>
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <strong>Nombre Completo:</strong>
                                    <span>{userData.nombre}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <strong>Fecha de Nacimiento:</strong>
                                    <span>{formatDate(userData.fecha_nacimiento)}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <strong>Institución:</strong>
                                    <span>{userData.institucion}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <strong>Semestre:</strong>
                                    <span>{userData.semestre}</span>
                                </li>
                                {/* Aquí podrías añadir la carrera con una consulta extra si lo deseas */}
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <strong>ID de Carrera:</strong>
                                    <span>{userData.carrera_id}</span>
                                </li>
                            </ul>
                            
                            <div className="text-center mt-5">
                                <button 
                                    className="btn btn-danger btn-lg" 
                                    onClick={handleLogout}
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;