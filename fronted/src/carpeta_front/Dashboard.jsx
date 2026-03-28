import React, { useState } from 'react';
import Groq from 'groq-sdk';

const Dashboard = ({ abierto, onCerrar, usuario, onLogout, apiKey, onSeleccionarReceta, onVerPlanDetallado }) => {
  const [seccionActiva, setSeccionActiva] = useState('perfil');
  const [planSemanal, setPlanSemanal] = useState(() => {
    if (usuario?.plan_semanal) return usuario.plan_semanal;
    const guardado = localStorage.getItem(`venia_plan_${usuario?.id_usuario}`);
    return guardado ? JSON.parse(guardado) : null;
  });
  const [cargandoPlan, setCargandoPlan] = useState(false);
  const [mensajePlan, setMensajePlan] = useState('');
  const [recetasGuardadas, setRecetasGuardadas] = useState([]);
  const [preferencias, setPreferencias] = useState(usuario?.preferencias_dieteticas || '');
  const [editandoPreferencias, setEditandoPreferencias] = useState(false);

  const groq = new Groq({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });

  // Cargar datos al abrir
  React.useEffect(() => {
    if (abierto && usuario?.id_usuario) {
      fetch(`http://localhost:3000/api/recetas/usuario/${usuario.id_usuario}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setRecetasGuardadas(data.recetas);
        })
        .catch(err => console.error("Error cargando recetas:", err));
    }
  }, [abierto, usuario]);

  const guardarPreferencias = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/perfil/${usuario.id_usuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferencias_dieteticas: preferencias })
      });
      const data = await res.json();
      if (data.success) {
        setEditandoPreferencias(false);
        // Actualizar el objeto usuario localmente si fuera necesario (opcional)
      }
    } catch (err) {
      console.error("Error guardando preferencias:", err);
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
      console.error("Error eliminando:", err);
    }
  };

  const generarPlanSemanal = async () => {
    setCargandoPlan(true);
    setPlanSemanal(null);

    try {
      const promptContextualizado = `Eres VENIA, una abuela venezolana experta en nutrición y cocina típica. 
      Crea un plan semanal (Lunes a Domingo) de alimentación venezolana balanceada para el usuario ${usuario?.nombre || ''}.
      Toma en cuenta estas preferencias del usuario: "${preferencias || 'Sin restricciones'}".
      
      DEBES responder ÚNICAMENTE en formato json (objeto JSON) válido con la siguiente estructura:
      {
        "lunes": { 
          "desayuno": { "nombre": "...", "ingredientes": ["..."], "pasos": ["..."] },
          "almuerzo": { "nombre": "...", "ingredientes": ["..."], "pasos": ["..."] },
          "cena": { "nombre": "...", "ingredientes": ["..."], "pasos": ["..."] }
        },
        ... hasta domingo
      }
      
      IMPORTANTE: Las recetas deben ser tradicionales venezolanas, nutritivas y detalladas. Responde solo el JSON.`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: promptContextualizado }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });

      const dataString = chatCompletion.choices[0]?.message?.content || "{}";
      const planParseado = JSON.parse(dataString);
      setPlanSemanal(planParseado);
      // Auto-guardado
      if (usuario?.id_usuario) {
        localStorage.setItem(`venia_plan_${usuario.id_usuario}`, JSON.stringify(planParseado));
      }
    } catch (error) {
      console.error('Error al generar el plan:', error);
      setMensajePlan('Mijo, no pude armar el plan. Inténtalo de nuevo.');
    } finally {
      setCargandoPlan(false);
    }
  };

  const guardarPlanSemanal = async () => {
    if (!planSemanal || !usuario?.id_usuario) return;
    try {
      // Guardamos en localStorage ya que el backend no tiene soporte directo por ahora
      localStorage.setItem(`venia_plan_${usuario.id_usuario}`, JSON.stringify(planSemanal));
      setMensajePlan('¡Plan guardado en el navegador, mijo! 📅');
      setTimeout(() => setMensajePlan(''), 3000);
    } catch (err) {
      console.error("Error guardando plan:", err);
    }
  };

  if (!abierto) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '100%',
      height: '100%',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end',
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(4px)',
      transition: 'all 0.4s'
    }} onClick={onCerrar}>
      
      <div 
        style={{
          width: '450px',
          height: '100%',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Dashboard */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '24px', fontWeight: '800' }}>Panel de Control</h2>
          <button onClick={onCerrar} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Navegación Interna */}
        <nav style={{ display: 'flex', gap: '10px', marginBottom: '40px', background: 'rgba(255,255,255,0.02)', padding: '5px', borderRadius: '12px' }}>
          {['perfil', 'recetas', 'plan'].map(sec => (
            <button
              key={sec}
              onClick={() => setSeccionActiva(sec)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: seccionActiva === sec ? 'rgba(255, 215, 0, 0.15)' : 'transparent',
                color: seccionActiva === sec ? '#FFD700' : 'rgba(255,255,255,0.5)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textTransform: 'capitalize'
              }}
            >
              {sec === 'plan' ? 'Plan Semanal' : sec === 'recetas' ? 'Guardadas' : sec}
            </button>
          ))}
        </nav>

        {/* Contenido Dinámico */}
        <div style={{ flex: 1, paddingRight: '5px' }}>
          {seccionActiva === 'perfil' && (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#FFD700', margin: '0 auto 15px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#003893', fontWeight: 'bold' }}>
                  {usuario?.nombre?.charAt(0) || 'U'}
                </div>
                <h3 style={{ color: 'white', margin: '0 0 5px 0' }}>{usuario?.nombre || 'Usuario'}</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>{usuario?.email || 'email@ejemplo.com'}</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ color: 'white', fontSize: '15px', margin: 0 }}>Preferencias de Dieta</h4>
                  {!editandoPreferencias && (
                    <button onClick={() => setEditandoPreferencias(true)} style={{ background: 'transparent', border: 'none', color: '#FFD700', fontSize: '12px', cursor: 'pointer' }}>Editar</button>
                  )}
                </div>
                
                {editandoPreferencias ? (
                  <div>
                    <textarea 
                      value={preferencias}
                      onChange={(e) => setPreferencias(e.target.value)}
                      placeholder="Ej: Soy alérgico al maní, evito el gluten..."
                      style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '10px', color: 'white', fontSize: '14px', minHeight: '80px', marginBottom: '10px', outline: 'none' }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={guardarPreferencias} style={{ flex: 1, background: '#FFD700', color: '#0f172a', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Guardar</button>
                      <button onClick={() => setEditandoPreferencias(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>
                    {preferencias || "No has definido preferencias nutricionales."}
                  </p>
                )}
              </div>
            </div>
          )}

          {seccionActiva === 'recetas' && (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              {recetasGuardadas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ opacity: 0.2, marginBottom: '20px' }}>
                    <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="#EF3340" strokeWidth="1"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>Aún no has guardado recetas, mijo.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {recetasGuardadas.map(rec => (
                    <div 
                      key={rec.id_receta} 
                      onClick={() => onSeleccionarReceta(rec)}
                      className="receta-card-interactive"
                      style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        padding: '15px', 
                        borderRadius: '12px', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        position: 'relative',
                        transition: 'all 0.3s',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h4 style={{ color: '#FFD700', margin: 0, fontSize: '15px', flex: 1 }}>{rec.titulo}</h4>
                        <button 
                          onClick={(e) => { e.stopPropagation(); eliminarReceta(rec.id_receta); }}
                          style={{ 
                            background: 'rgba(239, 51, 64, 0.1)', 
                            border: 'none', 
                            color: '#EF3340', 
                            width: '28px', 
                            height: '28px', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: '10px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 51, 64, 0.2)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 51, 64, 0.1)'}
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {(() => {
                          try {
                            const parsed = JSON.parse(rec.descripcion);
                            return parsed.historia || rec.descripcion;
                          } catch (e) {
                            return rec.descripcion;
                          }
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {seccionActiva === 'plan' && (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              {!planSemanal && !cargandoPlan ? (
                <>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: '1.6', marginBottom: '25px' }}>
                    ¿Quieres que la abuela te planee la semana? <br /> Generaremos un menú balanceado basado en tus gustos.
                  </p>
                  <button 
                    onClick={generarPlanSemanal}
                    style={{ width: '100%', background: '#FFD700', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', transition: 'all 0.3s' }}>
                    Generar Plan Semanal por IA
                  </button>
                </>
              ) : cargandoPlan ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#FFD700', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px auto' }}></div>
                  <p style={{ color: '#FFD700', fontWeight: '600' }}>Organizando la semana, mijo...</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ color: 'white', margin: 0 }}>Tu Menú Semanal</h4>
                    <button onClick={() => setPlanSemanal(null)} style={{ background: 'transparent', border: 'none', color: '#FFD700', fontSize: '12px', cursor: 'pointer' }}>Nuevo Plan</button>
                  </div>
                  
                  {mensajePlan && <div style={{ color: '#FFD700', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>{mensajePlan}</div>}

                  {/* CARTA DEL PLAN SEMANAL */}
                  <div 
                    onClick={() => onVerPlanDetallado(planSemanal)}
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.05) 100%)', 
                      borderRadius: '20px', 
                      padding: '30px', 
                      border: '1px solid rgba(255,215,0,0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '15px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ fontSize: '40px' }}>📅</div>
                    <div>
                      <h5 style={{ color: '#FFD700', margin: '0 0 5px 0', fontSize: '18px' }}>Plan Semanal de {usuario?.nombre || 'Mi Usuario'}</h5>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>Haz clic para ver todas tus comidas detalladas</p>
                    </div>
                    <div style={{ background: '#FFD700', color: '#0f172a', padding: '8px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
                      VER DETALLES
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={guardarPlanSemanal}
                      style={{ flex: 2, background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700', color: '#FFD700', padding: '12px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                      💾 Guardar Plan
                    </button>
                    <button 
                      onClick={() => setPlanSemanal(null)}
                      style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                      Nuevo
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer del Dashboard */}
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
        .receta-card-interactive:hover { 
          background: rgba(255, 215, 0, 0.08) !important; 
          border-color: rgba(255, 215, 0, 0.3) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
