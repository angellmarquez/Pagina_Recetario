import React from 'react';
import { Clock, Users, BarChart3, Flame, ChefHat, Sparkles, ArrowLeft, Utensils } from 'lucide-react';
import RecipeImage from '../components/RecipeImage';

const RecipeDetailView = ({ recetaActiva, guardarReceta, guardando, mensajeGuardado, setRecetaActiva, setPrompt, setRespuestaIA }) => {
  return (
    <div className="fade-in" style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      background: '#ffffff', 
      borderRadius: '24px', 
      overflow: 'hidden', 
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--glass-shadow)'
    }}>
      
      {/* HEADER HERO (Expansive Image) */}
      <div style={{ position: 'relative', height: '400px', width: '100%', overflow: 'hidden' }}>
        <RecipeImage 
          query={recetaActiva.titulo} 
          origin="venezuela" 
          alt={recetaActiva.titulo} 
          style={{ height: '100%', width: '100%', filter: 'brightness(0.75)' }}
        />
        
        {/* Overlay Gradients — dark bottom for text readability over image */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(30,58,95,0.90) 100%)'
        }}></div>

        {/* Top left Volver Button */}
        <button 
          onClick={() => { setRecetaActiva(null); setPrompt(''); setRespuestaIA(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          style={{ 
            position: 'absolute', top: '30px', left: '30px', zIndex: 1000,
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
            color: 'var(--text-primary)', border: '1px solid var(--glass-border)', 
            padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '600', transition: 'all 0.3s' 
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#ffffff'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.color = 'var(--text-primary)'; }}>
          <ArrowLeft size={18} /> Volver
        </button>

        {/* Title Content over Image — always white text since overlay is dark */}
        <div style={{ position: 'absolute', bottom: '30px', left: '40px', right: '40px', zIndex: 10 }}>
          {/* Tags / Badges */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
            {recetaActiva.tags && recetaActiva.tags.map((tag, i) => (
              <span key={i} className="badge" style={{ 
                background: 'rgba(46, 125, 94, 0.85)', 
                color: '#ffffff', 
                border: '1px solid rgba(58, 158, 119, 0.6)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                backdropFilter: 'blur(4px)'
              }}>
                {tag}
              </span>
            ))}
          </div>
          {/* Title — white on dark overlay, always readable */}
          <h1 style={{ fontSize: '52px', color: '#ffffff', margin: '0 0 10px', fontWeight: '900', letterSpacing: '-1px', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
            {recetaActiva.titulo}
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', margin: 0, maxWidth: '800px', lineHeight: '1.5', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            {recetaActiva.historia}
          </p>
        </div>
      </div>

      {/* METADATA BAR — light background, dark text */}
      <div style={{ display: 'flex', gap: '2px', background: '#f9f6f1', borderBottom: '1px solid var(--glass-border)' }}>
        {/* PREP TIME */}
        <div style={{ flex: 1, padding: '25px 30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(46, 125, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>Prep.</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{recetaActiva.tiempo}</div>
          </div>
        </div>
        <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
        
        {/* DIFFICULTY */}
        <div style={{ flex: 1, padding: '25px 30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(46, 125, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <BarChart3 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>Dificultad</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{recetaActiva.dificultad}</div>
          </div>
        </div>
        <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
        
        {/* PORTIONS */}
        <div style={{ flex: 1, padding: '25px 30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(46, 125, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>Porciones</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{recetaActiva.porciones}</div>
          </div>
        </div>
        <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>

        {/* CALORIES */}
        <div style={{ flex: 1, padding: '25px 30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(46, 125, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Flame size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>Calorías</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{recetaActiva.calorias || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* main content flex row */}
      <div style={{ display: 'flex', padding: '40px', gap: '60px', background: '#ffffff' }}>
        
        {/* INGREDIENTES */}
        <section style={{ flex: '1', minWidth: '300px' }}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '24px', borderBottom: '2px solid rgba(46, 125, 94, 0.2)', paddingBottom: '15px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Utensils size={24} style={{ color: 'var(--primary)' }} /> Ingredientes
          </h2>
          <div style={{ background: 'var(--surface-bright)', borderRadius: '24px', padding: '30px', border: '1.5px solid var(--glass-border)', boxShadow: '0 8px 32px rgba(30, 58, 95, 0.04)' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {recetaActiva.ingredientes.map((ing, i) => (
                <li key={i} style={{ 
                  color: 'var(--text-primary)', padding: '14px 0', borderBottom: i === recetaActiva.ingredientes.length - 1 ? 'none' : '1px solid var(--outline-variant)',
                  display: 'flex', alignItems: 'center', gap: '15px', fontSize: '16px'
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }}></div>
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
              background: mensajeGuardado ? 'rgba(46, 125, 94, 0.15)' : 'var(--primary)', 
              border: `1px solid ${mensajeGuardado ? 'var(--primary)' : 'var(--primary)'}`, 
              color: mensajeGuardado ? 'var(--primary)' : '#ffffff', 
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
          <h2 style={{ color: 'var(--text-primary)', fontSize: '24px', borderBottom: '2px solid rgba(46, 125, 94, 0.2)', paddingBottom: '15px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ChefHat size={24} style={{ color: 'var(--primary)' }} /> ¡A cocinar!
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {recetaActiva.pasos.map((paso, i) => (
              <div key={i} style={{ 
                display: 'flex', gap: '20px', padding: '28px 32px',
                background: 'var(--surface-bright)',
                borderRadius: '24px',
                border: '1.5px solid var(--glass-border)',
                boxShadow: '0 8px 24px rgba(30, 58, 95, 0.03)',
                transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
              }}>
                <div style={{ 
                  minWidth: '42px', height: '42px', 
                  background: 'var(--primary)', 
                  borderRadius: '50%', 
                  color: '#ffffff', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '16px', fontWeight: '900',
                  flexShrink: 0
                }}>
                  {i + 1}
                </div>
                <p style={{ color: 'var(--text-primary)', lineHeight: '1.8', fontSize: '16px', margin: 0 }}>
                  {paso}
                </p>
              </div>
            ))}

            {/* CHEF TIPS CARD */}
            {recetaActiva.consejo_chef && (
              <div style={{ 
                marginTop: '10px', 
                padding: '32px', 
                background: 'linear-gradient(135deg, rgba(46,125,94,0.08) 0%, rgba(249,246,241,1) 100%)',
                border: '1px solid rgba(46,125,94,0.25)',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  position: 'absolute', top: '-20px', right: '-20px', opacity: 0.06, color: 'var(--primary)'
                }}>
                  <Sparkles size={120} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', color: 'var(--primary)' }}>
                  <Sparkles size={20} />
                  <span style={{ fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px' }}>Consejos de la Abuela VenIA</span>
                </div>
                <p style={{ 
                  color: 'var(--text-secondary)', fontSize: '17px', fontStyle: 'italic', margin: 0, lineHeight: '1.7', position: 'relative', zIndex: 2
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
