import React, { useState, useEffect } from 'react';

const TutoriasPage = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [seleccionada, setSeleccionada] = useState(null);
    const [mensajeRespuesta, setMensajeRespuesta] = useState('');
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('userToken');
    const tutorName = JSON.parse(localStorage.getItem('userInfo'))?.nombre || 'Tutor';

    useEffect(() => {
        const fetchSolicitudes = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/solicitudes/tutor', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setSolicitudes(data);
                    if (data.length > 0) setSeleccionada(data[0]);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchSolicitudes();
    }, [token]);

    const handleAction = async (nuevoEstado) => {
        try {
            const response = await fetch(`http://localhost:5000/api/solicitudes/actualizar/${seleccionada.solicitud_id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: nuevoEstado, mensaje_tutor: mensajeRespuesta })
            });
            if (response.ok) {
                setSolicitudes(solicitudes.map(s => s.solicitud_id === seleccionada.solicitud_id ? { ...s, status: nuevoEstado, mensaje_tutor: mensajeRespuesta } : s));
                setSeleccionada({ ...seleccionada, status: nuevoEstado, mensaje_tutor: mensajeRespuesta });
                if (nuevoEstado === 'aceptada') alert("¡Tutoría aceptada y mensaje enviado!");
            }
        } catch (error) { alert("Error en la operación"); }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-success"></div></div>;

    return (
        <div className="container-fluid my-4">
            <div className="row">
                {/* BANDEJA DE ENTRADA (Izquierda) */}
                <div className="col-md-4 border-end" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                    <h4 className="p-3 bg-dark text-white rounded-top mb-0">Bandeja de Entrada</h4>
                    <div className="list-group list-group-flush shadow-sm">
                        {solicitudes.map((s) => (
                            <button key={s.solicitud_id} onClick={() => { setSeleccionada(s); setMensajeRespuesta(s.mensaje_tutor || ''); }}
                                className={`list-group-item list-group-item-action ${seleccionada?.solicitud_id === s.solicitud_id ? 'active' : ''}`}>
                                <div className="d-flex w-100 justify-content-between">
                                    <h6 className="mb-1">{s.nombre_aprendiz}</h6>
                                    <small>{s.status}</small>
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
                                <p className="bg-white p-3 border-start border-4 border-success">
                                    <strong>Temas:</strong> {seleccionada.temas}
                                </p>
                                <div className="row bg-light p-3 rounded mb-4">
                                    <div className="col-md-6">
                                        <strong>📅 Fecha:</strong> {new Date(seleccionada.fecha_tutoria).toLocaleDateString()}
                                    </div>
                                    <div className="col-md-6 text-end">
                                        <strong>⏰ Hora:</strong> {seleccionada.hora_tutoria}
                                    </div>
                                    <div className="col-12 mt-2">
                                        <strong>⏳ Tiempo Solicitado:</strong> {seleccionada.tiempo_requerido} minutos
                                    </div>
                                </div>

                                {/* Campo de respuesta del tutor */}
                                {seleccionada.status === 'pendiente' && (
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">Escribe un mensaje de respuesta (opcional):</label>
                                        <textarea className="form-control border-success" rows="2" 
                                            placeholder="Ej: Hola, con gusto te ayudo. Nos vemos por Zoom."
                                            value={mensajeRespuesta} onChange={(e) => setMensajeRespuesta(e.target.value)}
                                        ></textarea>
                                    </div>
                                )}

                                <div className="d-flex justify-content-center gap-3">
                                    {seleccionada.status === 'pendiente' ? (
                                        <>
                                            <button className="btn btn-success btn-lg shadow" onClick={() => handleAction('aceptada')}>Aceptar</button>
                                            <button className="btn btn-danger btn-lg shadow" onClick={() => handleAction('rechazada')}>Rechazar</button>
                                        </>
                                    ) : (
                                        <div className="btn-group shadow w-100">
                                            <button className="btn btn-dark" onClick={() => handleAction('finalizada')}>Finalizar</button>
                                            <button className="btn btn-warning" onClick={() => handleAction('aceptada')}>Re-Agendar</button>
                                            <button className="btn btn-danger" onClick={() => handleAction('cancelada')}>Cancelar</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-5">Selecciona una solicitud para leer la carta.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TutoriasPage;