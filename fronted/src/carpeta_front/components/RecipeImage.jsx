import React, { useState, useEffect } from 'react';
import placeholderImg from '../../assets/recipe-placeholder.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * RecipeImage component handles:
 * - Loading state with shimmer effect
 * - Backend proxy image fetching
 * - Automatic fallback to local professional placeholder on error
 * - Origin-aware searching
 */
const RecipeImage = ({ query, origin = 'venezuela', alt = 'Receta', style = {}, className = '' }) => {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Hardcoded mappings for high-quality, known dish photos
  const hardcodedImages = {
    'arepa': 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=600&auto=format&fit=crop',
    'pabellon': 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=600&auto=format&fit=crop',
    'pabellón': 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=600&auto=format&fit=crop',
    'cachapa': 'https://images.unsplash.com/photo-1614961191076-2679268f7ced?q=80&w=600&auto=format&fit=crop',
    'asado': 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop',
    'hallaca': 'https://images.unsplash.com/photo-1599388839592-3bc3a5027f31?q=80&w=600&auto=format&fit=crop',
  };

  useEffect(() => {
    setLoading(true);
    setError(false);
    
    // Check for hardcoded match first
    const t = (query || '').toLowerCase();
    let foundHardcoded = null;
    
    for (const key in hardcodedImages) {
      if (t.includes(key)) {
        foundHardcoded = hardcodedImages[key];
        break;
      }
    }

    if (foundHardcoded) {
      setSrc(foundHardcoded);
    } else {
      // Use proxy — no auth needed for image proxy (public endpoint)
      const proxyUrl = `${API_BASE_URL}/recetas/imagen?q=${encodeURIComponent(query)}&origin=${origin}`;
      setSrc(proxyUrl);
    }
  }, [query, origin]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    console.warn(`[RecipeImage] Failed to load image for: ${query}. Switching to placeholder.`);
    setError(true);
    setLoading(false);
    setSrc(placeholderImg);
  };

  return (
    <div 
      className={`recipe-image-wrapper ${loading ? 'shimmer-effect' : ''} ${className}`}
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative', 
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.02)',
        ...style 
      }}
    >
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={!loading ? 'image-fade-in' : ''}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: loading ? 'none' : 'block',
          transition: 'all 0.5s ease'
        }}
      />
    </div>
  );
};

export default RecipeImage;
