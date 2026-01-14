import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Configuración de URLs y recursos
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
                    // El backend devuelve { tutors: [...] }
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

    // ✨ Función para renderizar estrellas según la reputación real
    const renderStars = (rating) => {
        const numericRating = parseFloat(rating) || 0;
        return (
            <div className="mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <i
                        key={star}
                        className={`bi bi-star-fill ${star <= Math.round(numericRating) ? 'text-warning' : 'text-muted opacity-25'}`}
                        style={{ fontSize: '0.9rem', marginRight: '2px' }}
                    ></i>
                ))}
                <span className="ms-1 small text-muted">({numericRating.toFixed(1)})</span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                <div className="spinner-border text-success" style={{ width: '3rem', height: '3rem' }} role="status"></div>
                <p className="mt-3 fw-bold text-success">Buscando mentores disponibles...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container my-5 text-center">
                <div className="alert alert-danger shadow-sm py-4">
                    <i className="bi bi-exclamation-triangle-fill fs-1 d-block mb-2"></i>
                    {error}
                </div>
                <button className="btn btn-primary rounded-pill px-4" onClick={() => window.location.reload()}>
                    Reintentar conexión
                </button>
            </div>
        );
    }

    return (
        <div className="container my-5">
            <header className="text-center mb-5">
                <h1 className="display-4 fw-bold" style={{ color: '#1a4731' }}>
                    📚 Encuentra a tu Mentor
                </h1>
                <p className="lead text-muted">Aprende de los mejores estudiantes de la comunidad</p>
            </header>

            {tutors.length === 0 ? (
                <div className="alert alert-light border text-center p-5 shadow-sm">
                    <i className="bi bi-people fs-1 text-muted opacity-50 mb-3 d-block"></i>
                    <h4>No hay tutores disponibles en este momento.</h4>
                    <p className="mb-0 text-muted">Intenta regresar más tarde.</p>
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {tutors.map(tutor => (
                        <div className="col" key={tutor.id}>
                            <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden card-hover">
                                <div className="card-body text-center p-4">
                                    {/* Imagen de Perfil de Cloudinary */}
                                    <div className="position-relative mb-4">
                                        <img 
                                            src={tutor.foto_perfil_url || DEFAULT_AVATAR} 
                                            alt={tutor.nombre} 
                                            className="rounded-circle shadow-sm border border-4 border-white"
                                            style={{ width: '130px', height: '130px', objectFit: 'cover' }}
                                        />
                                    </div>
                                    
                                    {/* Información Principal */}
                                    <h5 className="card-title mb-1 fw-bold text-dark">{tutor.nombre}</h5>
                                    <p className="text-muted small mb-1">@{tutor.username}</p>
                                    
                                    {/* Reputación en Estrellas */}
                                    {renderStars(tutor.promedio_reputacion)}

                                    <div className="d-flex justify-content-center gap-2 mb-3">
                                        <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                                            {tutor.nombre_carrera}
                                        </span>
                                        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                                            {tutor.semestre}° Semestre
                                        </span>
                                    </div>
                                    
                                    {/* Especialidades */}
                                    <h6 className="text-uppercase small fw-bold text-muted mb-2 ls-1">Especialidades</h6>
                                    <div className="mb-4 d-flex flex-wrap justify-content-center gap-1" style={{ minHeight: '50px' }}>
                                        {tutor.materias && tutor.materias.length > 0 ? (
                                            tutor.materias.slice(0, 3).map((materia, i) => (
                                                <span key={i} className="badge bg-white text-dark border px-2 py-1 small fw-normal">
                                                    {materia.nombre_materia}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-muted small fst-italic">Ver materias en perfil</span>
                                        )}
                                        {tutor.materias?.length > 3 && (
                                            <span className="text-muted small">+{tutor.materias.length - 3}</span>
                                        )}
                                    </div>

                                    {/* Botón de Acción */}
                                    <div className="d-grid">
                                        <Link 
                                            to={`/profile/${tutor.id}`} 
                                            className="btn btn-success py-2 fw-bold rounded-pill shadow-sm"
                                            style={{ backgroundColor: '#1a4731', border: 'none' }}
                                        >
                                            Ver Perfil Completo
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CSS para el efecto hover */}
            <style>{`
                .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .card-hover:hover { transform: translateY(-10px); box-shadow: 0 1rem 3rem rgba(0,0,0,.175)!important; }
                .ls-1 { letter-spacing: 1px; }
            `}</style>
        </div>
    );
};

export default SearchTutorPage;