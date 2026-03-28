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
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', transition: 'all 0.4s'
    }} onClick={onCerrar}>
      
      <div 
        style={{
          width: '400px', height: '100%', background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(255,255,255,0.1)',
          padding: '40px', display: 'flex', flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)', overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '22px', fontWeight: '800' }}>Mi Cuaderno</h2>
          <button onClick={onCerrar} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
        </div>

        <nav style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: 'rgba(255,255,255,0.02)', padding: '5px', borderRadius: '12px' }}>
          <button
            onClick={() => setSeccionActiva('recetas')}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
              background: seccionActiva === 'recetas' ? 'rgba(255, 215, 0, 0.15)' : 'transparent',
              color: seccionActiva === 'recetas' ? '#FFD700' : 'rgba(255,255,255,0.5)',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s'
            }}
          >Recetas Guardadas</button>
          <button
            onClick={() => setSeccionActiva('planes')}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
              background: seccionActiva === 'planes' ? 'rgba(255, 215, 0, 0.15)' : 'transparent',
              color: seccionActiva === 'planes' ? '#FFD700' : 'rgba(255,255,255,0.5)',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s'
            }}
          >Planes Semanales</button>
        </nav>

        <div style={{ flex: 1, paddingRight: '5px' }}>
          {seccionActiva === 'recetas' && (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              {recetasGuardadas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>No hay recetas guardadas.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {recetasGuardadas.map(rec => (
                    <div 
                      key={rec.id_receta} 
                      onClick={() => onSeleccionarReceta(rec)}
                      className="receta-card-interactive"
                      style={{ 
                        background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', 
                        border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.3s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h4 style={{ color: '#FFD700', margin: 0, fontSize: '15px', flex: 1 }}>{rec.titulo}</h4>
                        <button 
                          onClick={(e) => { e.stopPropagation(); eliminarReceta(rec.id_receta); }}
                          style={{ background: 'rgba(239, 51, 64, 0.1)', border: 'none', color: '#EF3340', width: '28px', height: '28px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '10px' }}
                        ><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                        Clic para cargar en el feed
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {seccionActiva === 'planes' && (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              {cargandoLista ? (
                <div style={{ textAlign: 'center', padding: '20px' }}><div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#FFD700', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}></div></div>
              ) : listaPlanes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}><p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>No hay planes guardados.</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {listaPlanes.map(plan => (
                    <div 
                      key={plan.id_plan}
                      className="plan-card-mini"
                      onClick={() => verDetallePlan(plan.id_plan)}
                      style={{ 
                        background: 'rgba(255,255,255,0.03)', padding: '12px 15px', borderRadius: '12px', 
                        border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h5 style={{ color: '#FFD700', margin: '0 0 4px 0', fontSize: '14px' }}>{plan.nombre_plan}</h5>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', margin: 0 }}>
                          📅 {new Date(plan.fecha_creacion).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); eliminarPlan(plan.id_plan); }}
                        style={{ background: 'rgba(239, 51, 64, 0.1)', border: 'none', color: '#EF3340', width: '28px', height: '28px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '10px' }}
                      ><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <button 
            onClick={onLogout}
            style={{ width: '100%', background: 'transparent', border: '1px solid rgba(239, 51, 64, 0.3)', color: '#EF3340', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
        .spinner { transform-origin: center; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .receta-card-interactive:hover { background: rgba(255, 215, 0, 0.08) !important; border-color: rgba(255, 215, 0, 0.3) !important; transform: translateY(-2px); }
        .plan-card-mini:hover { background: rgba(255, 215, 0, 0.08) !important; border-color: rgba(255, 215, 0, 0.2) !important; transform: translateX(5px); }
      `}</style>
    </div>
  );
};

export default Dashboard;
