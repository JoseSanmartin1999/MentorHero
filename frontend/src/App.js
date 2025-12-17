import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importa los estilos de Bootstrap

// ===========================================
// 1. IMPORTACIONES DE COMPONENTES DE LAYOUT Y PÁGINAS
// ===========================================
import Navbar from './components/Navbar'; 
import Footer from './components/Footer'; 

// Páginas de Autenticación
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage'; 

// Páginas Protegidas
import DashboardPage from './pages/DashboardPage'; 
// ===========================================

function App() {
  return (
    // <Router> envuelve toda la aplicación para habilitar la navegación
    <Router>
      
      {/* Navbar: Visible en todas las rutas */}
      <Navbar /> 
      
      <main className="container-fluid py-4">
        {/* <Routes> define las reglas de mapeo de URL a Componentes */}
        <Routes>
          
          {/* ------------------------------------- */}
          {/* RUTAS PÚBLICAS Y DE AUTENTICACIÓN */}
          {/* ------------------------------------- */}
          
          {/* Ruta principal (Root: /) */}
          <Route 
            path="/" 
            element={
              <div className="text-center my-5">
                <h1>Bienvenido a MentorHero</h1>
                <p className="lead">Tu plataforma de mentoría entre pares.</p>
                
                <div className="mt-4">
                  <Link to="/register" className="btn btn-primary btn-lg">Registrarse ahora</Link>
                  <Link to="/login" className="btn btn-outline-secondary btn-lg ms-3">Iniciar Sesión</Link>
                </div>
              </div>
            } 
          />
          
          {/* Ruta de Registro */}
          <Route path="/register" element={<RegistrationPage />} />
          
          {/* Ruta de Login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* ------------------------------------- */}
          {/* RUTAS PROTEGIDAS (ACCESO RESTRINGIDO) */}
          {/* ------------------------------------- */}
          
          {/* Ruta del Dashboard: Solo visible con Token JWT válido */}
          <Route path="/dashboard" element={<DashboardPage />} /> 

          {/* ------------------------------------- */}
          {/* MANEJO DE ERRORES */}
          {/* ------------------------------------- */}
          
          {/* Manejo de 404 (Cualquier ruta no definida) */}
          <Route path="*" element={<h1 className="text-danger text-center">404: Página no encontrada</h1>} />
          
        </Routes>
      </main>

      {/* Footer: Visible en todas las rutas */}
      <Footer /> 
      
    </Router>
  );
}

export default App;