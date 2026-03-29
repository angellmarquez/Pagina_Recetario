import React, { useState } from 'react';
import { generarPlanIA } from '../services/aiService';

const PlanSemanalView = ({ usuario }) => {
  const [promptPlan, setPromptPlan] = useState('');
  const [cargando, setCargando] = useState(false);
  const [planIA, setPlanIA] = useState(null);
  const [errorPlan, setErrorPlan] = useState('');

  const diasOrden = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  const generarPlan = async () => {
    if (!promptPlan.trim()) return;
    setCargando(true);
    setErrorPlan('');
    setPlanIA(null);
    try {
      const planGenerado = await generarPlanIA({
        pUsuario: promptPlan,
        prefs: usuario?.preferencias_dieteticas || '',
        nombre: usuario?.nombre || 'Mi amor'
      });
      // Verify valid structure
      if (planGenerado && (planGenerado.lunes || planGenerado.Lunes)) {
        setPlanIA(planGenerado);
      } else {
        setErrorPlan('La abuela se confundió anotando las recetas, íntentalo de nuevo.');
      }
    } catch (error) {
      setErrorPlan(error.message || 'Mijo, no pude armar el plan. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const formatearDia = (dia) => {
    const nombres = {
      'lunes': 'Lunes', 'martes': 'Martes', 'miercoles': 'Miércoles', 
      'jueves': 'Jueves', 'viernes': 'Viernes', 'sabado': 'Sábado', 'domingo': 'Domingo'
    };
    return nombres[dia.toLowerCase()] || dia;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
      <div className="stagger-1" style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h2 style={{ fontSize: '48px', fontWeight: '900', margin: '0 0 15px', letterSpacing: '-1px', color: 'white' }}>
          Plan Semanal <span style={{ color: 'var(--primary)', textShadow: '0 4px 20px rgba(255,231,146,0.3)' }}>Inteligente</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '18px', margin: '0 auto', maxWidth: '600px' }}>
          Dile a VENIA qué necesitas (ej: "Quiero rebajar", "Comida rápida de hacer") y te armará el menú completo.
        </p>
      </div>

      <div className="glass-card stagger-2" style={{ padding: '30px', display: 'flex', gap: '20px', marginBottom: '50px' }}>
        <input 
          type="text" 
          placeholder="Ej: Menú para la semana, fácil y económico..."
          style={{
            flex: 1,
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--outline-variant)',
            borderRadius: '16px',
            padding: '20px',
            color: 'white',
            fontSize: '18px',
            fontFamily: 'var(--font-body)',
            outline: 'none'
          }}
          value={promptPlan}
          onChange={(e) => setPromptPlan(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generarPlan()}
        />
        <button 
          onClick={generarPlan} 
          disabled={cargando || !promptPlan.trim()}
          style={{
            background: 'var(--primary)',
            color: 'var(--on-primary)',
            border: 'none',
            borderRadius: '16px',
            padding: '0 40px',
            fontSize: '18px',
            fontWeight: '800',
            cursor: cargando || !promptPlan.trim() ? 'not-allowed' : 'pointer',
            opacity: cargando || !promptPlan.trim() ? 0.6 : 1,
            transition: 'all 0.3s'
          }}
        >
          {cargando ? 'Cocidando...' : 'Generar Plan'}
        </button>
      </div>

      {errorPlan && (
        <div className="glass-card stagger-3" style={{ padding: '30px', border: '1px solid var(--error)', backgroundColor: 'rgba(255,113,108,0.1)', color: '#ffaaaa', textAlign: 'center' }}>
          <h3>❌ {errorPlan}</h3>
        </div>
      )}

      {planIA && (
        <div className="stagger-4" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {diasOrden.map(diaExt => {
            const dataDia = planIA[diaExt] || planIA[diaExt.charAt(0).toUpperCase() + diaExt.slice(1)];
            if (!dataDia) return null;
            
            return (
              <div key={diaExt} className="glass-card" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '28px', color: 'var(--primary)', marginBottom: '25px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '15px' }}>
                  {formatearDia(diaExt)}
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                  {['desayuno', 'almuerzo', 'cena'].map(comida => {
                    const infoP = dataDia[comida] || dataDia[comida.charAt(0).toUpperCase() + comida.slice(1)];
                    if (!infoP) return null;
                    return (
                      <div key={comida} style={{ background: 'var(--surface-container)', padding: '25px', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                           <span style={{ fontSize: '24px' }}>{comida === 'desayuno' ? '☕' : comida === 'almuerzo' ? '🍛' : '🥣'}</span>
                           <h4 style={{ margin: 0, fontSize: '20px', color: 'white', textTransform: 'capitalize' }}>{comida}</h4>
                         </div>
                         <h5 style={{ margin: '0 0 10px 0', fontSize: '18px', color: 'var(--primary-container)' }}>{infoP.nombre}</h5>
                         <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                           <strong>Ingredientes:</strong> {Array.isArray(infoP.ingredientes) ? infoP.ingredientes.join(', ') : infoP.ingredientes}
                         </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlanSemanalView;
