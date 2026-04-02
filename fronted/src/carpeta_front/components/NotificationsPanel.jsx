import React from 'react';
import { Bell, CheckCircle, MessageCircle, Info } from 'lucide-react';

const NotificationsPanel = ({ abierto, onCerrar, notificaciones }) => {
  if (!abierto) return null;

  const getIcon = (tipo) => {
    switch (tipo) {
      case 'success': return <CheckCircle size={20} color="#4caf50" />;
      case 'whatsapp': return <MessageCircle size={20} color="#25D366" />;
      default: return <Info size={20} color="#FFD700" />;
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, width: '100%', height: '100%',
      zIndex: 1000, display: 'flex', justifyContent: 'flex-end',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }} onClick={onCerrar}>
      
      <div 
        style={{
          width: '420px', height: '100%', background: 'var(--surface-container)',
          backdropFilter: 'blur(30px)', borderLeft: '1px solid var(--outline)',
          padding: '50px 40px', display: 'flex', flexDirection: 'column',
          boxShadow: '-20px 0 50px rgba(0,0,0,0.5)', overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h2 style={{ color: 'white', margin: 0, fontSize: '28px', fontWeight: '900', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bell color="#FFD700" size={28} /> Notificaciones
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Mantente al tanto de tus acciones</p>
          </div>
          <button onClick={onCerrar} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ flex: 1, paddingRight: '5px' }}>
          {notificaciones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', animation: 'fadeIn 0.4s ease-out' }}>
              <div style={{ fontSize: '40px', marginBottom: '20px', opacity: 0.3 }}>🔕</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>No tienes notificaciones aún.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', animation: 'fadeIn 0.4s ease-out' }}>
              {notificaciones.map((notif, index) => (
                <div 
                  key={index} 
                  style={{ 
                    background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', 
                    border: '1px solid var(--outline-variant)', display: 'flex', gap: '15px', alignItems: 'flex-start',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ 
                    minWidth: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', 
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                  }}>
                    {getIcon(notif.tipo)}
                  </div>
                  <div>
                    <h4 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '15px', fontWeight: '700' }}>{notif.titulo}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, lineHeight: '1.4' }}>{notif.mensaje}</p>
                    <small style={{ color: 'var(--primary)', fontSize: '11px', display: 'block', marginTop: '8px', fontWeight: '600' }}>
                      {notif.fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
};

export default NotificationsPanel;
