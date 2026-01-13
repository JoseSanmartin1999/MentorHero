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
            setError('');
            const token = localStorage.getItem('userToken');

            if (!token) {
                setError('Necesitas iniciar sesión para ver perfiles.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${TUTOR_PROFILE_URL}/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
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
    
    // 🚀 Lógica para enviar a la página SolicitudTutoriaPage.js
    const handleSolicitarTutoria = () => {
        // Esta ruta debe estar registrada en tu App.js
        navigate(`/solicitar-tutoria/${id}`);
    };

    // ✨ Sistema de calificación en estrellas
    const renderStars = (rating) => {
        const numericRating = parseFloat(rating) || 0;
        const fullStars = Math.floor(numericRating);
        const emptyStars = 5 - fullStars;
        
        return (
            <span style={{ color: '#FFD700', fontSize: '1.5rem' }}>
                {'★'.repeat(fullStars)}
                <span style={{ color: '#ccc' }}>{'★'.repeat(emptyStars)}</span>
                <small className="text-muted ms-2" style={{ fontSize: '1rem' }}>({numericRating})</small>
            </span>
        );
    };
    
    if (loading) return <div className="text-center my-5"><span className="spinner-border text-success" role="status"></span></div>;
    if (error) return <div className="alert alert-danger text-center my-5">{error}</div>;
    if (!tutor) return null;

    return (
        <div className="container my-5" style={{ fontFamily: "'Playfair Display', serif" }}>
            <div className="row align-items-center">
                
                {/* Columna Izquierda: Imagen y Nombre */}
                <div className="col-md-6 text-center mb-4">
                    <img 
                        src={tutor.foto_perfil_url || DEFAULT_AVATAR} 
                        alt={tutor.nombre} 
                        className="img-fluid mb-4 shadow-sm"
                        style={{ width: '85%', maxHeight: '450px', objectFit: 'cover', borderRadius: '15px' }}
                    />
                    <h1 className="display-4" style={{ color: '#1a4731', fontStyle: 'italic' }}>
                        {tutor.nombre.toUpperCase()}
                    </h1>
                    <p className="text-muted fs-4">{tutor.semestre} Semestre</p>
                </div>
                
                {/* Columna Derecha: Información y Botones */}
                <div className="col-md-6 ps-md-5">
                    <div className="d-grid gap-3">
                        <TutorDetailItem title="Materias que puede impartir">
                            {tutor.materias?.map(m => m.nombre_materia).join(', ') || 'No especificadas'}
                        </TutorDetailItem>

                        <TutorDetailItem title="Institucion a la que pertenece">
                            {tutor.institucion}
                        </TutorDetailItem>

                        <TutorDetailItem title="Carrera">
                            {tutor.carrera_nombre}
                        </TutorDetailItem>

                        <TutorDetailItem title="Logros alcanzados">
                            {tutor.logros || 'Mentor Certificado'}
                        </TutorDetailItem>

                        <TutorDetailItem title="Reputación">
                            {renderStars(tutor.reputacion)}
                        </TutorDetailItem>

                        {/* Botón Solicitar Tutoría - Envía a SolicitudTutoriaPage.js */}
                        <button 
                            className="btn btn-lg py-3 mt-3 shadow-sm" 
                            style={{ 
                                backgroundColor: '#2d572c', 
                                border: 'none', 
                                color: '#ffffff',
                                fontSize: '1.4rem',
                                fontWeight: 'bold'
                            }}
                            onClick={handleSolicitarTutoria}
                        >
                            Solicitar Tutoria
                        </button>
                        
                        <button 
                            className="btn btn-lg py-3" 
                            style={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #ced4da', 
                                color: '#6c757d',
                                fontSize: '1.2rem'
                            }}
                            onClick={() => navigate('/buscar-tutor')}
                        >
                            Regresar a buscar tutor
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TutorDetailItem = ({ title, children }) => (
    <div className="py-3 px-4 border text-center" style={{ borderColor: '#c3d7c3', color: '#4a7c59', borderRadius: '10px' }}>
        <span className="fs-5 fw-bold">{title}: </span>
        <span className="fs-5 fw-light">{children}</span>
    </div>
);

export default TutorProfilePage;