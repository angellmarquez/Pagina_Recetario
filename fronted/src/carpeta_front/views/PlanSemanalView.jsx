import React, { useState, useEffect } from 'react';
import { generarPlanIA } from '../services/aiService';
import { apiGuardarPlanSemanal, apiGuardarReceta } from '../services/apiService';

const PlanSemanalView = ({ usuario }) => {
  // Configuración Inicial de Fecha y Hora
  const [fechaActual, setFechaActual] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setFechaActual(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const formatearHora = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const formatearFecha = (date) => date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  // Determinar la comida a priorizar según la hora
  const getComidaPrioridad = () => {
    const hora = fechaActual.getHours();
    if (hora < 11) return 'desayuno';
    if (hora < 16) return 'almuerzo';
    return 'cena';
  };

  const prioridad = getComidaPrioridad();

  // Filter states
  const [numPersonas, setNumPersonas] = useState(4);
  const [dietaryStyle, setDietaryStyle] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [promptAdicional, setPromptAdicional] = useState('');
  
  // Control states
  const [cargando, setCargando] = useState(false);
  const [planIA, setPlanIA] = useState(null);
  const [errorPlan, setErrorPlan] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [selectedMeal, setSelectedMeal] = useState(prioridad);
  
  // Estado para la API de WhatsApp
  const [wasapEnviando, setWasapEnviando] = useState(false);

  // Parsear dieta del usuario cuando esté disponible
  useEffect(() => {
    if (usuario && usuario.preferencias_dieteticas) {
      const prefs = usuario.preferencias_dieteticas;
      if (typeof prefs[0] === 'object') {
        setDietaryStyle(prefs);
      } else if (Array.isArray(prefs)) {
        setDietaryStyle(prefs.map(p => ({ nombre: p.nombre || p, activo: true })));
      }
    }
  }, [usuario]);

  const toggleTag = (tagNombre) => {
    setDietaryStyle(prev => prev.map(tag =>
      tag.nombre === tagNombre ? { ...tag, activo: !tag.activo } : tag
    ));
  };

  const removeTagFromList = (tagNombre, e) => {
    e.stopPropagation();
    setDietaryStyle(prev => prev.filter(tag => tag.nombre !== tagNombre));
  };

  const handleAddTag = () => {
    const nombre = newTagInput.trim();
    if (nombre && !dietaryStyle.some(tag => tag.nombre === nombre)) {
      setDietaryStyle([...dietaryStyle, { nombre, activo: true }]);
      setNewTagInput('');
      setIsAdding(false);
    }
  };

  const generarPlan = async () => {
    setCargando(true);
    setErrorPlan('');
    setMensajeExito('');
    try {
      const activeTags = dietaryStyle.filter(t => t.activo).map(t => t.nombre);
      const planGenerado = await generarPlanIA({
        promptAdicional,
        dieta: activeTags.length > 0 ? activeTags.join(', ') : 'Ninguna',
        regiones: [],
        numPersonas,
        nombre: usuario?.nombre || 'Gourmet',
        fechaActual: formatearFecha(fechaActual),
        horaActual: formatearHora(fechaActual),
        comidaPrioridad: prioridad
      });
      
      if (planGenerado && planGenerado.comidas) {
        setPlanIA(planGenerado);
        setSelectedMeal(prioridad);
      } else {
        setErrorPlan('Mijo, la abuela se enredó con los cables. Inténtalo de nuevo.');
      }
    } catch (error) {
      setErrorPlan(error.message || 'No pude armar el menú, corazón.');
    } finally {
      setCargando(false);
    }
  };

  const enviarWhatsApp = async () => {
    if (!planIA || !planIA.comidas) return;
    if (!usuario || !usuario.telefono) {
      setErrorPlan('No tienes un número de teléfono registrado en tu perfil.');
      return;
    }

    setWasapEnviando(true);
    
    // Preparar el texto a enviar basado en la receta actualmente visualizada por el usuario
    const recetaParaEnviar = planIA.comidas[selectedMeal];
    const textoMensaje = `*¡Hola! VENIA te ha preparado este menú para hoy (${formatearFecha(fechaActual)})* 👩🏽‍🍳✨\n\n` +
      `*🍲 Pluma Principal (${selectedMeal.toUpperCase()}):* ${recetaParaEnviar?.nombre}\n` +
      `*Ingredientes:* ${recetaParaEnviar?.ingredientes?.join(', ')}\n\n` +
      `*¡Buen provecho!*`;

    try {
      const res = await fetch('http://localhost:3000/api/whatsapp/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telefonoDestino: usuario.telefono,
          mensaje: textoMensaje
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.mensaje);

      setMensajeExito('¡Receta enviada por WhatsApp exitosamente usando el Bot!');
      setTimeout(() => setMensajeExito(''), 5000);
    } catch (error) {
      setErrorPlan(error.message || 'Hubo un error al intentar enviar el mensaje de WhatsApp.');
    } finally {
      setWasapEnviando(false);
    }
  };

  const guardarRecetaEnDB = async (tipo, receta) => {
    if (!usuario?.id_usuario || !receta) return;
    try {
      // Adding recipe specific metadata
      const activeTags = dietaryStyle.filter(t => t.activo).map(t => t.nombre);
      const recetaGuardar = {
        ...receta,
        tiempo: receta.tiempo || "30 min",
        porciones: numPersonas,
        tags: [tipo, ...activeTags],
        historia: planIA?.metadatos?.mensaje_abuela || "Una deliciosa receta generada por VENIA"
      };
      
      const res = await apiGuardarReceta(usuario.id_usuario, receta.nombre, recetaGuardar, '');
      if (res.status === 201) {
        setMensajeExito(`¡Receta de ${tipo} guardada exitosamente!`);
        setTimeout(() => setMensajeExito(''), 4000);
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      setErrorPlan(`Hubo un error al guardar la receta de ${tipo}.`);
    }
  };

  const getDiasSemana = () => {
    const today = fechaActual;
    const curDay = today.getDay(); // 0(Sun)-6(Sat)
    const diff = today.getDate() - curDay + (curDay === 0 ? -6 : 1); // Monday
    const monday = new Date(today.getFullYear(), today.getMonth(), diff);
    
    return Array.from({length: 7}, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isToday = d.toDateString() === today.toDateString();
      return { 
        name: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        date: d.getDate(),
        isToday,
        fullDate: d
      };
    });
  };
  const diasSemana = getDiasSemana();

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '20px 40px' }}>
      
      {/* Mensajes Flotantes */}
      {mensajeExito && (
        <div style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', color: '#22c55e', padding: '15px 25px', borderRadius: '12px', marginBottom: '20px', fontWeight: 'bold' }}>
          {mensajeExito}
        </div>
      )}
      {errorPlan && (
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', padding: '15px 25px', borderRadius: '12px', marginBottom: '20px', fontWeight: 'bold' }}>
          {errorPlan}
        </div>
      )}

      {/* Header + CTA Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div className="stagger-1" style={{ flex: 1 }}>
          <h1 style={{ fontSize: '64px', fontWeight: '800', margin: '0', letterSpacing: '-2px', color: 'white' }}>
            Daily <span style={{ color: 'var(--primary)' }}>Menu</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', marginTop: '15px', maxWidth: '600px', lineHeight: '1.4' }}>
            Perfect recommendations for {formatearFecha(fechaActual)} at {formatearHora(fechaActual)}. Powered by heritage.
          </p>
        </div>
        
        <div className="stagger-1" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
           {planIA && (
            <button 
              onClick={enviarWhatsApp}
              disabled={wasapEnviando}
              style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: '100px', padding: '18px 30px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: wasapEnviando ? 0.7 : 1 }}
            >
              📱 {wasapEnviando ? 'Enviando...' : 'Enviar Receta a WhatsApp'}
            </button>
           )}
           <button 
            onClick={generarPlan} 
            disabled={cargando}
            style={{
              background: 'var(--primary)',
              color: 'var(--on-primary)',
              border: 'none',
              borderRadius: '100px',
              padding: '18px 40px',
              fontSize: '18px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 10px 30px rgba(245,158,11,0.2)',
              opacity: cargando ? 0.7 : 1
            }}
          >
            <span style={{ fontSize: '24px' }}>✨</span>
            {cargando ? 'Generando...' : 'Generar Menú del Día'}
          </button>
        </div>
      </div>

      {/* Configuration Cards Grid */}
      <div className="stagger-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginBottom: '60px' }}>
        
        {/* Card 1: Portions */}
        <div className="glass-card" style={{ padding: '40px', background: 'rgba(15, 23, 42, 0.4)' }}>
          <p style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '12px' }}>Portions</p>
          <h3 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 30px', color: 'white' }}>Number of people</h3>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(5, 8, 18, 0.6)', borderRadius: '24px', padding: '12px', width: 'fit-content' }}>
            <button onClick={() => setNumPersonas(Math.max(1, numPersonas - 1))} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '28px', cursor: 'pointer', padding: '0 25px' }}>−</button>
            <span style={{ fontSize: '36px', fontWeight: '800', width: '70px', textAlign: 'center', color: 'white' }}>{numPersonas.toString().padStart(2, '0')}</span>
            <button onClick={() => setNumPersonas(numPersonas + 1)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '28px', cursor: 'pointer', padding: '0 25px' }}>+</button>
          </div>
        </div>

        {/* Card 2: Preferences */}
        <div className="glass-card" style={{ padding: '40px', background: 'rgba(15, 23, 42, 0.4)' }}>
          <p style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '12px' }}>Preferences (From Profile)</p>
          <h3 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 20px', color: 'white' }}>Dietary style</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {dietaryStyle.map(tag => (
              <div key={tag.nombre} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <button 
                  onClick={() => toggleTag(tag.nombre)}
                  style={{ 
                    padding: '10px 28px 10px 18px', borderRadius: '30px', border: 'none',
                    background: tag.activo ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: tag.activo ? 'var(--on-primary)' : 'var(--text-secondary)',
                    fontWeight: '800', fontSize: '13px', cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)', position: 'relative',
                    opacity: tag.activo ? 1 : 0.5
                  }}>
                  {tag.nombre}
                </button>
                <button 
                  onClick={(e) => removeTagFromList(tag.nombre, e)}
                  style={{
                    position: 'absolute', right: '10px', background: 'transparent', border: 'none',
                    color: tag.activo ? 'var(--on-primary)' : 'var(--text-muted)',
                    fontSize: '16px', cursor: 'pointer', opacity: 0.6, fontWeight: '900'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            {isAdding ? (
              <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                <input 
                  autoFocus
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Nueva etiqueta..."
                  style={{ 
                    width: '120px', padding: '10px 15px', borderRadius: '15px', 
                    background: 'rgba(0,0,0,0.4)', border: '1px solid var(--primary)', 
                    color: 'white', fontSize: '13px', outline: 'none' 
                  }}
                />
                <button 
                  onClick={handleAddTag}
                  style={{ 
                    background: 'var(--primary)', color: 'var(--on-primary)', 
                    padding: '10px 18px', borderRadius: '15px', border: 'none', 
                    fontWeight: '800', fontSize: '12px', cursor: 'pointer' 
                  }}
                >Add</button>
                <button onClick={() => setIsAdding(false)} style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAdding(true)}
                style={{ padding: '10px 20px', borderRadius: '30px', border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.4)', background: 'transparent', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>
                + Add Tag
              </button>
            )}
          </div>
        </div>

        {/* Card 3: Custom Prompt */}
        <div className="glass-card" style={{ padding: '40px', background: 'rgba(15, 23, 42, 0.4)', position: 'relative', overflow: 'hidden' }}>
          <p style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '12px' }}>Customization</p>
          <h3 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 20px', color: 'white' }}>Extras</h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '15px' }}>¿Algún antojo o ingrediente a evitar?</p>
          <textarea 
            value={promptAdicional}
            onChange={(e) => setPromptAdicional(e.target.value)}
            placeholder="Ej. Quiero algo fresco para el calor, sin cebolla..."
            style={{ 
              width: '100%', 
              height: '80px', 
              background: 'rgba(5, 8, 18, 0.6)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '16px', 
              padding: '15px', 
              color: 'white', 
              fontFamily: 'inherit',
              resize: 'none'
            }}
          />
        </div>
      </div>

      {/* Section: The Calendar */}
      <div className="stagger-3" style={{ marginBottom: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '48px', fontWeight: '800', margin: 0, color: 'white' }}>The Calendar</h2>
          {planIA && planIA.metadatos && (
            <p style={{ color: 'var(--primary)', fontStyle: 'italic', margin: 0 }}>"{planIA.metadatos.mensaje_abuela}"</p>
          )}
        </div>

        {/* Calendar Row */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
          {diasSemana.map((dia, idx) => (
            <div key={idx} className="glass-card" style={{ 
              flex: 1, 
              padding: '20px 15px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              background: dia.isToday ? 'rgba(15, 23, 42, 0.8)' : 'rgba(15, 23, 42, 0.2)',
              border: dia.isToday ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
              position: 'relative'
            }}>
              {dia.isToday && <div style={{ position: 'absolute', top: '-10px', background: 'var(--primary)', color: 'var(--on-primary)', padding: '4px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: '900' }}>AI PICK</div>}
              
              <span style={{ fontSize: '14px', fontWeight: '800', color: dia.isToday ? 'white' : 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '5px' }}>{dia.name}</span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>{dia.date}</span>
              
              {/* Recipe slots */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                {['desayuno', 'almuerzo', 'cena'].map((tipo) => (
                  <div key={tipo} style={{ height: '40px', background: !dia.isToday ? 'rgba(5, 8, 18, 0.4)' : (prioridad === tipo ? 'rgba(245, 158, 11, 0.1)' : 'rgba(5, 8, 18, 0.6)'), borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                    {dia.isToday && planIA?.comidas?.[tipo] ? (
                       <span style={{ fontSize: '11px', fontWeight: '700', color: prioridad === tipo ? 'var(--primary)' : 'rgba(255,255,255,0.8)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{planIA.comidas[tipo].nombre}</span>
                    ) : (
                       <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '14px' }}>•</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Daily Recipes via Cinematic Tabs */}
        {planIA && (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'rgba(5, 8, 18, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {['desayuno', 'almuerzo', 'cena'].map((tipo) => (
               <button 
                 key={tipo}
                 onClick={() => setSelectedMeal(tipo)}
                 style={{
                    flex: 1,
                    background: selectedMeal === tipo ? 'rgba(255,255,255,0.02)' : 'transparent',
                    border: 'none',
                    color: selectedMeal === tipo ? 'white' : 'rgba(255,255,255,0.4)',
                    fontSize: '16px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '25px',
                    transition: 'all 0.3s'
                 }}
               >
                 {tipo} {prioridad === tipo && '✨'}
                 {selectedMeal === tipo && (
                   <div style={{ position: 'absolute', bottom: 0, left: '20%', width: '60%', height: '3px', background: 'var(--primary)', borderRadius: '3px 3px 0 0' }} />
                 )}
               </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '50px 60px' }}>
            {planIA.comidas[selectedMeal] ? (
              <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '60px' }}>
                {/* Left Col: Info */}
                <div>
                   <h3 style={{ fontSize: '42px', color: 'white', fontWeight: '900', margin: '0 0 15px', lineHeight: '1.1', letterSpacing: '-1px' }}>
                     {planIA.comidas[selectedMeal].nombre}
                   </h3>
                   <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                     <span style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: '800', background: 'rgba(245,158,11,0.1)', padding: '5px 12px', borderRadius: '100px' }}>
                       ⏱️ {planIA.comidas[selectedMeal].tiempo || '30 min'}
                     </span>
                     <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '800', background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '100px' }}>
                       👨‍👩‍👧‍👦 {numPersonas} Pax
                     </span>
                   </div>
                   <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: '1.6', marginBottom: '40px' }}>
                     {planIA.metadatos?.mensaje_abuela}
                   </p>

                   <button 
                     onClick={() => guardarRecetaEnDB(selectedMeal, planIA.comidas[selectedMeal])}
                     style={{ 
                       background: 'var(--primary)',
                       border: 'none',
                       color: 'var(--on-primary)',
                       padding: '16px 24px',
                       borderRadius: '100px',
                       fontWeight: '800',
                       fontSize: '16px',
                       cursor: 'pointer',
                       transition: 'all 0.3s',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       gap: '10px',
                       width: '100%',
                       boxShadow: '0 10px 25px rgba(245,158,11,0.3)'
                     }}
                   >
                     <span>💾</span> Guardar Receta
                   </button>
                </div>

                {/* Right Col: Ingredients and Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  <div>
                     <h4 style={{ color: 'white', fontSize: '18px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }} />
                       Ingredientes Clave
                     </h4>
                     <ul style={{ paddingLeft: '0', margin: '0', color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: '1.8', listStyle: 'none' }}>
                       {planIA.comidas[selectedMeal].ingredientes?.map((ing, i) => (
                         <li key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginBottom: '10px' }}>✓ {ing}</li>
                       ))}
                     </ul>
                  </div>

                  <div>
                     <h4 style={{ color: 'white', fontSize: '18px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }} />
                       Preparación
                     </h4>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                       {planIA.comidas[selectedMeal].pasos?.map((paso, i) => (
                         <div key={i} style={{ display: 'flex', gap: '15px', background: 'rgba(15,23,42,0.6)', padding: '20px', borderRadius: '16px' }}>
                           <div style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '18px' }}>{i + 1}.</div>
                           <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: '1.6' }}>{paso}</div>
                         </div>
                       ))}
                     </div>
                  </div>
                </div>
              </div>
            ) : (
               <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '50px 0' }}>
                 <h3 style={{ fontSize: '24px', fontWeight: '700' }}>Esperando a la abuela...</h3>
               </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default PlanSemanalView;

