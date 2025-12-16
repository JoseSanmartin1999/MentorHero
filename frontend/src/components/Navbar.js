import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
            <Link className="navbar-brand" to="/">MentorHero</Link>
            <div className="collapse navbar-collapse">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                        <Link className="nav-link" to="/register">Registro</Link>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
);
export default Navbar;