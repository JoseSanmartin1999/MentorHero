import React from 'react';
import ReactDOM from 'react-dom/client';

// 1. IMPORTAR ESTILOS GLOBALES
// Bootstrap CSS para la estructura y componentes
import 'bootstrap/dist/css/bootstrap.min.css';
// Bootstrap Icons para que las estrellas y cámaras se vean correctamente
import 'bootstrap-icons/font/bootstrap-icons.css';
// Tus estilos personalizados
import './index.css';

import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();