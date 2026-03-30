import React, { useState } from 'react';
import { generarPlanIA } from '../services/aiService';
import { apiGuardarPlanSemanal } from '../services/apiService';

const PlanSemanalView = ({ usuario }) => {
  // Filter states
  const [numPersonas, setNumPersonas] = useState(4);
  const [dieta, setDieta] = useState('Sin Gluten');
  const [regiones, setRegiones] = useState(['llanos', 'oriente']);
  const [promptAdicional, setPromptAdicional] = useState('');
  const [nombrePlan, setNombrePlan] = useState('');
  
  // Control states
  const [cargando, setCargando] = useState(false);
  const [planIA, setPlanIA] = useState(null);
  const [errorPlan, setErrorPlan] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const diasOrden = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const opcionesDieta = ['Sin Gluten', 'Vegano', 'Keto', 'Lactose Free'];
  const opcionesRegiones = [
    { id: 'llanos', nombre: 'Los Llanos (Savannah)' },
    { id: 'oriente', nombre: 'Oriente (Coastal)' },
    { id: 'andes', nombre: 'Andes (Mountain)' }
  ];

  const toggleRegion = (regId) => {
    if (regiones.includes(regId)) {
      setRegiones(regiones.filter(r => r !== regId));
    } else {
      setRegiones([...regiones, regId]);
    }
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
        nombre: usuario?.nombre || 'Gourmet'
      });
      
      if (planGenerado && (planGenerado.lunes || planGenerado.Lunes)) {
        setPlanIA(planGenerado);
        setNombrePlan(planGenerado.metadatos?.nombre_sugerido || '');
      } else {
        setErrorPlan('Mijo, la abuela se enredó con los cables. Inténtalo de nuevo.');
      }
    } catch (error) {
      setErrorPlan(error.message || 'No pude armar el plan, corazón.');
    } finally {
      setCargando(false);
    }
  };

  const guardarPlan = async () => {
    if (!nombrePlan) {
      setErrorPlan('¡Ponle un nombre a tu plan, mijo!');
      return;
    }
    setCargando(true);
    try {
      const res = await apiGuardarPlanSemanal(usuario?.id_usuario, planIA, nombrePlan);
      if (res.error) throw new Error(res.error);
      setMensajeExito('¡Plan guardado con éxito!');
      setTimeout(() => setMensajeExito(''), 5000);
    } catch (error) {
      setErrorPlan('No se pudo guardar el plan.');
    } finally {
      setCargando(false);
    }
  };

  const formatearDia = (dia) => {
    const nombres = {
      'lunes': 'MON', 'martes': 'TUE', 'miercoles': 'WED', 
      'jueves': 'THU', 'viernes': 'FRI', 'sabado': 'SAT', 'domingo': 'SUN'
    };
    return nombres[dia.toLowerCase()] || dia.toUpperCase();
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '20px 40px' }}>
      
      {/* Header + CTA Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div className="stagger-1" style={{ flex: 1 }}>
          <h1 style={{ fontSize: '64px', fontWeight: '800', margin: '0', letterSpacing: '-2px', color: 'white' }}>
            Weekly <span style={{ color: 'var(--primary)' }}>Plan</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', marginTop: '15px', maxWidth: '600px', lineHeight: '1.4' }}>
            Transform your ingredients into a curated Venezuelan culinary journey. Powered by heritage, refined by AI.
          </p>
        </div>
        
        <div className="stagger-1" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
           <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--outline)', color: 'white', borderRadius: '100px', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
             📔 Cuaderno
           </button>
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
            {cargando ? 'Generando...' : 'Generar Plan con IA'}
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
            <button 
              onClick={() => setNumPersonas(Math.max(1, numPersonas - 1))}
              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '28px', cursor: 'pointer', padding: '0 25px' }}
            >−</button>
            <span style={{ fontSize: '36px', fontWeight: '800', width: '70px', textAlign: 'center', color: 'white' }}>{numPersonas.toString().padStart(2, '0')}</span>
            <button 
              onClick={() => setNumPersonas(numPersonas + 1)}
              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '28px', cursor: 'pointer', padding: '0 25px' }}
            >+</button>
          </div>
        </div>

        {/* Card 2: Preferences */}
        <div className="glass-card" style={{ padding: '40px', background: 'rgba(15, 23, 42, 0.4)' }}>
          <p style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '12px' }}>Preferences</p>
          <h3 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 30px', color: 'white' }}>Dietary restrictions</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {opcionesDieta.map(opt => (
              <button
                key={opt}
                onClick={() => setDieta(dieta === opt ? '' : opt)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '100px',
                  border: '1px solid',
                  borderColor: dieta === opt ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                  background: dieta === opt ? 'rgba(245,158,11,0.1)' : 'rgba(5, 8, 18, 0.4)',
                  color: dieta === opt ? 'var(--primary)' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '700'
                }}
              >
                {opt}
              </button>
            ))}
            <button style={{ color: 'rgba(255,255,255,0.3)', border: 'none', background: 'transparent', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginLeft: '10px' }}>+ Add Custom</button>
          </div>
        </div>

        {/* Card 3: Gastronomy */}
        <div className="glass-card" style={{ padding: '40px', background: 'rgba(15, 23, 42, 0.4)', position: 'relative', overflow: 'hidden' }}>
          <p style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '12px' }}>Gastronomy</p>
          <h3 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 30px', color: 'white' }}>Preferred regions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {opcionesRegiones.map(reg => (
              <label key={reg.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
                <div style={{
                  width: '24px', height: '24px',
                  borderRadius: '6px',
                  border: '2px solid',
                  borderColor: regiones.includes(reg.id) ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                  background: regiones.includes(reg.id) ? 'var(--primary)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s'
                }}>
                  {regiones.includes(reg.id) && <span style={{ color: 'var(--on-primary)', fontWeight: '900', fontSize: '14px' }}>✓</span>}
                </div>
                <input 
                  type="checkbox" 
                  checked={regiones.includes(reg.id)}
                  onChange={() => toggleRegion(reg.id)}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>{reg.nombre}</span>
              </label>
            ))}
          </div>
          <div style={{ position: 'absolute', bottom: '-40px', right: '-20px', opacity: 0.1, fontSize: '200px', pointerEvents: 'none' }}>🇻🇪</div>
        </div>
      </div>

      {/* Section: The Calendar */}
      <div className="stagger-3" style={{ marginBottom: '80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '48px', fontWeight: '800', margin: 0, color: 'white' }}>The Calendar</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px', color: 'white' }}>
             <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', opacity: 0.5 }}>←</button>
             <span style={{ fontSize: '18px', fontWeight: '700' }}>Mayo 15 - 21</span>
             <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', opacity: 0.5 }}>→</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '15px' }}>
          {diasOrden.map((dia, idx) => {
            const isActive = dia === 'miercoles'; 
            return (
              <div key={dia} className="glass-card" style={{ 
                padding: '24px', 
                background: isActive ? 'rgba(15, 23, 42, 0.4)' : 'rgba(15, 23, 42, 0.2)',
                border: isActive ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                position: 'relative'
              }}>
                 {isActive && <div style={{ position: 'absolute', top: '-10px', right: '10px', background: 'var(--primary)', color: 'var(--on-primary)', padding: '4px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: '900' }}>AI PICK</div>}
                 
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '30px' }}>
                   <span style={{ fontSize: '14px', fontWeight: '800', color: 'white' }}>{formatearDia(dia)}</span>
                   <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.3)' }}>{15 + idx}</span>
                 </div>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {[1,2,3].map(i => (
                      <div key={i}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></div>
                        </div>
                        {isActive && i === 1 ? (
                          <>
                            <p style={{ fontSize: '13px', fontWeight: '700', color: 'white', margin: '0 0 4px' }}>Pabellón Criollo</p>
                            <div style={{ display: 'flex', gap: '4px' }}>
                               <div style={{ width: '12px', height: '4px', borderRadius: '2px', background: 'var(--primary)' }}></div>
                               <div style={{ width: '12px', height: '4px', borderRadius: '2px', background: '#ff716c' }}></div>
                            </div>
                          </>
                        ) : (
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', width: '80%' }}></div>
                        )}
                      </div>
                    ))}
                 </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section: Regional Spotlight */}
      <div className="stagger-4">
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '15px' }}>
            Regional Spotlight
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.4)' }}>Suggested based on your preference</span>
          </h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
          {[
            { tag: 'LOS LLANOS', title: 'Carne en Vara', desc: 'Smoked slow-roasted beef from the...' },
            { tag: 'ORIENTE', title: 'Cachapa con Queso', desc: 'Sweet corn pancakes with handmade...' },
            { tag: 'AI TWIST', title: 'Cacao Symphony', desc: 'Venezuelan chocolate mousse with...' }
          ].map((item, idx) => (
            <div key={idx} className="glass-card" style={{ height: '300px', overflow: 'hidden', padding: 0 }}>
               <div style={{ height: '100%', background: 'linear-gradient(to bottom, transparent 30%, rgba(5,8,18,0.9) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '30px' }}>
                  <span style={{ background: 'var(--primary-container)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '40px', fontSize: '10px', fontWeight: '900', letterSpacing: '1px', width: 'fit-content', marginBottom: '12px' }}>
                    {item.tag}
                  </span>
                  <h4 style={{ fontSize: '24px', fontWeight: '800', color: 'white', margin: '0 0 8px' }}>{item.title}</h4>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{item.desc}</p>
               </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default PlanSemanalView;

