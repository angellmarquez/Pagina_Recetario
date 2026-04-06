import React, { useState } from 'react';
import World from "@react-map/world";
import Venezuela from "@react-map/venezuela";

const RegionesView = ({ setPrompt, generarReceta, setSeccionActiva, setPaisSeleccionado }) => {
  const [loadingTravel, setLoadingTravel] = useState(null);
  const [activeTab, setActiveTab] = useState('world');

  const handleCountrySelect = (countryCode) => {
    setLoadingTravel(countryCode);
    setTimeout(() => {
      setPaisSeleccionado({ nombre: countryCode, tipo: 'world-map' });
      setSeccionActiva('explorar_pais');
      setPrompt('');
    }, 1200);
  };

  const handleStateSelect = (stateName) => {
    setLoadingTravel(stateName);
    setTimeout(() => {
      setPaisSeleccionado({ nombre: stateName, tipo: 'region' });
      setSeccionActiva('explorar_pais');
      setPrompt(''); 
    }, 1200);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
      
      <div className="stagger-1" style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(20px)',
          padding: '8px',
          borderRadius: '100px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          gap: '5px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <button onClick={() => setActiveTab('world')} style={{ padding: '12px 40px', borderRadius: '100px', fontSize: '15px', fontWeight: '800', background: activeTab === 'world' ? 'var(--primary)' : 'transparent', color: activeTab === 'world' ? 'var(--on-primary)' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '0.05em' }}>
            <span style={{ fontSize: '18px' }}>🌍</span> EXPLORADOR MUNDIAL
          </button>
          <button onClick={() => setActiveTab('venezuela')} style={{ padding: '12px 40px', borderRadius: '100px', fontSize: '15px', fontWeight: '800', background: activeTab === 'venezuela' ? '#22c55e' : 'transparent', color: activeTab === 'venezuela' ? 'white' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '0.05em' }}>
            <span style={{ fontSize: '18px' }}>🇻🇪</span> VENEZUELA
          </button>
        </div>
      </div>

      {activeTab === 'world' && (
      <div className="stagger-2 fade-in">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="hero-badge-premium" style={{ marginBottom: '20px' }}>✨ Gastronomía Sin Fronteras</div>
          <h2 style={{ fontSize: '56px', fontWeight: '900', margin: '0 0 15px', letterSpacing: '-2.5px', color: 'white', lineHeight: '1' }}>
            Explora los Sabores del <span style={{ color: 'var(--primary)', textShadow: '0 0 40px rgba(245, 158, 11, 0.3)' }}>Mundo</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '20px', margin: '0 auto', maxWidth: '750px', lineHeight: '1.6' }}>
            Selecciona una región para descubrir los secretos culinarios mejor guardados de cada país.
          </p>
        </div>

        <div className="glass-panel-premium" style={{ 
          padding: '80px 40px', 
          background: 'rgba(5, 8, 18, 0.6)', 
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '50px',
          position: 'relative',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
          overflow: 'hidden'
        }}>
          <div className="map-container-premium">
            <World 
              onSelect={handleCountrySelect}
              size={900} 
              mapColor="#162035"
              strokeColor="rgba(245, 158, 11, 0.4)"
              strokeWidth={0.5}
              hoverColor="var(--primary)"
              selectColor="var(--primary)"
              hints={true}
              hintBackgroundColor="var(--surface-bright)"
              hintTextColor="white"
              hintPadding="12px 18px"
              hintBorderRadius="12px"
              type="select-single"
            />
          </div>
          {loadingTravel && (
            <div className="travel-overlay">
              <div style={{ fontSize: '40px', animation: 'bounce 1s infinite' }}>✈️</div>
              <h3 style={{ margin: 0, color: 'white', fontSize: '24px', fontWeight: '900' }}>Viajando a {loadingTravel}...</h3>
            </div>
          )}
        </div>
      </div>
      )}

      {activeTab === 'venezuela' && (
      <div className="stagger-2 fade-in">
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="hero-badge-premium" style={{ marginBottom: '20px', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.2)' }}>🇻🇪 NUESTRO LEGADO CULINARIO</div>
          <h2 style={{ fontSize: '56px', fontWeight: '900', margin: '0 0 15px', letterSpacing: '-2.5px', color: 'white', lineHeight: '1' }}>
            Ruta del Sabor <span style={{ color: '#22c55e', textShadow: '0 0 40px rgba(34, 197, 94, 0.3)' }}>Venezolano</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '20px', margin: '0 auto', maxWidth: '750px', lineHeight: '1.6' }}>
            Nuestras raíces son sagradas. Explora la diversidad de cada estado.
          </p>
        </div>

        <div className="glass-panel-premium" style={{ 
          padding: '60px 40px', 
          background: 'rgba(5, 8, 18, 0.6)', 
          border: '1px solid rgba(34, 197, 94, 0.15)',
          borderRadius: '50px',
          position: 'relative',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
          overflow: 'hidden'
        }}>
          <div className="map-container-premium">
            <Venezuela 
              onSelect={handleStateSelect}
              size={650}
              mapColor="#162035"
              strokeColor="rgba(34, 197, 94, 0.5)"
              strokeWidth={1.2}
              hoverColor="#22c55e"
              selectColor="#16a34a"
              hints={true}
              hintBackgroundColor="var(--surface-bright)"
              hintTextColor="white"
              hintPadding="12px 18px"
              hintBorderRadius="12px"
              type="select-single"
            />
          </div>
          {loadingTravel && (
            <div className="travel-overlay" style={{ border: '1px solid #4ade80' }}>
              <div style={{ fontSize: '40px', animation: 'bounce 1s infinite' }}>🇻🇪</div>
              <h3 style={{ margin: 0, color: 'white', fontSize: '24px', fontWeight: '900' }}>Explorando {loadingTravel}...</h3>
            </div>
          )}
        </div>
      </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.1); }
        }
        .map-container-premium {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          min-height: 400px;
        }
        .map-container-premium svg {
          max-width: 100%;
          height: auto !important;
          filter: drop-shadow(0 20px 50px rgba(0,0,0,0.5));
        }
        .travel-overlay {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          padding: 30px 60px; display: flex; flexDirection: column; alignItems: center; gap: 20px;
          border: 1px solid var(--primary); zIndex: 100; background: rgba(10, 15, 29, 0.9);
          backdropFilter: blur(40px); border-radius: 30px;
        }
        .map-container-premium path:hover {
          filter: brightness(1.3) drop-shadow(0 0 10px currentColor);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default RegionesView;
