import React from 'react';

const SearchView = ({ prompt, setPrompt, generarReceta, cargando, seccionActiva }) => {
  const isNevera = seccionActiva === 'nevera';
  
  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Search Input Area */}
      <div className="stagger-2 glass-card" style={{ 
        display: 'flex', 
        width: '100%', 
        padding: '12px 20px', 
        marginBottom: '40px', 
        alignItems: 'center',
        background: 'rgba(25, 37, 64, 0.6)',
        border: '1px solid rgba(255, 215, 0, 0.2)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        transition: 'all 0.3s'
      }}>
        <div style={{ paddingRight: '20px', color: '#FFD700', fontSize: '24px' }}>
           {isNevera ? '🔥' : '🔍'}
        </div>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !cargando) generarReceta(); }}
          placeholder={isNevera ? "Ej: tengo pollo, cebolla, plátano verde y queso..." : "Ej: ¿Cómo hago cachapas con queso de mano?"}
          style={{ 
            flex: 1, 
            background: 'transparent', 
            border: 'none', 
            outline: 'none', 
            color: 'white', 
            fontSize: '18px', 
            fontFamily: 'inherit',
            letterSpacing: '0.5px'
          }}
        />
        <button 
          onClick={() => generarReceta()} 
          disabled={cargando || !prompt} 
          style={{ 
            background: (cargando || !prompt) ? 'rgba(255, 215, 0, 0.3)' : '#FFD700', 
            color: '#060E20', 
            border: 'none', 
            padding: '15px 40px', 
            borderRadius: '20px', 
            fontWeight: '900', 
            fontSize: '16px',
            cursor: (cargando || !prompt) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
          }}>
          {cargando ? 'Cocinando...' : (isNevera ? '¡Dime qué hago!' : 'Buscar Receta')}
        </button>
      </div>

      {/* Suggested Chips Area (Only for direct search) */}
      {!isNevera && (
        <div className="stagger-3" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Arepa Pelúa', 'Pabellón Margariteño', 'Cachapas de Hoja', 'Tequeños', 'Patacón Zuliano', 'Asado Negro'].map(chip => (
            <button 
              key={chip} 
              onClick={() => { setPrompt(chip); generarReceta(chip); }} 
              className="glass-card" 
              style={{ 
                padding: '12px 24px', 
                fontSize: '15px', 
                fontWeight: '600',
                cursor: 'pointer', 
                color: 'rgba(255,255,255,0.9)', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '30px',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,215,0,0.1)'; e.currentTarget.style.borderColor = '#FFD700'; e.currentTarget.style.color = '#FFD700'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; }}
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchView;
