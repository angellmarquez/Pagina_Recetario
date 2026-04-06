import React, { useState, useEffect } from 'react';
import Groq from 'groq-sdk';
import RecipeImage from './components/RecipeImage';

const DiscoverFeed = ({ apiKey, onSelectRecipe }) => {
  const [feed, setFeed] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState('');

  const groq = new Groq({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
  });

  const getBadgeType = (idx) => {
    const types = ['signature', 'heritage', 'popular'];
    return types[idx % types.length];
  };

  const getBadgeLabel = (type) => {
    if (type === 'signature') return 'SIGNATURE';
    if (type === 'heritage') return 'HERITAGE';
    if (type === 'popular') return 'POPULAR';
    return 'CLASSIC';
  };

  const fetchFeed = async (isLoadMore = false) => {
    if (isLoadMore) setCargandoMas(true);
    else setCargando(true);
    setError('');

    try {
      const promptFeed = `Eres VENIA, una experta abuela venezolana. 
      Por favor, dame ${isLoadMore ? 'OTRAS ' : ''}6 recetas de platos muy variados y CULTURALMENTE EXACTOS de Venezuela.
      ${isLoadMore ? 'ASEGÚRATE DE QUE SEAN PLATOS DISTINTOS A LOS QUE YA SUGERISTE. NO repitas los más comunes.' : ''}
      Intenta que haya variedad (desayuno, almuerzo, cena, postre, sopa).
      MUY IMPORTANTE: Usa nombres oficiales e históricos exactos (ej: "Pabellón Criollo", "Asado Negro").
      Devuelve ÚNICAMENTE en formato json válido:
      {
        "feed": [
          {
            "titulo": "Nombre del plato",
            "descripcion_corta": "Breve frase encantadora.",
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
        throw new Error("Formato inválido");
      }
    } catch (err) {
      console.error("Error:", err);
      if (!isLoadMore) setError('Ocurrió un error al cargar las recomendaciones, mijo.');
    } finally {
      if (isLoadMore) setCargandoMas(false);
      else setCargando(false);
    }
  };

  useEffect(() => {
    if (feed.length === 0) fetchFeed();
    // eslint-disable-next-line
  }, [apiKey]);

  if (cargando) {
    return (
      <div style={{ padding: '60px 0', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
          {[1, 2, 3].map((skel) => (
            <div key={skel} style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '28px',
              height: '450px',
              animation: 'pulse 1.5s infinite ease-in-out'
            }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stagger-2" style={{ padding: '60px 0', width: '100%' }}>
      
      {/* Section Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end',
        marginBottom: '40px'
      }}>
        <div>
          <span style={{ 
            color: 'var(--primary)', 
            fontSize: '12px', 
            fontWeight: '800', 
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '8px'
          }}>TRADITION & INNOVATION</span>
          <h2 style={{ fontSize: '36px', fontWeight: '900', margin: 0, color: 'white' }}>Explorar Recetas</h2>
        </div>
        
        <button 
          onClick={() => fetchFeed()}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--primary)', 
            fontWeight: '700', 
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 0'
          }}>
          View All Classics <span style={{ fontSize: '18px' }}>→</span>
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '40px' 
      }}>
        {feed.map((receta, idx) => {
          const badgeType = getBadgeType(idx);
          return (
            <div 
              key={idx}
              className="recipe-card-premium"
              onClick={() => onSelectRecipe(receta.titulo)}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
            >
              {/* Image Container */}
              <div style={{ position: 'relative', height: '350px', overflow: 'hidden' }}>
                <RecipeImage 
                  query={receta.titulo} 
                  origin="venezuela" 
                  alt={receta.titulo} 
                />
                
                {/* Overlay Badges */}
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', gap: '10px' }}>
                  <span className={`badge badge-${badgeType}`}>{getBadgeLabel(badgeType)}</span>
                  <span className="badge" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                    CHEF'S CHOICE
                  </span>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '30px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ color: 'white', margin: 0, fontSize: '24px', fontWeight: '800' }}>
                    {receta.titulo}
                  </h3>
                  <span style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: '800', whiteSpace: 'nowrap' }}>
                    <span style={{ opacity: 0.6, marginRight: '4px' }}>🕒</span> {receta.tiempo}
                  </span>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0, lineHeight: '1.6', marginBottom: '20px' }}>
                  {receta.descripcion_corta}
                </p>
                
                {/* Tags */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {receta.tags?.slice(0, 2).map((tag, tIdx) => (
                    <span key={tIdx} style={{
                      color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      • {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {feed.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <button 
            className="btn-gold"
            onClick={() => fetchFeed(true)}
            disabled={cargandoMas}
            style={{ padding: '16px 48px' }}
          >
            {cargandoMas ? "Cocinando más..." : "+ Descubrir más sabores"}
          </button>
        </div>
      )}
    </div>
  );
};

export default DiscoverFeed;
