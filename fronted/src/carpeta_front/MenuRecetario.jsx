import React, { useState, useEffect } from 'react';
import NotificationsPanel from './components/NotificationsPanel';
import DiscoverFeed from './DiscoverFeed';
import SidebarNavigation from './components/SidebarNavigation';
import SearchView, { getRecipeImage } from './views/SearchView';
import RecipeDetailView from './views/RecipeDetailView';
import RegionesView from './views/RegionesView';
import PlanSemanalView from './views/PlanSemanalView';
import ProfileView from './views/ProfileView';
import CountryExplorationView from './views/CountryExplorationView';
import Footer from './components/Footer';
import RecipeImage from './components/RecipeImage';
import { generarRecetaIA, generarPlanIA } from './services/aiService';
import { apiGuardarReceta, apiObtenerRecetasUsuario, apiEliminarReceta } from './services/apiService';

const MenuRecetario = ({ usuario, onLogout, onActualizarUsuario }) => {
  const [prompt, setPrompt] = useState('');
  const [respuestaIA, setRespuestaIA] = useState('');
  const [cargando, setCargando] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState('descubrir'); 
  const [dashboardAbierto, setDashboardAbierto] = useState(false);
  const [fondoActivo, setFondoActivo] = useState('var(--bg-gradient)');
  const [notificaciones, setNotificaciones] = useState([]);
  
  const addNotification = (titulo, mensaje, tipo = 'info') => {
    setNotificaciones(prev => [{ titulo, mensaje, tipo, fecha: new Date() }, ...prev]);
  };

  const sugerirRecomendacion = () => {
    const momentos = ['algo reconfortante', 'un plato exótico', 'algo saludable', 'un festín tradicional'];
    const random = momentos[Math.floor(Math.random() * momentos.length)];
    const nombre = usuario?.nombre || 'amigo';
    const dieta = Array.isArray(usuario?.preferencias_dieteticas) ? usuario.preferencias_dieteticas.map(p => p?.nombre || p).join(', ') : '';
    let promptPersonalizado = `Sorprende a ${nombre} con un ${random}.`;
    if (dieta) promptPersonalizado += ` Dieta: ${dieta}.`;
    setSeccionActiva('buscar'); setPrompt(promptPersonalizado); generarReceta(promptPersonalizado);
  };

  const [guardando, setGuardando] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState('');
  const [recetaActiva, setRecetaActiva] = useState(null);
  const [recetasGuardadasLocales, setRecetasGuardadasLocales] = useState([]);
  const [recentRecipes, setRecentRecipes] = useState(() => {
    const saved = localStorage.getItem('venia_recent_history_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [paisSeleccionado, setPaisSeleccionado] = useState(null);

  useEffect(() => {
    if (seccionActiva === 'guardadas' && usuario?.id_usuario) { cargarRecetasGuardadas(); }
  }, [seccionActiva, usuario]);

  const cargarRecetasGuardadas = async () => {
    try {
      const data = await apiObtenerRecetasUsuario(usuario.id_usuario);
      if (data.success) setRecetasGuardadasLocales(data.recetas);
    } catch (err) {}
  };

  const generarReceta = async (textoVoz = null, origin = null) => {
    const textoFinal = textoVoz || prompt;
    if (!textoFinal.trim()) return;
    setCargando(true); setRespuestaIA(''); 
    try {
      const originToUse = origin || paisSeleccionado?.tipo || (seccionActiva === 'regiones' ? 'region' : null);
      const datosParseados = await generarRecetaIA({ textoBase: textoFinal, seccionActiva, origin: originToUse, pais: paisSeleccionado?.nombre || paisSeleccionado });
      if (datosParseados.receta_valida === false) { setRespuestaIA(datosParseados.historia); setRecetaActiva(null); }
      else {
        setRecetaActiva(datosParseados); setRespuestaIA(datosParseados.historia);
        const updatedHistory = [datosParseados, ...recentRecipes.filter(r => r.titulo !== datosParseados.titulo)].slice(0, 6);
        setRecentRecipes(updatedHistory); localStorage.setItem('venia_recent_history_v2', JSON.stringify(updatedHistory));
      }
    } catch (error) { setRespuestaIA('Error de conexión.'); } finally { setCargando(false); }
  };

  const guardarReceta = async () => {
    if (!respuestaIA || !usuario?.id_usuario) return;
    setGuardando(true);
    try {
      const { data } = await apiGuardarReceta(usuario.id_usuario, prompt, recetaActiva, respuestaIA);
      if (data.success) {
        setMensajeGuardado('¡Guardada! ❤️');
        addNotification('Receta Guardada', `"${recetaActiva.titulo}" archivada con éxito.`, 'success');
      }
      setTimeout(() => setMensajeGuardado(''), 3000);
    } catch (err) {} finally { setGuardando(false); }
  };

  const handleEliminarReceta = async (e, id_receta) => {
    e.stopPropagation();
    try {
      const res = await apiEliminarReceta(usuario.id_usuario, id_receta);
      if (res.success) { setRecetasGuardadasLocales(prev => prev.filter(r => r.id_receta !== id_receta)); }
    } catch (err) {}
  };

  return (
    <div className="app-container" style={{ background: fondoActivo, minHeight: '100vh', transition: 'background 1.5s ease' }}>
      <div style={{ position: 'absolute', top: '20px', right: '40px', zIndex: 1000 }}>
        <button className="glass-card" onClick={() => setDashboardAbierto(true)} style={{ padding: '12px 24px', color: 'white', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span>🔔</span> Notificaciones {notificaciones.length > 0 && <span className="notif-count">{notificaciones.length}</span>}
        </button>
      </div>

      <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
        <SidebarNavigation seccionActiva={seccionActiva} setSeccionActiva={setSeccionActiva} setPrompt={setPrompt} setRecetaActiva={setRecetaActiva} setRespuestaIA={setRespuestaIA} setFondoActivo={setFondoActivo} usuario={usuario} onRecomendar={sugerirRecomendacion} />
        <main style={{ flex: 1, padding: '40px 60px' }}>
          <div style={{ width: '100%', flex: 1, position: 'relative' }}>
            {['buscar', 'descubrir', 'nevera'].includes(seccionActiva) && !recetaActiva && !cargando && (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <SearchView prompt={prompt} setPrompt={setPrompt} generarReceta={generarReceta} cargando={cargando} seccionActiva={seccionActiva} recentRecipes={recentRecipes} onSelectRecipe={(r) => { setRecetaActiva(r); setRespuestaIA(r.historia); }} onClearHistory={() => { setRecentRecipes([]); localStorage.removeItem('venia_recent_history_v2'); }} />
                  {seccionActiva === 'descubrir' && <DiscoverFeed apiKey={import.meta.env.VITE_GROQ_API_KEY} onSelectRecipe={(tit) => { setPrompt(tit); generarReceta(tit); }} />}
                </div>
            )}
            {recetaActiva && !cargando && <RecipeDetailView recetaActiva={recetaActiva} guardarReceta={guardarReceta} guardando={guardando} mensajeGuardado={mensajeGuardado} setRecetaActiva={setRecetaActiva} setPrompt={setPrompt} setRespuestaIA={setRespuestaIA} />}
            {cargando && <div className="glass-card loading-box"><div className="loader"></div><p>Cocinando...</p></div>}
            {seccionActiva === 'regiones' && !recetaActiva && !cargando && <RegionesView setPrompt={setPrompt} generarReceta={generarReceta} setSeccionActiva={setSeccionActiva} setPaisSeleccionado={setPaisSeleccionado} />}
            {seccionActiva === 'explorar_pais' && !recetaActiva && !cargando && <CountryExplorationView pais={paisSeleccionado?.nombre || paisSeleccionado} tipoLugar={paisSeleccionado?.tipo || 'world-map'} prompt={prompt} setPrompt={setPrompt} generarReceta={generarReceta} cargando={cargando} onVolver={() => setSeccionActiva('regiones')} />}
            {seccionActiva === 'plan' && !recetaActiva && !cargando && <PlanSemanalView usuario={usuario} addNotification={addNotification} onActualizarUsuario={onActualizarUsuario} />}
            
            {/* RESTORED PROFESSIONAL GRID FOR SAVED RECIPES */}
            {seccionActiva === 'guardadas' && !recetaActiva && !cargando && (
              <div className="stagger-3" style={{ width: '100%' }}>
                <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '40px', letterSpacing: '-2px' }}>Personal <span>Collection</span></h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '32px' }}>
                  {recetasGuardadasLocales.map((r) => (
                    <div key={r.id_receta} className="glass-card" style={{ cursor: 'pointer', padding: 0, overflow: 'hidden', transition: 'all 0.5s ease', height: '420px', display: 'flex', flexDirection: 'column' }}
                         onClick={() => { const d = JSON.parse(r.descripcion); setRecetaActiva(d); setRespuestaIA(d.historia); }}>
                      <div style={{ position: 'relative', width: '100%', height: '260px' }}>
                        <img src={getRecipeImage(r.titulo)} alt={r.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(15, 23, 42, 1) 0%, transparent 100%)' }} />
                        <button onClick={(e) => handleEliminarReceta(e, r.id_receta)} 
                                 style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(239, 68, 68, 0.5)', border: 'none', width: '44px', height: '44px', borderRadius: '50%', color: 'white', backdropFilter: 'blur(10px)', cursor: 'pointer', transition: '0.3s' }}
                                 onMouseOver={(e) => e.target.style.background = '#EF4444'}>🗑️</button>
                      </div>
                      <div style={{ padding: '30px', marginTop: '-30px', position: 'relative', zIndex: 2 }}>
                        <span style={{ background: 'var(--primary)', color: 'var(--on-primary)', padding: '5px 12px', borderRadius: '40px', fontSize: '11px', fontWeight: '900', display: 'inline-block', marginBottom: '12px' }}>COLLECTION ITEM</span>
                        <h3 style={{ fontSize: '24px', fontWeight: '900', margin: 0, lineHeight: 1.1 }}>{r.titulo}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '8px 0 0' }}>Sourced by VenIA MasterChef</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {seccionActiva === 'perfil' && <ProfileView usuario={usuario} onActualizarUsuario={onActualizarUsuario} />}
          </div>
        </main>
      </div>
      <Footer setSeccionActiva={setSeccionActiva} />
      <NotificationsPanel abierto={dashboardAbierto} onCerrar={() => setDashboardAbierto(false)} notificaciones={notificaciones} />
    </div>
  );
};

export default MenuRecetario;
