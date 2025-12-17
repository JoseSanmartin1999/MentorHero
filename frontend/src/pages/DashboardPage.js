import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const PROTECTED_URL = 'http://localhost:5000/api/users/profile';
const DEFAULT_AVATAR = 'https://res.cloudinary.com/dfuk35w6v/image/upload/v1700000000/default-avatar.png'; 

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
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
                // 🛑 CORRECCIÓN 1: Redirección inmediata si no hay token
                setError('No tienes sesión iniciada.');
                setLoading(false);
                navigate('/login');
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
                    setError(errorData.message || 'Error al cargar los datos del perfil. Sesión caducada.');
                    // Limpiar sesión y redirigir
                    localStorage.removeItem('userToken');
                    localStorage.removeItem('userInfo');
                    navigate('/login'); // 🛑 CORRECCIÓN 2: Redirección sin timeout
                }
            } catch (err) {
                setError('Error de conexión con el servidor. El backend puede estar inactivo.');
            } finally {
                setLoading(false);
            }
        };

        fetchProtectedData();
    }, [navigate]);

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

    // Asegurarse de que los datos existen antes de intentar renderizar
    if (!userData) {
        return <div className="alert alert-warning text-center my-5">No se pudo obtener la información del usuario. Intenta iniciar sesión de nuevo.</div>;
    }
    
    const avatarUrl = userData.foto_perfil_url ? userData.foto_perfil_url : DEFAULT_AVATAR;
    const isTutor = userData.rol === 'Tutor';
    // 🛑 Manejo defensivo: Si el backend no envía el array, asumimos que es vacío.
    const materiasTutor = userData.materias_a_enseñar || []; 

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
                                <span className={`badge bg-${isTutor ? 'info' : 'secondary'} text-white`}>
                                    {userData.rol}
                                </span>
                            </div>

                            <hr />

                            {/* SECCIÓN DE DETALLES PRINCIPALES */}
                            <h5 className="mb-3 text-muted">Detalles del Perfil:</h5>
                            <ul className="list-group list-group-flush mb-4">
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
                            </ul>
                            
                            {/* 🛑 SECCIÓN DE MATERIAS DEL TUTOR (CONDICIONAL) */}
                            {isTutor && materiasTutor.length > 0 && (
                                <div className="mt-4 p-3 border rounded bg-light">
                                    <h5 className="text-primary mb-3">Materias que puedes enseñar:</h5>
                                    <ul className="list-group">
                                        {/* Usamos el ID de la materia como key para mayor estabilidad */}
                                        {materiasTutor.map((materia) => (
                                            <li key={materia.materia_id} className="list-group-item list-group-item-action">
                                                {materia.nombre_materia}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {isTutor && materiasTutor.length === 0 && (
                                <div className="alert alert-info text-center mt-4">
                                    Aún no tienes materias registradas para tutoría.
                                </div>
                            )}
                            
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