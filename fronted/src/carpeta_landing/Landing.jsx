import React from 'react';
import './Landing.css';

const Landing = ({ onLogin, onRegistro }) => {
  return (
    <div className="landing-container">
      {/* Navbar Minimalista */}
      <nav className="landing-nav">
        <div className="logo-container">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="#003893">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <span className="logo-text-ven">VEN</span><span className="logo-text-ia">IA</span>
        </div>
        <div className="nav-buttons">
          <button className="btn-login-outline" onClick={onLogin}>Iniciar Sesión</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          <div className="badge-beta">🚀 Plataforma en Fase Beta</div>
          <h1 className="hero-title">El sazón de la <span className="highlight">abuela</span>,<br/>ahora con Inteligencia Artificial.</h1>
          <p className="hero-subtitle">
            Descubre, crea y guarda miles de recetas auténticas venezolanas. 
            Dile qué tienes en la nevera y VENIA cocinará la magia por ti.
          </p>
          <div className="hero-actions">
            <button className="btn-primary-large" onClick={onRegistro}>
              Comenzar Gratis Ahora
            </button>
            <button className="btn-secondary-large" onClick={onLogin}>
              Ya tengo cuenta
            </button>
          </div>
        </div>
        
        {/* Floating background elements */}
        <div className="blob-1"></div>
        <div className="blob-2"></div>
      </main>

      {/* Features Section */}
      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon">🇻🇪</div>
          <h3>100% Venezolano</h3>
          <p>Desde un Pabellón Margariteño hasta una Pizca Andina. Las recetas que te genera VENIA son históricamente precisas y culturalmente exactas.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">❄️</div>
          <h3>Modo Nevera</h3>
          <p>¿No sabes qué cocinar? Escribe los ingredientes que te sobran en la cocina y la abuela te diseñará una receta deliciosa para no desperdiciar nada.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🧠</div>
          <h3>IA Generativa</h3>
          <p>Potenciado por el modelo Llama 3 ultrarrápido y un buscador global de imágenes 100% reales, para una experiencia interactiva sin igual.</p>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="showcase-section">
        <h2 className="showcase-title">Todo lo que necesitas en un solo lugar</h2>
        
        {/* Feature 1: Descubrir */}
        <div className="showcase-row">
          <div className="showcase-text">
            <span className="showcase-badge">Explorar</span>
            <h3>Feed "Descubrir"</h3>
            <p>Una galería infinita de recomendaciones personalizadas. Desliza a través de platos típicos generados por Inteligencia Artificial y encuentra tu próxima comida favorita al instante.</p>
          </div>
          <div className="showcase-image">
            <img src="/assets/feed.png" alt="Feed Descubrir" />
          </div>
        </div>

        {/* Feature 2: Buscar */}
        <div className="showcase-row reverse">
          <div className="showcase-text">
            <span className="showcase-badge">Búsqueda Inteligente</span>
            <h3>Encuentra cualquier receta</h3>
            <p>¿Se te antojó un Pabellón Margariteño o unas Cachapas con Queso de Mano? Escríbelo en el buscador y VENIA te entregará la receta exacta, paso a paso, con ingredientes precisos y una imagen real del plato.</p>
          </div>
          <div className="showcase-image">
            <img src="/assets/search.png" alt="Búsqueda Inteligente" />
          </div>
        </div>

        {/* Feature 3: Nevera */}
        <div className="showcase-row">
          <div className="showcase-text">
            <span className="showcase-badge">Ahorro y Creatividad</span>
            <h3>¿Qué hay en la nevera?</h3>
            <p>No más desperdicios. Ingresa los ingredientes que te sobran y la abuela VENIA diseñará una receta deliciosa usando exactamente lo que tienes a la mano.</p>
          </div>
          <div className="showcase-image">
            <img src="/assets/fridge.png" alt="Modo Nevera" />
          </div>
        </div>

        {/* Feature 4: Regiones */}
        <div className="showcase-row reverse">
          <div className="showcase-text">
            <span className="showcase-badge">Cultura</span>
            <h3>Búsqueda por Regiones</h3>
            <p>Viaja gastronómicamente por toda Venezuela. Explora platos típicos desde los Andes hasta la costa oriental con nuestro explorador cultural interactivo.</p>
          </div>
          <div className="showcase-image showcase-placeholder">
            <span style={{ fontSize: '80px' }}>🗺️</span>
          </div>
        </div>

        {/* Feature 5: Menú Semanal */}
        <div className="showcase-row">
          <div className="showcase-text">
            <span className="showcase-badge">Planificación</span>
            <h3>Generador de Menú Semanal</h3>
            <p>Organiza tu semana fácilmente. VENIA crea para ti un menú balanceado de Lunes a Domingo con desayunos, almuerzos y cenas variadas y 100% venezolanas.</p>
          </div>
          <div className="showcase-image">
            <img src="/assets/menu_generator.png" alt="Menú Semanal" style={{ objectPosition: 'top' }} />
          </div>
        </div>

        {/* Feature 6: Historial */}
        <div className="showcase-row reverse">
          <div className="showcase-text">
            <span className="showcase-badge">Colección</span>
            <h3>Historial y Guardadas</h3>
            <p>Guarda tus recetas favoritas en tu perfil de VENIA para tenerlas siempre a mano. Nunca más perderás esa receta perfecta de las empanadas de cazón.</p>
          </div>
          <div className="showcase-image">
            <img src="/assets/history.png" alt="Historial de recetas" />
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
