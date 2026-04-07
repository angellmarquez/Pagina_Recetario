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
          background: '#ffffff',
          backdropFilter: 'blur(20px)',
          padding: '8px',
          borderRadius: '100px',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          gap: '5px',
          boxShadow: 'var(--glass-shadow)'
        }}>
          <button onClick={() => setActiveTab('world')} style={{ padding: '12px 40px', borderRadius: '100px', fontSize: '15px', fontWeight: '800', background: activeTab === 'world' ? 'var(--primary)' : 'transparent', color: activeTab === 'world' ? 'var(--on-primary)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '0.05em' }}>
            <span style={{ fontSize: '18px' }}>🌍</span> EXPLORADOR MUNDIAL
          </button>
          <button onClick={() => setActiveTab('venezuela')} style={{ padding: '12px 40px', borderRadius: '100px', fontSize: '15px', fontWeight: '800', background: activeTab === 'venezuela' ? 'var(--primary)' : 'transparent', color: activeTab === 'venezuela' ? 'var(--on-primary)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '0.05em' }}>
            <span style={{ fontSize: '18px' }}>🇻🇪</span> VENEZUELA
          </button>
        </div>
      </div>

      {activeTab === 'world' && (
      <div className="stagger-2 fade-in">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="hero-badge-premium" style={{ marginBottom: '20px' }}>✨ Gastronomía Sin Fronteras</div>
          <h2 style={{ fontSize: '56px', fontWeight: '900', margin: '0 0 15px', letterSpacing: '-2.5px', color: 'var(--text-primary)', lineHeight: '1' }}>
            Explora los Sabores del <span style={{ color: 'var(--primary)' }}>Mundo</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '20px', margin: '0 auto', maxWidth: '750px', lineHeight: '1.6' }}>
            Selecciona una región para descubrir los secretos culinarios mejor guardados de cada país.
          </p>
        </div>

        {/* WORLD MAP — Vichy palette */}
        <div className="glass-panel-premium" style={{ 
          padding: '60px 40px', 
          background: 'var(--surface-bright)', 
          border: '1.5px solid var(--glass-border)',
          borderRadius: '50px',
          position: 'relative',
          boxShadow: '0 30px 80px rgba(30, 58, 95, 0.08)',
          overflow: 'visible'
        }}>
          {/* Background wrapper for decorative blobs to keep them clipped while allowing tooltips to overflow */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '50px', pointerEvents: 'none', zIndex: 0 }}>
            <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,125,94,0.08) 0%, transparent 70%)' }} />
            <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,58,95,0.05) 0%, transparent 70%)' }} />
          </div>
          <div className="map-container-premium">
            <World 
              onSelect={handleCountrySelect}
              size={900} 
              mapColor="#1e3a5f"
              strokeColor="rgba(243, 237, 228, 0.6)"
              strokeWidth={0.5}
              hoverColor="#2e7d5e"
              selectColor="#2e7d5e"
              hints={true}
              hintBackgroundColor="#1e3a5f"
              hintTextColor="#ffffff"
              hintPadding="12px 18px"
              hintBorderRadius="12px"
              type="select-single"
            />
          </div>
          {loadingTravel && (
            <div className="travel-overlay">
              <div style={{ fontSize: '40px', animation: 'bounce 1s infinite' }}>✈️</div>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '24px', fontWeight: '900' }}>Viajando a {loadingTravel}...</h3>
            </div>
          )}
        </div>
      </div>
      )}

      {activeTab === 'venezuela' && (
      <div className="stagger-2 fade-in">
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="hero-badge-premium" style={{ marginBottom: '20px', background: 'rgba(46, 125, 94, 0.1)', color: 'var(--primary)', borderColor: 'rgba(46, 125, 94, 0.2)' }}>🇻🇪 NUESTRO LEGADO CULINARIO</div>
          <h2 style={{ fontSize: '56px', fontWeight: '900', margin: '0 0 15px', letterSpacing: '-2.5px', color: 'var(--text-primary)', lineHeight: '1' }}>
            Ruta del Sabor <span style={{ color: 'var(--primary)' }}>Venezolano</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '20px', margin: '0 auto', maxWidth: '750px', lineHeight: '1.6' }}>
            Nuestras raíces son sagradas. Explora la diversidad de cada estado.
          </p>
        </div>

        {/* VENEZUELA MAP — Vichy palette (crema/verde) */}
        <div className="glass-panel-premium" style={{ 
          padding: '60px 40px', 
          background: 'var(--surface-bright)', 
          border: '1.5px solid var(--primary)',
          borderRadius: '50px',
          position: 'relative',
          boxShadow: '0 30px 80px rgba(46, 125, 94, 0.08)',
          overflow: 'visible'
        }}>
          {/* Background wrapper for decorative blobs */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '50px', pointerEvents: 'none', zIndex: 0 }}>
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,125,94,0.1) 0%, transparent 70%)' }} />
          </div>
          <div className="map-container-premium">
            <Venezuela 
              onSelect={handleStateSelect}
              size={650}
              mapColor="#1e3a5f"
              strokeColor="rgba(243, 237, 228, 0.8)"
              strokeWidth={1.2}
              hoverColor="#2e7d5e"
              selectColor="#2e7d5e"
              hints={true}
              hintBackgroundColor="#1e3a5f"
              hintTextColor="#ffffff"
              hintPadding="12px 18px"
              hintBorderRadius="12px"
              type="select-single"
            />
          </div>
          {loadingTravel && (
            <div className="travel-overlay" style={{ border: '1px solid var(--primary)', background: 'rgba(255,255,255,0.95)' }}>
              <div style={{ fontSize: '40px', animation: 'bounce 1s infinite' }}>🇻🇪</div>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '24px', fontWeight: '900' }}>Explorando {loadingTravel}...</h3>
            </div>
          )}
        </div>
      </div>
      )}

      <style>{`
        /* Ajuste global para tooltips de mapas */
        .map-tooltip, .react-map-hint, .map-hint {
          position: absolute !important;
          z-index: 100000 !important;
          pointer-events: none !important;
          background: #1e3a5f !important;
          color: #ffffff !important;
          padding: 8px 16px !important;
          border-radius: 12px !important;
          font-weight: 700 !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important;
          transform: translate(-50%, -120%) !important; /* Justo encima del cursor */
          white-space: nowrap !important;
          visibility: visible !important;
          display: block !important;
          opacity: 1 !important;
        }
        @media (max-width: 900px) {
          .map-tooltip, .react-map-hint, .map-hint {
            max-width: 140px;
            font-size: 13px;
            white-space: normal !important;
            transform: translate(-50%, -130%) !important;
          }
        }
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
          filter: drop-shadow(0 10px 30px rgba(30, 58, 95, 0.15));
        }
        .travel-overlay {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          padding: 30px 60px; display: flex; flex-direction: column; align-items: center; gap: 20px;
          border: 1px solid var(--primary); z-index: 100; background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(40px); border-radius: 30px;
          box-shadow: 0 20px 60px rgba(30, 58, 95, 0.12);
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
