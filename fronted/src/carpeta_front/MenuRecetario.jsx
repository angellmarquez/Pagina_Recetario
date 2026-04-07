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
import CinematicLoader from './components/CinematicLoader';
import TimerIA from './components/TimerIA';
import { generarRecetaIA, generarPlanIA } from './services/aiService';
import { apiGuardarReceta, apiObtenerRecetasUsuario, apiEliminarReceta } from './services/apiService';

const MenuRecetario = ({ usuario, onLogout, onActualizarUsuario, irARecuperar }) => {
  const [prompt, setPrompt] = useState('');
  const [respuestaIA, setRespuestaIA] = useState('');
  const [cargando, setCargando] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState('descubrir'); 
  const [dashboardAbierto, setDashboardAbierto] = useState(false);
  const [fondoActivo, setFondoActivo] = useState('var(--bg-gradient)');
  const [notificaciones, setNotificaciones] = useState([]);
  const [perfilSucio, setPerfilSucio] = useState(false);
  const [seccionPendiente, setSeccionPendiente] = useState(null);
  const [mostrarAlertaNavegacion, setMostrarAlertaNavegacion] = useState(false);
  
  // Estado para Límite de Tokens / Rate Limit
  const [lockIAUntil, setLockIAUntil] = useState(null);
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  
  const addNotification = (titulo, mensaje, tipo = 'info') => {
    setNotificaciones(prev => [{ titulo, mensaje, tipo, fecha: new Date() }, ...prev]);
  };

  const sugerirRecomendacion = () => {
    const momentos = [
      'un desayuno energético y creativo', 
      'un almuerzo casero reconfortante con un toque gourmet', 
      'una cena ligera, elegante y nutritiva', 
      'un snack innovador para media tarde',
      'un plato exótico para viajar con el paladar',
      'algo saludable que se sienta como un capricho',
      'un festín tradicional venezolano con técnicas modernas'
    ];
    const randomMoment = momentos[Math.floor(Math.random() * momentos.length)];
    const nombre = usuario?.nombre || 'amigo';
    
    // Obtener etiquetas del usuario
    const allTags = Array.isArray(usuario?.preferencias_dieteticas) 
      ? usuario.preferencias_dieteticas.map(p => p?.nombre || p) 
      : [];
    
    // Seleccionar subconjunto aleatorio (máx 3) para no saturar a la IA y dar variedad
    const selectedTags = [...allTags]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
      
    const dietaStr = selectedTags.length > 0 ? selectedTags.join(', ') : '';

    // Obtener títulos de recetas recientes para evitar repetición
    const titulosEvitar = recentRecipes.map(r => r.titulo).slice(0, 5);

    let promptPersonalizado = `Actúa como un Chef Personal de alta gama. Sorprende a ${nombre} con ${randomMoment}.`;
    
    if (dietaStr) {
      promptPersonalizado += ` Prioriza estos gustos/dietas del perfil: ${dietaStr}.`;
    }

    if (titulosEvitar.length > 0) {
      promptPersonalizado += ` IMPORTANTE: NO sugieras ninguna de estas recetas recientes: ${titulosEvitar.join(', ')}.`;
    }

    // Cambiar a vista de búsqueda y ejecutar
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
    if (seccionActiva === 'guardadas' && usuario?.id_usuario) { cargarRecetasGuardadas(); }
  }, [seccionActiva, usuario]);

  // Manejo del contador de bloqueo de IA
  useEffect(() => {
    let interval = null;
    if (lockIAUntil) {
      interval = setInterval(() => {
        const diff = Math.ceil((lockIAUntil - Date.now()) / 1000);
        if (diff <= 0) {
          setLockIAUntil(null);
          setSegundosRestantes(0);
          if (interval) clearInterval(interval);
        } else {
          setSegundosRestantes(diff);
        }
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [lockIAUntil]);

  const cargarRecetasGuardadas = async () => {
    try {
      const data = await apiObtenerRecetasUsuario(usuario.id_usuario);
      if (data.success) setRecetasGuardadasLocales(data.recetas);
    } catch (err) {}
  };

  const generarReceta = async (textoVoz = null, origin = null) => {
    if (lockIAUntil && Date.now() < lockIAUntil) return;
    const textoFinal = textoVoz || prompt;
    if (!textoFinal.trim()) return;
    setCargando(true); setRespuestaIA(''); 
    try {
      const originToUse = origin || (seccionActiva === 'explorar_pais' ? paisSeleccionado?.tipo : (seccionActiva === 'regiones' ? 'region' : null));
      const datosParseados = await generarRecetaIA({ textoBase: textoFinal, seccionActiva, origin: originToUse, pais: paisSeleccionado?.nombre || paisSeleccionado });
      if (datosParseados.receta_valida === false) { setRespuestaIA(datosParseados.historia); setRecetaActiva(null); }
      else {
        setRecetaActiva(datosParseados); setRespuestaIA(datosParseados.historia);
        const updatedHistory = [datosParseados, ...recentRecipes.filter(r => r.titulo !== datosParseados.titulo)].slice(0, 6);
        setRecentRecipes(updatedHistory); localStorage.setItem('venia_recent_history_v2', JSON.stringify(updatedHistory));
      }
    } catch (error) { 
      if (error.type === 'RATE_LIMIT') {
        const waitTime = (error.segundos || 60) * 1000;
        setLockIAUntil(Date.now() + waitTime);
        addNotification('¡Abuela Ocupada!', 'Demasiadas consultas seguidas. Dame un respiro.', 'warning');
      } else {
        setRespuestaIA(error.message || 'Error de conexión.'); 
      }
    } finally { setCargando(false); }
  };

  const guardarReceta = async () => {
    if (!respuestaIA || !usuario?.id_usuario) return;
    setGuardando(true);
    try {
      const { data } = await apiGuardarReceta(usuario.id_usuario, recetaActiva?.titulo || prompt, recetaActiva, respuestaIA);
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

  const navegarSeguro = (proximaSeccion) => {
    if (perfilSucio && proximaSeccion !== seccionActiva) {
      setSeccionPendiente(proximaSeccion);
      setMostrarAlertaNavegacion(true);
    } else {
      setSeccionActiva(proximaSeccion);
    }
  };

  const confirmarNavegacion = () => {
    setPerfilSucio(false);
    setSeccionActiva(seccionPendiente);
    setMostrarAlertaNavegacion(false);
    setSeccionPendiente(null);
  };

  return (
    <div className="app-container" style={{ 
      background: 'radial-gradient(ellipse at 0% 0%, rgba(46,125,94,0.06) 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(30,58,95,0.05) 0%, transparent 50%), linear-gradient(135deg, #f9f6f1 0%, #ffffff 50%, #f3ede4 100%)',
      minHeight: '100vh', 
      transition: 'background 1.5s ease' 
    }}>
      <div style={{ position: 'absolute', top: '20px', right: '40px', zIndex: 1000 }}>
        <button className="glass-card" onClick={() => setDashboardAbierto(true)} style={{ padding: '12px 24px', color: 'var(--text-primary)', background: 'rgba(0,0,0,0.03)', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span>🔔</span> Notificaciones {notificaciones.length > 0 && <span className="notif-count">{notificaciones.length}</span>}
        </button>
      </div>

      <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
        <SidebarNavigation 
           seccionActiva={seccionActiva} 
           setSeccionActiva={navegarSeguro} 
           setPrompt={setPrompt} 
           setRecetaActiva={setRecetaActiva} 
           setRespuestaIA={setRespuestaIA} 
           setFondoActivo={setFondoActivo} 
           usuario={usuario} 
           onRecomendar={sugerirRecomendacion} 
        />
        <main style={{ flex: 1, padding: '40px 60px' }}>
          <div style={{ width: '100%', flex: 1, position: 'relative' }}>
            {['buscar', 'descubrir', 'nevera'].includes(seccionActiva) && !recetaActiva && !cargando && (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <SearchView prompt={prompt} setPrompt={setPrompt} generarReceta={generarReceta} cargando={cargando} seccionActiva={seccionActiva} recentRecipes={recentRecipes} onSelectRecipe={(r) => { setRecetaActiva(r); setRespuestaIA(r.historia); }} onClearHistory={() => { setRecentRecipes([]); localStorage.removeItem('venia_recent_history_v2'); }} lockIAUntil={lockIAUntil} />
                  {seccionActiva === 'descubrir' && <DiscoverFeed onSelectRecipe={(tit) => { setPrompt(tit); generarReceta(tit); }} />}
                </div>
            )}
            {recetaActiva && !cargando && <RecipeDetailView recetaActiva={recetaActiva} guardarReceta={guardarReceta} guardando={guardando} mensajeGuardado={mensajeGuardado} setRecetaActiva={setRecetaActiva} setPrompt={setPrompt} setRespuestaIA={setRespuestaIA} />}
            
            {/* Display AI Message when validation fails or for feedback */}
            {respuestaIA && !recetaActiva && !cargando && (
              <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center',
                background: 'rgba(10, 15, 29, 0.8)', backdropFilter: 'blur(10px)',
                animation: 'fadeIn 0.3s ease'
              }} onClick={() => setRespuestaIA('')}>
                <div 
                  className="glass-panel-premium" 
                  style={{ 
                    padding: '60px', textAlign: 'center', maxWidth: '600px', 
                    boxShadow: '0 30px 100px rgba(0,0,0,0.8)',
                    animation: 'shakeCard 0.5s cubic-bezier(.36,.07,.19,.97) both'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ fontSize: '70px', marginBottom: '20px' }}>👵🏽</div>
                  <h3 style={{ fontSize: '32px', color: '#EF4444', marginBottom: '20px', fontWeight: '900', letterSpacing: '-1px' }}>¡Mijo, ten cuidado!</h3>
                  <p style={{ fontSize: '20px', lineHeight: '1.6', color: 'var(--text-primary)', opacity: 0.9, fontWeight: '500' }}>{respuestaIA}</p>
                  <button 
                    className="btn-gold" 
                    onClick={() => setRespuestaIA('')}
                    style={{ marginTop: '40px', padding: '15px 50px', borderRadius: '100px', fontSize: '16px', fontWeight: '800' }}
                  >
                    LO SIENTO, ABUELA
                  </button>
                </div>
              </div>
            )}

            {/* NAVIGATION WARNING MODAL (ABUELA) */}
            {mostrarAlertaNavegacion && (
              <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center',
                background: 'rgba(10, 15, 29, 0.9)', backdropFilter: 'blur(20px)',
                animation: 'fadeIn 0.3s ease'
              }}>
                <div 
                  className="glass-panel-premium" 
                  style={{ 
                    padding: '60px', textAlign: 'center', maxWidth: '550px', 
                    boxShadow: '0 30px 100px rgba(0,0,0,0.8)',
                    animation: 'shakeCard 0.5s cubic-bezier(.36,.07,.19,.97) both',
                    border: '1px solid #EF4444'
                  }}
                >
                  <div style={{ fontSize: '70px', marginBottom: '20px' }}>👵🏽☝🏽</div>
                  <h3 style={{ fontSize: '32px', color: '#EF4444', marginBottom: '20px', fontWeight: '900', letterSpacing: '-1px' }}>¡Mijo, no te vayas todavía!</h3>
                  <p style={{ fontSize: '20px', lineHeight: '1.6', color: 'var(--text-primary)', opacity: 0.9, fontWeight: '500' }}>
                    Tienes cambios sin guardar en tu perfil. Si te vas ahora, la abuela se va a enojar porque se perderá tu progreso.
                  </p>
                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '40px' }}>
                    <button 
                      className="btn-gold" 
                      onClick={() => setMostrarAlertaNavegacion(false)}
                      style={{ background: 'transparent', border: '1px solid var(--outline-variant)', color: 'var(--text-primary)' }}
                    >
                      VOLVER Y GUARDAR
                    </button>
                    <button 
                      className="btn-gold" 
                      onClick={confirmarNavegacion}
                      style={{ background: '#EF4444', color: 'var(--text-primary)' }}
                    >
                      IRME SIN GUARDAR
                    </button>
                  </div>
                </div>
              </div>
            )}

            <style>{`
              @keyframes shakeCard {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                40%, 60% { transform: translate3d(4px, 0, 0); }
              }
            `}</style>

            <CinematicLoader visible={cargando} />
            {seccionActiva === 'regiones' && !recetaActiva && !cargando && <RegionesView setPrompt={setPrompt} generarReceta={generarReceta} setSeccionActiva={setSeccionActiva} setPaisSeleccionado={setPaisSeleccionado} lockIAUntil={lockIAUntil} />}
            {seccionActiva === 'explorar_pais' && !recetaActiva && !cargando && <CountryExplorationView pais={paisSeleccionado?.nombre || paisSeleccionado} tipoLugar={paisSeleccionado?.tipo || 'world-map'} prompt={prompt} setPrompt={setPrompt} generarReceta={generarReceta} cargando={cargando} onVolver={() => setSeccionActiva('regiones')} lockIAUntil={lockIAUntil} />}
            {seccionActiva === 'plan' && !recetaActiva && !cargando && <PlanSemanalView usuario={usuario} addNotification={addNotification} onActualizarUsuario={onActualizarUsuario} lockIAUntil={lockIAUntil} onRateLimit={(s) => setLockIAUntil(Date.now() + (s * 1000))} />}
            
            {/* RESTORED PROFESSIONAL GRID FOR SAVED RECIPES */}
            {seccionActiva === 'guardadas' && !recetaActiva && !cargando && (
              <div className="stagger-3" style={{ width: '100%' }}>
                <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '40px', letterSpacing: '-2px' }}>Colección <span>Personal</span></h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '32px' }}>
                  {recetasGuardadasLocales.map((r) => (
                    <div key={r.id_receta} className="glass-card" style={{ cursor: 'pointer', padding: 0, overflow: 'hidden', transition: 'all 0.5s ease', height: '420px', display: 'flex', flexDirection: 'column' }}
                         onClick={() => { const d = JSON.parse(r.descripcion); setRecetaActiva(d); setRespuestaIA(d.historia); }}>
                      <div style={{ position: 'relative', width: '100%', height: '260px' }}>
                        <img src={getRecipeImage(r.titulo)} alt={r.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(15, 23, 42, 1) 0%, transparent 100%)' }} />
                        <button onClick={(e) => handleEliminarReceta(e, r.id_receta)} 
                                 style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(239, 68, 68, 0.5)', border: 'none', width: '44px', height: '44px', borderRadius: '50%', color: 'var(--text-primary)', backdropFilter: 'blur(10px)', cursor: 'pointer', transition: '0.3s' }}
                                 onMouseOver={(e) => e.target.style.background = '#EF4444'}>🗑️</button>
                      </div>
                      <div style={{ padding: '30px', marginTop: '-30px', position: 'relative', zIndex: 2 }}>
                        <span style={{ background: 'var(--primary)', color: 'var(--on-primary)', padding: '5px 12px', borderRadius: '40px', fontSize: '11px', fontWeight: '900', display: 'inline-block', marginBottom: '12px' }}>RECETA GUARDADA</span>
                        <h3 style={{ fontSize: '24px', fontWeight: '900', margin: 0, lineHeight: 1.1 }}>{r.titulo}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '8px 0 0' }}>Preparada por VenIA MasterChef</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {seccionActiva === 'perfil' && (
              <ProfileView 
                usuario={usuario} 
                onActualizarUsuario={onActualizarUsuario} 
                onDirtyStateChange={(isDirty) => setPerfilSucio(isDirty)}
                onLogout={onLogout}
                irARecuperar={irARecuperar}
              />
            )}
          </div>
        </main>
      </div>
      <Footer setSeccionActiva={navegarSeguro} />
      <NotificationsPanel abierto={dashboardAbierto} onCerrar={() => setDashboardAbierto(false)} notificaciones={notificaciones} />
      
      {/* Temporizador de la Abuela (Rate Limit) */}
      {segundosRestantes > 0 && <TimerIA segundos={segundosRestantes} />}
    </div>
  );
};

export default MenuRecetario;
