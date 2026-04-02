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
import { generarRecetaIA, generarPlanIA } from './services/aiService';
import { apiGuardarReceta, apiObtenerRecetasUsuario, apiEliminarReceta, apiGuardarPlanSemanal } from './services/apiService';

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
    // Elemento aleatorio para garantizar variedad
    const momentos = [
      'algo reconfortante y casero', 'un plato exótico y sorprendente', 'algo ligero y saludable',
      'un festín digno de celebración', 'un plato rápido pero delicioso', 'algo con mucho sabor y especias',
      'una receta tradicional venezolana poco conocida', 'algo cremoso y contundente',
      'un plato con proteína fuerte', 'algo fresco y colorido'
    ];
    const random = momentos[Math.floor(Math.random() * momentos.length)];

    // Personalización con datos del usuario
    const nombre = usuario?.nombre || 'amigo';
    const dieta = Array.isArray(usuario?.preferencias_dieteticas)
      ? usuario.preferencias_dieteticas.map(p => p?.nombre || p).filter(Boolean).join(', ')
      : (usuario?.preferencias_dieteticas || '');
    const hora = new Date().getHours();
    const momentoDia = hora < 11 ? 'desayuno' : hora < 16 ? 'almuerzo' : 'cena';

    let promptPersonalizado = `Sorprende a ${nombre} con una receta perfecta para ${momentoDia}. Quiero ${random}.`;
    if (dieta) promptPersonalizado += ` Respeta estas preferencias dietéticas: ${dieta}.`;
    promptPersonalizado += ` Hazlo único, diferente a lo de siempre, y que sea un plato venezolano auténtico o latinoamericano.`;

    setSeccionActiva('buscar');
    setPrompt(promptPersonalizado);
    generarReceta(promptPersonalizado);
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

  const generarReceta = async (textoVoz = null, origin = null) => {
    const textoFinal = textoVoz || prompt;
    if (!textoFinal.trim()) return;
    setCargando(true); setRespuestaIA(''); 
    
    try {
      const originToUse = origin || (paisSeleccionado?.tipo) || (seccionActiva === 'regiones' ? 'region' : null);
      const datosParseados = await generarRecetaIA({ 
        textoBase: textoFinal, 
        seccionActiva,
        origin: originToUse,
        pais: paisSeleccionado?.nombre || paisSeleccionado
      });
      if (datosParseados.receta_valida === false) {
        setRespuestaIA(datosParseados.historia);
        setRecetaActiva(null);
      } else {
        setRecetaActiva(datosParseados);
        setRespuestaIA(datosParseados.historia);
        
        // Add to history if valid
        const updatedHistory = [
          datosParseados,
          ...recentRecipes.filter(r => r.titulo !== datosParseados.titulo)
        ].slice(0, 6);
        setRecentRecipes(updatedHistory);
        localStorage.setItem('venia_recent_history_v2', JSON.stringify(updatedHistory));
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
        addNotification('Receta Guardada', `La receta "${recetaActiva.titulo}" se guardó en tu cuaderno.`, 'success');
      } else {
        setMensajeGuardado(status === 409 ? 'Ya la tenías ❤️' : 'Error al guardar');
      }
      setTimeout(() => setMensajeGuardado(''), 3000);
    } catch (err) {} finally { setGuardando(false); }
  };

  const handleEliminarReceta = async (e, id_receta) => {
    e.stopPropagation();
    try {
      const res = await apiEliminarReceta(usuario.id_usuario, id_receta);
      if (res.success) {
        setRecetasGuardadasLocales(prev => prev.filter(r => r.id_receta !== id_receta));
      }
    } catch (err) {
      console.error("Error al eliminar", err);
    }
  };


  return (
    <div className="app-container" style={{ background: fondoActivo, minHeight: '100vh', transition: 'background 1.5s ease' }}>
      
      {/* Top Navbar / "Notificaciones" button decoupled from the grid */}
      <div style={{ position: 'absolute', top: '20px', right: '40px', zIndex: 1000 }}>
        <button 
          className="glass-card" 
          onClick={() => setDashboardAbierto(true)} 
          style={{ padding: '12px 24px', color: 'white', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '15px', fontWeight: 'bold', position: 'relative' }}>
          <span>🔔</span> Notificaciones
          {notificaciones.length > 0 && (
            <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#EF3340', color: 'white', border: '2px solid var(--surface-container)', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
              {notificaciones.length}
            </span>
          )}
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
            onRecomendar={sugerirRecomendacion}
          />
        </div>

        {/* MAIN PANEL CONTENT - Takes remaining 100% width, avoids squash */}
        <main style={{ flex: 1, padding: '40px 60px', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
          
          {/* Dynamic Headers removed as they are now part of SearchView */}


          {/* DYNAMIC VIEWS WRAPPER - Expanding to full remaining content width */}
          <div style={{ width: '100%', flex: 1, position: 'relative' }}>
            
            {/* UNIFIED SEARCH & DISCOVER VIEW */}
            {['buscar', 'descubrir'].includes(seccionActiva) && !recetaActiva && !cargando && (
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <SearchView 
                  prompt={prompt} 
                  setPrompt={setPrompt} 
                  generarReceta={generarReceta} 
                  cargando={cargando} 
                  seccionActiva={seccionActiva} 
                  recentRecipes={recentRecipes}
                  onSelectRecipe={(r) => { 
                    setRecetaActiva(r); 
                    setRespuestaIA(r.historia); 
                  }}
                  onClearHistory={() => {
                    setRecentRecipes([]);
                    localStorage.removeItem('venia_recent_history_v2');
                  }}
                />
                
                <DiscoverFeed 
                  apiKey={import.meta.env.VITE_GROQ_API_KEY} 
                  onSelectRecipe={(tit) => { setPrompt(tit); generarReceta(tit); }} 
                />
              </div>
            )}

            {/* NEVERA VIEW (Focused) */}
            {seccionActiva === 'nevera' && !recetaActiva && !cargando && (
                <SearchView 
                  prompt={prompt} 
                  setPrompt={setPrompt} 
                  generarReceta={generarReceta} 
                  cargando={cargando} 
                  seccionActiva={seccionActiva} 
                  recentRecipes={recentRecipes}
                  onSelectRecipe={(r) => { 
                    setRecetaActiva(r); 
                    setRespuestaIA(r.historia); 
                  }}
                  onClearHistory={() => {
                    setRecentRecipes([]);
                    localStorage.removeItem('venia_recent_history_v2');
                  }}
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

            {/* DESCUBRIR (handled by unified view above) */}


            {/* EXPLORAR REGIONES */}
            {seccionActiva === 'regiones' && !recetaActiva && !cargando && (
              <RegionesView 
                setPrompt={setPrompt} 
                generarReceta={generarReceta} 
                setSeccionActiva={setSeccionActiva}
                setPaisSeleccionado={setPaisSeleccionado}
              />
            )}

            {/* EXPLORACION PAIS / ESTADO ESPECIFICO */}
            {seccionActiva === 'explorar_pais' && !recetaActiva && !cargando && (
              <CountryExplorationView 
                pais={paisSeleccionado?.nombre || paisSeleccionado}
                tipoLugar={paisSeleccionado?.tipo || 'world-map'}
                prompt={prompt}
                setPrompt={setPrompt}
                generarReceta={generarReceta}
                cargando={cargando}
                onVolver={() => setSeccionActiva('regiones')}
              />
            )}

            {/* PLAN SEMANAL */}
            {seccionActiva === 'plan' && !recetaActiva && !cargando && (
              <PlanSemanalView usuario={usuario} addNotification={addNotification} />
            )}

            {/* RECETAS GUARDADAS */}
            {seccionActiva === 'guardadas' && !recetaActiva && !cargando && (
              <div className="stagger-3" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '32px', marginBottom: '30px', fontWeight: '800' }}>❤️ Tus Recetas Guardadas</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                   {recetasGuardadasLocales.map(receta => (
                     <div key={receta.id_receta} className="glass-card" style={{ cursor: 'pointer', padding: '0', display: 'flex', flexDirection: 'column', gap: '0', overflow: 'hidden' }}
                          onClick={() => {
                            try {
                              const detail = JSON.parse(receta.descripcion);
                              setRecetaActiva(detail);
                              setRespuestaIA(detail.historia);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            } catch (e) {
                              console.error("Error parsing saved recipe:", e);
                            }
                          }}
                     >
                        <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                           <img src={getRecipeImage(receta.titulo)} alt={receta.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                           <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(15, 23, 42, 1) 0%, transparent 100%)' }}></div>
                           <button 
                             onClick={(e) => handleEliminarReceta(e, receta.id_receta)}
                             style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(239, 68, 68, 0.8)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', transition: 'transform 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
                             title="Eliminar receta"
                             onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                             onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                           >
                              🗑️
                           </button>
                        </div>
                        <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 1, marginTop: '-30px' }}>
                           <div style={{ display: 'flex', gap: '8px' }}>
                             <span style={{ background: 'var(--primary)', color: 'var(--on-primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>GUARDADA</span>
                           </div>
                           <h3 style={{ fontSize: '22px', margin: 0, fontWeight: '800', lineHeight: '1.2', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{receta.titulo}</h3>
                           <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Venia Recetas AI</p>
                        </div>
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

      {/* GLOBAL FOOTER - Full Width and Below Sidebar/Content */}
      <Footer setSeccionActiva={setSeccionActiva} />

      <NotificationsPanel 
        abierto={dashboardAbierto} 
        onCerrar={() => setDashboardAbierto(false)} 
        notificaciones={notificaciones}
      />
    </div>
  );
};

export default MenuRecetario;

