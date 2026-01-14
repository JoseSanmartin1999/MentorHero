import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const TUTOR_PROFILE_URL = 'http://localhost:5000/api/users/profile';
const DEFAULT_AVATAR = 'https://res.cloudinary.com/dfuk35w6v/image/upload/v1700000000/default-avatar.png'; 

const TutorProfilePage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const [tutor, setTutor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTutorProfile = async () => {
            setLoading(true);
            const token = localStorage.getItem('userToken');

            if (!token) {
                setError('Necesitas iniciar sesión para ver perfiles.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${TUTOR_PROFILE_URL}/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    // IMPORTANTE: data.tutor debe incluir los arrays "materias" y "reviews"
                    setTutor(data.tutor);
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Error al cargar el perfil del tutor.');
                }
            } catch (err) {
                setError('Error de conexión con el servidor.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchTutorProfile();
        else navigate('/buscar-tutor');
    }, [id, navigate]);
    
    const handleSolicitarTutoria = () => {
        navigate(`/solicitar-tutoria/${id}`);
    };

    const renderStars = (rating) => {
        const numericRating = parseFloat(rating) || 0;
        return (
            <div className="d-inline-block">
                {[1, 2, 3, 4, 5].map((star) => (
                    <i key={star} 
                       className={`bi bi-star-fill ${star <= Math.round(numericRating) ? 'text-warning' : 'text-muted opacity-25'}`}
                       style={{ fontSize: '1.2rem', marginRight: '3px' }}></i>
                ))}
                <span className="ms-2 fw-bold text-dark">({numericRating.toFixed(1)})</span>
            </div>
        );
    };
    
    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-success" role="status"></div>
        </div>
    );
    
    if (error) return <div className="alert alert-danger text-center my-5 mx-auto w-50 shadow-sm">{error}</div>;
    if (!tutor) return null;

    return (
        <div className="min-vh-100 bg-light py-5" style={{ fontFamily: "'Playfair Display', serif" }}>
            <div className="container">
                <div className="row g-4">
                    
                    {/* COLUMNA IZQUIERDA: Tarjeta de Perfil */}
                    <div className="col-lg-4 text-center">
                        <div className="card border-0 shadow-sm rounded-4 p-4 sticky-lg-top" style={{ top: '20px' }}>
                            <div className="position-relative d-inline-block mx-auto mb-4">
                                <img 
                                    src={tutor.foto_perfil_url || DEFAULT_AVATAR} 
                                    alt={tutor.nombre} 
                                    className="rounded-4 shadow-sm border border-4 border-white"
                                    style={{ width: '100%', maxWidth: '300px', height: '350px', objectFit: 'cover' }}
                                />
                            </div>
                            <h2 className="fw-bold mb-1 text-uppercase" style={{ color: '#1a4731' }}>{tutor.nombre}</h2>
                            <p className="text-muted fs-5 mb-3">{tutor.semestre}° Semestre</p>
                            
                            <div className="mb-4 py-2 bg-light rounded-pill border">
                                {renderStars(tutor.reputacion)}
                            </div>

                            <button 
                                className="btn btn-lg w-100 rounded-pill py-3 fw-bold shadow mb-3" 
                                style={{ backgroundColor: '#1a4731', color: '#fff', border: 'none' }}
                                onClick={handleSolicitarTutoria}
                            >
                                <i className="bi bi-calendar-check me-2"></i>Solicitar Tutoría
                            </button>
                            
                            <button 
                                className="btn btn-outline-secondary w-100 rounded-pill py-2" 
                                onClick={() => navigate('/buscar-tutor')}
                            >
                                <i className="bi bi-arrow-left me-2"></i>Volver
                            </button>
                        </div>
                    </div>
                    
                    {/* COLUMNA DERECHA: Información Detallada */}
                    <div className="col-lg-8">
                        {/* Información Académica */}
                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                            <h4 className="fw-bold mb-4 border-bottom pb-2" style={{ color: '#1a4731' }}>
                                <i className="bi bi-mortarboard-fill me-2"></i>Información Académica
                            </h4>
                            <div className="row g-3">
                                <InfoBox title="Carrera" value={tutor.nombre_carrera || tutor.carrera_nombre} icon="bi-journal-bookmark" />
                                <InfoBox title="Institución" value={tutor.institucion} icon="bi-building" />
                                
                                <div className="col-12 mt-4">
                                    <h6 className="fw-bold text-muted text-uppercase small mb-3">Materias que puede impartir:</h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        {/* Renderizado condicional de materias */}
                                        {tutor.materias && tutor.materias.length > 0 ? (
                                            tutor.materias.map((m, idx) => (
                                                <span key={idx} className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-3 fs-6 fw-normal">
                                                    {m.nombre_materia}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-muted italic">No hay materias registradas para este tutor.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Logros */}
                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                            <h4 className="fw-bold mb-3" style={{ color: '#1a4731' }}>
                                <i className="bi bi-trophy-fill me-2 text-warning"></i>Insignias y Logros
                            </h4>
                            <div className="d-flex flex-wrap gap-2">
                                {tutor.logros && Array.isArray(tutor.logros) ? tutor.logros.map((logro, idx) => (
                                    <span key={idx} className="badge bg-warning bg-opacity-10 text-dark border border-warning px-3 py-2 rounded-pill fw-semibold">
                                        <i className="bi bi-patch-check-fill text-warning me-1"></i> {logro}
                                    </span>
                                )) : (
                                    <span className="badge bg-warning bg-opacity-10 text-dark border border-warning px-3 py-2 rounded-pill fw-semibold">
                                        <i className="bi bi-patch-check-fill text-warning me-1"></i> Mentor Certificado
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Reseñas */}
                        <div className="card border-0 shadow-sm rounded-4 p-4">
                            <h4 className="fw-bold mb-4" style={{ color: '#1a4731' }}>
                                <i className="bi bi-chat-quote-fill me-2 text-primary"></i>Reseñas de Estudiantes
                            </h4>
                            <div className="overflow-auto pe-2" style={{ maxHeight: '400px' }}>
                                {/* Renderizado condicional de reseñas */}
                                {tutor.reviews && tutor.reviews.length > 0 ? (
                                    tutor.reviews.map((rev, idx) => (
                                        <div key={idx} className="bg-light p-3 rounded-4 mb-3 border-start border-4 border-success shadow-sm">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="fw-bold text-dark">{rev.autor}</span>
                                                <div className="small text-warning">
                                                    {renderStars(rev.estrellas)}
                                                </div>
                                            </div>
                                            <p className="text-muted small italic mb-1">"{rev.comentario}"</p>
                                            <small className="text-muted opacity-75">
                                                {new Date(rev.fecha).toLocaleDateString()}
                                            </small>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-5 opacity-50">
                                        <i className="bi bi-chat-dots fs-1 mb-2 d-block"></i>
                                        <p>Este tutor aún no tiene comentarios de estudiantes.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoBox = ({ title, value, icon }) => (
    <div className="col-md-6">
        <div className="p-3 bg-light rounded-3 h-100 border border-white shadow-sm">
            <div className="d-flex align-items-center mb-1">
                <i className={`bi ${icon} text-success me-2`}></i>
                <span className="text-muted small fw-bold text-uppercase">{title}</span>
            </div>
            <p className="fs-5 mb-0 fw-bold">{value || 'N/A'}</p>
        </div>
    </div>
);

export default TutorProfilePage;