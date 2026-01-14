import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const SolicitudTutoriaPage = () => {
    const { tutorId } = useParams();
    const navigate = useNavigate();
    const [tutor, setTutor] = useState(null);
    const [mensaje, setMensaje] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        materia_id: '',
        temas: '',
        fecha: '',
        hora: '',
        tiempo: 60
    });

    useEffect(() => {
        const fetchTutor = async () => {
            const token = localStorage.getItem('userToken');
            try {
                const response = await fetch(`http://localhost:5000/api/users/profile/${tutorId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setTutor(data.tutor);
                } else {
                    setMensaje({ type: 'danger', text: 'No se pudo cargar la información del tutor.' });
                }
            } catch (err) {
                setMensaje({ type: 'danger', text: 'Error de conexión al cargar tutor.' });
            }
        };
        fetchTutor();
    }, [tutorId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.materia_id || formData.materia_id === "") {
            setMensaje({ type: 'danger', text: 'Por favor, selecciona una materia.' });
            return;
        }

        const token = localStorage.getItem('userToken');

        try {
            const response = await fetch('http://localhost:5000/api/solicitudes/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    ...formData, 
                    tutor_id: tutorId 
                })
            });

            const data = await response.json();
            if (response.ok) {
                setMensaje({ type: 'success', text: '¡Solicitud enviada con éxito! Redirigiendo...' });
                
                // --- CAMBIO AQUÍ ---
                // Se cambia la redirección para regresar a la página de búsqueda de tutores
                setTimeout(() => navigate('/buscar-tutor'), 2000); 
                // -------------------
                
            } else {
                setMensaje({ type: 'danger', text: data.message || 'Error al enviar la solicitud.' });
            }
        } catch (err) {
            setMensaje({ type: 'danger', text: 'Error de conexión con el servidor.' });
        }
    };

    if (!tutor && !mensaje.text) return (
        <div className="text-center mt-5">
            <div className="spinner-border text-success" role="status"></div>
            <p className="mt-2">Cargando datos del tutor...</p>
        </div>
    );

    return (
        <div className="container mt-5" style={{ maxWidth: '600px' }}>
            <div className="card shadow-lg p-4 border-0 rounded-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0" style={{ color: '#1a4731', fontWeight: 'bold' }}>Solicitar Tutoría</h2>
                    {/* El botón Volver también regresa a la página anterior */}
                    <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => navigate('/buscar-tutor')}>
                        Volver
                    </button>
                </div>
                
                <p className="text-muted">Tutor seleccionado: <strong>{tutor?.nombre}</strong></p>
                <hr />

                {mensaje.text && (
                    <div className={`alert alert-${mensaje.type} alert-dismissible fade show text-center`} role="alert">
                        {mensaje.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Materia de interés</label>
                        <select 
                            className="form-select border-2" 
                            required 
                            value={formData.materia_id}
                            onChange={(e) => setFormData({...formData, materia_id: e.target.value})}
                        >
                            <option value="">Selecciona una materia...</option>
                            {tutor?.materias?.map((m, index) => (
                                <option 
                                    key={m.materia_id ? `materia-${m.materia_id}` : `m-idx-${index}`} 
                                    value={m.materia_id}
                                >
                                    {m.nombre_materia}
                                </option>
                            ))}
                        </select>
                        {(!tutor?.materias || tutor.materias.length === 0) && (
                            <small className="text-danger">Este tutor no tiene materias asignadas todavía.</small>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">¿Qué temas necesitas reforzar?</label>
                        <textarea 
                            className="form-control border-2" 
                            rows="3" 
                            placeholder="Ej: Derivadas, Programación orientada a objetos, etc." 
                            required
                            value={formData.temas}
                            onChange={(e) => setFormData({...formData, temas: e.target.value})}
                        ></textarea>
                    </div>

                    <div className="row mb-3">
                        <div className="col">
                            <label className="form-label fw-bold">Fecha</label>
                            <input 
                                type="date" 
                                className="form-control border-2" 
                                required 
                                min={new Date().toISOString().split("T")[0]}
                                value={formData.fecha}
                                onChange={(e) => setFormData({...formData, fecha: e.target.value})} 
                            />
                        </div>
                        <div className="col">
                            <label className="form-label fw-bold">Hora</label>
                            <input 
                                type="time" 
                                className="form-control border-2" 
                                required 
                                value={formData.hora}
                                onChange={(e) => setFormData({...formData, hora: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-bold">Duración estimada: <span className="text-success">{formData.tiempo} min.</span></label>
                        <input 
                            type="range" 
                            className="form-range" 
                            min="60" 
                            max="120" 
                            step="15" 
                            value={formData.tiempo} 
                            onChange={(e) => setFormData({...formData, tiempo: e.target.value})} 
                        />
                        <div className="d-flex justify-content-between small text-muted px-1">
                            <span>1h</span>
                            <span>1.5h</span>
                            <span>2h</span>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-success w-100 py-3 rounded-pill fw-bold shadow-sm" style={{ backgroundColor: '#1a4731' }}>
                        Enviar Solicitud
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SolicitudTutoriaPage;