import React, { useState } from 'react';
import '../carpeta_login/Login.css'; // Importamos el CSS desde la carpeta del login

const Registro = ({ alCompletar, irALogin }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' }); // tipo: 'error' o 'exito'

  const registrarCuenta = async (e) => {
    e.preventDefault();
    if (!nombre || !email || !password) {
      setMensaje({ texto: 'Nombre, Email y Contraseña son obligatorios.', tipo: 'error' });
      return;
    }

    if (!email.endsWith('@gmail.com') && !email.endsWith('@hotmail.com')) {
      setMensaje({ texto: 'El correo debe ser @gmail.com o @hotmail.com.', tipo: 'error' });
      return;
    }

    if (telefono && telefono.length !== 11) {
      setMensaje({ texto: 'Debe tener exactamente 11 números, ej: 04141234567.', tipo: 'error' });
      return;
    }

    if (password.length < 5 || password.length > 20) {
      setMensaje({ texto: 'La contraseña debe tener mínimo 5 caracteres.', tipo: 'error' });
      return;
    }

    const regexLetras = /[a-zA-Z]/;
    const regexNumeros = /\d/;
    if (!regexLetras.test(password) || !regexNumeros.test(password)) {
      setMensaje({ texto: 'La contraseña debe incluir números y letras.', tipo: 'error' });
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, telefono, password }),
      });

      const data = await response.json();

      if (data.success) {
        setMensaje({ texto: '¡Cuenta creada con éxito! Iniciando sesión...', tipo: 'exito' });
        
        // Esperar un poco para que el usuario lea el mensaje y enviarlo al Login
        setTimeout(() => {
          irALogin();
        }, 1500);
      } else {
        setMensaje({ texto: data.mensaje, tipo: 'error' });
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      setMensaje({ texto: "Error conectando con el servidor.", tipo: 'error' });
    }
  };

  return (
    <div className="login-pantalla">
      <div className="login-card-container">
        <div className="login-card-bg"></div>
        
        <div className="login-card-content" style={{ paddingTop: '30px' }}> {/* Ajustamos padding superior porque hay más campos */}
          <h1 className="login-title">VEN<span style={{ color: 'white' }}>IA</span></h1>
          <p className="login-subtitle" style={{ marginBottom: '25px' }}>Regístrate en el tricolor 🇻🇪</p>

          <form className="login-form" onSubmit={registrarCuenta} autoComplete="off">
            
            {/* Input Nombre */}
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <span className="input-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#FFD700">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <input type="text" className="login-input" placeholder="Nombre completo" 
                maxLength={20}
                autoComplete="off"
                value={nombre} onChange={(e) => { 
                  const val = e.target.value.replace(/[^a-zA-ZÁ-ÿ\s]/g, '');
                  setNombre(val); 
                  setMensaje({texto:'', tipo:''}); 
                }} />
            </div>

            {/* Input Correo */}
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <span className="input-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
              <input type="email" className="login-input" placeholder="Correo Electrónico" 
                autoComplete="off"
                value={email} onChange={(e) => { setEmail(e.target.value); setMensaje({texto:'', tipo:''}); }} />
            </div>

            {/* Input Teléfono */}
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <span className="input-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </span>
              <input type="text" className="login-input" placeholder="Teléfono (11 números)" 
                maxLength={11}
                autoComplete="off"
                value={telefono} onChange={(e) => { 
                  const val = e.target.value.replace(/\D/g, '');
                  setTelefono(val); 
                  setMensaje({texto:'', tipo:''}); 
                }} />
            </div>

            {/* Input Contraseña */}
            <div className="input-group" style={{ marginBottom: '15px', position: 'relative' }}>
              <span className="input-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <rect x="5" y="11" width="14" height="10" rx="2" ry="2" fill="#003893" stroke="none"/>
                   <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                   <circle cx="12" cy="16" r="1.5" fill="#EF3340" stroke="none"/>
                </svg>
              </span>
              <input 
                type={showPassword ? "text" : "password"} 
                className="login-input" 
                placeholder="Contraseña" 
                maxLength={20}
                autoComplete="new-password"
                style={{ paddingRight: '40px' }}
                value={password} 
                onChange={(e) => { setPassword(e.target.value); setMensaje({texto:'', tipo:''}); }} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#FFD700',
                  padding: '0'
                }}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>

            {/* Area de Mensajes */}
            {mensaje.texto && (
              <div style={{ color: mensaje.tipo === 'error' ? '#ffaaaa' : '#aaffaa', fontSize: '12px', textAlign: 'center', marginTop: '-5px', marginBottom: '5px' }}>
                * {mensaje.texto}
              </div>
            )}

            <button type="submit" className="login-btn" style={{ marginTop: '10px' }}>
              REGISTRARME
            </button>
          </form>

          <div className="login-footer" style={{ bottom: '25px' }}>
            <span className="footer-text">¿Ya tienes cuenta? </span>
            <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); irALogin(); }}>Inicia Sesión</a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Registro;
