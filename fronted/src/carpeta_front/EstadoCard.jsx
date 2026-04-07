import React from 'react';

const EstadoCard = ({ nombre, plato, imagen, gradient, onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        minWidth: '220px',
        height: '140px',
        background: gradient || 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '20px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
        userSelect: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.3)';
        e.currentTarget.style.borderColor = 'rgba(46, 125, 94, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)';
      }}
    >
      {/* Overlay de brillo */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(0,0,0,0.05) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <h4 style={{ 
        color: '#2e7d5e', 
        fontSize: '20px', 
        fontWeight: '800', 
        margin: '0 0 4px 0',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        letterSpacing: '-0.5px'
      }}>
        {nombre}
      </h4>
      <p style={{ 
        color: 'var(--text-muted)', 
        fontSize: '13px', 
        margin: 0,
        fontWeight: '500'
      }}>
        {plato}
      </p>

      {/* Decoración sutil */}
      <div style={{
        position: 'absolute',
        right: '15px',
        top: '15px',
        opacity: 0.2
      }}>
        <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </div>
    </div>
  );
};

export default EstadoCard;
