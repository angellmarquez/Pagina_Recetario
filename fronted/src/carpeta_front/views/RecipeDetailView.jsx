import React from 'react';
import { Clock, Users, BarChart3, Flame, ChefHat, Sparkles, ArrowLeft, Utensils } from 'lucide-react';
import RecipeImage from '../components/RecipeImage';

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
        <RecipeImage 
          query={recetaActiva.titulo} 
          origin="venezuela" 
          alt={recetaActiva.titulo} 
          style={{ height: '100%', width: '100%', filter: 'brightness(0.8)' }}
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
            position: 'absolute', top: '30px', left: '30px', zIndex: 1000,
            background: 'rgba(6,14,32,0.6)', backdropFilter: 'blur(10px)',
            color: 'white', border: '1px solid rgba(255,255,255,0.2)', 
            padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '600', transition: 'all 0.3s' 
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,215,0,0.2)'; e.currentTarget.style.borderColor = '#FFD700'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(6,14,32,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}>
          <ArrowLeft size={18} /> Volver
        </button>

        {/* Title Content over Image */}
        <div style={{ position: 'absolute', bottom: '30px', left: '40px', right: '40px', zIndex: 10 }}>
          {/* Tags / Badges */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
            {recetaActiva.tags && recetaActiva.tags.map((tag, i) => (
              <span key={i} className="badge" style={{ 
                background: 'rgba(245, 158, 11, 0.15)', 
                color: '#FFD700', 
                border: '1px solid rgba(255, 215, 0, 0.3)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {tag}
              </span>
            ))}
          </div>
          <h1 style={{ fontSize: '56px', color: '#FFD700', margin: '0 0 10px', fontWeight: '900', letterSpacing: '-1px', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
            {recetaActiva.titulo}
          </h1>
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', margin: 0, maxWidth: '800px', lineHeight: '1.5', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {recetaActiva.historia}
          </p>
        </div>
      </div>

      {/* METADATA BAR */}
      <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
        {/* PREP TIME */}
        <div style={{ flex: 1, padding: '25px 30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(255,215,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>Prep.</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>{recetaActiva.tiempo}</div>
          </div>
        </div>
        <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
        
        {/* DIFFICULTY */}
        <div style={{ flex: 1, padding: '25px 30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(255,215,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700' }}>
            <BarChart3 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>Dificultad</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>{recetaActiva.dificultad}</div>
          </div>
        </div>
        <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
        
        {/* PORTIONS */}
        <div style={{ flex: 1, padding: '25px 30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(255,215,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>Porciones</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>{recetaActiva.porciones}</div>
          </div>
        </div>
        <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>

        {/* CALORIES */}
        <div style={{ flex: 1, padding: '25px 30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(255,215,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700' }}>
            <Flame size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>Calorías</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>{recetaActiva.calorias || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* main content flex row */}
      <div style={{ display: 'flex', padding: '40px', gap: '60px' }}>
        
        {/* INGREDIENTES */}
        <section style={{ flex: '1', minWidth: '300px' }}>
          <h2 style={{ color: 'white', fontSize: '24px', borderBottom: '2px solid rgba(255,215,0,0.1)', paddingBottom: '15px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Utensils size={24} style={{ color: '#FFD700' }} /> Ingredientes
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
          <h2 style={{ color: 'white', fontSize: '24px', borderBottom: '2px solid rgba(255,215,0,0.1)', paddingBottom: '15px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ChefHat size={24} style={{ color: '#FFD700' }} /> ¡A cocinar!
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {recetaActiva.pasos.map((paso, i) => (
              <div key={i} className="glass-card" style={{ display: 'flex', gap: '25px', padding: '30px' }}>
                <div style={{ 
                  minWidth: '45px', height: '45px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '50%', color: '#FFD700', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900'
                }}>
                  {i + 1}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.8', fontSize: '18px', margin: 0 }}>
                  {paso}
                </p>
              </div>
            ))}

            {/* CHEF TIPS CARD */}
            {recetaActiva.consejo_chef && (
              <div className="glass-card" style={{ 
                marginTop: '10px', 
                padding: '35px', 
                background: 'linear-gradient(135deg, rgba(255,215,0,0.05) 0%, rgba(6,14,32,0.4) 100%)',
                border: '1px solid rgba(255,215,0,0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, color: '#FFD700'
                }}>
                  <Sparkles size={120} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', color: '#FFD700' }}>
                  <Sparkles size={20} />
                  <span style={{ fontWeight: '800', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px' }}>Consejos de la Abuela VenIA</span>
                </div>
                <p style={{ 
                  color: 'rgba(255,255,255,0.95)', fontSize: '18px', fontStyle: 'italic', margin: 0, lineHeight: '1.6', position: 'relative', zIndex: 2
                }}>
                  "{recetaActiva.consejo_chef}"
                </p>
              </div>
            )}
          </div>
        </section>
        
      </div>
    </div>
  );
};

export default RecipeDetailView;
