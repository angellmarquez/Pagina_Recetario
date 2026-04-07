import React, { useMemo } from 'react';
import RecipeImage from '../components/RecipeImage';

// Suggestions mappings
const countrySuggestions = {
  'Mexico': ['Tacos al Pastor', 'Mole Poblano', 'Chiles en Nogada'],
  'Italy': ['Lasagna Tradicional', 'Risotto de Hongos', 'Pasta Carbonara'],
  'Japan': ['Ramen Shoyu', 'Sushi Variado', 'Okonomiyaki'],
  'Spain': ['Paella Valenciana', 'Tortilla de Patatas', 'Gazpacho Andaluz'],
  'France': ['Ratatouille', 'Coq au Vin', 'Quiche Lorraine'],
  'Colombia': ['Bandeja Paisa', 'Ajiaco Santafereño', 'Sancocho'],
  'Peru': ['Ceviche Limeño', 'Lomo Saltado', 'Ají de Gallina'],
  'Argentina': ['Asado Criollo', 'Empanadas Mendocinas', 'Chimichurri Tradicional'],
  'Brazil': ['Feijoada', 'Pão de Queijo', 'Moqueca de Peixe'],
  'USA': ['Classic Burger', 'Apple Pie', 'BBQ Ribs'],
  'China': ['Peking Duck', 'Dim Sum', 'Kung Pao Chicken'],
  'India': ['Butter Chicken', 'Biryani de Cordero', 'Palak Paneer'],
};

const stateSuggestions = {
  'Zulia': ['Patacón', 'Mandocas', 'Macarronada'],
  'Mérida': ['Pizca Andina', 'Arepa de Trigo', 'Pastelitos de Trucha'],
  'Lara': ['Mute Larense', 'Tostada Caroreña', 'Acemitas'],
  'Sucre': ['Empanadas de Cazón', 'Cuajado', 'Consomé de Chipichipi'],
  'Distrito Capital': ['Asado Negro', 'Pabellón Criollo', 'Polvorosas'],
  'Bolívar': ['Pelao Guayanés', 'Sancocho de Sapara', 'Casabe'],
  'Falcón': ['Chivo al Coco', 'Dulce de Leche de Cabra', 'Arepa Pelada'],
  'Nueva Esparta': ['Pastel de Chucho', 'Empanadas de Cazón', 'Piñonate'],
  'Táchira': ['Pastelitos Andinos', 'Pisillo', 'Chicha Andina'],
};

const getRegionImage = (lugar, tipo) => {
  if (tipo === 'region') return 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?q=80&w=1600&auto=format&fit=crop';
  const images = {
    'Mexico': 'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?q=80&w=1600&auto=format&fit=crop',
    'Italy': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1600&auto=format&fit=crop',
    'Japan': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600&auto=format&fit=crop',
    'Spain': 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=1600&auto=format&fit=crop',
    'France': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1600&auto=format&fit=crop',
    'Colombia': 'https://images.unsplash.com/photo-1583997051651-8255af853bc6?q=80&w=1600&auto=format&fit=crop',
  };
  return images[lugar] || 'https://images.unsplash.com/photo-1488459711626-d6df200c9977?q=80&w=1600&auto=format&fit=crop';
};

const CountryExplorationView = ({ pais, tipoLugar, prompt, setPrompt, generarReceta, cargando, onVolver, lockIAUntil }) => {
  const isLocked = lockIAUntil && Date.now() < lockIAUntil;
  const isVenezuelaState = tipoLugar === 'region';
  const suggestions = useMemo(() => {
    if (isVenezuelaState) return stateSuggestions[pais] || ['Plato Principal', 'Postre Tradicional', 'Desayuno'];
    return countrySuggestions[pais] || ['Especialidad Local', 'Sabor Tradicional', 'Receta Clásica'];
  }, [pais, isVenezuelaState]);

  const handleSearch = (term = null) => {
    const finalTerm = term || prompt || `La receta más famosa y representativa de ${pais}`;
    generarReceta(finalTerm, tipoLugar);
  };

  return (
    <div className="stagger-1" style={{ width: '100%', position: 'relative', minHeight: '90vh', padding: '40px 0' }}>
      
      {/* Clean Vichy background — no random food images */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, width: '100%', height: '100%',
        background: 'linear-gradient(135deg, #f9f6f1 0%, #ffffff 50%, #f3ede4 100%)',
        backgroundImage: 'none',
        zIndex: -2,
        pointerEvents: 'none'
      }} />
      {/* Subtle accent blobs */}
      <div style={{
        position: 'fixed',
        top: '-100px', right: '-100px', width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(46,125,94,0.05) 0%, transparent 70%)',
        zIndex: -1, pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-100px', left: '-80px', width: '400px', height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(30,58,95,0.04) 0%, transparent 70%)',
        zIndex: -1, pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        
        {/* Navigation Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px' }}>
          <button 
            onClick={onVolver}
            style={{ 
              background: 'var(--surface-bright)', 
              border: '1.5px solid var(--primary)', 
              color: 'var(--primary)', 
              padding: '12px 28px',
              borderRadius: '100px',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(46, 125, 94, 0.1)',
              transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'var(--on-primary)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--surface-bright)'; e.currentTarget.style.color = 'var(--primary)'; }}
          >
            <span style={{ fontSize: '18px' }}>←</span> VOLVER
          </button>

          <div className="hero-badge-premium" style={{ 
            margin: 0,
            background: 'rgba(46, 125, 94, 0.12)',
            color: 'var(--primary)',
            borderColor: 'rgba(46, 125, 94, 0.2)'
          }}>
            {isVenezuelaState ? '🇻🇪 PATRIMONIO NACIONAL' : '🌍 EXPLORACIÓN GLOBAL'}
          </div>
        </div>

        {/* REFINED CONTENT SECTION */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h1 style={{ 
            fontSize: '64px', 
            fontWeight: '900', 
            margin: '0 0 20px 0', 
            letterSpacing: '-2px', 
            color: 'var(--text-primary)',
            lineHeight: '1.1'
          }}>
            Descubriendo <span style={{ color: 'var(--primary)' }}>{pais}</span>
          </h1>
          
          <p style={{ 
            fontSize: '20px', 
            color: 'var(--text-primary)', 
            maxWidth: '800px', 
            margin: '0 auto',
            lineHeight: '1.6',
            fontWeight: '600'
          }}>
            {isVenezuelaState 
              ? `Explora la riqueza culinaria del estado ${pais}. Como buena abuela venezolana, te guiaré por sus sabores más auténticos.`
              : `Viaja a través del paladar por la historia de ${pais}. Descubre los platos que definen su cultura y herencia.`}
          </p>
        </div>

        {/* INTEGRATED SEARCH BAR */}
        <div style={{ 
          maxWidth: '850px', 
          margin: '0 auto 60px auto',
          position: 'relative'
        }}>
          <div style={{
            background: '#ffffff',
            backdropFilter: 'blur(40px)',
            borderRadius: '100px',
            padding: '10px 10px 10px 35px',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            boxShadow: 'var(--glass-shadow)'
          }}>
            <span style={{ fontSize: '24px' }}>🍳</span>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !cargando) handleSearch(); }}
              placeholder={`🔎 Ej: Plato específico, o ingresa tus ingredientes...`}
              style={{ 
                flex: 1, 
                background: 'transparent', 
                border: 'none', 
                outline: 'none', 
                color: 'var(--text-primary)', 
                fontSize: '18px', 
                fontWeight: '500'
              }}
            />
            <button 
              className="btn-gold"
              onClick={() => handleSearch()} 
              disabled={cargando || isLocked} 
              style={{ 
                padding: '14px 40px',
                borderRadius: '100px',
                fontSize: '15px',
                fontWeight: '800',
                background: isLocked ? 'rgba(0,0,0,0.05)' : 'var(--primary)',
                boxShadow: isLocked ? 'none' : '0 8px 20px rgba(46, 125, 94, 0.25)',
                opacity: isLocked ? 0.6 : 1,
                color: isLocked ? 'rgba(255,255,255,0.4)' : 'white'
              }}>
              {cargando ? '⌛...' : (isLocked ? '🔒 ESPERA' : 'COCINAR')}
            </button>
          </div>
        </div>

        {/* REFINED SUGGESTIONS */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '11px', 
            color: 'var(--text-muted)', 
            fontWeight: '800', 
            textTransform: 'uppercase', 
            letterSpacing: '0.2em',
            marginBottom: '40px'
          }}>PLATOS EMBLEMÁTICOS PARA EMPEZAR</div>
          
          <div className="history-grid-cinematic" style={{ textAlign: 'left' }}>
            {suggestions.map((item, idx) => (
              <div 
                key={idx} 
                className="recipe-card-cinematic stagger-3"
                onClick={() => { setPrompt(item); handleSearch(item); }}
              >
                <div className="recipe-image-container">
                  <RecipeImage 
                    query={item} 
                    origin={tipoLugar} 
                    alt={item} 
                  />
                  <div className="floating-badge badge-left">{isVenezuelaState ? 'TRADICIÓN' : 'CLÁSICO'}</div>
                  <div className="floating-badge badge-right">RECOMENDADO</div>
                </div>
                
                <div className="recipe-body-premium">
                  <div className="recipe-title-cinematic" style={{ fontSize: '20px', marginBottom: '15px' }}>
                    {item}
                  </div>
                  
                  <p className="recipe-description-cinematic">
                    {isVenezuelaState 
                      ? "Un clásico indiscutible que representa el corazón y el alma de la gastronomía de este estado." 
                      : "Una de las joyas más auténticas y sabrosas para conocer la verdadera cultura de este país."}
                  </p>
                  
                  <div className="recipe-footer-tags">
                    <span>{isVenezuelaState ? 'SABOR CRIOLLO' : 'INTERNACIONAL'}</span>
                    <span>IMPERDIBLE</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default CountryExplorationView;
