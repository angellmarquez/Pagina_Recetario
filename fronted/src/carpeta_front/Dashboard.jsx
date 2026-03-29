import React, { useState } from 'react';

const Dashboard = ({ abierto, onCerrar, usuario, onLogout, onSeleccionarReceta, onVerPlanDetallado }) => {
  const [recetasGuardadas, setRecetasGuardadas] = useState([]);
  const [listaPlanes, setListaPlanes] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState('recetas'); // 'recetas' o 'planes'

  React.useEffect(() => {
    if (abierto && usuario?.id_usuario) {
      // Cargar recetas
      fetch(`http://localhost:3000/api/recetas/usuario/${usuario.id_usuario}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setRecetasGuardadas(data.recetas);
        })
        .catch(err => console.error("Error cargando recetas:", err));

      cargarListaPlanes();
    }
  }, [abierto, usuario]);

  const cargarListaPlanes = async () => {
    if (!usuario?.id_usuario) return;
    setCargandoLista(true);
    try {
      const res = await fetch(`http://localhost:3000/api/plan-semanal/usuario/${usuario.id_usuario}`);
      const data = await res.json();
      if (data.success) setListaPlanes(data.planes);
    } catch (err) {
      console.error("Error cargando lista de planes:", err);
    } finally {
      setCargandoLista(false);
    }
  };

  const eliminarReceta = async (id_receta) => {
    if (!usuario?.id_usuario) return;
    try {
      const res = await fetch(`http://localhost:3000/api/recetas/eliminar/${usuario.id_usuario}/${id_receta}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setRecetasGuardadas(prev => prev.filter(r => r.id_receta !== id_receta));
      }
    } catch (err) {
      console.error("Error eliminando receta:", err);
    }
  };

  const eliminarPlan = async (id_plan) => {
    if (!window.confirm('¿Seguro que quieres borrar este plan, mijo?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/plan-semanal/${id_plan}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        cargarListaPlanes();
      }
    } catch (err) {
      console.error("Error eliminando plan:", err);
    }
  };

  const verDetallePlan = async (id_plan) => {
    try {
      const res = await fetch(`http://localhost:3000/api/plan-semanal/detalle/${id_plan}`);
      const data = await res.json();
      if (data.success) {
        onVerPlanDetallado(data.plan);
      }
    } catch (err) {
      console.error("Error obteniendo detalle:", err);
    }
  };

  if (!abierto) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, width: '100%', height: '100%',
      zIndex: 1000, display: 'flex', justifyContent: 'flex-end',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }} onClick={onCerrar}>
      
      <div 
        style={{
          width: '420px', height: '100%', background: 'var(--surface-container)',
          backdropFilter: 'blur(30px)', borderLeft: '1px solid var(--outline)',
          padding: '50px 40px', display: 'flex', flexDirection: 'column',
          boxShadow: '-20px 0 50px rgba(0,0,0,0.5)', overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h2 style={{ color: 'white', margin: 0, fontSize: '28px', fontWeight: '900', letterSpacing: '-1px' }}>Mi Cuaderno</h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Recetas y planes guardados</p>
          </div>
          <button onClick={onCerrar} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <nav style={{ display: 'flex', gap: '8px', marginBottom: '40px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '16px' }}>
          <button
            onClick={() => setSeccionActiva('recetas')}
            style={{
              flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
              background: seccionActiva === 'recetas' ? 'var(--primary)' : 'transparent',
              color: seccionActiva === 'recetas' ? 'var(--on-primary)' : 'var(--text-secondary)',
              fontSize: '14px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s'
            }}
          >Recetas</button>
          <button
            onClick={() => setSeccionActiva('planes')}
            style={{
              flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
              background: seccionActiva === 'planes' ? 'var(--primary)' : 'transparent',
              color: seccionActiva === 'planes' ? 'var(--on-primary)' : 'var(--text-secondary)',
              fontSize: '14px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s'
            }}
          >Planes</button>
        </nav>

        <div style={{ flex: 1, paddingRight: '5px' }}>
          {seccionActiva === 'recetas' && (
            <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
              {recetasGuardadas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: '40px', marginBottom: '20px', opacity: 0.3 }}>🍽️</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Tu cuaderno está vacío, mijo.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {recetasGuardadas.map(rec => (
                    <div 
                      key={rec.id_receta} 
                      onClick={() => onSeleccionarReceta(rec)}
                      className="receta-card-interactive"
                      style={{ 
                        background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', 
                        border: '1px solid var(--outline-variant)', cursor: 'pointer', transition: 'all 0.3s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <h4 style={{ color: 'var(--primary)', margin: 0, fontSize: '16px', fontWeight: '800', flex: 1, lineHeight: '1.4' }}>{rec.titulo}</h4>
                        <button 
                          onClick={(e) => { e.stopPropagation(); eliminarReceta(rec.id_receta); }}
                          style={{ background: 'rgba(239, 51, 64, 0.1)', border: 'none', color: '#EF3340', width: '32px', height: '32px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '10px' }}
                        ><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                         <span style={{ color: 'var(--primary)' }}>⚡</span> Toque para ver detalle
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {seccionActiva === 'planes' && (
            <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
              {cargandoLista ? (
                <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}></div></div>
              ) : listaPlanes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: '40px', marginBottom: '20px', opacity: 0.3 }}>📅</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Aún no has planeado tu semana.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {listaPlanes.map(plan => (
                    <div 
                      key={plan.id_plan}
                      className="plan-card-mini"
                      onClick={() => verDetallePlan(plan.id_plan)}
                      style={{ 
                        background: 'rgba(255,255,255,0.02)', padding: '18px 20px', borderRadius: '20px', 
                        border: '1px solid var(--outline-variant)', cursor: 'pointer', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h5 style={{ color: 'var(--primary)', margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800' }}>{plan.nombre_plan}</h5>
                        <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0, fontWeight: '600' }}>
                          CREADO EL {new Date(plan.fecha_creacion).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' }).toUpperCase()}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); eliminarPlan(plan.id_plan); }}
                        style={{ background: 'rgba(239, 51, 64, 0.1)', border: 'none', color: '#EF3340', width: '32px', height: '32px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '10px' }}
                      ><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: '40px', borderTop: '1px solid var(--outline-variant)', paddingTop: '30px' }}>
          <button 
            onClick={onLogout}
            style={{ width: '100%', background: 'rgba(239, 51, 64, 0.05)', border: '1px solid rgba(239, 51, 64, 0.2)', color: '#EF3340', padding: '15px', borderRadius: '18px', fontWeight: '800', cursor: 'pointer', fontSize: '14px', transition: 'all 0.3s' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 51, 64, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 51, 64, 0.05)'}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .spinner { transform-origin: center; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .receta-card-interactive:hover { background: rgba(245, 158, 11, 0.08) !important; border-color: rgba(245, 158, 11, 0.3) !important; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
        .plan-card-mini:hover { background: rgba(245, 158, 11, 0.08) !important; border-color: rgba(245, 158, 11, 0.2) !important; transform: translateX(8px); }
      `}</style>
    </div>
  );
};

export default Dashboard;
