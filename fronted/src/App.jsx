
import React, { useState } from 'react'
import Landing from './carpeta_landing/Landing'
import Login from './carpeta_login/Login'
import Registro from './carpeta_creacion_usuario/Registro'
import MenuRecetario from './carpeta_front/MenuRecetario'
import RecuperarPassword from './carpeta_recuperacion/RecuperarPassword'
import Footer from './carpeta_comun/Footer'
import { apiActualizarPerfil } from './carpeta_front/services/apiService';


function App() {
  // Estado para guardar el objeto usuario
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('venia_usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  // Estado para controlar qué pantalla se ve
  const [vistaActual, setVistaActual] = useState(() => {
    return localStorage.getItem('venia_usuario') ? 'menu' : 'landing';
  });

  // Función que se llama desde el Login o Registro cuando las credenciales son correctas
  const handleIngresoExitoso = (usuarioIngresado) => {
    setUsuario(usuarioIngresado);
    setVistaActual('menu');
    localStorage.setItem('venia_usuario', JSON.stringify(usuarioIngresado));
  };

  // Función para cerrar sesión y volver al Login
  const handleLogout = () => {
    setVistaActual('login');
    setUsuario(null);
    localStorage.removeItem('venia_usuario');
  };

  // Actualiza el usuario tanto en backend como en frontend
  const handleActualizarUsuario = async (nuevosDatos) => {
    if (!usuario?.id_usuario) return;
    // Llama a la API para actualizar en la base de datos
    try {
      const res = await apiActualizarPerfil(
        usuario.id_usuario,
        nuevosDatos.preferencias_dieteticas,
        nuevosDatos.nombre
      );
      if (res.success) {
        const actualizado = { ...usuario, ...nuevosDatos };
        setUsuario(actualizado);
        localStorage.setItem('venia_usuario', JSON.stringify(actualizado));
      } else {
        alert('No se pudo actualizar el perfil: ' + (res.mensaje || 'Error desconocido'));
      }
    } catch (e) {
      alert('Error de conexión al actualizar el perfil');
    }
  };

  return (
    <div className="app-container">
      {vistaActual === 'landing' && <Landing onLogin={() => setVistaActual('login')} onRegistro={() => setVistaActual('registro')} />}
      {vistaActual === 'login' && <Login onLogin={handleIngresoExitoso} irARegistro={() => setVistaActual('registro')} irARecuperar={() => setVistaActual('recuperar')} />}
      {vistaActual === 'registro' && <Registro alCompletar={handleIngresoExitoso} irALogin={() => setVistaActual('login')} />}
      {vistaActual === 'recuperar' && <RecuperarPassword irALogin={() => setVistaActual('login')} />}
      {vistaActual === 'menu' && <MenuRecetario usuario={usuario} onLogout={handleLogout} onActualizarUsuario={handleActualizarUsuario} />}
    </div>
  )
}

export default App
