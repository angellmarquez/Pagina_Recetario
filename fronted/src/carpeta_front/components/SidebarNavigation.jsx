import React from 'react';

const SidebarNavigation = ({ seccionActiva, setSeccionActiva, setPrompt, setRecetaActiva, setRespuestaIA, setFondoActivo, usuario, onRecomendar }) => {
  const resetState = (nuevaSeccion) => {
    setSeccionActiva(nuevaSeccion);
    setPrompt('');
    setRecetaActiva(null);
    if(setRespuestaIA) setRespuestaIA('');
    if(setFondoActivo) setFondoActivo('var(--bg-gradient)');
  };

  const navItems = [
    { id: 'descubrir', label: 'Descubrir', icon: <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /> },
    { id: 'nevera', label: 'Explorar Nevera', icon: <path d="M7 2h10c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2zm0 10v7h10v-7H7zm0-8v6h10V4H7zm2 1h2v4H9V5zm0 9h2v4H9v-4z" /> },
    { id: 'regiones', label: 'Regiones del Mundo', icon: <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" /> },
    { id: 'plan', label: 'Plan Semanal', icon: <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /> },
    { id: 'guardadas', label: 'Mis Recetas', icon: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /> },
    { id: 'perfil', label: 'Mi Perfil', icon: <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /> },
  ];

  return (
    <aside style={{
      width: '320px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '40px 20px',
      background: '#ffffff',
      borderRight: '1px solid rgba(0,0,0,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '4px 0 24px rgba(0,0,0,0.04)',
      overflowY: 'auto',
      scrollbarWidth: 'none',
    }}>
      {/* Brand */}
      <div style={{ marginBottom: '50px', paddingLeft: '20px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
          Ven <span style={{ color: 'var(--primary)' }}>IA</span>
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', fontWeight: 'bold' }}>Hogar Moderno</p>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => resetState(item.id)}
            style={{
              padding: '16px 20px',
              borderRadius: '20px',
              border: 'none',
              background: seccionActiva === item.id ? 'rgba(46, 125, 94, 0.08)' : 'transparent',
              color: seccionActiva === item.id ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              fontSize: '16px',
              fontWeight: seccionActiva === item.id ? '800' : '600',
              textAlign: 'left',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              position: 'relative'
            }}
          >
            {seccionActiva === item.id && (
               <div style={{ position: 'absolute', left: 0, width: '4px', height: '24px', background: 'var(--primary)', borderRadius: '0 4px 4px 0' }}></div>
            )}
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              {item.icon}
            </svg>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Sidebar Footer - AI Sous Chef Button */}
      <div style={{ padding: '20px' }}>
        <button 
          onClick={onRecomendar}
          style={{
          width: '100%',
          padding: '18px',
          background: 'var(--primary)',
          color: 'var(--on-primary)',
          borderRadius: '24px',
          border: 'none',
          fontWeight: '900',
          fontSize: '15px',
          cursor: 'pointer',
          boxShadow: '0 15px 30px rgba(46, 125, 94, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          Recomendaciones del chef
        </button>
      </div>
    </aside>
  );
};

export default SidebarNavigation;

