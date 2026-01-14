import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const PROFILE_URL = 'http://localhost:5000/api/users/profile';
const UPDATE_URL = 'http://localhost:5000/api/users/update-profile';
const DEFAULT_AVATAR = 'https://res.cloudinary.com/dfuk35w6v/image/upload/v1700000000/default-avatar.png';

const DashboardPage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editSemestre, setEditSemestre] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [updating, setUpdating] = useState(false);

    const navigate = useNavigate();

    const fetchData = async () => {
        const token = localStorage.getItem('userToken');
        if (!token) { navigate('/login'); return; }
        try {
            const response = await fetch(PROFILE_URL, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setUserData(data.user);
                setEditSemestre(data.user.semestre);
            } else {
                localStorage.clear();
                navigate('/login');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [navigate]);

    // Función para renderizar estrellas según el promedio
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i key={i} className={`bi bi-star-fill ${i <= rating ? 'text-warning' : 'text-muted opacity-25'}`}></i>
            );
        }
        return stars;
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    const avatarUrl = previewUrl || userData?.foto_perfil_url || DEFAULT_AVATAR;
    const isTutor = userData?.rol === 'Tutor';

    // Datos simulados en caso de que el backend aún no los envíe
    const reviews = userData?.reviews || [];
    const averageRating = userData?.promedio_estrellas || 0;
    const logros = isTutor 
        ? ['Mentor Destacado', 'Puntualidad de Oro', 'Experto en Matemáticas']
        : ['Estudiante Activo', 'Velocidad de Aprendizaje'];

    return (
        <div className="min-vh-100 bg-light pb-5">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm">
                <div className="container">
                    <span className="navbar-brand fw-bold italic">MentorHero</span>
                    <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="btn btn-outline-light btn-sm rounded-pill">Salir</button>
                </div>
            </nav>

            <div className="container">
                <div className="row g-4">
                    
                    {/* SIDEBAR IZQUIERDO */}
                    <div className="col-12 col-lg-4">
                        <div className="card border-0 shadow-sm rounded-4 text-center p-4 mb-4">
                            <div className="position-relative d-inline-block mx-auto mb-3">
                                <img src={avatarUrl} className="rounded-circle shadow-sm border border-4 border-white" style={{ width: '150px', height: '150px', objectFit: 'cover' }} alt="Perfil" />
                            </div>
                            <h3 className="fw-bold mb-1">{userData.nombre}</h3>
                            <div className="mb-3">
                                {renderStars(averageRating)}
                                <span className="ms-2 text-muted small">({averageRating})</span>
                            </div>
                            <span className={`badge rounded-pill px-3 py-2 mb-4 ${isTutor ? 'bg-info-subtle text-info' : 'bg-success-subtle text-success'}`}>
                                {userData.rol}
                            </span>
                            <button onClick={() => setIsEditing(!isEditing)} className="btn btn-primary w-100 rounded-pill py-2">
                                {isEditing ? 'Cerrar Edición' : 'Editar Perfil'}
                            </button>
                        </div>

                        {/* SECCIÓN DE LOGROS */}
                        <div className="card border-0 shadow-sm rounded-4 p-4">
                            <h5 className="fw-bold mb-3"><i className="bi bi-trophy-fill text-warning me-2"></i>Logros</h5>
                            <div className="d-flex flex-wrap gap-2">
                                {logros.map((logro, index) => (
                                    <span key={index} className="badge bg-warning-subtle text-dark border border-warning-subtle rounded-pill p-2">
                                        <i className="bi bi-patch-check-fill text-warning me-1"></i> {logro}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA */}
                    <div className="col-12 col-lg-8">
                        {/* Información Académica */}
                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                            <h5 className="fw-bold mb-4"><i className="bi bi-book-half me-2"></i>Académico</h5>
                            <div className="row g-3">
                                <div className="col-md-6 border-end">
                                    <p className="text-muted small mb-0 fw-bold">INSTITUCIÓN</p>
                                    <p className="fw-bold">{userData.institucion || 'N/A'}</p>
                                </div>
                                <div className="col-md-6">
                                    <p className="text-muted small mb-0 fw-bold">SEMESTRE</p>
                                    <p className="fw-bold text-primary">{userData.semestre}° Semestre</p>
                                </div>
                            </div>
                        </div>

                        {/* COMENTARIOS Y CALIFICACIONES */}
                        <div className="card border-0 shadow-sm rounded-4 p-4">
                            <h5 className="fw-bold mb-4"><i className="bi bi-chat-left-quote-fill text-primary me-2"></i>Comentarios de la Comunidad</h5>
                            <div className="overflow-auto" style={{ maxHeight: '350px' }}>
                                {reviews.length > 0 ? (
                                    reviews.map((rev, index) => (
                                        <div key={index} className="border-bottom mb-3 pb-3">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="fw-bold small">{rev.autor || 'Usuario Anónimo'}</span>
                                                <div className="small text-warning">
                                                    {renderStars(rev.estrellas)}
                                                </div>
                                            </div>
                                            <p className="text-muted small italic mb-0">"{rev.comentario}"</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <i className="bi bi-chat-dots fs-1 text-muted opacity-25"></i>
                                        <p className="text-muted mt-2">Aún no hay reseñas disponibles.</p>
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

export default DashboardPage;