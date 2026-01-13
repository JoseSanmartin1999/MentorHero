// frontend/src/components/Navbar.js

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Añadimos useLocation
import { isAuthenticated, getUserInfo, logout } from '../utils/auth';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation(); // 💡 Detecta cambios de ruta para actualizar el Navbar
    const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
    const [user, setUser] = useState(getUserInfo());

    // Se ejecuta cada vez que cambias de página
    useEffect(() => {
        setIsLoggedIn(isAuthenticated());
        setUser(getUserInfo());
    }, [location]); 

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderPrimaryNavigation = () => {
        const isTutor = user && user.rol === 'Tutor';
        
        return (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                    <Link className="nav-link" to="/">Inicio</Link>
                </li>
                
                {isLoggedIn && (
                    <>
                        {/* 1. OPCIÓN PARA TODOS LOS LOGUEADOS: Buscar Tutores */}
                        <li className="nav-item">
                            <Link className="nav-link text-info fw-bold" to="/buscar-tutor">
                                🔍 Busca un Tutor
                            </Link>
                        </li>

                        {/* 2. OPCIÓN SOLO PARA TUTORES: Solicitudes Recibidas */}
                        {isTutor && (
                            <li className="nav-item">
                                <Link className="nav-link text-warning fw-bold" to="/tutorias">
                                    📬 Solicitudes de Tutoría
                                </Link>
                            </li>
                        )}
                        // En el Navbar.js, dentro de renderPrimaryNavigation:
                        {!isTutor && (
                            <li className="nav-item">
                                <Link className="nav-link text-info fw-bold" to="/mis-tutorias">
                                    📝 Mis Solicitudes
                                </Link>
                            </li>
                        )}
                    </>
                )}
            </ul>
        );
    };

    const renderAuthButtons = () => {
        if (isLoggedIn && user) {
            return (
                <div className="navbar-nav">
                    <li className="nav-item dropdown">
                        <button 
                            className="nav-link dropdown-toggle text-white border-0 bg-transparent" 
                            id="navbarDropdown" 
                            data-bs-toggle="dropdown" 
                            aria-expanded="false"
                        >
                            ¡Hola, {user.username}!
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                            <li><Link className="dropdown-item" to="/dashboard">Ver Perfil</Link></li>
                            <li><Link className="dropdown-item" to="/logros">Ver Logros</Link></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <button className="dropdown-item text-danger" onClick={handleLogout}>
                                    Cerrar Sesión
                                </button>
                            </li>
                        </ul>
                    </li>
                </div>
            );
        } else {
            return (
                <div className="navbar-nav">
                    <li className="nav-item">
                        <Link className="nav-link" to="/register">Registro</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link btn btn-outline-success ms-lg-2" to="/login">
                            Iniciar Sesión
                        </Link>
                    </li>
                </div>
            );
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
            <div className="container-fluid">
                <Link className="navbar-brand fw-bold" to="/">MentorHero</Link> 
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    {renderPrimaryNavigation()}
                    {renderAuthButtons()}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;