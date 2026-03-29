import React from 'react';

const ProfileView = ({ usuario, onActualizarUsuario }) => {
  const [nombre, setNombre] = React.useState(usuario?.nombre || 'Alejandro Rodríguez');
  const [email, setEmail] = React.useState(usuario?.email || 'alejandro.rod@venia.com');
  const [telefono, setTelefono] = React.useState(usuario?.telefono || '');
  const [bio, setBio] = React.useState(usuario?.bio || "Searching for the perfect masa. Born in Caracas, living for the aroma of freshly toasted cacao. Always looking for ways to modernise grandmother's recipes with AI precision.");
  const [dietaryStyle, setDietaryStyle] = React.useState(['Amo la arepa', 'Sin gluten', 'Fan del picante', 'Vegetariano']);
  const [selectedTags, setSelectedTags] = React.useState(['Amo la arepa', 'Fan del picante']);
  const [isAdding, setIsAdding] = React.useState(false);
  const [newTagInput, setNewTagInput] = React.useState('');
  const [isSaved, setIsSaved] = React.useState(false);

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const removeTagFromList = (tag, e) => {
    e.stopPropagation();
    setDietaryStyle(prev => prev.filter(t => t !== tag));
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !dietaryStyle.includes(newTagInput.trim())) {
      setDietaryStyle([...dietaryStyle, newTagInput.trim()]);
      setSelectedTags([...selectedTags, newTagInput.trim()]);
      setNewTagInput('');
      setIsAdding(false);
    }
  };

  const handleSave = () => {
    if (onActualizarUsuario) {
      onActualizarUsuario({ ...usuario, nombre, email, telefono, bio, preferencias_dieteticas: selectedTags.join(', ') });
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
                <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--on-primary)"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </button>
            </div>
            <div>
              <h3 style={{ fontSize: '32px', margin: '0 0 5px', fontWeight: '900', letterSpacing: '-0.5px' }}>Cacao Enthusiast</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: 0, fontWeight: '500' }}>Member since October 2023</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="glass-card" style={{ padding: '45px', flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '35px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--primary)', fontSize: '13px', marginBottom: '14px', fontWeight: '800', letterSpacing: '1.2px' }}>FULL NAME</label>
                <input 
                  type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                  style={{ width: '100%', padding: '20px 24px', borderRadius: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--outline-variant)', color: 'white', outline: 'none', fontSize: '16px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--primary)', fontSize: '13px', marginBottom: '14px', fontWeight: '800', letterSpacing: '1.2px' }}>TELÉFONO</label>
                <input 
                  type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)}
                  style={{ width: '100%', padding: '20px 24px', borderRadius: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--outline-variant)', color: 'white', outline: 'none', fontSize: '16px', boxSizing: 'border-box' }}
                  placeholder="Ej: +58 412-1234567"
                />
              </div>
            </div>
            <div style={{ marginBottom: '35px' }}>
              <label style={{ display: 'block', color: 'var(--primary)', fontSize: '13px', marginBottom: '14px', fontWeight: '800', letterSpacing: '1.2px' }}>EMAIL ADDRESS</label>
              <input 
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '20px 24px', borderRadius: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--outline-variant)', color: 'white', outline: 'none', fontSize: '16px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--primary)', fontSize: '13px', marginBottom: '14px', fontWeight: '800', letterSpacing: '1.2px' }}>BIO & CULINARY INTEREST</label>
              <textarea 
                value={bio} onChange={(e) => setBio(e.target.value)}
                style={{ width: '100%', padding: '24px', borderRadius: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--outline-variant)', color: 'white', outline: 'none', minHeight: '140px', resize: 'vertical', fontSize: '16px', lineHeight: '1.7', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        {/* Columna Derecha: Dietary Style y Elite Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Dietary Style Card - Proportionate to Form height */}
          <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
            <h4 style={{ fontSize: '19px', display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 30px', fontWeight: '800' }}>
              <span style={{ color: 'var(--primary)' }}>🍳</span> Dietary Style
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: 'auto' }}>
              {dietaryStyle.map(tag => (
                <div key={tag} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <button 
                    onClick={() => toggleTag(tag)}
                    style={{ 
                      padding: '10px 28px 10px 18px', borderRadius: '30px', border: 'none',
                      background: selectedTags.includes(tag) ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      color: selectedTags.includes(tag) ? 'var(--on-primary)' : 'var(--text-secondary)',
                      fontWeight: '800', fontSize: '13px', cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)', position: 'relative'
                    }}>
                    {tag}
                  </button>
                  <button 
                    onClick={(e) => removeTagFromList(tag, e)}
                    style={{
                      position: 'absolute', right: '10px', background: 'transparent', border: 'none',
                      color: selectedTags.includes(tag) ? 'var(--on-primary)' : 'var(--text-muted)',
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

          <div className="glass-card" style={{ 
            padding: '30px', 
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(30, 41, 59, 0.5) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            <h4 style={{ fontSize: '18px', margin: '0 0 5px', fontWeight: '900' }}>Modern Hearth Elite</h4>
            <p style={{ margin: '0 0 20px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>You've unlocked 14 regional badges.</p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: '2px solid rgba(255,255,255,0.1)' }}>🥇</div>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fb7185', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: '2px solid rgba(255,255,255,0.1)' }}>⭐</div>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', color: 'white' }}>+12</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Settings */}
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

