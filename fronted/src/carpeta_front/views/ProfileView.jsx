import React from 'react';
import { validarTagIA } from '../services/aiService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
function getAuthHeaders() {
    const token = localStorage.getItem('venia_token');
    return { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
}

const ProfileView = ({ usuario, onActualizarUsuario, onDirtyStateChange, onLogout, irARecuperar }) => {
  const [nombre, setNombre] = React.useState(usuario?.nombre || 'Alejandro Rodríguez');
  const [email, setEmail] = React.useState(usuario?.email || 'alejandro.rod@venia.com');
  const [telefono, setTelefono] = React.useState(usuario?.telefono || '');
  const [bio, setBio] = React.useState(
    usuario?.bio !== undefined && usuario?.bio !== null ? usuario.bio : ''
  );
  // Adaptar a array de objetos {nombre, activo}
  const initialDietary = React.useMemo(() => {
    if (Array.isArray(usuario?.preferencias_dieteticas)) {
      // Si ya es array de objetos
      if (typeof usuario.preferencias_dieteticas[0] === 'object') return usuario.preferencias_dieteticas;
      // Si es array de strings
      return usuario.preferencias_dieteticas.map(nombre => ({ nombre, activo: true }));
    }
    return [
      { nombre: 'Amo la arepa', activo: true },
      { nombre: 'Sin gluten', activo: false },
      { nombre: 'Fan del picante', activo: true },
      { nombre: 'Vegetariano', activo: false }
    ];
  }, [usuario]);
  const [dietaryStyle, setDietaryStyle] = React.useState(initialDietary);
  const [isAdding, setIsAdding] = React.useState(false);
  const [newTagInput, setNewTagInput] = React.useState('');
  const [modalStatus, setModalStatus] = React.useState(null); // 'warning' | 'success' | null
  const [errores, setErrores] = React.useState({});
  const [tagError, setTagError] = React.useState('');
  const [validandoTag, setValidandoTag] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [botStatus, setBotStatus] = React.useState(null);

  React.useEffect(() => {
    if (usuario?.id_usuario) {
      fetch(`${API_BASE_URL}/bot/estado/${usuario.id_usuario}`, { headers: getAuthHeaders() })
        .then(r => r.json())
        .then(data => {
           if (data.success) {
             setBotStatus(data.estado);
           }
        })
        .catch(e => console.error("Error obteniendo estado bot en perfil:", e));
    }
  }, [usuario]);

  const hasChanges = React.useMemo(() => {
    const isNombreDiff = nombre !== (usuario?.nombre || 'Alejandro Rodríguez');
    const isEmailDiff = email !== (usuario?.email || 'alejandro.rod@venia.com');
    const isTelefonoDiff = telefono !== (usuario?.telefono || '');
    const isBioDiff = bio !== (usuario?.bio || '');
    const isDietaryDiff = JSON.stringify(dietaryStyle) !== JSON.stringify(initialDietary);
    return isNombreDiff || isEmailDiff || isTelefonoDiff || isBioDiff || isDietaryDiff;
  }, [nombre, email, telefono, bio, dietaryStyle, usuario, initialDietary]);

  React.useEffect(() => {
    if (onDirtyStateChange) {
      onDirtyStateChange(hasChanges);
    }
  }, [hasChanges, onDirtyStateChange]);

  // Alternar estado activo/inactivo
  const toggleTag = (tagNombre) => {
    setDietaryStyle(prev => prev.map(tag =>
      tag.nombre === tagNombre ? { ...tag, activo: !tag.activo } : tag
    ));
  };

  // Eliminar tag
  const removeTagFromList = (tagNombre, e) => {
    e.stopPropagation();
    setDietaryStyle(prev => prev.filter(tag => tag.nombre !== tagNombre));
  };

  // Agregar nuevo tag
  const handleAddTag = async () => {
    setTagError('');
    const nombre = newTagInput.trim();
    
    if (!nombre) return;
    
    // Validación local primero
    if (nombre.length > 20) {
      setTagError('Muy largo (máximo 20 caracteres).');
      return;
    }
    
    if (dietaryStyle.some(tag => tag.nombre.toLowerCase() === nombre.toLowerCase())) {
      setTagError('Esta etiqueta ya existe.');
      return;
    }

    setValidandoTag(true);
    try {
      const resp = await validarTagIA(nombre);
      if (!resp.valido) {
        setTagError(resp.razon || 'La abuela dice que esto no tiene sentido.');
        return;
      }
      
      setDietaryStyle([...dietaryStyle, { nombre, activo: true }]);
      setNewTagInput('');
      setIsAdding(false);
    } catch (e) {
      // En caso de error de red, lo permitimos pero lo limpiamos
      setDietaryStyle([...dietaryStyle, { nombre, activo: true }]);
      setNewTagInput('');
      setIsAdding(false);
    } finally {
      setValidandoTag(false);
    }
  };

  // Validación de campos
  const validarCampos = () => {
    const nuevosErrores = {};
    if (!nombre || nombre.trim().length === 0) {
      nuevosErrores.nombre = 'El nombre es obligatorio.';
    } else if (nombre.length > 30) {
      nuevosErrores.nombre = 'El nombre no puede tener más de 30 caracteres.';
    } else if (/[0-9]/.test(nombre)) {
      nuevosErrores.nombre = 'El nombre no puede contener números.';
    }
    if (bio.length > 50) {
      nuevosErrores.bio = 'La bio no puede tener más de 50 caracteres.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.trim().length === 0) {
      nuevosErrores.email = 'El email es obligatorio.';
    } else if (!emailRegex.test(email)) {
      nuevosErrores.email = 'El email no es válido.';
    }
    if (telefono && telefono.length > 0 && !/^\d{11}$/.test(telefono)) {
      nuevosErrores.telefono = 'El teléfono debe tener exactamente 11 números.';
    }
    return nuevosErrores;
  };

  // Guardar cambios
  const handleSave = async () => {
    const nuevosErrores = validarCampos();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;
    if (onActualizarUsuario) {
      setIsSaving(true);
      try {
        const res = await onActualizarUsuario({ ...usuario, nombre, email, telefono, bio, preferencias_dieteticas: dietaryStyle });
        if (res && res.success) {
          setModalStatus('success');
          setTimeout(() => setModalStatus(null), 3000);
        } else if (res && !res.success) {
          setErrores(prev => ({ ...prev, backend: res.mensaje || 'Error del servidor al guardar.' }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleLogoutClick = (e) => {
    e.preventDefault();
    if (onLogout) onLogout();
  };

  const handleDiscard = () => {
    if (hasChanges) {
      setModalStatus('warning');
    } else {
      // Si no hay cambios, resetear a los valores originales
      setNombre(usuario?.nombre || 'Alejandro Rodríguez');
      setEmail(usuario?.email || 'alejandro.rod@venia.com');
      setTelefono(usuario?.telefono || '');
      setBio(usuario?.bio || '');
      setDietaryStyle(initialDietary);
    }
  };

  const confirmDiscard = () => {
    setNombre(usuario?.nombre || 'Alejandro Rodríguez');
    setEmail(usuario?.email || 'alejandro.rod@venia.com');
    setTelefono(usuario?.telefono || '');
    setBio(usuario?.bio || '');
    setDietaryStyle(initialDietary);
    setModalStatus(null);
  };

  return (
    <div className="stagger-1" style={{ width: '100%', maxWidth: '1150px', margin: '0 auto', paddingBottom: '100px' }}>
      
      {/* Header Perfil */}
      <div style={{ marginBottom: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1.2 }}>
          <h1 style={{ 
            fontSize: '80px', 
            fontWeight: '900', 
            margin: '0 0 20px', 
            letterSpacing: '-4px', 
            lineHeight: '0.85', 
            color: 'var(--text-primary)' 
          }}>
            Settings <span style={{ color: 'var(--primary)' }}>&</span><br/>Perfil
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '19px', margin: 0, maxWidth: '550px', lineHeight: '1.5', fontWeight: '500' }}>
            Personaliza tu viaje culinario por el corazón de Venezuela. Actualiza tus preferencias y deja que nuestra IA personalice tu experiencia.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', paddingTop: '45px', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '15px' }}>
            {modalStatus === 'success' && <span style={{ color: '#3a9e77', fontWeight: 'bold' }}>✓ Quedó al pelo!</span>}
            
            <button 
              onClick={handleLogoutClick}
              style={{ 
                background: 'rgba(30, 58, 95, 0.05)', color: 'var(--secondary)', padding: '16px 28px', 
                borderRadius: '40px', border: '1.5px solid var(--outline)', fontWeight: '800', cursor: 'pointer',
                fontSize: '14px', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
              <span style={{ fontSize: '18px' }}>🚪</span> Cerrar Sesión
            </button>

            <button 
              onClick={handleDiscard}
              style={{ 
                background: 'transparent', color: 'var(--text-primary)', padding: '16px 28px', 
                borderRadius: '40px', border: '1px solid var(--outline)', fontWeight: '700', cursor: 'pointer',
                fontSize: '14px', opacity: hasChanges ? 1 : 0.5
              }}>
              Descartar
            </button>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={isSaving ? "btn-saving-pulse" : ""}
              style={{ 
                background: modalStatus === 'success' ? '#3a9e77' : 'var(--primary)', color: modalStatus === 'success' ? 'white' : 'var(--on-primary)', padding: '16px 32px', 
                borderRadius: '40px', border: 'none', fontWeight: '800', cursor: isSaving ? 'wait' : 'pointer',
                boxShadow: '0 15px 30px rgba(46, 125, 94, 0.3)',
                transition: 'all 0.4s ease',
                fontSize: '14px',
                opacity: (hasChanges || modalStatus === 'success' || isSaving) ? 1 : 0.7
              }}>
              {isSaving ? 'Actualizando...' : modalStatus === 'success' ? '¡Guardado!' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '30px', alignItems: 'stretch' }}>
        
        {/* Columna Izquierda: Tarjeta Usuario y Formulario */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* User Preview Card */}
          <div className="glass-card" style={{ padding: '45px', display: 'flex', alignItems: 'center', gap: '35px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                width: '130px', height: '130px', borderRadius: '50%', background: 'var(--surface-bright)', padding: '3px', border: '2px solid var(--primary)',
                boxShadow: '0 8px 24px rgba(46, 125, 94, 0.15)'
              }}>
                <div style={{ 
                  width: '100%', height: '100%', borderRadius: '50%', background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                }}>
                  <svg viewBox="0 0 24 24" width="65" height="65" fill="#7a94ae">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '32px', margin: '0 0 5px', fontWeight: '900', letterSpacing: '-0.5px' }}>{nombre}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: '0 0 5px 0', fontWeight: '500' }}>
                {(() => {
                  if (usuario?.fecha_creacion) {
                    const fecha = new Date(usuario.fecha_creacion);
                    const year = fecha.getFullYear();
                    if (!isNaN(year) && year > 2000) return `Miembro desde ${year}`;
                  }
                  return null;
                })()}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p style={{ color: botStatus === 'activa' ? '#3a9e77' : 'var(--text-muted)', fontSize: '14px', margin: 0, fontWeight: '800' }}>
                  {botStatus === 'activa' ? '🤖 Suscripción Auto-Chef: ACTIVA' : '📴 Suscripción Auto-Chef: INACTIVA'}
                </p>
                {botStatus === 'activa' ? 
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3a9e77', boxShadow: '0 0 10px rgba(58, 158, 119, 0.8)' }}></span> :
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--outline-variant)' }}></span>
                }
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="glass-card" style={{ padding: '45px', flex: 1 }}>
            {errores.backend && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '15px', borderRadius: '15px', marginBottom: '20px', fontWeight: 'bold' }}>👵🏽 {errores.backend}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '35px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--primary)', fontSize: '13px', marginBottom: '14px', fontWeight: '800', letterSpacing: '1.2px' }}>NOMBRE COMPLETO</label>
                <input 
                  type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                  maxLength={30}
                  style={{ width: '100%', padding: '20px 24px', borderRadius: '20px', background: 'var(--surface-bright)', border: '1.5px solid var(--outline)', color: 'var(--text-primary)', outline: 'none', fontSize: '16px', boxSizing: 'border-box', fontFamily: 'var(--font-body)', transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(30, 58, 95, 0.05)' }}
                />
                {errores.nombre && <div style={{ color: 'var(--error)', fontSize: '13px', marginTop: '6px', fontWeight: 'bold' }}>{errores.nombre}</div>}
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--primary)', fontSize: '13px', marginBottom: '14px', fontWeight: '800', letterSpacing: '1.2px', textTransform: 'uppercase' }}>TELÉFONO</label>
                <input 
                  type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  maxLength={11}
                  style={{ width: '100%', padding: '20px 24px', borderRadius: '20px', background: 'var(--surface-bright)', border: '1.5px solid var(--outline)', color: 'var(--text-primary)', outline: 'none', fontSize: '16px', boxSizing: 'border-box', fontFamily: 'var(--font-body)', transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(30, 58, 95, 0.05)' }}
                  placeholder="Ej: 04121234567"
                />
                {errores.telefono && <div style={{ color: 'var(--error)', fontSize: '13px', marginTop: '6px', fontWeight: 'bold' }}>{errores.telefono}</div>}
              </div>
            </div>
            <div style={{ marginBottom: '35px' }}>
              <label style={{ display: 'block', color: 'var(--primary)', fontSize: '13px', marginBottom: '14px', fontWeight: '800', letterSpacing: '1.2px', textTransform: 'uppercase' }}>CORREO ELECTRÓNICO</label>
              <input 
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                maxLength={50}
                style={{ width: '100%', padding: '20px 24px', borderRadius: '20px', background: 'var(--surface-bright)', border: '1.5px solid var(--outline)', color: 'var(--text-primary)', outline: 'none', fontSize: '16px', boxSizing: 'border-box', fontFamily: 'var(--font-body)', transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(30, 58, 95, 0.05)' }}
              />
              {errores.email && <div style={{ color: 'var(--error)', fontSize: '13px', marginTop: '6px', fontWeight: 'bold' }}>{errores.email}</div>}

            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--primary)', fontSize: '13px', marginBottom: '14px', fontWeight: '800', letterSpacing: '1.2px', textTransform: 'uppercase' }}>BIO E INTERÉS CULINARIO</label>
              <textarea 
                value={bio} onChange={(e) => setBio(e.target.value)}
                maxLength={50}
                style={{ width: '100%', padding: '24px', borderRadius: '20px', background: 'var(--surface-bright)', border: '1.5px solid var(--outline)', color: 'var(--text-primary)', outline: 'none', minHeight: '140px', resize: 'vertical', fontSize: '16px', lineHeight: '1.7', boxSizing: 'border-box', fontFamily: 'var(--font-body)', transition: 'all 0.3s ease', boxShadow: '0 2px 8px rgba(30, 58, 95, 0.05)' }}
              />
              {errores.bio && <div style={{ color: 'var(--error)', fontSize: '13px', marginTop: '6px', fontWeight: 'bold' }}>{errores.bio}</div>}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Dietary Style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
            <h4 style={{ fontSize: '19px', display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 30px', fontWeight: '800' }}>
              <span style={{ color: 'var(--primary)' }}>🍳</span> Estilo Dietético
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: 'auto' }}>
              {dietaryStyle.map(tag => (
                <div key={tag.nombre} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <button 
                    onClick={() => toggleTag(tag.nombre)}
                    style={{ 
                      padding: '10px 28px 10px 18px', borderRadius: '30px', border: 'none',
                      background: tag.activo ? 'var(--primary)' : 'rgba(0,0,0,0.03)',
                      color: tag.activo ? 'var(--on-primary)' : 'var(--text-secondary)',
                      fontWeight: '800', fontSize: '13px', cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)', position: 'relative',
                      opacity: tag.activo ? 1 : 0.5
                    }}>
                    {tag.nombre}
                  </button>
                  <button 
                    onClick={(e) => removeTagFromList(tag.nombre, e)}
                    style={{
                      position: 'absolute', right: '10px', background: 'transparent', border: 'none',
                      color: tag.activo ? 'var(--on-primary)' : 'var(--text-muted)',
                      fontSize: '16px', cursor: 'pointer', opacity: 0.6, fontWeight: '900'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {isAdding ? (
                <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '5px' }}>
                  <input 
                    autoFocus
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Nueva etiqueta..."
                    style={{ 
                      flex: 1, padding: '12px 18px', borderRadius: '16px', 
                      background: 'var(--surface-bright)', border: '1.5px solid var(--outline)', 
                      color: 'var(--text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font-body)',
                      boxShadow: '0 2px 6px rgba(30, 58, 95, 0.04)', transition: 'all 0.3s ease'
                    }}
                  />
                  <button 
                    onClick={handleAddTag}
                    disabled={validandoTag}
                    style={{ 
                      background: validandoTag ? 'var(--text-muted)' : 'var(--primary)', color: 'var(--on-primary)', 
                      padding: '10px 18px', borderRadius: '15px', border: 'none', 
                      fontWeight: '800', fontSize: '12px', cursor: validandoTag ? 'wait' : 'pointer' 
                    }}
                  >{validandoTag ? 'Validando...' : 'Añadir'}</button>
                  <button onClick={() => { setIsAdding(false); setTagError(''); }} style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAdding(true)}
                  style={{ padding: '10px 20px', borderRadius: '30px', border: '1px dashed var(--outline)', color: 'var(--text-muted)', background: 'transparent', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>
                  + Añadir Etiqueta
                </button>
              )}
            </div>
            
            {tagError && (
              <div style={{ color: '#EF4444', fontSize: '12px', fontWeight: 'bold', marginTop: '10px' }}>
                👵🏽 {tagError}
              </div>
            )}

            <div style={{ background: 'var(--primary-container)', padding: '25px', borderRadius: '24px', position: 'relative', marginTop: '40px', border: '1px solid var(--primary)' }}>
              <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--primary)', fontSize: '16px', opacity: 0.8 }}>ⓘ</div>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6', fontWeight: '600' }}>
                Tu perfil de sabor ayuda a nuestra IA a priorizar <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>especialidades regionales</span> del Zulia y los Andes según tu gusto.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '40px', padding: '35px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--outline-variant)' }}>
        <div>
          <h4 style={{ fontSize: '18px', margin: '0 0 8px', fontWeight: '900' }}>Privacidad de la Cuenta</h4>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>Administra tus credenciales y mejora la seguridad de tu perfil.</p>
        </div>
        <button 
          onClick={irARecuperar}
          style={{ 
          background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '900', cursor: 'pointer', fontSize: '17px', letterSpacing: '0.5px'
        }}>
          Cambiar contraseña
        </button>
      </div>

      {/* MODALES DE LA ABUELA (WARNING & SUCCESS) */}
      {modalStatus && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center',
          background: 'rgba(10, 15, 29, 0.85)', backdropFilter: 'blur(15px)',
          animation: 'fadeIn 0.3s ease'
        }} onClick={() => setModalStatus(null)}>
          <div 
            className="glass-panel-premium" 
            style={{ 
              padding: '60px', textAlign: 'center', maxWidth: '550px', 
              boxShadow: '0 30px 100px rgba(0,0,0,0.8)',
              border: modalStatus === 'warning' ? '1px solid #EF4444' : '1px solid #3a9e77',
              animation: modalStatus === 'warning' ? 'shakeCard 0.5s cubic-bezier(.36,.07,.19,.97) both' : 'fadeInUp 0.5s ease both'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '70px', marginBottom: '20px' }}>
              {modalStatus === 'warning' ? '👵🏽☝🏽' : '✨👵🏽✨'}
            </div>
            <h3 style={{ 
              fontSize: '32px', 
              color: modalStatus === 'warning' ? '#EF4444' : '#3a9e77', 
              marginBottom: '20px', fontWeight: '900', letterSpacing: '-1px' 
            }}>
              {modalStatus === 'warning' ? '¡Epa mijo, cuidado!' : '¡Quedó al pelo!'}
            </h3>
            <p style={{ fontSize: '20px', lineHeight: '1.6', color: 'var(--text-primary)', opacity: 0.9, fontWeight: '500' }}>
              {modalStatus === 'warning' 
                ? 'No te vayas sin guardar los cambios, que la abuela se va a enojar si se pierde tu progreso.' 
                : 'Tus preferencias se han guardado con éxito. ¡Ahora a cocinar con alma!'}
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '40px' }}>
              {modalStatus === 'warning' ? (
                <>
                  <button className="btn-gold" onClick={() => setModalStatus(null)} style={{ background: 'transparent', border: '1px solid var(--outline-variant)', color: 'var(--text-primary)' }}>
                    VOLVER A GUARDAR
                  </button>
                  <button className="btn-gold" onClick={confirmDiscard} style={{ background: '#EF4444', color: 'var(--text-primary)' }}>
                    DESCARTAR IGUAL
                  </button>
                </>
              ) : (
                <button className="btn-gold" onClick={() => setModalStatus(null)} style={{ padding: '15px 60px' }}>
                  ¡GRACIAS, ABUELA!
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shakeCard {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseSaving {
          0% { box-shadow: 0 0 0 0 rgba(46, 125, 94, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(46, 125, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(46, 125, 94, 0); }
        }
        .btn-saving-pulse {
          animation: pulseSaving 1.5s infinite cubic-bezier(0.66, 0, 0, 1);
        }
        .btn-gold { 
          padding: 15px 30px; border-radius: 100px; fontSize: 15px; fontWeight: 800;
          background: var(--primary); color: var(--on-primary); border: none; cursor: pointer;
          transition: all 0.3s ease; box-shadow: 0 10px 20px rgba(46, 125, 94, 0.2);
        }
        .btn-gold:hover { transform: scale(1.05); }
      `}</style>

    </div>
  );
};

export default ProfileView;
