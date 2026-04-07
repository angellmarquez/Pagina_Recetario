import descubrirImg from '../assets/app_screenshots/descubrir.png';
import buscarImg from '../assets/app_screenshots/buscar.png';
import perfilImg from '../assets/app_screenshots/perfil.png';
import { 
  Soup, 
  Refrigerator, 
  ArrowRight, 
  ChevronRight, 
  Sparkles,
  History,
  Globe
} from 'lucide-react';
import './Landing.css';

const Landing = ({ onLogin, onRegistro }) => {
  return (
    <div className="landing-container">
      {/* Navbar Minimalista Premium Flourish */}
      <nav className="landing-nav">
        <div className="logo-container">
          <div className="logo-icon-wrapper">
            <Soup size={24} color="#ffffff" strokeWidth={2.5} />
          </div>
          <span className="logo-text">
            <span className="logo-text-ven">VEN</span>
            <span className="logo-text-ia">IA</span>
          </span>
        </div>
        
        <div className="nav-links">
          <a className="nav-item" onClick={onLogin}>Descubrir</a>
          <a className="nav-item" onClick={onLogin}>Nevera</a>
          <a className="nav-item" onClick={onLogin}>Regiones</a>
        </div>

        <div className="nav-buttons">
          <button className="btn-login-outline" onClick={onLogin}>
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* Hero Section Re-imaginada con Mockup */}
      <main className="hero-section">
        <div className="hero-content stagger-1">
          <div className="hero-badge-premium">
            <Sparkles size={14} />
            <span>La evolución de la cocina criolla</span>
          </div>
          <h1 className="hero-title">
            El sazón de la <span className="highlight">abuela</span>,<br/>
            con mente <span className="highlight-alt">artificial</span>.
          </h1>
          <p className="hero-subtitle">
            Descubre, crea y guarda miles de recetas auténticas venezolanas. 
            Dile qué tienes en la nevera y deja que nuestra IA diseñe el menú perfecto por ti.
          </p>
          <div className="hero-actions">
            <button className="btn-gold-large" onClick={onRegistro}>
              Comenzar gratis <ArrowRight size={18} />
            </button>
            <button className="btn-ghost-large" onClick={onLogin}>
              Ya tengo cuenta
            </button>
          </div>
        </div>

        <div className="hero-mockup-container stagger-2">
          <img src={descubrirImg} alt="App Preview" className="hero-mockup" />
        </div>
        
        {/* Elementos decorativos de fondo */}
        <div className="blob-1"></div>
        <div className="blob-2"></div>
      </main>

      {/* Features Grid Refinado */}
      <section className="features-section">
        <div className="feature-card glass-card stagger-2">
          <div className="feature-icon-box">
            <Globe className="icon-sage" size={32} />
          </div>
          <h3>100% Venezolano</h3>
          <p>Desde un Pabellón Margariteño hasta una Pizca Andina. Recetas históricamente precisas y culturalmente exactas.</p>
        </div>
        <div className="feature-card glass-card stagger-4">
          <div className="feature-icon-box">
            <History className="icon-sage" size={32} />
          </div>
          <h3>Tu Recetario Eterno</h3>
          <p>Guarda tus creaciones favoritas en una biblioteca personal y tenlas siempre a mano con un solo click.</p>
        </div>
      </section>

      {/* Showcase Section Visualmente Atractiva */}
      <section className="showcase-section">
        <div className="section-header">
          <h2 className="showcase-title">Arquitectura del Sabor</h2>
          <p className="showcase-desc">Una suite completa de herramientas diseñadas para el foodie venezolano moderno.</p>
        </div>
        
        <div className="showcase-grid">
          {/* Feature 1: Descubrir */}
          <div className="showcase-item">
            <div className="showcase-visual stagger-1">
              <div className="image-wrapper">
                <img src={descubrirImg} alt="Feed Descubrir" />
                <div className="visual-overlay"></div>
              </div>
            </div>
            <div className="showcase-info">
              <span className="info-tag">Explorar</span>
              <h3>Feed Inteligente</h3>
              <p>Una galería infinita de recomendaciones personalizadas basadas en tus gustos regionales y preferencias dietéticas.</p>
              <button className="text-btn" onClick={onRegistro}>Explorar feed <ChevronRight size={16} /></button>
            </div>
          </div>

          {/* Feature 2: Buscar Sabores (Nevera) */}
          <div className="showcase-item reverse">
            <div className="showcase-visual stagger-2">
               <div className="image-wrapper">
                <img src={buscarImg} alt="Buscador de Sabores" />
                <div className="visual-overlay"></div>
              </div>
            </div>
            <div className="showcase-info">
              <span className="info-tag">Creatividad</span>
              <h3>¿Qué hay en la nevera?</h3>
              <p>Transforma ingredientes simples en platos extraordinarios. Nuestra IA optimiza tus ingredientes para encontrar el sabor perfecto.</p>
              <button className="text-btn" onClick={onRegistro}>Probar buscador <ChevronRight size={16} /></button>
            </div>
          </div>

          {/* Feature 3: Perfil Personalizado */}
          <div className="showcase-item">
            <div className="showcase-visual stagger-3">
               <div className="image-wrapper">
                <img src={perfilImg} alt="Perfil de Usuario" />
                <div className="visual-overlay"></div>
              </div>
            </div>
            <div className="showcase-info">
              <span className="info-tag">Personalización</span>
              <h3>Tu Perfil Gourmet</h3>
              <p>Gestiona tu información, tus platos guardados y personaliza tu experiencia culinaria desde un solo lugar.</p>
              <button className="text-btn" onClick={onRegistro}>Configurar perfil <ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Minimalista */}
      <footer className="landing-footer-simple">
        <div className="footer-line"></div>
        <div className="footer-content">
          <div className="footer-brand">
             <Soup size={20} className="icon-sage" />
             <span>VenIA — El Sabor de Mañana</span>
          </div>
          <div className="footer-legal">
            &copy; 2026 VenIA Recetario. Hecho con ❤️ para Venezuela.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
