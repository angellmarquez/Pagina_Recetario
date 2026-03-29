import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import DiscoverFeed from './DiscoverFeed';
import SidebarNavigation from './components/SidebarNavigation';
import SearchView from './views/SearchView';
import RecipeDetailView from './views/RecipeDetailView';
import RegionesView from './views/RegionesView';
import PlanSemanalView from './views/PlanSemanalView';
import ProfileView from './views/ProfileView';
import { generarRecetaIA, generarPlanIA } from './services/aiService';
import { apiGuardarReceta, apiObtenerRecetasUsuario, apiEliminarReceta, apiGuardarPlanSemanal } from './services/apiService';

const MenuRecetario = ({ usuario, onLogout, onActualizarUsuario }) => {
  const [prompt, setPrompt] = useState('');
  const [respuestaIA, setRespuestaIA] = useState('');
  const [cargando, setCargando] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState('descubrir'); 
  const [dashboardAbierto, setDashboardAbierto] = useState(false);
  const [fondoActivo, setFondoActivo] = useState('var(--bg-gradient)');
  
  const [guardando, setGuardando] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState('');
  const [recetaActiva, setRecetaActiva] = useState(null);
  const [recetasGuardadasLocales, setRecetasGuardadasLocales] = useState([]);

  useEffect(() => {
    if (seccionActiva === 'guardadas' && usuario?.id_usuario) {
      cargarRecetasGuardadas();
    }
  }, [seccionActiva, usuario]);

  const cargarRecetasGuardadas = async () => {
    try {
      const data = await apiObtenerRecetasUsuario(usuario.id_usuario);
      if (data.success) setRecetasGuardadasLocales(data.recetas);
    } catch (err) {}
  };

  const generarReceta = async (textoVoz = null) => {
    const textoFinal = textoVoz || prompt;
    if (!textoFinal.trim()) return;
    setCargando(true); setRespuestaIA(''); 
    
    try {
      const datosParseados = await generarRecetaIA({ textoBase: textoFinal, seccionActiva });
      if (datosParseados.receta_valida === false) {
        setRespuestaIA(datosParseados.historia);
        setRecetaActiva(null);
      } else {
        setRecetaActiva(datosParseados);
        setRespuestaIA(datosParseados.historia);
      }
    } catch (error) {
      setRespuestaIA(error.message);
    } finally {
      setCargando(false);
    }
  };

  const guardarReceta = async () => {
    if (!respuestaIA || !usuario?.id_usuario) return;
    setGuardando(true);
    try {
      const { status, data } = await apiGuardarReceta(usuario.id_usuario, prompt, recetaActiva, respuestaIA);
      if (data.success) {
        setMensajeGuardado('¡Guardada mijo! ❤️');
      } else {
        setMensajeGuardado(status === 409 ? 'Ya la tenías ❤️' : 'Error al guardar');
      }
      setTimeout(() => setMensajeGuardado(''), 3000);
    } catch (err) {} finally { setGuardando(false); }
  };



  return (
    <div className="app-container" style={{ background: fondoActivo, minHeight: '100vh', transition: 'background 1.5s ease' }}>
      
      {/* Top Navbar / "Cuaderno" button decoupled from the grid */}
      <div style={{ position: 'absolute', top: '20px', right: '40px', zIndex: 1000 }}>
        <button 
          className="glass-card" 
          onClick={() => setDashboardAbierto(true)} 
          style={{ padding: '12px 24px', color: 'white', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '15px', fontWeight: 'bold' }}>
          <span>📋</span> Cuaderno
        </button>
      </div>

      {/* Main App Layout: expansive width, 0 margin on body, no hard-coded maxWidth constraints */}
      <div style={{ display: 'flex', width: '100%', minHeight: '100vh', boxSizing: 'border-box' }}>
        
        {/* SIDEBAR NAVIGATION */}
        <div style={{ width: '320px', flexShrink: 0, paddingRight: '0' }}>
          <SidebarNavigation 
            seccionActiva={seccionActiva} 
            setSeccionActiva={setSeccionActiva}
            setPrompt={setPrompt}
            setRecetaActiva={setRecetaActiva}
            setRespuestaIA={setRespuestaIA}
            setFondoActivo={setFondoActivo}
            usuario={usuario}
          />
        </div>

        {/* MAIN PANEL CONTENT - Takes remaining 100% width, avoids squash */}
        <main style={{ flex: 1, padding: '40px 60px', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
          
          {/* HEADER SECTION (Global Headers) */}
          {!recetaActiva && seccionActiva !== 'perfil' && seccionActiva !== 'plan' && seccionActiva !== 'regiones' && (
            <div className="stagger-1" style={{ marginBottom: '60px', textAlign: 'center' }}>
              <h1 style={{ fontSize: '72px', fontWeight: '900', margin: '0 0 15px', letterSpacing: '-1.5px', color: 'white' }}>
                ¿Qué hay en el <span style={{ color: 'var(--primary)', textShadow: '0 4px 20px rgba(255,215,0,0.3)' }}>budare</span> hoy?
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '20px', margin: '0 auto', maxWidth: '700px', lineHeight: '1.6' }}>
                Genera tu menú ideal utilizando Inteligencia Artificial entrenada con pura sazón venezolana.
              </p>
            </div>
          )}

          {/* DYNAMIC VIEWS WRAPPER - Expanding to full remaining content width */}
          <div style={{ width: '100%', flex: 1, position: 'relative' }}>
            
            {/* SEARCH / NEVERA VIEW MODULE */}
            {['buscar', 'nevera'].includes(seccionActiva) && !recetaActiva && !cargando && (
              <SearchView 
                prompt={prompt} 
                setPrompt={setPrompt} 
                generarReceta={generarReceta} 
                cargando={cargando} 
                seccionActiva={seccionActiva} 
              />
            )}

            {/* ERROR / IA RESPONSE CHAT BOX */}
            {['buscar', 'nevera'].includes(seccionActiva) && !recetaActiva && !cargando && respuestaIA && (
              <div className="glass-card stagger-4" style={{ 
                padding: '50px', 
                textAlign: 'center', 
                margin: '0 auto', 
                maxWidth: '900px',
                marginTop: '40px',
                border: '1px solid rgba(239, 51, 64, 0.4)'
              }}>
                 <p style={{ fontSize: '20px', color: '#ffaaaa', margin: 0 }}>
                   <span style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}>👵🏽❌</span>
                   {respuestaIA}
                 </p>
              </div>
            )}

            {/* RECIPE DETAIL IMMERSIVE VIEW MODULE */}
            {recetaActiva && !cargando && (
              <RecipeDetailView 
                recetaActiva={recetaActiva} 
                guardarReceta={guardarReceta} 
                guardando={guardando} 
                mensajeGuardado={mensajeGuardado} 
                setRecetaActiva={setRecetaActiva}
                setPrompt={setPrompt}
                setRespuestaIA={setRespuestaIA}
              />
            )}
            
            {/* CARGANDO */}
            {cargando && (
              <div className="glass-card" style={{ padding: '100px 40px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
                <div style={{ width: '50px', height: '50px', border: '4px solid rgba(255,255,0,0.1)', borderTopColor: '#FFD700', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 25px auto' }}></div>
                <p style={{ color: '#FFD700', fontSize: '18px', fontWeight: 'bold' }}>Cocinando tu solicitud, mijo...</p>
              </div>
            )}

            {/* DESCUBRIR */}
            {seccionActiva === 'descubrir' && !recetaActiva && !cargando && (
              <DiscoverFeed apiKey={import.meta.env.VITE_GROQ_API_KEY} onSelectRecipe={(tit) => { setPrompt(tit); generarReceta(tit); }} />
            )}

            {/* EXPLORAR REGIONES */}
            {seccionActiva === 'regiones' && !recetaActiva && !cargando && (
              <RegionesView setPrompt={setPrompt} generarReceta={generarReceta} />
            )}

            {/* PLAN SEMANAL */}
            {seccionActiva === 'plan' && !recetaActiva && !cargando && (
              <PlanSemanalView usuario={usuario} />
            )}

            {/* RECETAS GUARDADAS */}
            {seccionActiva === 'guardadas' && !recetaActiva && !cargando && (
              <div className="stagger-3" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '30px', fontWeight: '800' }}>❤️ Tus Recetas Guardadas</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                   {recetasGuardadasLocales.map(receta => (
                     <div key={receta.id_receta} className="glass-card" style={{ cursor: 'pointer', padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#FFD700', fontSize: '32px' }}>🍽️</span>
                        </div>
                        <h3 style={{ fontSize: '20px', margin: 0, fontWeight: '800' }}>{receta.titulo}</h3>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Venia Recetas</p>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {/* PERFIL */}
            {seccionActiva === 'perfil' && (
              <ProfileView usuario={usuario} onActualizarUsuario={onActualizarUsuario} />
            )}
          </div>
        </main>
      </div>

      <Dashboard abierto={dashboardAbierto} onCerrar={() => setDashboardAbierto(false)} usuario={usuario} onLogout={onLogout} apiKey={import.meta.env.VITE_GROQ_API_KEY} />
    </div>
  );
};

export default MenuRecetario;

