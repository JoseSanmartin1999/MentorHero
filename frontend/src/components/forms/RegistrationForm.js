import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// --- MOCK DATA --- 
// 1. Carreras: (IDs deben coincidir con tu tabla 'carreras')
const mockCarreras = [
    { id: 1, name: 'Ingeniería de Software' },
    { id: 2, name: 'Marketing Digital' },
    { id: 3, name: 'Diseño Gráfico' },
    { id: 4, name: 'Administración de Empresas' },
];

// 2. Roles permitidos en el registro: (Excluimos Administrador)
const roles = ['Aprendiz', 'Tutor'];

// 3. Materias base para selección de Tutores: (IDs deben coincidir con tu tabla 'materias')
const basicSubjects = [
    { id: 1, name: 'Cálculo Diferencial e Integral' },
    { id: 2, name: 'Fundamentos de Programación' },
    { id: 3, name: 'Álgebra Lineal' },
    { id: 4, name: 'Cálculo Vectorial' },
    { id: 5, name: 'Estructura de Datos' },
    { id: 6, name: 'Lógica' },
    { id: 7, name: 'Programación Orientada a Objetos' },
    { id: 8, name: 'Modelos Discretos' },
    { id: 9, name: 'Programación Web' },
    { id: 10, name: 'Métodos Numéricos' },
];

const BACKEND_URL = 'http://localhost:5000/api/auth/register'; 

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
    const [selectedSubjects, setSelectedSubjects] = useState([]); // Array de IDs de materias
    
    const semesters = useMemo(() => Array.from({ length: 8 }, (_, i) => String(i + 1)), []);

    // 2. MANEJO DE CAMBIOS
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Lógica para limpiar las materias si cambia el rol a Aprendiz
        if (name === 'rol' && value === 'Aprendiz') {
            setSelectedSubjects([]);
            setErrors(prev => ({ ...prev, subjects: undefined }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };
    
    const handleFileChange = (e) => { 
        setFile(e.target.files[0]); 
        if (errors.foto) { setErrors(prev => ({ ...prev, foto: undefined })); }
    };

    // Manejador de selección de materias para tutores
    const handleSubjectChange = (subjectId) => {
        const id = parseInt(subjectId);
        setSelectedSubjects(prev => {
            const isSelected = prev.includes(id);
            const newSelection = isSelected 
                ? prev.filter(s => s !== id) 
                : [...prev, id];
            
            // Limpia el error de materias si ya se cumple el mínimo (3)
            if (newSelection.length >= 3 && errors.subjects) {
                 setErrors(prevErrors => ({ ...prevErrors, subjects: undefined }));
            }
            return newSelection;
        });
    };

    // 3. VALIDACIÓN EN EL CLIENTE
    const validate = () => {
        const newErrors = {};
        const { password, repetir_password, fecha_nacimiento, rol } = formData;
        
        // Validación de campos obligatorios (simplificado)
        Object.keys(formData).forEach(key => {
            if (!formData[key]) {
                 newErrors[key] = 'Este campo es obligatorio.';
            }
        });
        
        // Contraseñas
        if (password.length < 8) { newErrors.password = 'Debe tener al menos 8 caracteres.'; }
        if (password !== repetir_password) { newErrors.repetir_password = 'Las contraseñas no coinciden.'; }
        
        // Validación de Edad (Mínimo 17 años)
        if (fecha_nacimiento) {
             const dob = new Date(fecha_nacimiento);
             const today = new Date();
             const minDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
             if (dob > minDate) { newErrors.fecha_nacimiento = 'Debe tener al menos 17 años.'; }
        }

        // Validación del MÍNIMO DE MATERIAS PARA TUTOR
        if (rol === 'Tutor') {
            if (selectedSubjects.length < 3) {
                newErrors.subjects = 'Como Tutor, debes seleccionar al menos 3 materias que domines.';
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
        
        // Agregar datos de texto
        Object.keys(formData).forEach(key => {
            dataToSend.append(key, formData[key]);
        });
        
        // ADJUNTAR MATERIAS CONDICIONALMENTE
        if (formData.rol === 'Tutor' && selectedSubjects.length > 0) {
            // Se envía como string JSON para que el backend lo pueda parsear
            dataToSend.append('subjects', JSON.stringify(selectedSubjects)); 
        } else if (formData.rol === 'Aprendiz') {
            // Aseguramos que no se envíe la clave 'subjects' si es Aprendiz
            dataToSend.delete('subjects');
        }

        // Adjuntar foto
        if (file) { dataToSend.append('foto', file); }

        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                body: dataToSend, 
            });

            const data = await response.json();
            
            if (response.ok) {
                setResponseMessage({ 
                    type: 'success', 
                    text: `¡Registro exitoso! Usuario: ${data.username}. Ahora puedes iniciar sesión.`
                });
            } else {
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

                                    {/* SECCIÓN CONDICIONAL DE MATERIAS PARA TUTORES */}
                                    {formData.rol === 'Tutor' && (
                                        <div className="col-12 mt-4 border p-3 rounded bg-light">
                                            <h5 className="mb-3 text-primary">Materias a Tutelar (Mínimo 3):</h5>
                                            <div className="row">
                                                {basicSubjects.map(subject => (
                                                    <div className="col-md-6 col-lg-4" key={subject.id}>
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                value={subject.id}
                                                                id={`subject-${subject.id}`}
                                                                checked={selectedSubjects.includes(subject.id)}
                                                                onChange={() => handleSubjectChange(subject.id)}
                                                                disabled={isSubmitting}
                                                            />
                                                            <label className="form-check-label" htmlFor={`subject-${subject.id}`}>
                                                                {subject.name}
                                                            </label>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.subjects && <div className="text-danger mt-2">{errors.subjects}</div>}
                                        </div>
                                    )}
                                    
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
                        <div className="card-footer text-muted text-center">
                            ¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión aquí</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationForm;