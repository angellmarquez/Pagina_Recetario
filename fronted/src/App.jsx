import React, { useState } from 'react'
import Landing from './carpeta_landing/Landing'
import Login from './carpeta_login/Login'
import Registro from './carpeta_creacion_usuario/Registro'
import MenuRecetario from './carpeta_front/MenuRecetario'
import RecuperarPassword from './carpeta_recuperacion/RecuperarPassword'
import Footer from './carpeta_comun/Footer'


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

  const handleActualizarUsuario = (nuevosDatos) => {
    const actualizado = { ...usuario, ...nuevosDatos };
    setUsuario(actualizado);
    localStorage.setItem('venia_usuario', JSON.stringify(actualizado));
  };

  return (
    <div className="app-container">
      {vistaActual === 'landing' && <Landing onLogin={() => setVistaActual('login')} onRegistro={() => setVistaActual('registro')} />}
      {vistaActual === 'login' && <Login onLogin={handleIngresoExitoso} irARegistro={() => setVistaActual('registro')} irARecuperar={() => setVistaActual('recuperar')} />}
      {vistaActual === 'registro' && <Registro alCompletar={handleIngresoExitoso} irALogin={() => setVistaActual('login')} />}
      {vistaActual === 'recuperar' && <RecuperarPassword irALogin={() => setVistaActual('login')} />}
      {vistaActual === 'menu' && <MenuRecetario usuario={usuario} onLogout={handleLogout} onActualizarUsuario={handleActualizarUsuario} />}
      <Footer />
    </div>
  )
}

export default App
