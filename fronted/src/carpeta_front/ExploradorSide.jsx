import React from 'react';
import EstadoCard from './EstadoCard';

const ExploradorSide = ({ abierto, onCerrar, estados, onSeleccionarEstado }) => {
  if (!abierto) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 2000,
        display: 'flex',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        transition: 'all 0.4s'
      }} 
      onClick={onCerrar}
    >
      <div 
        style={{
          width: '320px',
          height: '100%',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '10px 0 30px rgba(0,0,0,0.5)',
          animation: 'slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h2 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: '800' }}>📍 Explorador</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '4px 0 0 0' }}>Sazón por regiones</p>
          </div>
          <button 
            onClick={onCerrar} 
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: 'none', 
              color: 'white', 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          paddingRight: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }} className="hide-scrollbar">
          {estados.map((estado, idx) => (
            <div 
              key={idx} 
              style={{ transform: 'scale(0.95)', transformOrigin: 'left' }}
              onClick={() => onSeleccionarEstado(estado)}
            >
              <EstadoCard 
                nombre={estado.nombre}
                plato={estado.plato}
                gradient={estado.gradient}
                onClick={() => {}} // El click se maneja en el padre para cerrar el menú
              />
            </div>
          ))}
        </div>

        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', margin: 0 }}>🇻🇪 Sabores de Venezuela</p>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default ExploradorSide;
