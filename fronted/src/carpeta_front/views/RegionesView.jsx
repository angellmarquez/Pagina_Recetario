import React from 'react';

const estadosVenezuela = [
  { nombre: 'Zulia', plato: 'Patacón Maracucho', gradient: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' },
  { nombre: 'Nueva Esparta', plato: 'Pabellón Margariteño', gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)' },
  { nombre: 'Los Andes', plato: 'Pizca Andina', gradient: 'linear-gradient(135deg, #14532d, #22c55e)' },
  { nombre: 'Distrito Capital', plato: 'Asado Negro', gradient: 'linear-gradient(135deg, #7f1d1d, #ef4444)' },
  { nombre: 'Lara', plato: 'Mute Larense', gradient: 'linear-gradient(135deg, #854d0e, #eab308)' },
  { nombre: 'Sucre', plato: 'Empanadas de Cazón', gradient: 'linear-gradient(135deg, #0284c7, #7dd3fc)' },
  { nombre: 'Llanos', plato: 'Pisillo de Chigüire', gradient: 'linear-gradient(135deg, #b45309, #f59e0b)' },
  { nombre: 'Bolívar', plato: 'Pelao Guayanés', gradient: 'linear-gradient(135deg, #115e59, #14b8a6)' },
];

const RegionesView = ({ setPrompt, generarReceta }) => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
      <div className="stagger-1" style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h2 style={{ fontSize: '56px', fontWeight: '900', margin: '0 0 15px', letterSpacing: '-2px', color: 'white' }}>
          Sabores de <span style={{ color: 'var(--primary)', textShadow: '0 4px 20px rgba(255,231,146,0.3)' }}>Venezuela</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '20px', margin: '0 auto', maxWidth: '700px' }}>
          Un viaje gastronómico por las regiones más emblemáticas del país. Selecciona un estado y descubre su plato principal.
        </p>
      </div>

      <div className="stagger-2" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '30px',
        paddingBottom: '50px'
      }}>
        {estadosVenezuela.map((estado, idx) => (
          <div 
            key={idx} 
            className="glass-card"
            style={{ 
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              height: '220px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '24px',
              border: '1px solid var(--glass-border)',
              animationDelay: `${idx * 0.1}s`
            }}
            onClick={() => {
              const promptEspecial = `Quiero la receta tradicional de ${estado.plato} típica de ${estado.nombre}, Venezuela.`;
              setPrompt(promptEspecial);
              generarReceta(promptEspecial);
            }}
          >
            {/* Background Gradient */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: estado.gradient,
              opacity: 0.2, /* Opacidad sutil para el efecto de cristal */
              zIndex: 0,
              transition: 'opacity 0.4s'
            }} className="region-bg" />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ 
                background: 'rgba(255,255,255,0.1)', 
                backdropFilter: 'blur(10px)',
                padding: '4px 12px', 
                borderRadius: '12px', 
                fontSize: '12px', 
                fontWeight: 'bold', 
                color: 'var(--primary)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '10px'
              }}>
                🇻🇪 Región
              </span>
              <h3 style={{ fontSize: '28px', margin: '0 0 5px 0', fontWeight: '800', color: 'white', letterSpacing: '-1px' }}>
                {estado.nombre}
              </h3>
              <p style={{ fontSize: '16px', margin: 0, color: 'var(--text-secondary)', fontWeight: '500' }}>
                {estado.plato}
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
  );
};

export default RegionesView;
