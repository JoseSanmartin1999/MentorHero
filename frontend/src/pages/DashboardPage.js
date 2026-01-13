import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const PROTECTED_URL = 'http://localhost:5000/api/users/profile';
const DEFAULT_AVATAR = 'https://res.cloudinary.com/dfuk35w6v/image/upload/v1700000000/default-avatar.png';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
};

const DashboardPage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProtectedData = async () => {
            const token = localStorage.getItem('userToken');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(PROTECTED_URL, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data.user);
                } else {
                    localStorage.removeItem('userToken');
                    navigate('/login');
                }
            } catch (err) {
                setError('Error de conexión con el servidor.');
            } finally {
                setLoading(false);
            }
        };
        fetchProtectedData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="text-center">
                <div className="spinner-grow text-primary" role="status"></div>
                <p className="mt-2 fw-bold text-muted">Preparando tu espacio...</p>
            </div>
        </div>
    );

    if (error) return <div className="alert alert-danger m-5 shadow-sm text-center">{error}</div>;

    const avatarUrl = userData?.foto_perfil_url || DEFAULT_AVATAR;
    const isTutor = userData?.rol === 'Tutor';
    const materiasTutor = userData?.materias_a_enseñar || [];

    return (
        <div className="container-fluid py-5 bg-light" style={{ minHeight: '100vh' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        {/* Header / Banner Profile */}
                        <div className="card border-0 shadow-sm overflow-hidden mb-4">
                            <div className="bg-primary" style={{ height: '150px', background: 'linear-gradient(45deg, #1e3c72 0%, #2a5298 100%)' }}></div>
                            <div className="card-body pt-0 px-4 pb-4">
                                <div className="d-flex align-items-end mb-3" style={{ marginTop: '-75px' }}>
                                    <div className="position-relative">
                                        <img 
                                            src={avatarUrl} 
                                            alt="Perfil" 
                                            className="rounded-circle border border-4 border-white shadow"
                                            style={{ width: '150px', height: '150px', objectFit: 'cover', backgroundColor: 'white' }}
                                        />
                                        <span className={`position-absolute bottom-0 end-0 p-2 border border-2 border-white rounded-circle shadow-sm ${isTutor ? 'bg-info' : 'bg-success'}`} title={userData.rol}></span>
                                    </div>
                                    <div className="ms-4 mb-2">
                                        <h2 className="fw-bold mb-0">{userData.nombre}</h2>
                                        <p className="text-muted mb-0">@{userData.username} • <span className="badge bg-light text-dark border">{userData.rol}</span></p>
                                    </div>
                                    <div className="ms-auto mb-2">
                                        <button onClick={handleLogout} className="btn btn-outline-danger btn-sm rounded-pill px-4">
                                            <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            {/* Left Column: Personal Info */}
                            <div className="col-md-5">
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-body">
                                        <h5 className="card-title fw-bold mb-4"><i className="bi bi-person-vcard me-2 text-primary"></i>Información Personal</h5>
                                        <div className="mb-3">
                                            <label className="small text-uppercase text-muted fw-bold">Institución</label>
                                            <p className="mb-0 fw-semibold">{userData.institucion || 'No especificada'}</p>
                                        </div>
                                        <div className="mb-3">
                                            <label className="small text-uppercase text-muted fw-bold">Semestre / Nivel</label>
                                            <p className="mb-0 fw-semibold">{userData.semestre}° Semestre</p>
                                        </div>
                                        <div className="mb-3">
                                            <label className="small text-uppercase text-muted fw-bold">Fecha de Nacimiento</label>
                                            <p className="mb-0 fw-semibold">{formatDate(userData.fecha_nacimiento)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Specialization / Actions */}
                            <div className="col-md-7">
                                {isTutor ? (
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body">
                                            <h5 className="card-title fw-bold mb-4">
                                                <i className="bi bi-book me-2 text-primary"></i>Especialidades de Tutoría
                                            </h5>
                                            {materiasTutor.length > 0 ? (
                                                <div className="d-flex flex-wrap gap-2">
                                                    {materiasTutor.map((materia) => (
                                                        <span key={materia.materia_id} className="badge bg-primary-subtle text-primary border border-primary-subtle p-2 px-3 rounded-pill">
                                                            <i className="bi bi-check2-circle me-1"></i>{materia.nombre_materia}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <i className="bi bi-exclamation-circle text-muted display-6"></i>
                                                    <p className="text-muted mt-2">No has registrado materias para enseñar aún.</p>
                                                    <button className="btn btn-primary btn-sm rounded-pill">Configurar materias</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="card border-0 shadow-sm bg-primary text-white">
                                        <div className="card-body p-4 text-center">
                                            <i className="bi bi-mortarboard display-4 mb-3"></i>
                                            <h5 className="fw-bold">¿Listo para aprender algo nuevo?</h5>
                                            <p className="small opacity-75">Explora los tutores disponibles y agenda tu primera sesión hoy mismo.</p>
                                            <button className="btn btn-light text-primary fw-bold rounded-pill px-4">Buscar Tutor</button>
                                        </div>
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