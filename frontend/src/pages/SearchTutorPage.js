import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const TUTORS_API_URL = 'http://localhost:5000/api/users/tutors'; 
const DEFAULT_AVATAR = 'https://res.cloudinary.com/dfuk35w6v/image/upload/v1700000000/default-avatar.png'; 

const SearchTutorPage = () => {
    const [tutors, setTutors] = useState([]);
    const [filteredTutors, setFilteredTutors] = useState([]); // Estado para los tutores filtrados
    const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTutors = async () => {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('userToken');

            if (!token) {
                setError('Necesitas iniciar sesión para buscar tutores.');
                setLoading(false);
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(TUTORS_API_URL, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setTutors(data.tutors || []);
                    setFilteredTutors(data.tutors || []); // Inicialmente mostramos todos
                } else {
                    const errorData = await response.json();
                    if (response.status === 401) {
                        localStorage.removeItem('userToken');
                        navigate('/login');
                    }
                    setError(errorData.message || 'Error al cargar la lista de tutores.');
                }
            } catch (err) {
                console.error("Error en la petición:", err);
                setError('Error de conexión con el servidor.');
            } finally {
                setLoading(false);
            }
        };

        fetchTutors();
    }, [navigate]);

    // 🔍 Lógica de filtrado en tiempo real
    useEffect(() => {
        const results = tutors.filter(tutor => {
            const val = searchTerm.toLowerCase();
            
            // Criterio 1: Nombre
            const matchesName = tutor.nombre.toLowerCase().includes(val);
            
            // Criterio 2: Materias (buscamos en el array de materias del tutor)
            const matchesSubject = tutor.materias?.some(m => 
                m.nombre_materia.toLowerCase().includes(val)
            );

            return matchesName || matchesSubject;
        });

        setFilteredTutors(results);
    }, [searchTerm, tutors]);

    const renderStars = (rating) => {
        const numericRating = parseFloat(rating) || 0;
        return (
            <div className="mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <i
                        key={star}
                        className={`bi bi-star-fill ${star <= Math.round(numericRating) ? 'text-warning' : 'text-muted opacity-25'}`}
                        style={{ fontSize: '0.9rem', marginRight: '2px' }}
                    ></i>
                ))}
                <span className="ms-1 small text-muted">({numericRating.toFixed(1)})</span>
            </div>
        );
    };

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
            <div className="spinner-border text-success" style={{ width: '3rem', height: '3rem' }} role="status"></div>
            <p className="mt-3 fw-bold text-success">Buscando mentores disponibles...</p>
        </div>
    );

    return (
        <div className="container my-5">
            <header className="text-center mb-5">
                <h1 className="display-4 fw-bold" style={{ color: '#1a4731' }}>
                    📚 Encuentra a tu Mentor
                </h1>
                <p className="lead text-muted">Aprende de los mejores estudiantes de la comunidad</p>
                
                {/* 🔎 BARRA DE BÚSQUEDA */}
                <div className="row justify-content-center mt-4">
                    <div className="col-md-8 col-lg-6">
                        <div className="input-group input-group-lg shadow-sm">
                            <span className="input-group-text bg-white border-end-0">
                                <i className="bi bi-search text-success"></i>
                            </span>
                            <input 
                                type="text" 
                                className="form-control border-start-0" 
                                placeholder="Busca por nombre o materia (ej: Cálculo, Java...)" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button 
                                    className="btn btn-outline-secondary bg-white border-start-0" 
                                    onClick={() => setSearchTerm('')}
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            )}
                        </div>
                        <div className="mt-2 small text-muted text-start ps-2">
                            Se muestran {filteredTutors.length} de {tutors.length} tutores
                        </div>
                    </div>
                </div>
            </header>

            {filteredTutors.length === 0 ? (
                <div className="alert alert-light border text-center p-5 shadow-sm">
                    <i className="bi bi-search fs-1 text-muted opacity-50 mb-3 d-block"></i>
                    <h4>No encontramos resultados para "{searchTerm}"</h4>
                    <p className="mb-0 text-muted">Intenta buscar con otra palabra clave o materia.</p>
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {filteredTutors.map(tutor => (
                        <div className="col" key={tutor.id}>
                            <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden card-hover">
                                <div className="card-body text-center p-4">
                                    <div className="position-relative mb-4">
                                        <img 
                                            src={tutor.foto_perfil_url || DEFAULT_AVATAR} 
                                            alt={tutor.nombre} 
                                            className="rounded-circle shadow-sm border border-4 border-white"
                                            style={{ width: '130px', height: '130px', objectFit: 'cover' }}
                                        />
                                    </div>
                                    
                                    <h5 className="card-title mb-1 fw-bold text-dark">{tutor.nombre}</h5>
                                    <p className="text-muted small mb-1">@{tutor.username}</p>
                                    
                                    {renderStars(tutor.promedio_reputacion)}

                                    <div className="d-flex justify-content-center gap-2 mb-3">
                                        <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                                            {tutor.nombre_carrera}
                                        </span>
                                        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                                            {tutor.semestre}° Semestre
                                        </span>
                                    </div>
                                    
                                    <h6 className="text-uppercase small fw-bold text-muted mb-2 ls-1">Especialidades</h6>
                                    <div className="mb-4 d-flex flex-wrap justify-content-center gap-1" style={{ minHeight: '50px' }}>
                                        {tutor.materias && tutor.materias.length > 0 ? (
                                            tutor.materias.map((materia, i) => (
                                                <span key={i} className={`badge border px-2 py-1 small fw-normal ${
                                                    searchTerm && materia.nombre_materia.toLowerCase().includes(searchTerm.toLowerCase())
                                                    ? "bg-success text-white border-success shadow-sm" // Resaltar materia si coincide con búsqueda
                                                    : "bg-white text-dark"
                                                }`}>
                                                    {materia.nombre_materia}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-muted small fst-italic">Ver materias en perfil</span>
                                        )}
                                    </div>

                                    <div className="d-grid">
                                        <Link 
                                            to={`/profile/${tutor.id}`} 
                                            className="btn btn-success py-2 fw-bold rounded-pill shadow-sm"
                                            style={{ backgroundColor: '#1a4731', border: 'none' }}
                                        >
                                            Ver Perfil Completo
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .card-hover:hover { transform: translateY(-10px); box-shadow: 0 1rem 3rem rgba(0,0,0,.175)!important; }
                .ls-1 { letter-spacing: 1px; }
                .input-group:focus-within { border-color: #1a4731; outline: 0; box-shadow: 0 0 0 0.25rem rgba(26, 71, 49, 0.25); }
            `}</style>
        </div>
    );
};

export default SearchTutorPage;