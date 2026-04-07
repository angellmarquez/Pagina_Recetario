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
    color: 'var(--text-primary)',
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
      marginTop: '100px', 
      padding: '100px 0 60px', 
      borderTop: '1px solid var(--outline)',
      width: '100%',
      background: 'var(--surface-container-high)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative texture background */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.03, pointerEvents: 'none', backgroundImage: 'radial-gradient(var(--primary) 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>

      <div style={{ 
        maxWidth: '1150px', 
        marginLeft: '320px', 
        paddingRight: '60px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1
      }}>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(280px, 1.5fr) 1fr 1fr 1fr', 
          gap: '60px', 
          marginBottom: '80px' 
        }}>
          
          {/* Columna 1: Branding */}
          <div>
            <div style={{ marginBottom: '15px' }}>
              <span style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-1.5px' }}>Ven </span>
              <span style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-1.5px' }}>IA</span>
            </div>
            <p style={{ color: 'var(--text-primary)', fontSize: '15px', margin: '0 0 10px', fontWeight: '800', opacity: 0.9 }}>
              Tu Chef Digital con Alma Venezolana 🇻🇪
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 30px', fontWeight: '500', lineHeight: '1.6' }}>
              Descubre el sabor de nuestra tierra con el toque moderno de la Inteligencia Artificial.
            </p>
            <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
              <button title="Instagram" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.3s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                 <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </button>
              <button title="Twitter" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.3s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                 <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.27 0 .33.04.65.11.96-3.53-.18-6.66-1.87-8.76-4.44-.36.6-.57 1.31-.57 2.06 0 1.48.75 2.78 1.89 3.54-.7-.02-1.35-.22-1.92-.53v.05c0 2.06 1.47 3.78 3.42 4.17-.36.1-.74.15-1.13.15-.27 0-.54-.03-.8-.08.54 1.69 2.11 2.91 3.97 2.95-1.46 1.14-3.3 1.82-5.3 1.82-.35 0-.69-.02-1.02-.06 1.88 1.21 4.12 1.92 6.54 1.92 7.84 0 12.13-6.5 12.13-12.13 0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
              </button>
              <button title="Facebook" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.3s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                 <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </button>
            </div>
          </div>

          {/* Columna 2: Explorar */}
          <div>
            <h4 style={columnTitleStyle}>Explorar</h4>
            <div onClick={() => handleLinkClick('descubrir')} style={footerLinkStyle} className="hover-primary">Recetas Populares</div>
            <div onClick={() => handleLinkClick('regiones')} style={footerLinkStyle} className="hover-primary">Regiones de Venezuela</div>
            <div onClick={() => handleLinkClick('nevera')} style={footerLinkStyle} className="hover-primary">Filtro por Nevera</div>
          </div>

          {/* Columna 3: Recetas */}
          <div>
            <h4 style={columnTitleStyle}>Comunidad</h4>
            <div onClick={() => handleLinkClick('guardadas')} style={footerLinkStyle} className="hover-primary">Mis Favoritos</div>
            <div style={footerLinkStyle} className="hover-primary">Historias de Sabor</div>
            <div style={footerLinkStyle} className="hover-primary">Técnicas de la Abuela</div>
          </div>

          {/* Columna 4: Planificador */}
          <div>
            <h4 style={columnTitleStyle}>Planificador</h4>
            <div onClick={() => handleLinkClick('plan')} style={footerLinkStyle} className="hover-primary">Planes Semanales</div>
            <div style={footerLinkStyle} className="hover-primary">Lista del Mercado</div>
            <div onClick={() => handleLinkClick('perfil')} style={footerLinkStyle} className="hover-primary">Ajustes Dietéticos</div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{ 
          paddingTop: '30px', 
          borderTop: '1px solid var(--outline-variant)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, fontWeight: '600' }}>
            © {currentYear} Ven IA. Hecho con orgullo en Venezuela 🇻🇪
          </p>
          <div style={{ display: 'flex', gap: '30px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '800', cursor: 'pointer', letterSpacing: '0.8px' }}>PRIVACIDAD</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '800', cursor: 'pointer', letterSpacing: '0.8px' }}>TÉRMINOS</span>
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
