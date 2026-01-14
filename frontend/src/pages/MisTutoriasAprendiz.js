import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const MisTutoriasAprendiz = () => {
    const [misSolicitudes, setMisSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- NUEVOS ESTADOS PARA CALIFICAR AL TUTOR ---
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [tutorACalificar, setTutorACalificar] = useState(null);
    const [ratingData, setRatingData] = useState({ estrellas: 5, comentario: '' });
    const [isUpdating, setIsUpdating] = useState(false);

    const token = localStorage.getItem('userToken');

    const fetchMisSolicitudes = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/solicitudes/aprendiz', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setMisSolicitudes(data);
            }
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchMisSolicitudes();
    }, []);

    // --- FUNCIÓN PARA ENVIAR CALIFICACIÓN AL BACKEND ---
    const handleEnviarCalificacion = async () => {
        setIsUpdating(true);
        try {
            const response = await fetch('http://localhost:5000/api/solicitudes/calificar-tutor', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    solicitud_id: tutorACalificar.solicitud_id,
                    tutor_id: tutorACalificar.tutor_id,
                    estrellas: ratingData.estrellas,
                    comentario: ratingData.comentario
                })
            });

            if (response.ok) {
                alert("¡Gracias por calificar a tu tutor!");
                setShowRatingModal(false);
                setRatingData({ estrellas: 5, comentario: '' });
                fetchMisSolicitudes(); // Recargar para actualizar UI
            }
        } catch (error) {
            alert("Error al enviar la calificación");
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pendiente: 'bg-warning text-dark',
            aceptada: 'bg-success text-white',
            rechazada: 'bg-danger text-white',
            finalizada: 'bg-info text-dark',
            cancelada: 'bg-secondary text-white'
        };
        return <span className={`badge ${styles[status] || 'bg-dark'}`}>{status.toUpperCase()}</span>;
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-info"></div></div>;

    return (
        <div className="container my-5">
            <h2 className="mb-4 fw-bold" style={{ color: '#1a4731' }}>Mis Solicitudes de Tutoría</h2>
            <div className="row">
                {misSolicitudes.length === 0 ? (
                    <div className="alert alert-light border text-center p-5 shadow-sm">
                        <h4>Aún no has solicitado tutorías.</h4>
                        <p>Busca un tutor para comenzar a aprender.</p>
                    </div>
                ) : (
                    misSolicitudes.map((s) => (
                        <div key={s.solicitud_id} className="col-12 mb-4">
                            <div className="card shadow-sm border-0" style={{ borderLeft: '6px solid #1a4731' }}>
                                <div className="card-body p-4">
                                    {/* NOTIFICACIÓN DE CALIFICACIÓN PENDIENTE */}
                                    {s.status === 'finalizada' && !s.calificada_por_aprendiz && (
                                        <div className="alert alert-warning border-0 shadow-sm d-flex justify-content-between align-items-center mb-4 animate__animated animate__fadeIn">
                                            <div>
                                                <i className="bi bi- megaphone-fill me-2"></i>
                                                <strong>Tutoría completada:</strong> Por favor califica a tu Tutor para ayudar a la comunidad.
                                            </div>
                                            <button 
                                                className="btn btn-dark btn-sm rounded-pill px-4 fw-bold"
                                                onClick={() => {
                                                    setTutorACalificar(s);
                                                    setShowRatingModal(true);
                                                }}
                                            >
                                                Calificar ahora
                                            </button>
                                        </div>
                                    )}

                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h4 className="card-title mb-0 text-primary fw-bold">{s.nombre_materia}</h4>
                                        {getStatusBadge(s.status)}
                                    </div>

                                    <div className="row">
                                        <div className="col-md-8">
                                            <p className="mb-1"><strong>Tutor:</strong> {s.nombre_tutor}</p>
                                            <p className="mb-1"><strong>Temas:</strong> {s.temas}</p>
                                            <p className="mb-1"><strong>Fecha:</strong> {new Date(s.fecha_tutoria).toLocaleDateString()} a las {s.hora_tutoria}</p>
                                            <p className="mb-1"><strong>Duración:</strong> {s.tiempo_requerido} minutos</p>
                                        </div>
                                        <div className="col-md-4 border-start px-4">
                                            <h6 className="text-muted fw-bold small text-uppercase">Respuesta del Tutor:</h6>
                                            <div className="p-3 bg-light rounded italic shadow-inner" style={{ minHeight: '80px' }}>
                                                {s.mensaje_tutor ? (
                                                    <span className="text-dark">"{s.mensaje_tutor}"</span>
                                                ) : (
                                                    <span className="text-muted small italic">Esperando respuesta del tutor...</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* --- MODAL DE CALIFICACIÓN PARA EL TUTOR --- */}
            {showRatingModal && (
                <div className="modal d-block shadow" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4">
                            <div className="modal-header bg-primary text-white rounded-top-4 border-0">
                                <h5 className="modal-title fw-bold">Calificar a tu Tutor</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRatingModal(false)}></button>
                            </div>
                            <div className="modal-body p-4 text-center">
                                <p className="text-muted mb-4">¿Qué tal fue tu experiencia de aprendizaje con <br/><b>{tutorACalificar?.nombre_tutor}</b>?</p>
                                
                                {/* Estrellas Interactivas */}
                                <div className="mb-4 py-3 bg-light rounded-3">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <i key={num} 
                                           className={`bi bi-star${ratingData.estrellas >= num ? '-fill' : ''} fs-1 mx-1 text-warning`}
                                           style={{ cursor: 'pointer' }}
                                           onClick={() => setRatingData({...ratingData, estrellas: num})}></i>
                                    ))}
                                    <div className="fw-bold text-primary mt-2">{ratingData.estrellas} Estrellas</div>
                                </div>

                                {/* Área de Comentarios */}
                                <div className="mb-4 text-start">
                                    <label className="form-label fw-bold small text-muted text-uppercase">¿Deseas dejar un comentario?</label>
                                    <textarea 
                                        className="form-control border-2" 
                                        rows="3"
                                        placeholder="Tu feedback ayuda a otros estudiantes..."
                                        value={ratingData.comentario}
                                        onChange={(e) => setRatingData({...ratingData, comentario: e.target.value})}
                                    ></textarea>
                                </div>

                                <div className="d-grid gap-2">
                                    <button 
                                        className="btn btn-primary btn-lg rounded-pill fw-bold py-3 shadow" 
                                        onClick={handleEnviarCalificacion}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? <span className="spinner-border spinner-border-sm"></span> : 'Enviar Calificación'}
                                    </button>
                                    <button className="btn btn-link text-muted text-decoration-none" onClick={() => setShowRatingModal(false)}>Omitir por ahora</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MisTutoriasAprendiz;