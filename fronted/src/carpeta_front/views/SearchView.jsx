import React from 'react';
import RecipeImage from '../components/RecipeImage';

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

const SearchView = ({ prompt, setPrompt, generarReceta, cargando, seccionActiva, recentRecipes = [], onSelectRecipe, onClearHistory, lockIAUntil }) => {
  const isLocked = lockIAUntil && Date.now() < lockIAUntil;
  const isNevera = seccionActiva === 'nevera';

  const handleSearch = (term = null) => {
    const finalTerm = term || prompt;
    if (!finalTerm) return;
    generarReceta(finalTerm);
  };

  return (
    <div className="stagger-1" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* ─── HERO SECTION — Clean Vichy, no food background ─── */}
      <div style={{
        width: '100%',
        position: 'relative',
        borderRadius: '32px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--surface-bright) 0%, var(--surface) 100%)',
        backgroundImage: 'none',
        border: '1.5px solid var(--glass-border)',
        padding: '72px 60px 64px',
        marginBottom: '48px',
        boxShadow: '0 30px 60px rgba(30, 58, 95, 0.08)'
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,125,94,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,58,95,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Decorative food icons top-right */}
        <div style={{ position: 'absolute', top: '24px', right: '40px', display: 'flex', gap: '12px', opacity: 0.18, fontSize: '40px', pointerEvents: 'none' }}>
          <span>🫕</span><span>🌿</span><span>🍋</span>
        </div>

        {/* Badge */}
        <div className="hero-badge-premium" style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '14px' }}>✦</span>
          {isNevera ? 'Tradición e Innovación' : 'Herencia Venezolana'}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(40px, 5vw, 68px)',
          fontWeight: '900',
          letterSpacing: '-2px',
          lineHeight: '1.05',
          margin: '0 0 16px',
          color: 'var(--text-primary)',
          maxWidth: '700px'
        }}>
          {isNevera ? 'Explorar ' : 'Buscar '}
          <span style={{ color: 'var(--primary)' }}>{isNevera ? 'Recetas' : 'Sabores'}</span>
        </h1>

        <p style={{
          fontSize: '18px',
          color: 'var(--text-primary)',
          marginBottom: '40px',
          maxWidth: '560px',
          lineHeight: '1.6',
          fontWeight: '600'
        }}>
          {isNevera
            ? 'Dime qué ingredientes tienes y mi IA creará una obra maestra culinaria para ti.'
            : 'Busca los platos más emblemáticos de Venezuela y aprende a prepararlos con amor.'}
        </p>

        {/* Search Input */}
        <div className="glass-input-wrapper" style={{ maxWidth: '700px', background: '#ffffff', border: '1.5px solid var(--glass-border)' }}>
          <span style={{ fontSize: '20px', opacity: 0.5 }}>🔍</span>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !cargando) handleSearch(); }}
            placeholder={isNevera ? 'Tengo pollo, aguacate, cebolla...' : 'Pabellón, Arepas, Asado Negro...'}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '18px',
              padding: '14px 0',
              fontWeight: '500',
              fontFamily: 'var(--font-body)'
            }}
          />
          <button
            className="btn-gold"
            onClick={() => handleSearch()}
            disabled={cargando || !prompt || isLocked}
            style={{
              padding: '14px 36px',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: '800',
              background: isLocked ? '#e8e0d5' : 'var(--primary)',
              color: isLocked ? 'var(--text-muted)' : 'var(--on-primary)',
              boxShadow: isLocked ? 'none' : '0 4px 16px rgba(46, 125, 94, 0.25)',
              opacity: isLocked ? 0.7 : 1,
              border: 'none',
              cursor: isLocked ? 'not-allowed' : 'pointer'
            }}>
            {cargando ? '⏳ Cocinando...' : isLocked ? '🔒 Espera' : '✦ Cocinar'}
          </button>
        </div>

        {/* Suggestion chips */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            Sugerencias:
          </span>
          {['Pabellón', 'Cachapas', 'Arepa Pelúa'].map(chip => (
            <button
              key={chip}
              className="suggested-tag-premium"
              onClick={() => { setPrompt(chip); handleSearch(chip); }}
              style={{ fontSize: '12px', padding: '7px 16px', background: '#ffffff', border: '1px solid var(--outline-variant)', color: 'var(--text-secondary)', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--outline-variant)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* ─── RECENT DISCOVERIES (Nevera only) ─── */}
      {isNevera && recentRecipes.length > 0 && (
        <div className="history-section" style={{ maxWidth: '1200px', width: '100%', padding: '0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
            <div>
              <span className="hero-badge-premium" style={{ marginBottom: '10px', display: 'inline-flex' }}>Tradición e Innovación</span>
              <h2 style={{ fontSize: '40px', fontWeight: '900', margin: 0, letterSpacing: '-1px', color: 'var(--text-primary)' }}>
                Obras Maestras <span style={{ color: 'var(--primary)' }}>Recientes</span>
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <button
                onClick={onClearHistory}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', fontWeight: '700', letterSpacing: '0.1em' }}
              >
                LIMPIAR TODO
              </button>
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
                  <RecipeImage
                    query={recipe.titulo}
                    origin={isNevera ? 'venezuela' : 'region'}
                    alt={recipe.titulo}
                  />
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
                    {recipe.historia || 'Una obra maestra de nuestra cocina tradicional venezolana, preparada con el toque secreto de la abuela.'}
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
