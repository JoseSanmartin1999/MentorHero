import React, { useState, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

// --- MOCK DATA --- (Reemplazar con llamada a la API en producción)
const mockCarreras = [
    { id: 1, name: 'Ingeniería de Software' },
    { id: 2, name: 'Marketing Digital' },
    { id: 3, name: 'Diseño Gráfico' },
    { id: 4, name: 'Administración de Empresas' },
];
const roles = ['Aprendiz', 'Tutor', 'Administrador'];
const BACKEND_URL = 'http://localhost:5000/api/auth/register'; // URL de tu backend

const RegistrationForm = () => {
    // 1. ESTADO DEL FORMULARIO
    const [formData, setFormData] = useState({
        nombre: '',
        fecha_nacimiento: '',
        username: '',
        password: '',
        repetir_password: '',
        carrera_id: mockCarreras[0].id,
        institucion: '',
        semestre: '1',
        rol: 'Aprendiz',
    });
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [responseMessage, setResponseMessage] = useState({ type: '', text: '' });

    const semesters = useMemo(() => Array.from({ length: 8 }, (_, i) => String(i + 1)), []);

    // 2. MANEJO DE CAMBIOS
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpia el error al empezar a escribir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        if (errors.foto) {
            setErrors(prev => ({ ...prev, foto: undefined }));
        }
    };

    // 3. VALIDACIÓN EN EL CLIENTE
    const validate = () => {
        const newErrors = {};
        const { nombre, fecha_nacimiento, username, password, repetir_password, institucion } = formData;

        // Validación de campos obligatorios (simplificado)
        Object.keys(formData).forEach(key => {
            if (!formData[key]) {
                newErrors[key] = 'Este campo es obligatorio.';
            }
        });

        // Contraseñas
        if (password.length < 8) {
            newErrors.password = 'Debe tener al menos 8 caracteres.';
        }
        if (password !== repetir_password) {
            newErrors.repetir_password = 'Las contraseñas no coinciden.';
        }

        // Validación de Edad (Mínimo 17 años)
        if (fecha_nacimiento) {
            const dob = new Date(fecha_nacimiento);
            const today = new Date();
            // Calcular fecha mínima: 17 años antes de hoy
            const minDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
            if (dob > minDate) {
                newErrors.fecha_nacimiento = 'Debe tener al menos 17 años.';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    // 4. MANEJO DEL SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) {
            setResponseMessage({ type: 'danger', text: 'Por favor, corrige los errores del formulario.' });
            return;
        }

        setIsSubmitting(true);
        setResponseMessage({ type: '', text: '' });
        
        // Usar FormData para enviar archivos y datos de texto
        const dataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            dataToSend.append(key, formData[key]);
        });
        
        // Adjuntar el archivo, usando el nombre de campo 'foto'
        if (file) {
            dataToSend.append('foto', file); 
        }

        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                body: dataToSend,
            });

            const data = await response.json();
            
            if (response.ok) {
                setResponseMessage({ 
                    type: 'success', 
                    text: `¡Registro exitoso! Usuario: ${data.username}. Rol: ${data.rol}.`
                });
                // Opcional: limpiar formulario (setFormData a valores iniciales)
            } else {
                // El error viene del backend (ej: usuario ya existe)
                setResponseMessage({ 
                    type: 'danger', 
                    text: data.message || 'Error desconocido en el registro.' 
                });
            }
        } catch (error) {
            console.error('Error de red o servidor:', error);
            setResponseMessage({ type: 'danger', text: 'Error de conexión con el servidor. Verifica que el backend esté activo.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // 5. RENDERIZADO (JSX con Bootstrap)
    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow-lg">
                        <div className="card-header bg-primary text-white text-center">
                            <h2>Registro de Usuario MentorHero</h2>
                        </div>
                        <div className="card-body p-4">
                            
                            {/* Mensajes de Respuesta */}
                            {responseMessage.text && (
                                <div className={`alert alert-${responseMessage.type} text-center`} role="alert">
                                    {responseMessage.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    {/* Campo Nombre */}
                                    <div className="col-md-6">
                                        <label htmlFor="nombre" className="form-label">Nombre Completo</label>
                                        <input 
                                            type="text" 
                                            className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                                            id="nombre" 
                                            name="nombre" 
                                            value={formData.nombre} 
                                            onChange={handleChange} 
                                            disabled={isSubmitting}
                                        />
                                        {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                                    </div>

                                    {/* Campo Fecha de Nacimiento */}
                                    <div className="col-md-6">
                                        <label htmlFor="fecha_nacimiento" className="form-label">Fecha de Nacimiento</label>
                                        <input 
                                            type="date" 
                                            className={`form-control ${errors.fecha_nacimiento ? 'is-invalid' : ''}`}
                                            id="fecha_nacimiento" 
                                            name="fecha_nacimiento" 
                                            value={formData.fecha_nacimiento} 
                                            onChange={handleChange} 
                                            disabled={isSubmitting}
                                        />
                                        {errors.fecha_nacimiento && <div className="invalid-feedback">{errors.fecha_nacimiento}</div>}
                                    </div>

                                    {/* Campo Username */}
                                    <div className="col-md-6">
                                        <label htmlFor="username" className="form-label">Nombre de Usuario</label>
                                        <input 
                                            type="text" 
                                            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                            id="username" 
                                            name="username" 
                                            value={formData.username} 
                                            onChange={handleChange} 
                                            disabled={isSubmitting}
                                        />
                                        {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                                    </div>

                                    {/* Campo Institución */}
                                    <div className="col-md-6">
                                        <label htmlFor="institucion" className="form-label">Institución</label>
                                        <input 
                                            type="text" 
                                            className={`form-control ${errors.institucion ? 'is-invalid' : ''}`}
                                            id="institucion" 
                                            name="institucion" 
                                            value={formData.institucion} 
                                            onChange={handleChange} 
                                            disabled={isSubmitting}
                                        />
                                        {errors.institucion && <div className="invalid-feedback">{errors.institucion}</div>}
                                    </div>
                                    
                                    {/* Campo Contraseña */}
                                    <div className="col-md-6">
                                        <label htmlFor="password" className="form-label">Contraseña (Mín. 8)</label>
                                        <input 
                                            type="password" 
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            id="password" 
                                            name="password" 
                                            value={formData.password} 
                                            onChange={handleChange} 
                                            disabled={isSubmitting}
                                        />
                                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                    </div>

                                    {/* Campo Repetir Contraseña */}
                                    <div className="col-md-6">
                                        <label htmlFor="repetir_password" className="form-label">Confirmar Contraseña</label>
                                        <input 
                                            type="password" 
                                            className={`form-control ${errors.repetir_password ? 'is-invalid' : ''}`}
                                            id="repetir_password" 
                                            name="repetir_password" 
                                            value={formData.repetir_password} 
                                            onChange={handleChange} 
                                            disabled={isSubmitting}
                                        />
                                        {errors.repetir_password && <div className="invalid-feedback">{errors.repetir_password}</div>}
                                    </div>

                                    {/* Campo Carrera ID (Select) */}
                                    <div className="col-md-4">
                                        <label htmlFor="carrera_id" className="form-label">Carrera</label>
                                        <select 
                                            className={`form-select ${errors.carrera_id ? 'is-invalid' : ''}`}
                                            id="carrera_id" 
                                            name="carrera_id" 
                                            value={formData.carrera_id} 
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                        >
                                            {mockCarreras.map(carrera => (
                                                // Nota: el valor del option debe ser el ID (numérico)
                                                <option key={carrera.id} value={carrera.id}>
                                                    {carrera.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.carrera_id && <div className="invalid-feedback">{errors.carrera_id}</div>}
                                    </div>
                                    
                                    {/* Campo Semestre (Select) */}
                                    <div className="col-md-4">
                                        <label htmlFor="semestre" className="form-label">Semestre</label>
                                        <select 
                                            className={`form-select ${errors.semestre ? 'is-invalid' : ''}`}
                                            id="semestre" 
                                            name="semestre" 
                                            value={formData.semestre} 
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                        >
                                            {semesters.map(s => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.semestre && <div className="invalid-feedback">{errors.semestre}</div>}
                                    </div>

                                    {/* Campo Foto de Perfil */}
                                    <div className="col-md-4">
                                        <label htmlFor="foto" className="form-label">Foto de Perfil (Opcional)</label>
                                        <input 
                                            type="file" 
                                            className={`form-control ${errors.foto ? 'is-invalid' : ''}`}
                                            id="foto" 
                                            name="foto"
                                            accept="image/*"
                                            onChange={handleFileChange} 
                                            disabled={isSubmitting}
                                        />
                                        <div className="form-text">Campo de nombre: 'foto'</div>
                                        {errors.foto && <div className="invalid-feedback">{errors.foto}</div>}
                                    </div>

                                    {/* Campo Rol (Radios) */}
                                    <div className="col-12 mt-4">
                                        <label className="form-label d-block">Selecciona tu Rol:</label>
                                        <div className="d-flex gap-3">
                                            {roles.map(r => (
                                                <div className="form-check form-check-inline" key={r}>
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="rol"
                                                        id={`rol-${r}`}
                                                        value={r}
                                                        checked={formData.rol === r}
                                                        onChange={handleChange}
                                                        disabled={isSubmitting}
                                                    />
                                                    <label className="form-check-label" htmlFor={`rol-${r}`}>
                                                        {r}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                        {errors.rol && <div className="text-danger mt-1" style={{fontSize: '0.875em'}}>{errors.rol}</div>}
                                    </div>

                                    {/* Botón de Envío */}
                                    <div className="col-12 mt-4 text-center">
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary btn-lg" 
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    {' Registrando...'}
                                                </>
                                            ) : (
                                                'Registrarse'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationForm;