import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Soup, 
  ArrowRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import '../carpeta_login/Login.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Registro = ({ alCompletar, irALogin }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const registrarCuenta = async (e) => {
    e.preventDefault();
    const nombreValido = /^[a-zA-ZÁ-ÿ\s]{1,25}$/;
    if (!nombre || !email || !password) {
      setMensaje({ texto: 'Nombre, Email y Contraseña son obligatorios.', tipo: 'error' });
      return;
    }
    if (!nombreValido.test(nombre)) {
      setMensaje({ texto: 'El nombre solo puede tener letras y espacios.', tipo: 'error' });
      return;
    }
    const correoValido = /^[\w-.]+@((gmail|hotmail)\.com)$/i;
    if (!correoValido.test(email)) {
      setMensaje({ texto: 'El correo debe ser @gmail.com o @hotmail.com.', tipo: 'error' });
      return;
    }
    if (telefono && telefono.length !== 11) {
      setMensaje({ texto: 'El teléfono debe tener 11 números.', tipo: 'error' });
      return;
    }
    if (password.length < 5) {
      setMensaje({ texto: 'La contraseña debe tener mínimo 5 caracteres.', tipo: 'error' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, telefono, password }),
      });

      const data = await response.json();

      if (data.success) {
        setMensaje({ texto: '¡Cuenta creada con éxito!', tipo: 'exito' });
        setRegistroExitoso(true);
        setTimeout(() => {
          irALogin();
        }, 3000);
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
        
        <div className="login-card-content">
          <div className="login-header">
            <div className="login-logo-wrapper">
              <Soup size={28} color="#ffffff" strokeWidth={2.5} />
            </div>
            <h1 className="login-title">
              VEN<span>IA</span>
            </h1>
            <p className="login-subtitle">Únete a la nueva era del sabor 🇻🇪</p>
          </div>

          <form className="login-form" onSubmit={registrarCuenta} autoComplete="off">
            {/* Input Nombre */}
            <div className="input-field-wrapper">
              <label className="input-label">Nombre Completo</label>
              <div className="input-group">
                <span className="input-icon">
                  <User size={20} />
                </span>
                <input
                  type="text"
                  className="login-input"
                  placeholder="Tu nombre y apellido"
                  maxLength={25}
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value.replace(/[^a-zA-ZÁ-ÿ\s]/g, '').slice(0, 25));
                    setMensaje({ texto: '', tipo: '' });
                  }}
                />
              </div>
            </div>

            {/* Input Correo */}
            <div className="input-field-wrapper">
              <label className="input-label">Correo Electrónico</label>
              <div className="input-group">
                <span className="input-icon">
                  <Mail size={20} />
                </span>
                <input
                  type="email"
                  className="login-input"
                  placeholder="ejemplo@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setMensaje({ texto: '', tipo: '' });
                  }}
                />
              </div>
            </div>

            <div className="grid-2-col">
               {/* Input Teléfono */}
              <div className="input-field-wrapper">
                <label className="input-label">Teléfono</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="login-input"
                    placeholder="0412..."
                    maxLength={11}
                    style={{ paddingLeft: '20px' }}
                    value={telefono}
                    onChange={(e) => {
                      setTelefono(e.target.value.replace(/\D/g, '').slice(0, 11));
                      setMensaje({ texto: '', tipo: '' });
                    }}
                  />
                </div>
              </div>

              {/* Input Contraseña */}
              <div className="input-field-wrapper">
                <label className="input-label">Contraseña</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="login-input"
                    placeholder="Clave"
                    maxLength={20}
                    style={{ paddingLeft: '20px' }}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setMensaje({ texto: '', tipo: '' });
                    }}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {mensaje.texto && (
              <div className={mensaje.tipo === 'error' ? "auth-error-msg" : "auth-success-msg"}>
                {mensaje.tipo === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                {mensaje.texto}
              </div>
            )}

            <button type="submit" className="login-btn" style={{ marginTop: '0' }}>
              REGISTRARME <ArrowRight size={20} />
            </button>
          </form>

          <div className="login-footer">
            <span className="footer-text">¿Ya tienes cuenta? </span>
            <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); irALogin(); }}>
              Inicia Sesión aquí
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;
