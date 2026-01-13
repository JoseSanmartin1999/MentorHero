import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// URL de la API para buscar tutores
const TUTORS_API_URL = 'http://localhost:5000/api/users/tutors'; 
const DEFAULT_AVATAR = 'https://res.cloudinary.com/dfuk35w6v/image/upload/v1700000000/default-avatar.png'; 

const SearchTutorPage = () => {
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTutors = async () => {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('userToken');

            if (!token) {
                setError('Necesitas iniciar sesión para buscar tutores.');
                setLoading(false);
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(TUTORS_API_URL, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    // Nos aseguramos de recibir data.tutors y que sea un array
                    setTutors(data.tutors || []);
                } else {
                    const errorData = await response.json();
                    if (response.status === 401) {
                        localStorage.removeItem('userToken');
                        navigate('/login');
                    }
                    setError(errorData.message || 'Error al cargar la lista de tutores.');
                }
            } catch (err) {
                console.error("Error en la petición:", err);
                setError('Error de conexión con el servidor.');
            } finally {
                setLoading(false);
            }
        };

        fetchTutors();
    }, [navigate]);

    if (loading) {
        return (
            <div className="text-center my-5">
                <div className="spinner-border text-success" role="status"></div>
                <p className="mt-2">Cargando tutores disponibles...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container my-5">
                <div className="alert alert-danger text-center shadow-sm">{error}</div>
                <div className="text-center">
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>Reintentar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="container my-5">
            <h1 className="text-center mb-5" style={{ color: '#1a4731', fontWeight: 'bold' }}>
                📚 Encuentra a tu Mentor
            </h1>
            
            {tutors.length === 0 ? (
                <div className="alert alert-warning text-center shadow-sm">
                    No hay tutores disponibles registrados en este momento.
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {tutors.map(tutor => (
                        <div className="col" key={tutor.id}>
                            <div className="card h-100 shadow-sm border-0 transition-hover">
                                <div className="card-body text-center p-4">
                                    {/* Foto de Perfil */}
                                    <img 
                                        src={tutor.foto_perfil_url || DEFAULT_AVATAR} 
                                        alt={tutor.nombre} 
                                        className="rounded-circle mb-3 shadow-sm border border-3 border-light"
                                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                    />
                                    
                                    {/* Información Básica */}
                                    <h5 className="card-title mb-1 fw-bold text-dark">{tutor.nombre}</h5>
                                    <p className="text-muted small mb-2">@{tutor.username}</p>
                                    <p className="badge bg-light text-dark border mb-3">{tutor.nombre_carrera}</p>
                                    
                                    {/* Sección de Materias con validación defensiva */}
                                    <h6 className="text-success mb-2 fw-bold" style={{ fontSize: '0.9rem' }}>Especialidades:</h6>
                                    <div className="mb-4" style={{ minHeight: '60px' }}>
                                        {tutor.materias && tutor.materias.length > 0 ? (
                                            <div className="d-flex flex-wrap justify-content-center gap-1">
                                                {tutor.materias.slice(0, 3).map((materia, i) => (
                                                    <span key={i} className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                                                        {materia.nombre_materia}
                                                    </span>
                                                ))}
                                                {tutor.materias.length > 3 && (
                                                    <span className="badge bg-light text-muted border px-2 py-1">
                                                        +{tutor.materias.length - 3} más
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-muted small italic">Consultar materias en el perfil</p>
                                        )}
                                    </div>

                                    {/* Botón Revisar Perfil */}
                                    <div className="d-grid">
                                        <Link 
                                            to={`/profile/${tutor.id}`} 
                                            className="btn btn-success py-2 shadow-sm"
                                            style={{ backgroundColor: '#2d572c', borderColor: '#2d572c' }}
                                        >
                                            Ver Perfil Detallado
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchTutorPage;