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
            const response = await fetch(`http://localhost:5000/api/users/profile/${tutorId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setTutor(data.tutor);
        };
        fetchTutor();
    }, [tutorId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('userToken');

        try {
            const response = await fetch('http://localhost:5000/api/solicitudes/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...formData, tutor_id: tutorId })
            });

            const data = await response.json();
            if (response.ok) {
                setMensaje({ type: 'success', text: data.message });
                setTimeout(() => navigate('/buscar-tutor'), 3000);
            } else {
                setMensaje({ type: 'danger', text: data.message });
            }
        } catch (err) {
            setMensaje({ type: 'danger', text: 'Error de conexión.' });
        }
    };

    if (!tutor) return <div className="text-center mt-5">Cargando materias del tutor...</div>;

    return (
        <div className="container mt-5" style={{ maxWidth: '600px' }}>
            <div className="card shadow p-4 border-0">
                <h2 className="text-center mb-4" style={{ color: '#1a4731' }}>Solicitar Tutoría</h2>
                
                {mensaje.text && <div className={`alert alert-${mensaje.type} text-center`}>{mensaje.text}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Materia</label>
                        <select className="form-select" required 
                            onChange={(e) => setFormData({...formData, materia_id: e.target.value})}>
                            <option value="">Selecciona una materia...</option>
                            {tutor.materias?.map(m => (
                                <option key={m.materia_id} value={m.materia_id}>{m.nombre_materia}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">Temas a tratar</label>
                        <textarea className="form-control" rows="3" placeholder="Un tema por línea" required
                            onChange={(e) => setFormData({...formData, temas: e.target.value})}></textarea>
                    </div>

                    <div className="row mb-3">
                        <div className="col">
                            <label className="form-label fw-bold">Fecha</label>
                            <input type="date" className="form-control" required 
                                onChange={(e) => setFormData({...formData, fecha: e.target.value})} />
                        </div>
                        <div className="col">
                            <label className="form-label fw-bold">Hora</label>
                            <input type="time" className="form-control" required 
                                onChange={(e) => setFormData({...formData, hora: e.target.value})} />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-bold">Duración (Minutos)</label>
                        <input type="number" className="form-control" min="60" max="120" step="15" 
                            value={formData.tiempo} onChange={(e) => setFormData({...formData, tiempo: e.target.value})} />
                        <small className="text-muted">Mínimo 60 min, Máximo 120 min.</small>
                    </div>

                    <button type="submit" className="btn btn-success w-100 py-2" style={{ backgroundColor: '#2d572c' }}>
                        Enviar Solicitud
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SolicitudTutoriaPage;