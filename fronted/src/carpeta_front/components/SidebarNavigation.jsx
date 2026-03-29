import React from 'react';

const SidebarNavigation = ({ seccionActiva, setSeccionActiva, setPrompt, setRecetaActiva, setRespuestaIA, setFondoActivo, usuario }) => {
  const resetState = (nuevaSeccion) => {
    setSeccionActiva(nuevaSeccion);
    setPrompt('');
    setRecetaActiva(null);
    if(setRespuestaIA) setRespuestaIA('');
    if(nuevaSeccion === 'descubrir' || nuevaSeccion === 'buscar' || nuevaSeccion === 'nevera' || nuevaSeccion === 'plan' || nuevaSeccion === 'perfil' || nuevaSeccion === 'guardadas') {
       if(setFondoActivo) setFondoActivo('linear-gradient(135deg, #0f172a 0%, #020617 100%)');
    }
  };

  const navItems = [
    { id: 'descubrir', icon: '🌟', label: 'Descubrir' },
    { id: 'buscar', icon: '🔍', label: 'Buscar Receta' },
    { id: 'nevera', icon: '🔥', label: '¿Qué tengo en la nevera?' },
    { id: 'regiones', icon: '🗺️', label: 'Explorar Regiones' },
    { id: 'plan', icon: '📅', label: 'Generar Plan' },
    { id: 'guardadas', icon: '❤️', label: 'Mis Recetas' },
    { id: 'perfil', icon: '👤', label: 'Mi Perfil' },
  ];

  return (
    <aside className="sidebar-glass" style={{
      width: '280px',
      margin: '20px',
      borderRadius: '24px',
      background: 'rgba(25, 37, 64, 0.5)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 24px 48px rgba(0, 0, 0, 0.3)',
      overflow: 'hidden',
      zIndex: 100
    }}>
      {/* Brand & Profile */}
      <div style={{ padding: '30px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="stagger-1" style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          <div style={{
            width: '36px', height: '36px', background: '#FFD700', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
          }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#003893">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <span style={{ color: '#FFD700' }}>VEN</span><span style={{ color: '#ffffff' }}>IA</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#003893', fontWeight: 'bold' }}>
            {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h4 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '15px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{usuario?.nombre || 'Mi Usuario'}</h4>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Foodie Venezolano 🫓</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => resetState(item.id)}
            style={{
              background: seccionActiva === item.id ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
              border: `1px solid ${seccionActiva === item.id ? 'rgba(255,215,0,0.3)' : 'transparent'}`,
              color: seccionActiva === item.id ? '#FFD700' : 'rgba(255,255,255,0.7)',
              padding: '16px 20px',
              borderRadius: '16px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: seccionActiva === item.id ? '700' : '500',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseOver={(e) => {
              if (seccionActiva !== item.id) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseOut={(e) => {
              if (seccionActiva !== item.id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
              }
            }}
          >
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer / Logout Placeholder if needed */}
      <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
         <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>Venia Beta 0.9</div>
      </div>
    </aside>
  );
};

export default SidebarNavigation;
