import React from 'react';
import arepaBg from '../../assets/arepas-4.jpg';

const SearchView = ({ prompt, setPrompt, generarReceta, cargando, seccionActiva }) => {
  const isNevera = seccionActiva === 'nevera';
  
  return (
    <div className="stagger-1" style={{ 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: '80px 0 120px 0',
      position: 'relative',
      minHeight: '600px',
      justifyContent: 'center',
      borderRadius: '40px',
      overflow: 'hidden',
      marginTop: '20px'
    }}>
      
      {/* Background Image with Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${arepaBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: -1,
        transform: 'scale(1.1)', // Subtle scale for parallax-like feel
      }}></div>
      
      {/* Dark Gradient Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, rgba(10, 15, 29, 0.4) 0%, rgba(10, 15, 29, 0.8) 100%)',
        zIndex: -1
      }}></div>

      {/* Hero Content Card */}
      <div className="glass-card" style={{ 
        width: '90%', 
        maxWidth: '750px',
        padding: '50px', 
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(30px)',
        webkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        boxShadow: '0 40px 100px rgba(0,0,0,0.6)'
      }}>
        <h1 className="hero-title" style={{ fontSize: '56px', textAlign: 'left', marginBottom: '10px' }}>
          {isNevera ? '¿Qué hay en tu ' : '¿Qué hay en el '}
          <span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>{isNevera ? 'nevera' : 'budare'}</span> hoy?
        </h1>
        
        <p className="hero-subtitle" style={{ fontSize: '16px', opacity: 0.9, textAlign: 'left', marginBottom: '15px' }}>
          {isNevera 
            ? "Dime qué ingredientes tienes a la mano y mi IA creará una obra maestra culinaria para ti."
            : "Tell us what ingredients you have, and our AI will craft a traditional Venezuelan masterpiece for you."}
        </p>

        {/* Unified Search Bar */}
        <div style={{ 
          display: 'flex', 
          width: '100%', 
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '10px',
          alignItems: 'center',
          gap: '12px',
          transition: 'var(--transition-smooth)'
        }} className="search-input-wrapper">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !cargando) generarReceta(); }}
            placeholder={isNevera ? "I have chicken, avocado, onion..." : "I have black beans, plantains, and beef..."}
            style={{ 
              flex: 1, 
              background: 'transparent', 
              border: 'none', 
              outline: 'none', 
              color: 'white', 
              fontSize: '17px', 
              padding: '10px 15px',
              fontWeight: '400'
            }}
          />
          <button 
            className="btn-gold"
            onClick={() => generarReceta()} 
            disabled={cargando || !prompt} 
            style={{ 
              padding: '12px 30px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '800'
            }}>
            <span style={{ fontSize: '18px' }}>✦</span> {cargando ? '...' : 'Cook'}
          </button>
        </div>

        {/* Suggested Tags */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '5px' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Try These:</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Beef Mechada', 'Sweet Arepa', 'Reina Pepiada'].map(chip => (
              <button 
                key={chip} 
                onClick={() => { setPrompt(chip); generarReceta(chip); }} 
                style={{ 
                  padding: '6px 14px', 
                  fontSize: '11px', 
                  fontWeight: '700',
                  cursor: 'pointer', 
                  color: 'white', 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <style>{`
        .search-input-wrapper:focus-within {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: var(--primary) !important;
          box-shadow: 0 0 40px rgba(245, 158, 11, 0.2) !important;
        }
      `}</style>
    </div>
  );
};

export default SearchView;
