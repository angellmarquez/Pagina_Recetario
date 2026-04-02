import React from 'react';
import arepaBg from '../../assets/arepas-4.jpg';

// Helper to get a professional image for Venezuelan dishes
export const getRecipeImage = (titulo) => {
  const t = titulo.toLowerCase();
  if (t.includes('arepa')) return 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=600&auto=format&fit=crop';
  if (t.includes('pabellon') || t.includes('pabellón')) return 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=600&auto=format&fit=crop';
  if (t.includes('cachapa')) return 'https://images.unsplash.com/photo-1614961191076-2679268f7ced?q=80&w=600&auto=format&fit=crop';
  if (t.includes('asado')) return 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop';
  if (t.includes('hallaca')) return 'https://images.unsplash.com/photo-1599388839592-3bc3a5027f31?q=80&w=600&auto=format&fit=crop';
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop';
};

const SearchView = ({ prompt, setPrompt, generarReceta, cargando, seccionActiva, recentRecipes = [], onSelectRecipe, onClearHistory }) => {
  const isNevera = seccionActiva === 'nevera';

  const handleSearch = (term = null) => {
    const finalTerm = term || prompt;
    if (!finalTerm) return;
    generarReceta(finalTerm);
  };

  return (
    <div className="stagger-1" style={{ 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: '40px 0 100px 0',
      position: 'relative',
      minHeight: '800px',
      justifyContent: 'flex-start',
      borderRadius: '40px',
      overflow: 'hidden',
      marginTop: '20px'
    }}>
      
      {/* Background Image with Cinematic Zoom Overlay */}
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
        transform: prompt ? 'scale(1.15)' : 'scale(1.1)',
        filter: 'brightness(0.5) saturate(1.1)',
        transition: 'transform 2s ease, filter 2s ease'
      }}></div>
      
      {/* Cinematic Vignette & Gradient Overlays */}
      <div className="vignette-layer"></div>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 50% 50%, rgba(10, 15, 29, 0.1) 0%, rgba(10, 15, 29, 0.9) 100%)',
        zIndex: -1
      }}></div>

      {/* Hero Content Card */}
      <div className="glass-panel-premium stagger-2" style={{ 
        width: '95%', 
        maxWidth: '850px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        position: 'relative',
        zIndex: 10,
        padding: '60px',
        boxShadow: '0 50px 100px rgba(0,0,0,0.8)'
      }}>
        
        {/* Animated Badge */}
        <div className="hero-badge-premium">
          <span style={{ fontSize: '14px' }}>✨</span> {isNevera ? 'Tradition & Innovation' : 'Venezuelan Heritage'}
        </div>

        <div>
          <h1 className="hero-title" style={{ 
            fontSize: 'clamp(44px, 7vw, 84px)', 
            textAlign: 'left', 
            marginBottom: '20px',
            textShadow: '0 0 50px rgba(0,0,0,1)',
            letterSpacing: '-2px'
          }}>
            {isNevera ? 'Explorar ' : 'Buscar '}
            <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>{isNevera ? 'Recetas' : 'Sabores'}</span>
          </h1>
          
          <p className="hero-subtitle" style={{ 
            fontSize: '20px', 
            opacity: 0.8, 
            textAlign: 'left', 
            marginBottom: '10px',
            maxWidth: '650px',
            lineHeight: '1.4',
            fontWeight: '500'
          }}>
            {isNevera 
              ? "Dime qué ingredientes tienes y mi IA creará una obra maestra culinaria para ti."
              : "Busca los platos más emblemáticos de Venezuela y aprende a prepararlos con amor."}
          </p>
        </div>

        {/* Premium Search Experience */}
        <div className="glass-input-wrapper">
          <span style={{ fontSize: '24px', opacity: 0.6 }}>🔍</span>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !cargando) handleSearch(); }}
            placeholder={isNevera ? "Tengo pollo, aguacate, cebolla..." : "Pabellón, Arepas, Asado Negro..."}
            style={{ 
              flex: 1, 
              background: 'transparent', 
              border: 'none', 
              outline: 'none', 
              color: 'white', 
              fontSize: '20px', 
              padding: '16px 0',
              fontWeight: '500'
            }}
          />
          <button 
            className="btn-gold"
            onClick={() => handleSearch()} 
            disabled={cargando || !prompt} 
            style={{ 
              padding: '16px 45px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '18px',
              boxShadow: '0 15px 40px rgba(245, 158, 11, 0.4)'
            }}>
            <span>{cargando ? '⏳' : '✦'}</span> {cargando ? 'Cocinando...' : 'Cook'}
          </button>
        </div>

        {/* Suggested Tags (Inspirations) */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '10px' }}>
          <span style={{ 
            fontSize: '11px', 
            color: 'rgba(255,255,255,0.4)', 
            fontWeight: '900', 
            textTransform: 'uppercase', 
            letterSpacing: '0.25em' 
          }}>RECOMENDACIONES DEL CHEF:</span>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {['Pabellón', 'Cachapas', 'Arepa Pelúa'].map(chip => (
              <button 
                key={chip} 
                className="suggested-tag-premium"
                onClick={() => { setPrompt(chip); handleSearch(chip); }} 
                style={{ fontSize: '11px', padding: '6px 14px' }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Discoveries History Section - EXCLUSIVE TO NEVERA */}
      {isNevera && recentRecipes.length > 0 && (
        <div className="history-section" style={{ maxWidth: '1200px', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
            <div>
              <span className="hero-badge-premium" style={{ marginBottom: '10px' }}>Tradition & Innovation</span>
              <h2 style={{ fontSize: '48px', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>Recent Masterpieces</h2>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
               <button 
                onClick={onClearHistory}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '11px', cursor: 'pointer', fontWeight: '800', letterSpacing: '0.1em' }}
              >
                CLEAR ALL
              </button>
              <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}>View All History →</span>
            </div>
          </div>
          
          <div className="history-grid-cinematic">
            {recentRecipes.map((recipe, i) => (
              <div 
                key={`${recipe.titulo}-${i}`} 
                className="recipe-card-cinematic stagger-3"
                onClick={() => onSelectRecipe(recipe)}
              >
                <div className="recipe-image-container">
                  <img src={getRecipeImage(recipe.titulo)} alt={recipe.titulo} />
                  <div className="floating-badge badge-left">SIGNATURE</div>
                  <div className="floating-badge badge-right">CHEF'S CHOICE</div>
                </div>
                
                <div className="recipe-body-premium">
                  <div className="recipe-title-cinematic">
                    {recipe.titulo}
                    <div className="recipe-time-indicator">
                      <span>⏱️</span> {recipe.tiempo || '45 min'}
                    </div>
                  </div>
                  
                  <p className="recipe-description-cinematic">
                    {recipe.historia || "Una obra maestra de nuestra cocina tradicional venezolana, preparada con el toque secreto de la abuela."}
                  </p>
                  
                  <div className="recipe-footer-tags">
                    {recipe.tags && recipe.tags.slice(0, 2).map((t, idx) => (
                      <span key={idx}>{t}</span>
                    ))}
                    {!recipe.tags && (
                      <>
                        <span>ALMUERZO</span>
                        <span>TRADICIONAL</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchView;
