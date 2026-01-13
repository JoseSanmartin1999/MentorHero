import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// ===========================================
// 1. IMPORTACIONES DE COMPONENTES DE LAYOUT Y PÁGINAS
// ===========================================
import Navbar from './components/Navbar'; 
import Footer from './components/Footer'; 

// Páginas de Autenticación
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage'; 

// Páginas Protegidas y de Funcionalidad
import DashboardPage from './pages/DashboardPage'; 
import SearchTutorPage from './pages/SearchTutorPage'; 
import TutorProfilePage from './pages/TutorProfilePage'; 
import SolicitudTutoriaPage from './pages/SolicitudTutoriaPage'; 
import TutoriasPage from './pages/TutoriasPage'; 

// 🛑 NUEVA IMPORTACIÓN: Página para que el aprendiz vea sus solicitudes enviadas
import MisTutoriasAprendiz from './pages/MisTutoriasAprendiz'; 

// Componentes placeholder restantes
const LogrosPage = () => <h1 className="text-center my-5 text-warning">Página de Logros (En desarrollo)</h1>; 

// ===========================================

function App() {
  return (
    <Router>
      <Navbar /> 
      
      <main className="container py-4" style={{ minHeight: '80vh' }}>
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={
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
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* RUTAS PROTEGIDAS */}
          <Route path="/dashboard" element={<DashboardPage />} /> 
          <Route path="/profile/:id" element={<TutorProfilePage />} /> 
          <Route path="/solicitar-tutoria/:tutorId" element={<SolicitudTutoriaPage />} /> 
          <Route path="/buscar-tutor" element={<SearchTutorPage />} /> 

          {/* RUTA PARA EL TUTOR: Ver solicitudes recibidas (Bandeja de entrada) */}
          <Route path="/tutorias" element={<TutoriasPage />} /> 

          {/* 🛑 RUTA PARA EL APRENDIZ: Ver estado de sus solicitudes enviadas */}
          <Route path="/mis-tutorias" element={<MisTutoriasAprendiz />} />

          <Route path="/logros" element={<LogrosPage />} /> 

          <Route path="*" element={<h1 className="text-danger text-center">404: Página no encontrada</h1>} />
        </Routes>
      </main>

      <Footer /> 
    </Router>
  );
}

export default App;