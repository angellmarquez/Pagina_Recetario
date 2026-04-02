import React, { useState, useEffect } from 'react';
import { generarPlanIA } from '../services/aiService';
import { apiGuardarPlanSemanal } from '../services/apiService';

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
  const [dieta, setDieta] = useState('Ninguna');
  const [regiones, setRegiones] = useState(['llanos', 'oriente']);
  const [promptAdicional, setPromptAdicional] = useState('');
  
  // Control states
  const [cargando, setCargando] = useState(false);
  const [planIA, setPlanIA] = useState(null);
  const [errorPlan, setErrorPlan] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  
  // Estado para la API de WhatsApp
  const [wasapEnviando, setWasapEnviando] = useState(false);

  // Parsear dieta del usuario cuando esté disponible
  useEffect(() => {
    if (usuario && usuario.preferencias_dieteticas) {
      const prefs = usuario.preferencias_dieteticas;
      if (Array.isArray(prefs) && prefs.length > 0) {
        setDieta(prefs[0].nombre || prefs[0]);
      }
    }
  }, [usuario]);

  const opcionesDieta = ['Sin Gluten', 'Vegano', 'Keto', 'Lactose Free', 'Ninguna'];
  const opcionesRegiones = [
    { id: 'llanos', nombre: 'Los Llanos (Savannah)' },
    { id: 'oriente', nombre: 'Oriente (Coastal)' },
    { id: 'andes', nombre: 'Andes (Mountain)' }
  ];

  const toggleRegion = (regId) => {
    if (regiones.includes(regId)) setRegiones(regiones.filter(r => r !== regId));
    else setRegiones([...regiones, regId]);
  };

  const generarPlan = async () => {
    setCargando(true);
    setErrorPlan('');
    setMensajeExito('');
    try {
      const planGenerado = await generarPlanIA({
        promptAdicional,
        dieta,
        regiones,
        numPersonas,
        nombre: usuario?.nombre || 'Gourmet',
        fechaActual: formatearFecha(fechaActual),
        horaActual: formatearHora(fechaActual),
        comidaPrioridad: prioridad
      });
      
      if (planGenerado && planGenerado.comidas) {
        setPlanIA(planGenerado);
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
    
    // Preparar el texto a enviar basado en la sugerencia prioritaria sin formato URL
    const recetaPrioridad = planIA.comidas[prioridad];
    const textoMensaje = `*¡Hola! VENIA te ha preparado este menú para hoy (${formatearFecha(fechaActual)})* 👩🏽‍🍳✨\n\n` +
      `*🍲 Pluma Principal (${prioridad.toUpperCase()}):* ${recetaPrioridad?.nombre}\n` +
      `*Ingredientes:* ${recetaPrioridad?.ingredientes?.join(', ')}\n\n` +
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
          <h3 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 20px', color: 'white' }}>Dietary restrictions</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {opcionesDieta.map(opt => (
              <button
                key={opt}
                onClick={() => setDieta(dieta === opt ? 'Ninguna' : opt)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '100px',
                  border: '1px solid',
                  borderColor: dieta === opt ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                  background: dieta === opt ? 'rgba(245,158,11,0.1)' : 'rgba(5, 8, 18, 0.4)',
                  color: dieta === opt ? 'var(--primary)' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '700'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Card 3: Gastronomy */}
        <div className="glass-card" style={{ padding: '40px', background: 'rgba(15, 23, 42, 0.4)', position: 'relative', overflow: 'hidden' }}>
          <p style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '12px' }}>Gastronomy</p>
          <h3 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 30px', color: 'white' }}>Preferred regions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {opcionesRegiones.map(reg => (
              <label key={reg.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid', borderColor: regiones.includes(reg.id) ? 'var(--primary)' : 'rgba(255,255,255,0.1)', background: regiones.includes(reg.id) ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                  {regiones.includes(reg.id) && <span style={{ color: 'var(--on-primary)', fontWeight: '900', fontSize: '12px' }}>✓</span>}
                </div>
                <input type="checkbox" checked={regiones.includes(reg.id)} onChange={() => toggleRegion(reg.id)} style={{ display: 'none' }} />
                <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>{reg.nombre}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Section: Daily Menu */}
      <div className="stagger-3" style={{ marginBottom: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '48px', fontWeight: '800', margin: 0, color: 'white' }}>Menu del Día</h2>
          {planIA && planIA.metadatos && (
            <p style={{ color: 'var(--primary)', fontStyle: 'italic', margin: 0 }}>"{planIA.metadatos.mensaje_abuela}"</p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {['desayuno', 'almuerzo', 'cena'].map((tipo) => {
            const isPriority = prioridad === tipo;
            const receta = planIA?.comidas?.[tipo];

            return (
              <div key={tipo} className="glass-card" style={{ 
                padding: '30px', 
                background: isPriority ? 'rgba(245, 158, 11, 0.05)' : 'rgba(15, 23, 42, 0.4)',
                border: isPriority ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
              }}>
                 {isPriority && <div style={{ position: 'absolute', top: '-12px', right: '20px', background: 'var(--primary)', color: 'var(--on-primary)', padding: '6px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: '900', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>🍽️ SUGERENCIA ACTUAL</div>}
                 
                 <div style={{ marginBottom: '20px' }}>
                   <span style={{ textTransform: 'uppercase', fontSize: '14px', fontWeight: '800', color: isPriority ? 'var(--primary)' : 'rgba(255,255,255,0.5)', letterSpacing: '2px' }}>{tipo}</span>
                   {receta ? (
                     <h3 style={{ fontSize: '28px', color: 'white', fontWeight: '700', marginTop: '10px' }}>{receta.nombre}</h3>
                   ) : (
                     <h3 style={{ fontSize: '24px', color: 'rgba(255,255,255,0.2)', fontWeight: '700', marginTop: '10px' }}>Esperando IA...</h3>
                   )}
                 </div>
                 
                 {receta && (
                   <div style={{ flex: 1 }}>
                     <div style={{ marginBottom: '20px' }}>
                       <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', margin: '0 0 10px' }}>Ingredientes Clave</p>
                       <ul style={{ paddingLeft: '20px', margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.6' }}>
                         {receta.ingredientes?.slice(0,4).map((ing, i) => <li key={i}>{ing}</li>)}
                         {receta.ingredientes?.length > 4 && <li>Y más...</li>}
                       </ul>
                     </div>
                   </div>
                 )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlanSemanalView;

