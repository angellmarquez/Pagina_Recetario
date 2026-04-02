import React, { useState } from 'react';
import World from "@react-map/world";
import Venezuela from "@react-map/venezuela";

const RegionesView = ({ setPrompt, generarReceta, setSeccionActiva, setPaisSeleccionado }) => {
  const [loadingTravel, setLoadingTravel] = useState(null);
  const [activeTab, setActiveTab] = useState('world'); // 'world' or 'venezuela'

  const handleCountrySelect = (countryCode) => {
    setLoadingTravel(countryCode);
    
    // Smooth transition to exploration mode for Countries
    setTimeout(() => {
      setPaisSeleccionado({ nombre: countryCode, tipo: 'world-map' });
      setSeccionActiva('explorar_pais');
      setPrompt(''); // Clear prompt for fresh search in the new view
    }, 1200);
  };

  const handleStateSelect = (stateName) => {
    setLoadingTravel(stateName);

    // Smooth transition to exploration mode for States
    setTimeout(() => {
      setPaisSeleccionado({ nombre: stateName, tipo: 'region' });
      setSeccionActiva('explorar_pais');
      setPrompt(''); 
    }, 1200);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
      
      {/* TAB NAVIGATION */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px', gap: '20px' }}>
        <button 
          onClick={() => setActiveTab('world')}
          style={{
            padding: '12px 30px',
            borderRadius: '100px',
            fontSize: '16px',
            fontWeight: 'bold',
            background: activeTab === 'world' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'world' ? 'var(--primary)' : 'var(--text-secondary)',
            border: activeTab === 'world' ? '1px solid var(--primary)' : '1px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🌍 Mundo
        </button>
        <button 
          onClick={() => setActiveTab('venezuela')}
          style={{
            padding: '12px 30px',
            borderRadius: '100px',
            fontSize: '16px',
            fontWeight: 'bold',
            background: activeTab === 'venezuela' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'venezuela' ? '#4ade80' : 'var(--text-secondary)',
            border: activeTab === 'venezuela' ? '1px solid #4ade80' : '1px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🇻🇪 Venezuela
        </button>
      </div>

      {/* SECTION 1: GLOBAL EXPLORATION */}
      {activeTab === 'world' && (
      <div className="stagger-1 fade-in" style={{ textAlign: 'center', marginBottom: '60px' }}>
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
      )}

      {/* SECTION 2: VENEZUELA HERITAGE */}
      {activeTab === 'venezuela' && (
      <div className="stagger-1 fade-in">
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

        <div className="glass-panel-premium" style={{ 
          padding: '20px', 
          background: 'rgba(5, 8, 18, 0.6)', 
          border: '1px solid rgba(74, 222, 128, 0.4)',
          borderRadius: '40px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div className="map-container-premium">
            <Venezuela 
              onSelect={handleStateSelect}
              size={800}
              mapColor="#162035"
              strokeColor="rgba(74, 222, 128, 0.4)"
              strokeWidth={1}
              hoverColor="#22c55e"
              selectColor="#16a34a"
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
              border: '1px solid #4ade80',
              zIndex: 10
            }}>
              <span style={{ fontSize: '24px' }}>🇻🇪</span>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Viajando a {loadingTravel}...</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Preparando tradiciones locales.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

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
