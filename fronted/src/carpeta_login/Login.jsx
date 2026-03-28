import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin, irARegistro, irARecuperar }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorLogin, setErrorLogin] = useState(''); // Nuevo estado para mostrar errores de credenciales

  const iniciarSesion = async (e) => {
    e.preventDefault();
    if (!usuario || !password) {
      setErrorLogin('¡Te falta ingresar ingredientes! (Campos incompletos)');
      return;
    }

    if (!usuario.includes('@') && /\d/.test(usuario)) {
      setErrorLogin('Tu nombre no puede contener números. Usa tu correo si los tiene.');
      return;
    }

    // Conectar el Frontend React con el Backend Node.js
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Enviamos el usuario y contraseña al backend
        body: JSON.stringify({ usuario, password }),
      });

      const data = await response.json();

      if (data.success) {
        //si esta correcta entra a la app
        onLogin(data.usuario);
      } else {
        // si esta mal sale un mensaje de error
        setErrorLogin(data.mensaje);
      }
    } catch (error) {
      console.error("Error conectando con el backend:", error);
      setErrorLogin("Error del servidor. Asegúrate de que el backend (Node) esté encendido.");
    }
  };

  const simularCrearCuenta = (e) => {
    e.preventDefault();
    irARegistro();
  };

  return (
    <div className="login-pantalla">
      <div className="login-card-container">

        {/* Fondo Gradiente de la Tarjeta */}
        <div className="login-card-bg"></div>

        {/* Contenido de la Tarjeta */}
        <div className="login-card-content">
          <h1 className="login-title">VEN<span style={{ color: 'white' }}>IA</span></h1>
          <p className="login-subtitle">El sazón de la abuela con IA 🇻🇪</p>

          <form className="login-form" onSubmit={iniciarSesion}>

            {/* Input Usuario */}
            <div className="input-group">
              <span className="input-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#FFD700">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 22c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#FFD700" strokeWidth="2" fill="none" />
                </svg>
              </span>
              <input
                type="text"
                className="login-input"
                placeholder="Usuario o Email"
                maxLength={30}
                value={usuario}
                onChange={(e) => {
                  setUsuario(e.target.value);
                  setErrorLogin(''); // Limpiar errores cuando escriben
                }}
              />
            </div>

            {/* Input Contraseña */}
            <div className="input-group" style={{ position: 'relative' }}>
              <span className="input-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="11" width="14" height="10" rx="2" ry="2" fill="#003893" stroke="none" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  <circle cx="12" cy="16" r="1.5" fill="#EF3340" stroke="none" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="Contraseña"
                maxLength={30}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorLogin(''); // Limpiar errores cuando escriben
                }}
                style={{ paddingRight: '40px' }}
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

            {/* Mensaje de Error Rojo (Si las credenciales están mal) */}
            {errorLogin && (
              <div style={{ color: '#ffaaaa', fontSize: '12px', textAlign: 'center', marginTop: '-10px', marginBottom: '10px' }}>
                * {errorLogin}
              </div>
            )}

            {/* Botón de Ingreso */}
            <button type="submit" className="login-btn">
              ENTRAR A LA COCINA
            </button>

          </form>

          {/* Enlaces Footer */}
          <div className="login-footer" style={{ flexDirection: 'column', gap: '10px' }}>
            <div>
              <span className="footer-text">¿No tienes cuenta? </span>
              <a href="#" className="footer-link" onClick={simularCrearCuenta}>Crear cuenta</a>
            </div>
            <div>
              <a href="#" className="footer-link" style={{ fontSize: '13px', opacity: 0.8 }} 
                 onClick={(e) => { e.preventDefault(); irARecuperar(); }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
