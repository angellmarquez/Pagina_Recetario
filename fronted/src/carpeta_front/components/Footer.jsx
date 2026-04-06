import React from 'react';

const Footer = ({ setSeccionActiva }) => {
  const currentYear = new Date().getFullYear();

  const footerLinkStyle = {
    color: 'var(--text-muted)',
    fontSize: '14px',
    textDecoration: 'none',
    marginBottom: '12px',
    display: 'block',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    fontWeight: '500'
  };

  const columnTitleStyle = {
    color: 'white',
    fontSize: '13px',
    fontWeight: '900',
    letterSpacing: '1.5px',
    marginBottom: '25px',
    textTransform: 'uppercase'
  };

  const handleLinkClick = (section) => {
    if (setSeccionActiva) {
      setSeccionActiva(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer style={{ 
      marginTop: '60px', 
      padding: '80px 0 60px', 
      borderTop: '1px solid rgba(255,255,255,0.05)',
      width: '100%',
      background: '#070b13' // Un tono ligeramente más oscuro para el fondo del footer
    }}>
      <div style={{ 
        maxWidth: '1150px', 
        marginLeft: '320px', // Alineación exacta con el contenido principal
        paddingRight: '60px',
        boxSizing: 'border-box'
      }}>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(200px, 1.5fr) 1fr 1fr 1fr', 
          gap: '40px', 
          marginBottom: '80px' 
        }}>
          
          {/* Columna 1: Branding */}
          <div>
            <div style={{ marginBottom: '15px' }}>
              <span style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary)' }}>Ven </span>
              <span style={{ fontSize: '28px', fontWeight: '900', color: 'white' }}>IA</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 25px', fontWeight: '500' }}>
              El Hogar Moderno
            </p>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                 <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11 5L6 9H2V15H6L11 19V5Z" /><path d="M15.54 8.46L14.12 9.88C14.67 10.43 15 11.18 15 12C15 12.82 14.67 13.57 14.12 14.12L15.54 15.54C16.45 14.63 17 13.38 17 12C17 10.62 16.45 9.37 15.54 8.46Z" /><path d="M19.07 4.93L17.66 6.34C19.11 7.79 20 9.79 20 12C20 14.21 19.11 16.21 17.66 17.66L19.07 19.07C21.01 17.13 22 14.7 22 12C22 9.3 21.01 6.87 19.07 4.93Z" /></svg>
              </button>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                 <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              </button>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                 <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
              </button>
            </div>
          </div>

          {/* Columna 2: Explorar */}
          <div>
            <h4 style={columnTitleStyle}>Explorar</h4>
            <div onClick={() => handleLinkClick('descubrir')} style={footerLinkStyle} className="hover-primary">Descubrir</div>
            <div onClick={() => handleLinkClick('regiones')} style={footerLinkStyle} className="hover-primary">Regiones</div>
            <div style={footerLinkStyle} className="hover-primary">Ingredientes</div>
          </div>

          {/* Columna 3: Recetas */}
          <div>
            <h4 style={columnTitleStyle}>Recetas</h4>
            <div onClick={() => handleLinkClick('guardadas')} style={footerLinkStyle} className="hover-primary">Mis Recetas</div>
            <div style={footerLinkStyle} className="hover-primary">Mejor Valoradas</div>
            <div style={footerLinkStyle} className="hover-primary">Comidas Rápidas</div>
          </div>

          {/* Columna 4: Planificador */}
          <div>
            <h4 style={columnTitleStyle}>Planificador</h4>
            <div onClick={() => handleLinkClick('plan')} style={footerLinkStyle} className="hover-primary">Planes de Comidas</div>
            <div style={footerLinkStyle} className="hover-primary">Lista de Compras</div>
            <div style={footerLinkStyle} className="hover-primary">Sugerencias de IA</div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{ 
          paddingTop: '30px', 
          borderTop: '1px solid rgba(255,255,255,0.05)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>
            © {currentYear} Ven IA. Todos los derechos reservados.
          </p>
          <div style={{ display: 'flex', gap: '30px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '800', cursor: 'pointer', letterSpacing: '0.5px' }}>POLÍTICA DE PRIVACIDAD</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '800', cursor: 'pointer', letterSpacing: '0.5px' }}>TÉRMINOS DE SERVICIO</span>
          </div>
        </div>
      </div>

      <style>{`
        .hover-primary:hover {
          color: var(--primary) !important;
          transform: translateX(5px);
        }
      `}</style>
    </footer>
  );
};

export default Footer;
