import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// URLs de tu backend
const PROFILE_URL = 'http://localhost:5000/api/users/profile';
const UPDATE_URL = 'http://localhost:5000/api/users/update-profile';
const DEFAULT_AVATAR = 'https://res.cloudinary.com/dfuk35w6v/image/upload/v1700000000/default-avatar.png';

const formatDate = (dateString) => {
    if (!dateString || dateString === "N/A") return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
};

const DashboardPage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Estados para la edición de perfil
    const [isEditing, setIsEditing] = useState(false);
    const [editSemestre, setEditSemestre] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [updating, setUpdating] = useState(false);

    const navigate = useNavigate();

    // Función para obtener datos del perfil
    const fetchData = async () => {
        const token = localStorage.getItem('userToken');
        if (!token) { 
            navigate('/login'); 
            return; 
        }

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

    useEffect(() => {
        fetchData();
    }, [navigate]);

    // Manejar cambio de archivo y previsualización
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar que sea imagen y no mayor a 2MB
            if (!file.type.startsWith('image/')) {
                alert("Por favor selecciona una imagen válida.");
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                alert("La imagen es muy pesada (máximo 2MB).");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Función para enviar los cambios al Backend
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdating(true);
        const token = localStorage.getItem('userToken');

        // FormData es obligatorio para enviar archivos
        const formData = new FormData();
        formData.append('semestre', editSemestre);
        if (selectedFile) {
            formData.append('foto', selectedFile); // 'foto' debe coincidir con el backend
        }

        try {
            const response = await fetch(UPDATE_URL, {
                method: 'PATCH',
                headers: { 
                    'Authorization': `Bearer ${token}` 
                    // 🛑 No agregar Content-Type: el navegador lo pone con el boundary correcto
                },
                body: formData
            });

            if (response.ok) {
                alert('¡Perfil actualizado con éxito!');
                setIsEditing(false);
                setSelectedFile(null);
                setPreviewUrl(null);
                fetchData(); // Recargamos datos de la DB
            } else {
                const errData = await response.json();
                alert(`Error: ${errData.message}`);
            }
        } catch (err) {
            console.error("Error al actualizar:", err);
            alert('Error de red al intentar actualizar el perfil.');
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="text-center">
                <div className="spinner-grow text-primary" role="status"></div>
                <p className="mt-2 fw-bold text-muted">Cargando tu perfil...</p>
            </div>
        </div>
    );

    if (error) return <div className="alert alert-danger m-5 text-center">{error}</div>;

    // Prioridad de imagen: Previsualización > Cloudinary DB > Default
    const avatarUrl = previewUrl || userData?.foto_perfil_url || DEFAULT_AVATAR;
    const isTutor = userData?.rol === 'Tutor';
    const materiasTutor = userData?.materias_a_enseñar || [];

    return (
        <div className="container-fluid py-5 bg-light" style={{ minHeight: '100vh' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        
                        {/* HEADER CARD */}
                        <div className="card border-0 shadow-sm overflow-hidden mb-4">
                            <div className="bg-primary" style={{ height: '140px', background: 'linear-gradient(45deg, #1e3c72 0%, #2a5298 100%)' }}></div>
                            <div className="card-body pt-0 px-4 pb-4">
                                <div className="d-flex align-items-end mb-3" style={{ marginTop: '-70px' }}>
                                    <div className="position-relative">
                                        <img 
                                            src={avatarUrl} 
                                            alt="Perfil" 
                                            className="rounded-circle border border-4 border-white shadow"
                                            style={{ width: '140px', height: '140px', objectFit: 'cover', backgroundColor: 'white' }}
                                        />
                                        {isEditing && (
                                            <label className="btn btn-dark btn-sm position-absolute bottom-0 end-0 rounded-circle shadow" style={{ cursor: 'pointer' }}>
                                                <i className="bi bi-camera-fill"></i>
                                                <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                                            </label>
                                        )}
                                    </div>
                                    <div className="ms-4 mb-2 flex-grow-1">
                                        <h2 className="fw-bold mb-0">{userData.nombre}</h2>
                                        <p className="text-muted mb-0">@{userData.username} • <span className="badge bg-light text-dark border">{userData.rol}</span></p>
                                    </div>
                                    <div className="mb-2 d-flex gap-2">
                                        {!isEditing ? (
                                            <button onClick={() => setIsEditing(true)} className="btn btn-primary rounded-pill px-4 shadow-sm">
                                                <i className="bi bi-pencil-square me-2"></i>Editar Perfil
                                            </button>
                                        ) : (
                                            <button onClick={() => { setIsEditing(false); setPreviewUrl(null); }} className="btn btn-secondary rounded-pill px-4">
                                                Cancelar
                                            </button>
                                        )}
                                        <button onClick={handleLogout} className="btn btn-outline-danger rounded-pill px-4">
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            {/* COLUMNA IZQUIERDA: INFO */}
                            <div className="col-md-5">
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-body">
                                        <h5 className="card-title fw-bold mb-4 text-primary">
                                            <i className="bi bi-info-circle me-2"></i>Información Académica
                                        </h5>
                                        
                                        {isEditing ? (
                                            <form onSubmit={handleUpdateProfile}>
                                                <div className="mb-4">
                                                    <label className="form-label small fw-bold text-muted">SEMESTRE ACTUAL</label>
                                                    <input 
                                                        type="number" 
                                                        className="form-control form-control-lg border-primary" 
                                                        value={editSemestre} 
                                                        onChange={(e) => setEditSemestre(e.target.value)}
                                                        min="1" max="15"
                                                        required
                                                    />
                                                </div>
                                                <button type="submit" className="btn btn-success w-100 py-2 rounded-pill shadow" disabled={updating}>
                                                    {updating ? (
                                                        <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</>
                                                    ) : 'Guardar Todos los Cambios'}
                                                </button>
                                            </form>
                                        ) : (
                                            <>
                                                <div className="mb-3">
                                                    <label className="small text-uppercase text-muted fw-bold d-block">Institución</label>
                                                    <span className="fw-semibold">{userData.institucion || 'No especificada'}</span>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="small text-uppercase text-muted fw-bold d-block">Carrera</label>
                                                    <span className="fw-semibold">{userData.nombre_carrera || 'General'}</span>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="small text-uppercase text-muted fw-bold d-block">Nivel / Semestre</label>
                                                    <span className="badge bg-primary px-3 py-2">{userData.semestre}° Semestre</span>
                                                </div>
                                                <hr />
                                                <div className="mb-1">
                                                    <label className="small text-uppercase text-muted fw-bold d-block">Fecha de Nacimiento</label>
                                                    <span className="text-muted small">{formatDate(userData.fecha_nacimiento)}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* COLUMNA DERECHA: MATERIAS O ACCIONES */}
                            <div className="col-md-7">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title fw-bold mb-4 text-primary">
                                            <i className={isTutor ? "bi bi-journal-check me-2" : "bi bi-search me-2"}></i>
                                            {isTutor ? 'Mis Especialidades de Tutoría' : '¿Qué quieres aprender?'}
                                        </h5>

                                        {isTutor ? (
                                            materiasTutor.length > 0 ? (
                                                <div className="d-flex flex-wrap gap-2">
                                                    {materiasTutor.map((m) => (
                                                        <span key={m.materia_id} className="badge bg-primary-subtle text-primary border border-primary-subtle p-2 px-3 rounded-pill">
                                                            <i className="bi bi-bookmark-star-fill me-1"></i>{m.nombre_materia}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 bg-light rounded">
                                                    <p className="text-muted mb-0 small">Aún no tienes materias asignadas.</p>
                                                </div>
                                            )
                                        ) : (
                                            <div className="text-center py-3">
                                                <p className="text-muted mb-4">Encuentra al mentor ideal para tus estudios.</p>
                                                <button onClick={() => navigate('/buscar-tutor')} className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow">
                                                    Explorar Catálogo de Tutores
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;