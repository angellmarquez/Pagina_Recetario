import React, { useState, useEffect } from 'react';
import { generarPlanIA } from '../services/aiService';
import { apiGuardarReceta } from '../services/apiService';
import CinematicLoader from '../components/CinematicLoader';
import './PlanSemanal.css';

const PlanSemanalView = ({ usuario, addNotification, onActualizarUsuario, lockIAUntil, onRateLimit }) => {
  const [fechaActual, setFechaActual] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setFechaActual(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatearFecha = (date) => date.toLocaleDateString('es-VE', { weekday: 'long', month: 'long', day: 'numeric' });
  const getComidaPrioridad = () => {
    const hora = fechaActual.getHours();
    if (hora < 11) return 'desayuno';
    if (hora < 16) return 'almuerzo';
    return 'cena';
  };
  const prioridad = getComidaPrioridad();

  // DIETARY LOGIC
  const [dietaryStyle, setDietaryStyle] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (usuario && usuario.preferencias_dieteticas) {
      let prefs = usuario.preferencias_dieteticas;
      let parsed = [];
      if (Array.isArray(prefs)) {
        parsed = prefs.map(p => {
          if (typeof p === 'string') return { nombre: p, activo: true };
          if (typeof p === 'object' && p) {
            const name = p.nombre || p.name || p.label || (typeof p.nombre === 'object' ? p.nombre.nombre : JSON.stringify(p));
            return { nombre: name, activo: p.activo !== undefined ? p.activo : true };
          }
          return null;
        }).filter(Boolean);
      }
      if (parsed.length > 0) setDietaryStyle(parsed);
    }
  }, [usuario]);

  // RESTORED DYNAMIC CALENDAR LOGIC
  const getDiasSemana = () => {
    const today = new Date(fechaActual);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        name: d.toLocaleDateString('es-VE', { weekday: 'short' }),
        date: d.getDate(),
        isToday: d.toDateString() === fechaActual.toDateString(),
        fullDate: d
      };
    });
  };
  const diasSemana = getDiasSemana();

  // Sync with DB
  const handleSaveToProfile = async () => {
    if (!onActualizarUsuario || isSyncing) return;
    setIsSyncing(true);
    try {
      await onActualizarUsuario({ ...usuario, preferencias_dieteticas: dietaryStyle });
      if (addNotification) addNotification('Perfil Actualizado', 'Preferencias guardadas exitosamente.', 'success');
    } catch (e) { addNotification('Error', 'No se pudo guardar.', 'error'); } 
    finally { setIsSyncing(false); }
  };

  const [numPersonas, setNumPersonas] = useState(4);
  const [promptAdicional, setPromptAdicional] = useState('');
  const [cargando, setCargando] = useState(false);
  const [planIA, setPlanIA] = useState(null);
  const [errorPlan, setErrorPlan] = useState('');
  const [selectedMeal, setSelectedMeal] = useState(prioridad);
  const [autoSentWasap, setAutoSentWasap] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [savedMeals, setSavedMeals] = useState({});

  const toggleTag = (tagNombre) => setDietaryStyle(prev => prev.map(tag => tag.nombre === tagNombre ? { ...tag, activo: !tag.activo } : tag));
  const removeTagFromList = (tagNombre, e) => { e.stopPropagation(); setDietaryStyle(prev => prev.filter(tag => tag.nombre !== tagNombre)); };
  const handleAddTag = () => {
    const name = newTagInput.trim();
    if (name && !dietaryStyle.some(t => t.nombre === name)) {
      setDietaryStyle([...dietaryStyle, { nombre: name, activo: true }]);
      setNewTagInput(''); setIsAdding(false);
    }
  };

  // RESTORED PROFESSIONAL WHATSAPP FORMATTING
  const enviarWhatsAppAuto = async (plan, mealType) => {
    if (!plan?.comidas?.[mealType] || !usuario?.telefono) return;
    const receta = plan.comidas[mealType];
    const textoMensaje = `*🍲 MENÚ DEL DÍA - ${mealType.toUpperCase()}* 👩🏽‍🍳✨\n\n` +
      `*Receta:* ${receta.nombre}\n` +
      `*Porciones:* ${numPersonas} Pax | *Tiempo:* ${receta.tiempo || '30 min'}\n\n` +
      `*🥣 Ingredientes:* \n` +
      `${receta.ingredientes?.map(i => `• ${i}`).join('\n')}\n\n` +
      `*📋 Preparación:* \n` +
      `${receta.pasos?.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n` +
      `*¡Que lo disfrutes, ${usuario.nombre || 'Gourmet'}!*`;

    try {
      await fetch('http://localhost:3000/api/whatsapp/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefonoDestino: usuario.telefono, mensaje: textoMensaje })
      });
      setAutoSentWasap(true);
    } catch (e) { console.error("WA error:", e); }
  };

  const generarPlan = async () => {
    if (lockIAUntil && Date.now() < lockIAUntil) return;
    setCargando(true); setErrorPlan(''); setAutoSentWasap(false); setShowDetails(false); setSavedMeals({});
    try {
      const activeTags = dietaryStyle.filter(t => t.activo).map(t => t.nombre);
      const plan = await generarPlanIA({
        promptAdicional, dieta: activeTags.join(', '), regions: [], numPersonas,
        nombre: usuario?.nombre || 'Gourmet', fechaActual: formatearFecha(fechaActual),
        horaActual: fechaActual.toLocaleTimeString(), comidaPrioridad: prioridad
      });
      if (plan?.plan_valido === false) {
        setPlanIA(null);
        setErrorPlan(plan.metadatos?.mensaje_abuela || 'Petición inválida.');
      } else if (plan?.comidas) {
        setPlanIA(plan); setSelectedMeal(prioridad);
        await enviarWhatsAppAuto(plan, prioridad);
      }
    } catch (e) { 
      if (e.type === 'RATE_LIMIT') {
        if (onRateLimit) onRateLimit(e.segundos);
      } else {
        setErrorPlan('Error al generar plan.'); 
      }
    }
    finally { setCargando(false); }
  };

  const guardarReceta = (tipo, receta) => {
    if (!usuario?.id_usuario || !receta) return;
    const recipeToSave = { ...receta, porciones: numPersonas, tags: [tipo], historia: planIA?.metadatos?.mensaje_abuela };
    apiGuardarReceta(usuario.id_usuario, receta.nombre, recipeToSave, '')
      .then(() => { 
        if (addNotification) addNotification('Guardada', `Receta de ${tipo} guardada.`, 'success'); 
        setSavedMeals(prev => ({ ...prev, [tipo]: true }));
      })
      .catch(() => { setErrorPlan('Error al guardar.'); });
  };

  return (
    <div className="plan-semanal-container">
      <CinematicLoader visible={cargando} />

      {/* REJECTION MODAL FOR PLAN */}
      {errorPlan && !cargando && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center',
          background: 'rgba(10, 15, 29, 0.85)', backdropFilter: 'blur(15px)',
          animation: 'fadeIn 0.3s ease'
        }} onClick={() => setErrorPlan('')}>
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
            <h3 style={{ fontSize: '32px', color: '#EF4444', marginBottom: '20px', fontWeight: '900', letterSpacing: '-1px' }}>¡Mijo, así no se puede!</h3>
            <p style={{ fontSize: '20px', lineHeight: '1.6', color: 'white', opacity: 0.9, fontWeight: '500' }}>{errorPlan}</p>
            <button 
              className="btn-gold" 
              onClick={() => setErrorPlan('')}
              style={{ marginTop: '40px', padding: '15px 50px', borderRadius: '100px', fontSize: '16px', fontWeight: '800' }}
            >
              ENTENDIDO, ABUELA
            </button>
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

      <header className="hero-header stagger-1">
        <div className="hero-text-content">
          <div className="hero-badge-premium">✨ MasterChef Plan Diario</div>
          <h1 className="hero-main-title">Plan <span>Nutricional</span> Profesional</h1>
          <p className="hero-tagline">Entrega automatizada. Recetas tradicionales. Personalizado para ti.</p>
        </div>
        <button onClick={generarPlan} disabled={cargando || (lockIAUntil && Date.now() < lockIAUntil)} className="btn-premium-action btn-generate-main">
          <span>{lockIAUntil && Date.now() < lockIAUntil ? '⏳' : '✨'}</span> {cargando ? 'Cocinando...' : (lockIAUntil && Date.now() < lockIAUntil ? 'Esperando...' : 'Crear y Enviar Plan')}
        </button>
      </header>

      <section className="config-dashboard stagger-2">
        <div className="config-card">
          <span className="config-label">Capacidad</span><h3 className="config-title">Porciones</h3>
          <div className="portion-stepper">
            <button className="stepper-btn" onClick={() => setNumPersonas(Math.max(1, numPersonas - 1))}>-</button>
            <span className="stepper-value">{numPersonas.toString().padStart(2, '0')}</span>
            <button className="stepper-btn" onClick={() => setNumPersonas(numPersonas + 1)}>+</button>
          </div>
        </div>
        <div className="config-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span className="config-label">Matices</span>
            <button onClick={handleSaveToProfile} disabled={isSyncing} className={`active-save-btn ${isSyncing ? 'is-syncing' : ''}`}>
              {isSyncing ? 'Sincronizando...' : 'Guardar en Perfil'}
            </button>
          </div>
          <h3 className="config-title">Perfil Dietético</h3>
          <div className="tag-container">
            {dietaryStyle.map(tag => (
              <button key={tag.nombre} onClick={() => toggleTag(tag.nombre)} className={`dietary-tag ${tag.activo ? 'active' : ''}`}>
                {tag.nombre} <span className="remove-tag-btn" onClick={(e) => removeTagFromList(tag.nombre, e)}>×</span>
              </button>
            ))}
            {isAdding ? (
              <input autoFocus className="glass-input-special" style={{ width: '120px', height: '40px' }} value={newTagInput} onChange={(e) => setNewTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTag()} placeholder="..." />
            ) : (
              <button className="dietary-tag" style={{ borderStyle: 'dashed' }} onClick={() => setIsAdding(true)}>+ Añadir Filtro</button>
            )}
          </div>
        </div>
        <div className="config-card">
          <span className="config-label">Antojos Especiales</span><h3 className="config-title">Petición del Día</h3>
          <textarea className="glass-input-special" value={promptAdicional} onChange={(e) => setPromptAdicional(e.target.value)} placeholder="Sin cebolla, extra picante..." />
        </div>
      </section>

      {planIA && (
        <div className="automation-banner stagger-2" style={{
           background: autoSentWasap ? 'rgba(37, 211, 102, 0.1)' : 'rgba(255, 255, 255, 0.03)',
           border: autoSentWasap ? '1px solid #25D366' : '1px solid rgba(255, 255, 255, 0.1)',
           color: autoSentWasap ? '#25D366' : 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
             <span style={{ fontSize: '32px' }}>{autoSentWasap ? '✅' : '🍽️'}</span>
             <div>
                <strong>{autoSentWasap ? '¡Enviado a WhatsApp!' : '¡Plan Semanal Generado!'}</strong>
                <p style={{ margin: '5px 0 0', opacity: 0.8 }}>
                  {autoSentWasap 
                    ? `La receta digital completa para tu ${prioridad} ya está en tu teléfono.` 
                    : `Mira tus recetas personalizadas a continuación.`}
                </p>
             </div>
          </div>
          <button onClick={() => setShowDetails(!showDetails)} className="btn-secondary-premium">
            {showDetails ? 'Ocultar Detalles' : 'Ver Receta Completa 📖'}
          </button>
        </div>
      )}

      {/* RESTORED PROFESSIONAL CALENDAR */}
      <section className="calendar-section stagger-3">
        <h2 className="calendar-title">Vista Diaria</h2>
        <div className="calendar-grid-premium">
          {diasSemana.map((dia, idx) => (
            <div key={idx} className={`day-card-premium ${dia.isToday ? 'is-today' : ''}`}>
              <span className="day-name">{dia.name}</span>
              <span className="day-number">{dia.date.toString().padStart(2, '0')}</span>
              <div className="meal-status-column">
                {['desayuno', 'almuerzo', 'cena'].map(tipo => {
                  const title = dia.isToday && planIA?.comidas?.[tipo]?.nombre;
                  const icon = tipo === 'desayuno' ? '🌅' : tipo === 'almuerzo' ? '☀️' : '🌙';
                  return (
                    <div key={tipo} className={`meal-slot-premium ${title ? 'active' : ''}`}>
                      <div className="slot-label">{icon} {tipo.toUpperCase()}</div>
                      {title && <div className="recipe-title-mini">{title}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {showDetails && planIA && (
          <div className="recipe-masterpiece stagger-4">
            <div className="recipe-tabs">
              {['desayuno', 'almuerzo', 'cena'].map(t => (
                <button key={t} onClick={() => setSelectedMeal(t)} className={`recipe-tab-btn ${selectedMeal === t ? 'active' : ''}`}>{t.toUpperCase()}</button>
              ))}
            </div>
            <div className="recipe-content-grid">
               <div className="recipe-overview">
                 <h2>{planIA.comidas[selectedMeal].nombre}</h2>
                 <div className="recipe-meta-badges">
                    <div className="meta-badge">⏱️ {planIA.comidas[selectedMeal].tiempo || '30 min'}</div>
                    <div className="meta-badge">👨‍👩‍👧‍👦 {numPersonas} Pax</div>
                 </div>
                 <p className="recipe-story">{planIA.metadatos?.mensaje_abuela}</p>
                 <button 
                  onClick={() => guardarReceta(selectedMeal, planIA.comidas[selectedMeal])} 
                  disabled={savedMeals[selectedMeal]}
                  className="btn-premium-action btn-generate-main" 
                  style={{ width: '100%', justifyContent: 'center', opacity: savedMeals[selectedMeal] ? 0.7 : 1 }}
                 >
                   {savedMeals[selectedMeal] ? '✅ Receta Guardada' : '💾 Guardar Obra Maestra'}
                 </button>
               </div>
               <div className="recipe-details">
                  <h4 className="section-title-premium">Ingredientes Magistrales</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 40px', marginBottom: '40px' }}>
                    {planIA.comidas[selectedMeal].ingredientes?.map((ing, i) => <div key={i} className="ingredient-item-premium">✓ {ing}</div>)}
                  </div>
                  <h4 className="section-title-premium">Método de Preparación</h4>
                  <div className="steps-container">
                    {planIA.comidas[selectedMeal].pasos?.map((p, i) => (
                      <div key={i} className="step-card-premium">
                        <div className="step-number">{i+1}</div>
                        <div className="step-text">{p}</div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default PlanSemanalView;
