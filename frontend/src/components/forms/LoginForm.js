import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const LOGIN_URL = 'http://localhost:5000/api/auth/login';

const LoginForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [responseMessage, setResponseMessage] = useState({ type: '', text: '' });
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.username) {
            newErrors.username = 'El nombre de usuario es obligatorio.';
        }
        if (!formData.password) {
            newErrors.password = 'La contraseña es obligatoria.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            setResponseMessage({ type: 'danger', text: 'Por favor, rellena los campos requeridos.' });
            return;
        }

        setIsSubmitting(true);
        setResponseMessage({ type: '', text: '' });

        try {
            const response = await fetch(LOGIN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Importante para enviar JSON
                },
                body: JSON.stringify(formData), 
            });

            const data = await response.json();

            if (response.ok) {
                // Éxito: Guardar el token y la información del usuario
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userInfo', JSON.stringify({ 
                    id: data.user_id, 
                    username: data.username, 
                    rol: data.rol 
                }));

                setResponseMessage({ 
                    type: 'success', 
                    text: `¡Bienvenido, ${data.username}! Redirigiendo...` 
                });

                // Redirigir al dashboard (asumiendo que crearás esa ruta)
                setTimeout(() => navigate('/dashboard'), 1500); 

            } else {
                setResponseMessage({ 
                    type: 'danger', 
                    text: data.message || 'Error al iniciar sesión. Verifica credenciales.' 
                });
            }

        } catch (error) {
            console.error('Error de red o servidor:', error);
            setResponseMessage({ type: 'danger', text: 'Error de conexión. Verifica que el backend esté activo.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-lg">
                        <div className="card-header bg-success text-white text-center">
                            <h2>Iniciar Sesión</h2>
                        </div>
                        <div className="card-body p-4">
                            
                            {/* Mensajes de Respuesta */}
                            {responseMessage.text && (
                                <div className={`alert alert-${responseMessage.type} text-center`} role="alert">
                                    {responseMessage.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* Campo Username */}
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label">Nombre de Usuario</label>
                                    <input 
                                        type="text" 
                                        className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                        id="username" 
                                        name="username" 
                                        value={formData.username} 
                                        onChange={handleChange} 
                                        disabled={isSubmitting}
                                        required
                                    />
                                    {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                                </div>

                                {/* Campo Contraseña */}
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Contraseña</label>
                                    <input 
                                        type="password" 
                                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                        id="password" 
                                        name="password" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        disabled={isSubmitting}
                                        required
                                    />
                                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                </div>

                                {/* Botón de Envío */}
                                <div className="d-grid gap-2 mt-4">
                                    <button 
                                        type="submit" 
                                        className="btn btn-success btn-lg" 
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                {' Ingresando...'}
                                            </>
                                        ) : (
                                            'Iniciar Sesión'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="card-footer text-muted text-center">
                            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;