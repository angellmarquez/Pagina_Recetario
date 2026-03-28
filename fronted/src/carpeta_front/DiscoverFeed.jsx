import React, { useState, useEffect } from 'react';
import Groq from 'groq-sdk';

const DiscoverFeed = ({ apiKey, onSelectRecipe }) => {
  const [feed, setFeed] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState('');

  const groq = new Groq({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
  });

  const fetchFeed = async (isLoadMore = false) => {
    if (isLoadMore) setCargandoMas(true);
    else setCargando(true);
    setError('');

    try {
      const promptFeed = `Eres VENIA, una experta abuela venezolana. 
      Por favor, dame ${isLoadMore ? 'OTRAS ' : ''}6 recetas de platos muy variados y CULTURALMENTE EXACTOS de Venezuela.
      ${isLoadMore ? 'ASEGÚRATE DE QUE SEAN PLATOS DISTINTOS A LOS QUE YA SUGERISTE. NO repitas los más comunes.' : ''}
      Intenta que haya variedad (desayuno, almuerzo, cena, postre, sopa).
      MUY IMPORTANTE: Usa nombres oficiales e históricos exactos (ej: "Pabellón Criollo", "Asado Negro"). NO inventes nombres ni unas palabras al azar.
      Devuelve ÚNICAMENTE en formato json (objeto JSON) válido con la siguiente estructura:
      {
        "feed": [
          {
            "titulo": "Nombre del plato (ej: Cachapas con Queso de Mano)",
            "descripcion_corta": "Breve frase encantadora sobre por qué le gustará este plato al usuario.",
            "tiempo": "15 min",
            "tags": ["Desayuno", "Maíz"]
          }
        ]
      }`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: promptFeed }],
        model: "llama-3.3-70b-versatile",
        temperature: isLoadMore ? 0.9 : 0.8,
        response_format: { type: "json_object" },
      });

      const dataString = chatCompletion.choices[0]?.message?.content || "{}";
      const parseado = JSON.parse(dataString);

      if (parseado.feed && Array.isArray(parseado.feed)) {
        if (isLoadMore) {
          setFeed(prev => [...prev, ...parseado.feed]);
        } else {
          setFeed(parseado.feed);
        }
      } else {
        throw new Error("Formato inválido de JSON devuelto por Groq");
      }
    } catch (err) {
      console.error("Error al cargar Discover Feed:", err);
      if (!isLoadMore) setError('Ocurrió un error al cargar las recomendaciones, mijo.');
    } finally {
      if (isLoadMore) setCargandoMas(false);
      else setCargando(false);
    }
  };

  useEffect(() => {
    if (feed.length === 0) {
      fetchFeed();
    }
    // eslint-disable-next-line
  }, [apiKey]);

  if (cargando) {
    return (
      <div style={{ padding: '20px 0', width: '100%' }}>
        <h2 style={{ color: 'white', fontSize: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          ✨ <span style={{ fontWeight: '800' }}>Para ti hoy</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4, 5, 6].map((skel) => (
            <div key={skel} style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '20px',
              height: '320px',
              overflow: 'hidden',
              animation: 'pulse 1.5s infinite ease-in-out'
            }}>
              <div style={{ height: '180px', background: 'rgba(255,255,255,0.05)' }}></div>
              <div style={{ padding: '20px' }}>
                <div style={{ height: '20px', width: '80%', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '10px' }}></div>
                <div style={{ height: '15px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '8px' }}></div>
                <div style={{ height: '15px', width: '60%', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}></div>
              </div>
            </div>
          ))}
        </div>
        <style>{`
          @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 0.8; } 100% { opacity: 0.5; } }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#EF3340', fontSize: '18px' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '20px 0', width: '100%' }}>
      <h2 style={{ color: 'white', fontSize: '28px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800' }}>
        ✨ Explorar Recetas
      </h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '24px' 
      }}>
        {feed.map((receta, idx) => (
          <div 
            key={idx}
            className="discover-card"
            onClick={() => onSelectRecipe(receta.titulo)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
              e.currentTarget.style.borderColor = 'rgba(255,215,0,0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
              <img 
                src={`http://localhost:3000/api/recetas/imagen?q=${encodeURIComponent(receta.titulo)}`} 
                alt={receta.titulo}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                className="discover-img"
              />
              <div style={{
                position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', 
                backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: '12px', 
                color: 'white', fontSize: '12px', fontWeight: 'bold'
              }}>
                ⏳ {receta.tiempo}
              </div>
            </div>
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '20px', fontWeight: '700', lineHeight: '1.3' }}>
                {receta.titulo}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: '0 0 16px 0', lineHeight: '1.5', flex: 1 }}>
                {receta.descripcion_corta}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {receta.tags?.map((tag, tIdx) => (
                  <span key={tIdx} style={{
                    background: 'rgba(255,215,0,0.1)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.2)',
                    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BOTÓN CARGAR MÁS */}
      {feed.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '20px' }}>
          <button 
            onClick={() => fetchFeed(true)}
            disabled={cargandoMas}
            style={{
              padding: '14px 32px',
              background: cargandoMas ? 'rgba(255,255,255,0.05)' : 'rgba(255, 215, 0, 0.15)',
              border: `1px solid ${cargandoMas ? 'rgba(255,255,255,0.1)' : '#FFD700'}`,
              color: cargandoMas ? 'rgba(255,255,255,0.5)' : '#FFD700',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: cargandoMas ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => { if(!cargandoMas) { e.currentTarget.style.background = 'rgba(255, 215, 0, 0.25)'; e.currentTarget.style.transform = 'translateY(-2px)' } }}
            onMouseOut={(e) => { if(!cargandoMas) { e.currentTarget.style.background = 'rgba(255, 215, 0, 0.15)'; e.currentTarget.style.transform = 'translateY(0)' } }}
          >
            {cargandoMas ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="spinner-small"></span> Cocinando más ideas...
              </span>
            ) : "+ Ver más opciones"}
          </button>
        </div>
      )}

      <style>{`
        .discover-card:hover .discover-img {
          transform: scale(1.05);
        }
        .spinner-small {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default DiscoverFeed;
