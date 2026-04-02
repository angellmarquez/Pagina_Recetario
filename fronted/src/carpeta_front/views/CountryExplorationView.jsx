import React, { useMemo } from 'react';

// Simplified mapping for country suggestions - could be expanded or fetched
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

// Venezuelan State Suggestions
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
  if (tipo === 'region') {
    // Venezuelan landscapes (conceptual)
    return 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?q=80&w=1200&auto=format&fit=crop'; // Example: Salto Angel / Tepui conceptual
  }

  // Placeholder images for international regions
  const images = {
    'Mexico': 'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?q=80&w=1200&auto=format&fit=crop',
    'Italy': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1200&auto=format&fit=crop',
    'Japan': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop',
    'Spain': 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=1200&auto=format&fit=crop',
    'France': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop',
    'Colombia': 'https://images.unsplash.com/photo-1583997051651-8255af853bc6?q=80&w=1200&auto=format&fit=crop',
  };
  return images[lugar] || 'https://images.unsplash.com/photo-1488459711626-d6df200c9977?q=80&w=1200&auto=format&fit=crop';
};

const CountryExplorationView = ({ pais, tipoLugar, prompt, setPrompt, generarReceta, cargando, onVolver }) => {
  
  const isVenezuelaState = tipoLugar === 'region';

  const suggestions = useMemo(() => {
    if (isVenezuelaState) {
      return stateSuggestions[pais] || ['Plato Principal Típico', 'Dulce Tradicional', 'Desayuno Local'];
    }
    return countrySuggestions[pais] || ['Plato Típico 1', 'Especialidad Local', 'Sabor Tradicional'];
  }, [pais, isVenezuelaState]);

  const handleSearch = (term = null) => {
    const finalTerm = term || prompt || `Receta típica de ${pais}`;
    // The MenuRecetario now handles the generic origin mapping in the aiService call
    generarReceta(finalTerm, tipoLugar);
  };

  return (
    <div className="stagger-1" style={{ width: '100%', position: 'relative' }}>
      
      {/* Dynamic Background */}
      <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: `url(${getRegionImage(pais, tipoLugar)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -1,
          opacity: 0.2,
          filter: 'blur(4px) saturate(1.5)',
          transition: 'all 1.5s ease'
      }} />

      {/* Hero Section */}
      <div className="glass-panel-premium" style={{ 
        padding: '60px', 
        maxWidth: '900px', 
        margin: '20px auto 40px auto',
        border: isVenezuelaState ? '1px solid rgba(74, 222, 128, 0.4)' : '1px solid var(--primary-container)',
        boxShadow: isVenezuelaState ? '0 20px 50px rgba(74, 222, 128, 0.1)' : '0 20px 50px rgba(245, 158, 11, 0.1)'
      }}>
        
        <button 
          onClick={onVolver}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: isVenezuelaState ? '#4ade80' : 'var(--primary)', 
            cursor: 'pointer', 
            fontSize: '14px', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '30px'
          }}>
          <span>←</span> {isVenezuelaState ? 'VOLVER A REGIONES' : 'VOLVER AL MAPA'}
        </button>

        <div className="hero-badge-premium" style={{ 
          marginBottom: '25px', 
          background: isVenezuelaState ? 'rgba(74, 222, 128, 0.1)' : undefined,
          color: isVenezuelaState ? '#4ade80' : undefined,
          borderColor: isVenezuelaState ? 'rgba(74, 222, 128, 0.2)' : undefined
        }}>
          {isVenezuelaState ? '🇻🇪 PATRIMONIO NACIONAL' : '✨ EXPLORANDO EL MUNDO'}
        </div>

        <h1 style={{ fontSize: '64px', margin: '0 0 20px 0', fontWeight: '900', letterSpacing: '-2px', color: 'white' }}>
          Sabores de <span style={{ color: isVenezuelaState ? '#4ade80' : 'var(--primary)', fontStyle: 'italic' }}>{pais}</span>
        </h1>
        
        <p style={{ fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '650px', lineHeight: '1.6' }}>
          {isVenezuelaState 
            ? `Bienvenido a nuestro hermoso estado ${pais}. Como buena abuela venezolana, conozco todos los secretos de nuestra tierra. ¿Qué platillo local quieres que preparemos hoy?`
            : `Bienvenido a la cocina viajera. He recorrido ${pais} y estoy lista para enseñarte el secreto de su sazón. ¿Qué quieres cocinar hoy?`}
        </p>

        {/* Global Styled Search Input */}
        <div className="glass-input-wrapper" style={{ padding: '10px 10px 10px 30px', background: 'rgba(5, 8, 18, 0.4)' }}>
          <span style={{ fontSize: '24px' }}>🍳</span>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !cargando) handleSearch(); }}
            placeholder={`¿Qué quieres cocinar de ${pais}?`}
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
            disabled={cargando} 
            style={{ 
              padding: '16px 45px',
              borderRadius: '16px',
              fontSize: '18px',
              background: isVenezuelaState ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : undefined,
              boxShadow: isVenezuelaState ? '0 10px 30px rgba(34, 197, 94, 0.3)' : '0 10px 30px rgba(245, 158, 11, 0.3)'
            }}>
            {cargando ? '⌛ Cocinando...' : 'COOK'}
          </button>
        </div>

        {/* Suggestions Grid */}
        <div style={{ marginTop: '40px' }}>
          <span style={{ 
            fontSize: '12px', 
            color: 'rgba(255,255,255,0.4)', 
            fontWeight: '900', 
            textTransform: 'uppercase', 
            letterSpacing: '0.2em',
            display: 'block',
            marginBottom: '20px'
          }}>PLATOS RECOMENDADOS DEL CHEF:</span>
          
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {suggestions.map((item, idx) => (
              <button 
                key={idx} 
                className="suggested-tag-premium"
                style={{ 
                  padding: '12px 24px', 
                  fontSize: '14px',
                  borderColor: isVenezuelaState ? 'rgba(74, 222, 128, 0.3)' : undefined
                }}
                onClick={() => {
                  setPrompt(item);
                  handleSearch(item);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default CountryExplorationView;
