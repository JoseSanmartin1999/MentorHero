import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importa los estilos de Bootstrap

// 1. Importar los componentes principales de Layout
import Navbar from './components/Navbar'; 
import Footer from './components/Footer'; 

// 2. Importar la página de Registro
import RegistrationPage from './pages/RegistrationPage';

// 3. SE ELIMINÓ: import ConnectionTest from './components/ConnectionTest';

function App() {
  return (
    <Router>
      {/* 4. Navbar siempre visible */}
      <Navbar /> 
      
      <main className="container-fluid py-4">
        <Routes>
          
          {/* Ruta principal (Root: /) */}
          <Route 
            path="/" 
            element={
              <div className="text-center my-5">
                <h1>Bienvenido a MentorHero</h1>
                <p className="lead">Tu plataforma de mentoría entre pares.</p>
                {/* El componente ConnectionTest se ha eliminado de aquí */}
                <Link to="/register" className="btn btn-primary btn-lg mt-4">Registrarse ahora</Link>
                <Link to="/login" className="btn btn-outline-secondary btn-lg mt-4 ms-3">Iniciar Sesión</Link>
              </div>
            } 
          />
          
          {/* Ruta de Registro (/register) */}
          <Route path="/register" element={<RegistrationPage />} />
          
          {/* Aquí implementaremos la ruta de Login en el siguiente paso */}
          {/* <Route path="/login" element={<LoginPage />} /> */}
          
          {/* Manejo de 404 */}
          <Route path="*" element={<h1 className="text-danger text-center">404: Página no encontrada</h1>} />
        </Routes>
      </main>

      {/* 5. Footer siempre visible */}
      <Footer /> 
    </Router>
  );
}

export default App;