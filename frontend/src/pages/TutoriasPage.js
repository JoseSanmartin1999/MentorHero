import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const TutoriasPage = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [seleccionada, setSeleccionada] = useState(null);
    const [mensajeRespuesta, setMensajeRespuesta] = useState('');
    const [loading, setLoading] = useState(true);

    // --- ESTADOS PARA CALIFICACIÓN Y MODAL ---
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingData, setRatingData] = useState({ 
        estrellas: 5, 
        resultado: 'Con éxito',
        comentario: '' // Nuevo campo añadido
    });
    const [isUpdating, setIsUpdating] = useState(false);

    const token = localStorage.getItem('userToken');
    const tutorName = JSON.parse(localStorage.getItem('userInfo'))?.nombre || 'Tutor';

    const fetchSolicitudes = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/solicitudes/tutor', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setSolicitudes(data);
                if (data.length > 0) setSeleccionada(data[0]);
                else setSeleccionada(null);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchSolicitudes(); }, [token]);

    const handleAction = async (nuevoEstado) => {
        if (nuevoEstado === 'finalizada') {
            setShowRatingModal(true);
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/solicitudes/${seleccionada.solicitud_id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: nuevoEstado, mensaje_tutor: mensajeRespuesta })
            });
            if (response.ok) {
                alert(`Solicitud ${nuevoEstado}`);
                fetchSolicitudes();
            }
        } catch (error) { alert("Error en la operación"); }
    };

    const handleFinalizarCompleto = async () => {
        setIsUpdating(true);
        try {
            const response = await fetch('http://localhost:5000/api/solicitudes/finalizar', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    solicitud_id: seleccionada.solicitud_id,
                    alumno_id: seleccionada.aprendiz_id,
                    estrellas: ratingData.estrellas,
                    resultado: ratingData.resultado,
                    comentario: ratingData.comentario // Enviamos el comentario al backend
                })
            });

            if (response.ok) {
                alert("Tutoría finalizada y alumno calificado.");
                setShowRatingModal(false);
                fetchSolicitudes();
            } else {
                alert("Error al finalizar.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-success"></div></div>;

    return (
        <div className="container-fluid my-4">
            <div className="row">
                {/* BANDEJA DE ENTRADA (Izquierda) */}
                <div className="col-md-4 border-end" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                    <h4 className="p-3 bg-dark text-white rounded-top mb-0 fw-bold">Bandeja de Entrada</h4>
                    <div className="list-group list-group-flush shadow-sm">
                        {solicitudes.length === 0 && <p className="p-3 text-muted">No tienes solicitudes pendientes.</p>}
                        {solicitudes.map((s) => (
                            <button key={s.solicitud_id} 
                                onClick={() => { setSeleccionada(s); setMensajeRespuesta(s.mensaje_tutor || ''); }}
                                className={`list-group-item list-group-item-action ${seleccionada?.solicitud_id === s.solicitud_id ? 'active' : ''}`}>
                                <div className="d-flex w-100 justify-content-between">
                                    <h6 className="mb-1 fw-bold">{s.nombre_aprendiz}</h6>
                                    <span className="badge bg-info text-dark" style={{fontSize: '0.7rem'}}>{s.status}</span>
                                </div>
                                <small className="d-block text-truncate">{s.nombre_materia}</small>
                            </button>
                        ))}
                    </div>
                </div>

                {/* VISTA DE CARTA (Derecha) */}
                <div className="col-md-8 p-4">
                    {seleccionada ? (
                        <div className="card shadow border-0 p-4" style={{ borderRadius: '15px', background: '#fff9f0' }}>
                            <div className="card-body">
                                <h2 className="text-center mb-4" style={{ color: '#1a4731', fontFamily: 'serif' }}>Solicitud de Tutoría</h2>
                                <p className="fs-5">Hola Estimado <strong>{tutorName}</strong>,</p>
                                <p className="fs-5">
                                    Mi nombre es <strong>{seleccionada.nombre_aprendiz}</strong> y solicito su apoyo en 
                                    <span className="text-success fw-bold"> {seleccionada.nombre_materia}</span>.
                                </p>
                                <p className="bg-white p-3 border-start border-4 border-success rounded">
                                    <strong>Temas:</strong> {seleccionada.temas}
                                </p>
                                <div className="row bg-light p-3 rounded mb-4 shadow-sm">
                                    <div className="col-md-6">
                                        <strong>📅 Fecha:</strong> {new Date(seleccionada.fecha_tutoria).toLocaleDateString()}
                                    </div>
                                    <div className="col-md-6 text-end">
                                        <strong>⏰ Hora:</strong> {seleccionada.hora_tutoria}
                                    </div>
                                </div>

                                <div className="d-flex justify-content-center gap-3 mt-4">
                                    {seleccionada.status === 'pendiente' ? (
                                        <>
                                            <button className="btn btn-success btn-lg px-4 shadow-sm" onClick={() => handleAction('aceptada')}>Aceptar</button>
                                            <button className="btn btn-danger btn-lg px-4 shadow-sm" onClick={() => handleAction('rechazada')}>Rechazar</button>
                                        </>
                                    ) : (
                                        <div className="btn-group shadow w-100">
                                            <button className="btn btn-dark py-3" onClick={() => handleAction('finalizada')}>Finalizar</button>
                                            <button className="btn btn-warning py-3" onClick={() => handleAction('aceptada')}>Re-Agendar</button>
                                            <button className="btn btn-danger py-3" onClick={() => handleAction('cancelada')}>Cancelar</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-5 text-muted">Selecciona una solicitud para leer la carta.</div>
                    )}
                </div>
            </div>

            {/* --- MODAL DE CALIFICACIÓN MEJORADO --- */}
            {showRatingModal && (
                <div className="modal d-block shadow" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4">
                            <div className="modal-header bg-dark text-white rounded-top-4 border-0">
                                <h5 className="modal-title fw-bold">Finalizar Tutoría</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRatingModal(false)}></button>
                            </div>
                            <div className="modal-body p-4 text-center">
                                <p className="text-muted mb-4">¿Cómo calificarías el desempeño de <br/><b>{seleccionada?.nombre_aprendiz}</b>?</p>
                                
                                {/* 1. Estrellas Interactivas */}
                                <div className="mb-4 py-2 bg-light rounded-3">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <i key={num} 
                                           className={`bi bi-star${ratingData.estrellas >= num ? '-fill' : ''} fs-1 mx-1 text-warning`}
                                           style={{ cursor: 'pointer' }}
                                           onClick={() => setRatingData({...ratingData, estrellas: num})}></i>
                                    ))}
                                    <div className="fw-bold text-primary mt-2">{ratingData.estrellas} Estrellas</div>
                                </div>

                                {/* 2. Selector de Resultado */}
                                <div className="mb-3 text-start">
                                    <label className="form-label fw-bold small text-muted text-uppercase">Resultado de la sesión</label>
                                    <select 
                                        className="form-select border-2"
                                        value={ratingData.resultado}
                                        onChange={(e) => setRatingData({...ratingData, resultado: e.target.value})}
                                    >
                                        <option value="Con éxito">Con éxito ✅</option>
                                        <option value="Con fallas">Con fallas ⚠️</option>
                                        <option value="Fue cancelada">Fue cancelada ❌</option>
                                    </select>
                                </div>

                                {/* 3. Área de Comentarios */}
                                <div className="mb-4 text-start">
                                    <label className="form-label fw-bold small text-muted text-uppercase">Retroalimentación (opcional)</label>
                                    <textarea 
                                        className="form-control border-2" 
                                        rows="3"
                                        placeholder="Escribe algo sobre el alumno..."
                                        value={ratingData.comentario}
                                        onChange={(e) => setRatingData({...ratingData, comentario: e.target.value})}
                                    ></textarea>
                                </div>

                                <div className="d-grid gap-2">
                                    <button 
                                        className="btn btn-success btn-lg rounded-pill fw-bold py-3 shadow" 
                                        onClick={handleFinalizarCompleto}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? <span className="spinner-border spinner-border-sm"></span> : 'Confirmar y Finalizar'}
                                    </button>
                                    <button className="btn btn-link text-muted text-decoration-none" onClick={() => setShowRatingModal(false)}>Volver</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TutoriasPage;