import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Soup, 
  ArrowRight,
  AlertCircle 
} from 'lucide-react';
import './Login.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Login = ({ onLogin, irARegistro, irARecuperar }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');

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

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Pasar tanto el usuario como el token JWT
        onLogin(data.usuario, data.token);
      } else {
        setErrorLogin(data.mensaje);
      }
    } catch (error) {
      console.error("Error conectando con el backend:", error);
      setErrorLogin("Error del servidor. Asegúrate de que el backend esté encendido.");
    }
  };

  return (
    <div className="login-pantalla">
      <div className="login-card-container">
        <div className="login-card-bg"></div>
        
        <div className="login-card-content">
          <div className="login-header">
            <div className="login-logo-wrapper">
              <Soup size={28} color="#ffffff" strokeWidth={2.5} />
            </div>
            <h1 className="login-title">
              VEN<span>IA</span>
            </h1>
            <p className="login-subtitle">El sazón de la abuela con IA 🇻🇪</p>
          </div>

          <form className="login-form" onSubmit={iniciarSesion}>
            {/* Input Usuario */}
            <div className="input-field-wrapper">
              <label className="input-label">Usuario o Email</label>
              <div className="input-group">
                <span className="input-icon">
                  <User size={20} />
                </span>
                <input
                  type="text"
                  className="login-input"
                  placeholder="Tu nombre o correo"
                  maxLength={35}
                  value={usuario}
                  onChange={(e) => {
                    setUsuario(e.target.value);
                    setErrorLogin('');
                  }}
                />
              </div>
            </div>

            {/* Input Contraseña */}
            <div className="input-field-wrapper">
              <label className="input-label">Contraseña</label>
              <div className="input-group">
                <span className="input-icon">
                  <Lock size={20} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-input"
                  placeholder="Tu clave secreta"
                  maxLength={30}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorLogin('');
                  }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {errorLogin && (
              <div className="auth-error-msg">
                <AlertCircle size={14} /> {errorLogin}
              </div>
            )}

            <button type="submit" className="login-btn">
              ENTRAR A LA COCINA <ArrowRight size={20} />
            </button>
          </form>

          <div className="login-footer">
            <div>
              <span className="footer-text">¿No tienes cuenta? </span>
              <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); irARegistro(); }}>
                Crear cuenta GRATIS
              </a>
            </div>
            <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); irARecuperar(); }}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
