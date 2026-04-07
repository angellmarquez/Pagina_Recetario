
import React, { useState, useEffect } from 'react'
import Landing from './carpeta_landing/Landing'
import Login from './carpeta_login/Login'
import Registro from './carpeta_creacion_usuario/Registro'
import MenuRecetario from './carpeta_front/MenuRecetario'
import RecuperarPassword from './carpeta_recuperacion/RecuperarPassword'
import Footer from './carpeta_comun/Footer'
import { apiActualizarPerfil, apiVerificarToken } from './carpeta_front/services/apiService';


function App() {
  // Estado del usuario — ya NO guardamos datos sensibles en localStorage
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // Estado para controlar qué pantalla se ve
  const [vistaActual, setVistaActual] = useState('landing');

  // Al cargar la app, verificar si hay un token válido
  useEffect(() => {
    const verificarSesion = async () => {
      const token = localStorage.getItem('venia_token');
      if (token) {
        try {
          const usuarioVerificado = await apiVerificarToken();
          if (usuarioVerificado) {
            setUsuario(usuarioVerificado);
            setVistaActual('menu');
          } else {
            // Token inválido — limpiar
            localStorage.removeItem('venia_token');
          }
        } catch (e) {
          localStorage.removeItem('venia_token');
        }
      }
      setCargandoSesion(false);
    };
    verificarSesion();
  }, []);

  // Función que se llama desde Login cuando las credenciales son correctas
  const handleIngresoExitoso = (usuarioIngresado, token) => {
    setUsuario(usuarioIngresado);
    setVistaActual('menu');
    // Solo guardamos el JWT token, NO datos del usuario
    if (token) {
      localStorage.setItem('venia_token', token);
    }
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    setVistaActual('landing');
    setUsuario(null);
    localStorage.removeItem('venia_token');
  };

  // Actualiza el usuario tanto en backend como en frontend
  const handleActualizarUsuario = async (nuevosDatos) => {
    if (!usuario?.id_usuario) return;
    try {
      const res = await apiActualizarPerfil(
        usuario.id_usuario,
        nuevosDatos.preferencias_dieteticas,
        nuevosDatos.nombre,
        nuevosDatos.telefono,
        nuevosDatos.bio,
        nuevosDatos.email
      );
      if (res.success) {
        const actualizado = res.usuario ? res.usuario : { ...usuario, ...nuevosDatos };
        setUsuario(actualizado);
        return { success: true };
      } else {
        return { success: false, mensaje: res.mensaje || 'Error desconocido' };
      }
    } catch (e) {
      return { success: false, mensaje: 'Error de conexión al actualizar el perfil' };
    }
  };

  // Pantalla de carga mientras verificamos sesión
  if (cargandoSesion) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f9f6f1 0%, #ffffff 50%, #f3ede4 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>👵🏽</div>
          <p style={{ color: '#2e7d5e', fontWeight: '800', fontSize: '16px' }}>Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {vistaActual === 'landing' && <Landing onLogin={() => setVistaActual('login')} onRegistro={() => setVistaActual('registro')} />}
      {vistaActual === 'login' && <Login onLogin={handleIngresoExitoso} irARegistro={() => setVistaActual('registro')} irARecuperar={() => setVistaActual('recuperar')} />}
      {vistaActual === 'registro' && <Registro alCompletar={handleIngresoExitoso} irALogin={() => setVistaActual('login')} />}
      {vistaActual === 'recuperar' && <RecuperarPassword irALogin={() => setVistaActual('login')} />}
      {vistaActual === 'menu' && <MenuRecetario usuario={usuario} onLogout={handleLogout} onActualizarUsuario={handleActualizarUsuario} irARecuperar={() => setVistaActual('recuperar')} />}
    </div>
  )
}

export default App
