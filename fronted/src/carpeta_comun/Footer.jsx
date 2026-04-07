import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-section brand">
          <div className="footer-logo">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="#2e7d5e">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <span className="logo-text">VEN<span className="white">IA</span></span>
          </div>
          <p className="footer-description">
            La Inteligencia Artificial al servicio de la gastronomía venezolana. 
            Rescatando el sazón de la abuela, un plato a la vez.
          </p>
        </div>

        <div className="footer-section links">
          <h4>Plataforma</h4>
          <ul>
            <li><a href="#buscar">Buscar Receta</a></li>
            <li><a href="#nevera">Modo Nevera</a></li>
            <li><a href="#regiones">Explorar Regiones</a></li>
            <li><a href="#plan">Plan Semanal</a></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} VENIA - Hecho con ❤️ para Venezuela</p>
        <div className="footer-legal">
          <a href="#">Privacidad</a>
          <span className="separator">|</span>
          <a href="#">Términos</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
