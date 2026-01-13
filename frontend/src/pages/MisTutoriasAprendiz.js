import React, { useState, useEffect } from 'react';

const MisTutoriasAprendiz = () => {
    const [misSolicitudes, setMisSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMisSolicitudes = async () => {
            const token = localStorage.getItem('userToken');
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
        fetchMisSolicitudes();
    }, []);

    const getStatusBadge = (status) => {
        const styles = {
            pendiente: 'bg-warning text-dark',
            aceptada: 'bg-success',
            rechazada: 'bg-danger',
            finalizada: 'bg-info',
            cancelada: 'bg-secondary'
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
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h4 className="card-title mb-0 text-primary">{s.nombre_materia}</h4>
                                        {getStatusBadge(s.status)}
                                    </div>
                                    <div className="row">
                                        <div className="col-md-8">
                                            <p className="mb-1"><strong>Tutor:</strong> {s.nombre_tutor}</p>
                                            <p className="mb-1"><strong>Temas:</strong> {s.temas}</p>
                                            <p className="mb-1"><strong>Fecha:</strong> {new Date(s.fecha_tutoria).toLocaleDateString()} a las {s.hora_tutoria}</p>
                                            <p className="mb-1"><strong>Duración:</strong> {s.tiempo_requerido} minutos</p>
                                        </div>
                                        <div className="col-md-4 border-start">
                                            <h6 className="text-muted fw-bold">Respuesta del Tutor:</h6>
                                            <div className="p-3 bg-light rounded italic" style={{ minHeight: '80px' }}>
                                                {s.mensaje_tutor ? (
                                                    <span className="text-dark">"{s.mensaje_tutor}"</span>
                                                ) : (
                                                    <span className="text-muted small italic">Esperando respuesta...</span>
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
        </div>
    );
};

export default MisTutoriasAprendiz;