import React from 'react';

const TimerIA = ({ segundos }) => {
  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (segundos <= 0) return null;

  return (
    <div 
      className="stagger-1"
      style={{
        position: 'fixed',
        bottom: '40px',
        right: '40px',
        zIndex: 5000,
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '15px 30px',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(15px)',
        borderRadius: '50px',
        border: '1px solid var(--primary)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        animation: 'slideInRight 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    >
      <div style={{ position: 'relative', width: '40px', height: '40px' }}>
        <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
          <circle 
            cx="18" cy="18" r="16" fill="none" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="3" 
          />
          <circle 
            cx="18" cy="18" r="16" fill="none" stroke="var(--primary)" strokeWidth="3" 
            strokeDasharray="100, 100"
            style={{ 
              transition: 'stroke-dasharray 1s linear',
              strokeDasharray: `${(segundos / 60) * 100}, 100` 
            }}
          />
        </svg>
        <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '10px' }}>⏳</span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
          La Abuela descansa
        </span>
        <span style={{ fontSize: '24px', fontWeight: '900', color: 'white', fontFamily: 'monospace' }}>
          {formatTime(segundos)}
        </span>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default TimerIA;
