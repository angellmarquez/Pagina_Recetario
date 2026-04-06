import React, { useState, useEffect } from 'react';

const messages = [
  "Calentando el budare, mijo...",
  "Buscando los ingredientes más frescos...",
  "La abuela está preparando el sazón...",
  "Cocinando a fuego lento para que quede bueno...",
  "Ya casi sale, no te me desesperes...",
  "¡Huele de maravilla por aquí!",
  "Acomodando los aliños...",
  "Poniéndole mucho corazón a la receta..."
];

const CinematicLoader = ({ visible }) => {
  const [messageIdx, setMessageIdx] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setMessageIdx((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="cinematic-loader-overlay">
      <div className="cinematic-loader-container">
        {/* Animated Icon / Illustration */}
        <div className="loader-icon-wrapper">
          <div className="loader-circle-outer"></div>
          <div className="loader-circle-inner"></div>
          <span className="loader-emoji">🍳</span>
        </div>

        {/* Text Content */}
        <div className="loader-text-section">
          <h2 className="loader-title">CONECTANDO CON LA ABUELA</h2>
          <p className="loader-subtitle">{messages[messageIdx]}</p>
        </div>

        {/* Progress bar placeholder */}
        <div className="loader-progress-track">
          <div className="loader-progress-fill"></div>
        </div>
      </div>

      <style>{`
        .cinematic-loader-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(10, 15, 29, 0.9);
          backdrop-filter: blur(25px);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
          animation: fadeInLoader 0.5s ease;
        }

        .cinematic-loader-container {
          text-align: center;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 30px;
        }

        .loader-icon-wrapper {
          position: relative;
          width: 120px;
          height: 120px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .loader-circle-outer {
          position: absolute;
          width: 100%; height: 100%;
          border: 2px solid rgba(245, 158, 11, 0.1);
          border-top: 2px solid var(--primary);
          border-radius: 50%;
          animation: spinLoader 1.5s linear infinite;
        }

        .loader-circle-inner {
          position: absolute;
          width: 70%; height: 70%;
          border: 2px solid rgba(34, 197, 94, 0.1);
          border-bottom: 2px solid #22c55e;
          border-radius: 50%;
          animation: spinLoaderReverse 2s linear infinite;
        }

        .loader-emoji {
          font-size: 40px;
          filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.5));
          animation: pulseEmoji 1s ease-in-out infinite alternate;
        }

        .loader-text-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .loader-title {
          color: white;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 4px;
          margin: 0;
          opacity: 0.6;
        }

        .loader-subtitle {
          color: var(--primary);
          font-size: 22px;
          font-weight: 800;
          margin: 0;
          height: 30px;
          animation: slideUpText 0.5s ease;
        }

        .loader-progress-track {
          width: 200px;
          height: 4px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          overflow: hidden;
        }

        .loader-progress-fill {
          width: 40%;
          height: 100%;
          background: var(--primary);
          border-radius: 10px;
          animation: progressMove 2s infinite ease-in-out;
        }

        @keyframes spinLoader { to { transform: rotate(360deg); } }
        @keyframes spinLoaderReverse { to { transform: rotate(-360deg); } }
        @keyframes fadeInLoader { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulseEmoji { from { transform: scale(1); } to { transform: scale(1.15); } }
        @keyframes slideUpText { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes progressMove {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default CinematicLoader;
