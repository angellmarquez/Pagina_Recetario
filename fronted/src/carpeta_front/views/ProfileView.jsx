
import React from 'react';

const ProfileView = ({ usuario, onActualizarUsuario }) => {
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
  const [isSaved, setIsSaved] = React.useState(false);
  const [errores, setErrores] = React.useState({});

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
  const handleAddTag = () => {
    const nombre = newTagInput.trim();
    if (nombre && !dietaryStyle.some(tag => tag.nombre === nombre)) {
      setDietaryStyle([...dietaryStyle, { nombre, activo: true }]);
      setNewTagInput('');
      setIsAdding(false);
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
  const handleSave = () => {
    const nuevosErrores = validarCampos();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;
    if (onActualizarUsuario) {
      onActualizarUsuario({ ...usuario, nombre, email, telefono, bio, preferencias_dieteticas: dietaryStyle });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
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
            color: 'white' 
          }}>
            Settings <span style={{ color: 'var(--primary)' }}>&</span><br/>Profile
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '19px', margin: 0, maxWidth: '550px', lineHeight: '1.5', fontWeight: '500' }}>
            Tailor your culinary journey through the heart of Venezuela. Update your preferences and let our AI personalize your experience.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', paddingTop: '45px', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '15px' }}>
            {isSaved && <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Saved!</span>}
            <button style={{ 
              background: 'transparent', color: 'white', padding: '16px 36px', 
              borderRadius: '40px', border: '1px solid var(--outline)', fontWeight: '700', cursor: 'pointer',
              fontSize: '15px'
            }}>
              Discard
            </button>
            <button 
              onClick={handleSave}
              style={{ 
                background: isSaved ? '#10b981' : 'var(--primary)', color: isSaved ? 'white' : 'var(--on-primary)', padding: '16px 36px', 
                borderRadius: '40px', border: 'none', fontWeight: '800', cursor: 'pointer',
                boxShadow: '0 15px 30px rgba(245, 158, 11, 0.3)',
                transition: 'all 0.4s ease',
                fontSize: '15px'
              }}>
              {isSaved ? 'Saved!' : 'Save Changes'}
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
                width: '130px', height: '130px', borderRadius: '50%', background: 'linear-gradient(180deg, #1e293b, #0f172a)', padding: '3px', border: '1px solid var(--outline)'
              }}>
                <div style={{ 
                  width: '100%', height: '100%', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                }}>
                  <svg viewBox="0 0 24 24" width="65" height="65" fill="#334155">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>
              <button style={{ 
                position: 'absolute', bottom: '4px', right: '4px', width: '34px', height: '34px', borderRadius: '10px', 
                background: 'var(--primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--on-primary)"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </button>
            </div>
            <div>
              <h3 style={{ fontSize: '32px', margin: '0 0 5px', fontWeight: '900', letterSpacing: '-0.5px' }}>{nombre}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: 0, fontWeight: '500' }}>
                {(() => {
                  if (usuario?.fecha_creacion) {
                    const fecha = new Date(usuario.fecha_creacion);
                    const year = fecha.getFullYear();
                    return `Miembro desde ${year}`;
                  }
                  return 'Miembro desde año desconocido';
                })()}
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="glass-card" style={{ padding: '45px', flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '35px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--primary)', fontSize: '13px', marginBottom: '14px', fontWeight: '800', letterSpacing: '1.2px' }}>FULL NAME</label>
                <input 
                  type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                  maxLength={30}
                  style={{ width: '100%', padding: '20px 24px', borderRadius: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--outline-variant)', color: 'white', outline: 'none', fontSize: '16px', boxSizing: 'border-box' }}
                />
                {errores.nombre && <div style={{ color: '#f87171', fontSize: '13px', marginTop: '6px', fontWeight: 'bold' }}>{errores.nombre}</div>}
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--primary)', fontSize: '13px', marginBottom: '14px', fontWeight: '800', letterSpacing: '1.2px' }}>TELÉFONO</label>
                <input 
                  type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  maxLength={11}
                  style={{ width: '100%', padding: '20px 24px', borderRadius: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--outline-variant)', color: 'white', outline: 'none', fontSize: '16px', boxSizing: 'border-box' }}
                  placeholder="Ej: 04121234567"
                />
                {errores.telefono && <div style={{ color: '#f87171', fontSize: '13px', marginTop: '6px', fontWeight: 'bold' }}>{errores.telefono}</div>}
              </div>
            </div>
            <div style={{ marginBottom: '35px' }}>
              <label style={{ display: 'block', color: 'var(--primary)', fontSize: '13px', marginBottom: '14px', fontWeight: '800', letterSpacing: '1.2px' }}>EMAIL ADDRESS</label>
              <input 
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                maxLength={50}
                style={{ width: '100%', padding: '20px 24px', borderRadius: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--outline-variant)', color: 'white', outline: 'none', fontSize: '16px', boxSizing: 'border-box' }}
              />
              {errores.email && <div style={{ color: '#f87171', fontSize: '13px', marginTop: '6px', fontWeight: 'bold' }}>{errores.email}</div>}

            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--primary)', fontSize: '13px', marginBottom: '14px', fontWeight: '800', letterSpacing: '1.2px' }}>BIO & CULINARY INTEREST</label>
              <textarea 
                value={bio} onChange={(e) => setBio(e.target.value)}
                maxLength={50}
                style={{ width: '100%', padding: '24px', borderRadius: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--outline-variant)', color: 'white', outline: 'none', minHeight: '140px', resize: 'vertical', fontSize: '16px', lineHeight: '1.7', boxSizing: 'border-box' }}
              />
              {errores.bio && <div style={{ color: '#f87171', fontSize: '13px', marginTop: '6px', fontWeight: 'bold' }}>{errores.bio}</div>}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Dietary Style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
            <h4 style={{ fontSize: '19px', display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 30px', fontWeight: '800' }}>
              <span style={{ color: 'var(--primary)' }}>🍳</span> Dietary Style
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: 'auto' }}>
              {dietaryStyle.map(tag => (
                <div key={tag.nombre} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <button 
                    onClick={() => toggleTag(tag.nombre)}
                    style={{ 
                      padding: '10px 28px 10px 18px', borderRadius: '30px', border: 'none',
                      background: tag.activo ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
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
                      flex: 1, padding: '10px 15px', borderRadius: '15px', 
                      background: 'rgba(0,0,0,0.4)', border: '1px solid var(--primary)', 
                      color: 'white', fontSize: '13px', outline: 'none' 
                    }}
                  />
                  <button 
                    onClick={handleAddTag}
                    style={{ 
                      background: 'var(--primary)', color: 'var(--on-primary)', 
                      padding: '10px 18px', borderRadius: '15px', border: 'none', 
                      fontWeight: '800', fontSize: '12px', cursor: 'pointer' 
                    }}
                  >Add</button>
                  <button onClick={() => setIsAdding(false)} style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAdding(true)}
                  style={{ padding: '10px 20px', borderRadius: '30px', border: '1px dashed var(--outline)', color: 'var(--text-muted)', background: 'transparent', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>
                  + Add Tag
                </button>
              )}
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '25px', borderRadius: '25px', position: 'relative', marginTop: '40px', border: '1px solid rgba(255,255,255,0.02)' }}>
              <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--text-muted)', fontSize: '16px', opacity: 0.5 }}>ⓘ</div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', fontWeight: '500' }}>
                Your flavor profile helps our AI prioritize <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>regional specialties</span> from Zulia and the Andes based on your current location.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '40px', padding: '35px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--outline-variant)' }}>
        <div>
          <h4 style={{ fontSize: '18px', margin: '0 0 8px', fontWeight: '900' }}>Account Privacy</h4>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>Managing your data and visibility settings.</p>
        </div>
        <button style={{ 
          background: 'transparent', border: 'none', color: '#ff716c', fontWeight: '900', cursor: 'pointer', fontSize: '17px', letterSpacing: '0.5px'
        }}>
          Delete Account
        </button>
      </div>

    </div>
  );
};

export default ProfileView;
