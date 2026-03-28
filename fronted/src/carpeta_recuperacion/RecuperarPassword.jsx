import React, { useState } from 'react';
import '../carpeta_login/Login.css';

const RecuperarPassword = ({ irALogin }) => {
  const [paso, setPaso] = useState(1); // 1: Email, 2: Código, 3: Nueva Password
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);

  // Paso 1: Solicitar Código
  const solicitarCodigo = async (e) => {
    e.preventDefault();
    if (!email) return setMensaje({ texto: 'Ingresa tu correo mijo.', tipo: 'error' });
    
    setCargando(true);
    try {
      const resp = await fetch('http://localhost:3000/api/recuperar/solicitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await resp.json();
      if (data.success) {
        setMensaje({ texto: '¡Código enviado! Revisa tu bandeja de entrada mijo.', tipo: 'exito' });
        setPaso(2);
      } else {
        setMensaje({ texto: data.mensaje, tipo: 'error' });
      }
    } catch (err) {
      setMensaje({ texto: 'Error de conexión', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  // Paso 2: Verificar Código
  const verificarCodigo = async (e) => {
    e.preventDefault();
    if (!codigo) return setMensaje({ texto: 'Ingresa el código de 6 dígitos.', tipo: 'error' });

    setCargando(true);
    try {
      const resp = await fetch('http://localhost:3000/api/recuperar/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo })
      });
      const data = await resp.json();
      if (data.success) {
        setMensaje({ texto: 'Código correcto. Ahora cambia tu contraseña.', tipo: 'exito' });
        setPaso(3);
      } else {
        setMensaje({ texto: data.mensaje, tipo: 'error' });
      }
    } catch (err) {
      setMensaje({ texto: 'Error de conexión', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  // Paso 3: Restablecer Contraseña
  const restablecerPassword = async (e) => {
    e.preventDefault();
    if (nuevaPassword.length < 5) return setMensaje({ texto: 'Mínimo 5 caracteres.', tipo: 'error' });

    setCargando(true);
    try {
      const resp = await fetch('http://localhost:3000/api/recuperar/restablecer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo, nuevaPassword })
      });
      const data = await resp.json();
      if (data.success) {
        setMensaje({ texto: '¡Listo! Contraseña actualizada.', tipo: 'exito' });
        setTimeout(() => irALogin(), 2000);
      } else {
        setMensaje({ texto: data.mensaje, tipo: 'error' });
      }
    } catch (err) {
      setMensaje({ texto: 'Error de conexión', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-pantalla">
      <div className="login-card-container">
        <div className="login-card-bg"></div>
        <div className="login-card-content">
          <h1 className="login-title">VEN<span style={{ color: 'white' }}>IA</span></h1>
          <p className="login-subtitle">Recuperación Segura 🇻🇪</p>

          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
             <span style={{ color: paso >= 1 ? '#ffcc00' : '#888' }}>●</span>
             <span style={{ margin: '0 10px', color: paso >= 2 ? '#ffcc00' : '#888' }}>●</span>
             <span style={{ color: paso >= 3 ? '#ffcc00' : '#888' }}>●</span>
          </div>

          {paso === 1 && (
            <form className="login-form" onSubmit={solicitarCodigo}>
              <p style={{ fontSize: '12px', color: '#ccc', textAlign: 'center', marginBottom: '15px' }}>
                Ingresa tu correo para recibir un código de verificación.
              </p>
              <div className="input-group">
                <span className="input-icon">📧</span>
                <input type="email" className="login-input" placeholder="Tu Correo" 
                  value={email} onChange={(e) => setEmail(e.target.value)} disabled={cargando} />
              </div>
              <button type="submit" className="login-btn" disabled={cargando}>
                {cargando ? 'ENVIANDO...' : 'SOLICITAR CÓDIGO'}
              </button>
            </form>
          )}

          {paso === 2 && (
            <form className="login-form" onSubmit={verificarCodigo}>
              <p style={{ fontSize: '12px', color: '#ccc', textAlign: 'center', marginBottom: '15px' }}>
                Ingresa el código de 6 dígitos enviado a tu correo.
              </p>
              <div className="input-group">
                <span className="input-icon">🔑</span>
                <input type="text" className="login-input" placeholder="Código (6 dígitos)" 
                  value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))} maxLength={6} disabled={cargando} />
              </div>
              <button type="submit" className="login-btn" disabled={cargando}>
                {cargando ? 'VERIFICANDO...' : 'VERIFICAR CÓDIGO'}
              </button>
              <button type="button" className="footer-link" style={{ background: 'none', border: 'none', width: '100%', marginTop: '10px' }} 
                onClick={() => setPaso(1)}>Volver a intentar</button>
            </form>
          )}

          {paso === 3 && (
            <form className="login-form" onSubmit={restablecerPassword}>
              <p style={{ fontSize: '12px', color: '#ccc', textAlign: 'center', marginBottom: '15px' }}>
                ¡Casi listo! Ingresa tu nueva contraseña.
              </p>
              <div className="input-group">
                <span className="input-icon">🔐</span>
                <input type="password" className="login-input" placeholder="Nueva Contraseña" 
                  value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} disabled={cargando} />
              </div>
              <button type="submit" className="login-btn" disabled={cargando}>
                {cargando ? 'ACTUALIZANDO...' : 'CAMBIAR CONTRASEÑA'}
              </button>
            </form>
          )}

          {mensaje.texto && (
            <div style={{ color: mensaje.tipo === 'error' ? '#ffaaaa' : '#aaffaa', fontSize: '12px', textAlign: 'center', marginTop: '15px' }}>
              * {mensaje.texto}
            </div>
          )}

          <div className="login-footer">
            <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); irALogin(); }}>Cancelar</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecuperarPassword;
