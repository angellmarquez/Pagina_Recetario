import React from 'react';

const RecipeDetailView = ({ recetaActiva, guardarReceta, guardando, mensajeGuardado, setRecetaActiva, setPrompt, setRespuestaIA }) => {
  return (
    <div className="fade-in" style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      background: 'rgba(6, 14, 32, 0.4)', 
      borderRadius: '24px', 
      overflow: 'hidden', 
      border: '1px solid var(--glass-border)',
      boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)'
    }}>
      
      {/* HEADER HERO (Expansive Image) */}
      <div style={{ position: 'relative', height: '400px', width: '100%', overflow: 'hidden' }}>
        <img 
          src={`http://localhost:3000/api/recetas/imagen?q=${encodeURIComponent(recetaActiva.titulo)}`} 
          alt={recetaActiva.titulo}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.8)' }}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=2070&auto=format&fit=crop'; }}
        />
        
        {/* Overlay Gradients */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to bottom, transparent 40%, rgba(6,14,32,0.95) 100%)'
        }}></div>

        {/* Top left Volver Button */}
        <button 
          onClick={() => { setRecetaActiva(null); setPrompt(''); setRespuestaIA(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          style={{ 
            position: 'absolute', top: '30px', left: '30px', zIndex: 10,
            background: 'rgba(6,14,32,0.6)', backdropFilter: 'blur(10px)',
            color: 'white', border: '1px solid rgba(255,255,255,0.2)', 
            padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '600', transition: 'all 0.3s' 
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,215,0,0.2)'; e.currentTarget.style.borderColor = '#FFD700'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(6,14,32,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}>
          <span>←</span> Volver
        </button>

        {/* Title Content over Image */}
        <div style={{ position: 'absolute', bottom: '30px', left: '40px', right: '40px', zIndex: 10 }}>
          <h1 style={{ fontSize: '56px', color: '#FFD700', margin: '0 0 10px', fontWeight: '900', letterSpacing: '-1px', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
            {recetaActiva.titulo}
          </h1>
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', margin: 0, maxWidth: '800px', lineHeight: '1.5', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {recetaActiva.historia}
          </p>
        </div>
      </div>

      {/* METADATA BAR */}
      <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ flex: 1, padding: '20px 40px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,215,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🕒</div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tiempo de Prep.</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>{recetaActiva.tiempo}</div>
          </div>
        </div>
        <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
        <div style={{ flex: 1, padding: '20px 40px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,215,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📊</div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Dificultad</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>{recetaActiva.dificultad}</div>
          </div>
        </div>
        <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
        <div style={{ flex: 1, padding: '20px 40px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,215,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👪</div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Porciones</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>{recetaActiva.porciones} porciones</div>
          </div>
        </div>
      </div>

      {/* main content flex row */}
      <div style={{ display: 'flex', padding: '40px', gap: '60px' }}>
        
        {/* INGREDIENTES */}
        <section style={{ flex: '1', minWidth: '300px' }}>
          <h2 style={{ color: 'white', fontSize: '28px', borderBottom: '2px solid rgba(255,215,0,0.3)', paddingBottom: '15px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#FFD700' }}>🥗</span> Ingredientes
          </h2>
          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '20px', padding: '30px', border: '1px solid var(--glass-border)' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {recetaActiva.ingredientes.map((ing, i) => (
                <li key={i} style={{ 
                  color: 'rgba(255,255,255,0.85)', padding: '14px 0', borderBottom: i === recetaActiva.ingredientes.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', gap: '15px', fontSize: '16px'
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFD700' }}></div>
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          <button 
            onClick={guardarReceta} 
            disabled={guardando} 
            style={{ 
              width: '100%',
              background: mensajeGuardado ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 215, 0, 0.1)', 
              border: `1px solid ${mensajeGuardado ? '#4caf50' : '#FFD700'}`, 
              color: mensajeGuardado ? '#4caf50' : '#FFD700', 
              padding: '20px', 
              borderRadius: '16px', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              marginTop: '40px',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s'
            }}>
            {mensajeGuardado ? '✓ ' + mensajeGuardado : (guardando ? 'Guardando en cuaderno...' : '❤️ Guardar en Mis Recetas')}
          </button>
        </section>

        {/* PREPARACION */}
        <section style={{ flex: '2', minWidth: '400px' }}>
          <h2 style={{ color: 'white', fontSize: '28px', borderBottom: '2px solid rgba(255,215,0,0.3)', paddingBottom: '15px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#FFD700' }}>👨‍🍳</span> ¡A cocinar!
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {recetaActiva.pasos.map((paso, i) => (
              <div key={i} className="glass-card" style={{ display: 'flex', gap: '25px', padding: '30px' }}>
                <div style={{ 
                  minWidth: '45px', height: '45px', background: 'rgba(255,215,0,0.15)', border: '1px solid #FFD700', borderRadius: '50%', color: '#FFD700', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '900'
                }}>
                  {i + 1}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.8', fontSize: '18px', margin: 0 }}>
                  {paso}
                </p>
              </div>
            ))}
          </div>
        </section>
        
      </div>
    </div>
  );
};

export default RecipeDetailView;
