import React, { useState } from 'react';
import World from "@react-map/world";

// ALL 24 VENEZUELAN ENTITIES (23 States + Capital District)
const estadosVenezuela = [
  { nombre: 'Amazonas', plato: 'Gusano de Moriche', gradient: 'linear-gradient(135deg, #14532d, #166534)' },
  { nombre: 'Anzoátegui', plato: 'Cuajado de Cazón', gradient: 'linear-gradient(135deg, #0284c7, #0ea5e9)' },
  { nombre: 'Apure', plato: 'Palo a Pique', gradient: 'linear-gradient(135deg, #9a3412, #c2410c)' },
  { nombre: 'Aragua', plato: 'Sancocho de Pescado', gradient: 'linear-gradient(135deg, #0f766e, #14b8a6)' },
  { nombre: 'Barinas', plato: 'Picadillo Llanero', gradient: 'linear-gradient(135deg, #b45309, #d97706)' },
  { nombre: 'Bolívar', plato: 'Pelao Guayanés', gradient: 'linear-gradient(135deg, #115e59, #14b8a6)' },
  { nombre: 'Carabobo', plato: 'Panelitas de San Joaquín', gradient: 'linear-gradient(135deg, #4338ca, #6366f1)' },
  { nombre: 'Cojedes', plato: 'Pabellón Criollo Alterado', gradient: 'linear-gradient(135deg, #ea580c, #f97316)' },
  { nombre: 'Delta Amacuro', plato: 'Sancocho de Morocoto', gradient: 'linear-gradient(135deg, #0e7490, #06b6d4)' },
  { nombre: 'Distrito Capital', plato: 'Asado Negro', gradient: 'linear-gradient(135deg, #7f1d1d, #ef4444)' },
  { nombre: 'Falcón', plato: 'Chivo al Coco', gradient: 'linear-gradient(135deg, #c2410c, #f97316)' },
  { nombre: 'Guárico', plato: 'Pisillo de Chigüire', gradient: 'linear-gradient(135deg, #9a3412, #f59e0b)' },
  { nombre: 'Lara', plato: 'Mute Larense', gradient: 'linear-gradient(135deg, #854d0e, #eab308)' },
  { nombre: 'Mérida', plato: 'Pizca Andina', gradient: 'linear-gradient(135deg, #166534, #22c55e)' },
  { nombre: 'Miranda', plato: 'Cachito de Jamón (Hatillo)', gradient: 'linear-gradient(135deg, #b91c1c, #ef4444)' },
  { nombre: 'Monagas', plato: 'Casabe y Sancocho', gradient: 'linear-gradient(135deg, #0369a1, #38bdf8)' },
  { nombre: 'Nueva Esparta', plato: 'Empanadas de Cazón', gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)' },
  { nombre: 'Portuguesa', plato: 'Coporo Frito', gradient: 'linear-gradient(135deg, #d97706, #fbbf24)' },
  { nombre: 'Sucre', plato: 'Cuajado de Pepitonas', gradient: 'linear-gradient(135deg, #0284c7, #7dd3fc)' },
  { nombre: 'Táchira', plato: 'Pastelitos Andinos', gradient: 'linear-gradient(135deg, #15803d, #4ade80)' },
  { nombre: 'Trujillo', plato: 'Mojo Trujillano', gradient: 'linear-gradient(135deg, #166534, #22c55e)' },
  { nombre: 'La Guaira', plato: 'Pescado Frito con Tostones', gradient: 'linear-gradient(135deg, #0369a1, #0ea5e9)' },
  { nombre: 'Yaracuy', plato: 'Hallaca de Anguila', gradient: 'linear-gradient(135deg, #ca8a04, #facc15)' },
  { nombre: 'Zulia', plato: 'Patacón Maracucho', gradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' },
];

const RegionesView = ({ setPrompt, generarReceta, setSeccionActiva, setPaisSeleccionado }) => {
  const [loadingTravel, setLoadingTravel] = useState(null);

  const handleCountrySelect = (countryCode) => {
    setLoadingTravel(countryCode);
    
    // Smooth transition to exploration mode for Countries
    setTimeout(() => {
      setPaisSeleccionado({ nombre: countryCode, tipo: 'world-map' });
      setSeccionActiva('explorar_pais');
      setPrompt(''); // Clear prompt for fresh search in the new view
    }, 1200);
  };

  const handleStateSelect = (estado) => {
    setLoadingTravel(estado.nombre);

    // Smooth transition to exploration mode for States
    setTimeout(() => {
      setPaisSeleccionado({ nombre: estado.nombre, tipo: 'region' });
      setSeccionActiva('explorar_pais');
      setPrompt(''); 
    }, 1200);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
      
      {/* SECTION 1: GLOBAL EXPLORATION */}
      <div className="stagger-1" style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div className="hero-badge-premium" style={{ marginBottom: '20px' }}>
          🌍 Explorador Global
        </div>
        <h2 style={{ fontSize: '56px', fontWeight: '900', margin: '0 0 15px', letterSpacing: '-2px', color: 'white' }}>
          Sabores del <span style={{ color: 'var(--primary)', textShadow: '0 4px 20px rgba(255,231,146,0.3)' }}>Mundo</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '20px', margin: '0 auto', maxWidth: '700px', marginBottom: '40px' }}>
          Toca cualquier parte del mundo y deja que la abuela VenIA te guíe por la gastronomía internacional más exquisita.
        </p>

        {/* WORLD MAP CONTAINER */}
        <div className="glass-panel-premium" style={{ 
          padding: '20px', 
          background: 'rgba(5, 8, 18, 0.6)', 
          border: '1px solid var(--glass-border)',
          borderRadius: '40px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div className="map-container-premium">
            <World 
              onSelect={handleCountrySelect}
              size={1200}
              mapColor="#162035"
              strokeColor="rgba(245, 158, 11, 0.4)"
              strokeWidth={0.5}
              hoverColor="var(--primary)"
              selectColor="var(--primary)"
              hints={true}
              hintBackgroundColor="var(--surface-bright)"
              hintTextColor="white"
              hintPadding="8px 12px"
              hintBorderRadius="8px"
              type="select-single"
            />
          </div>
          
          {loadingTravel && (
            <div className="glass-card stagger-3" style={{ 
              position: 'absolute', 
              bottom: '40px', 
              left: '50%', 
              transform: 'translateX(-50%)',
              padding: '20px 40px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              border: '1px solid var(--primary)',
              zIndex: 10
            }}>
              <span style={{ fontSize: '24px' }}>✈️</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Viajando a {loadingTravel}...</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Preparando la cocina para tu destino mijo.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <hr style={{ border: 'none', height: '1px', background: 'linear-gradient(90deg, transparent, var(--glass-border), transparent)', margin: '80px 0' }} />

      {/* SECTION 2: VENEZUELA HERITAGE */}
      <div className="stagger-2">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="hero-badge-premium" style={{ marginBottom: '20px', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
            🇻🇪 Patrimonio Nacional
          </div>
          <h2 style={{ fontSize: '48px', fontWeight: '900', margin: '0 0 15px', color: 'white' }}>
            Ruta del Sabor <span style={{ color: '#4ade80' }}>Venezolano</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', margin: '0 auto', maxWidth: '600px' }}>
            Nuestras raíces son lo más importante. Explora los platos tradicionales que han definido nuestra historia estado por estado.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '20px',
          paddingBottom: '80px'
        }}>
          {estadosVenezuela.map((estado, idx) => (
            <div 
              key={idx} 
              className="glass-card"
              style={{ 
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '20px',
                border: '1px solid var(--glass-border)',
                animationDelay: `${(idx % 6) * 0.1}s`
              }}
              onClick={() => handleStateSelect(estado)}
            >
              {/* Background Gradient */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: estado.gradient,
                opacity: 0.15,
                zIndex: 0,
                transition: 'opacity 0.4s'
              }} className="region-bg" />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  backdropFilter: 'blur(10px)',
                  padding: '4px 10px', 
                  borderRadius: '12px', 
                  fontSize: '10px', 
                  fontWeight: 'bold', 
                  color: 'white',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginBottom: '10px'
                }}>
                  🇻🇪 Región
                </span>
                <h3 style={{ fontSize: '24px', margin: '0 0 5px 0', fontWeight: '900', color: 'white', letterSpacing: '-0.5px' }}>
                  {estado.nombre}
                </h3>
                <p style={{ fontSize: '14px', margin: 0, color: 'var(--text-secondary)', fontWeight: '500' }}>
                  Plato icónico: {estado.plato}
                </p>
              </div>
              
              <style>{`
                .glass-card:hover .region-bg {
                  opacity: 0.4 !important;
                }
              `}</style>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .map-container-premium {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          padding: 40px;
          transition: var(--transition-smooth);
        }
        
        .map-container-premium svg {
          max-width: 100%;
          height: auto;
          filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.1));
        }

        @media (max-width: 768px) {
          .map-container-premium {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default RegionesView;
