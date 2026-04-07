// aiService.js — Todas las llamadas IA pasan por el backend proxy (API key segura)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper: obtener token JWT del localStorage
function getAuthHeaders() {
    const token = localStorage.getItem('venia_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

export const generarRecetaIA = async ({ textoBase, origin, seccionActiva, pais }) => {
    try {
        const response = await fetch(`${API_BASE_URL}/ai/receta`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ textoBase, seccionActiva, origin, pais })
        });

        if (response.status === 429) {
            const errData = await response.json();
            throw { 
                type: 'RATE_LIMIT', 
                mensaje: errData.mensaje || '¡Mijo, dame un respiro!',
                segundos: errData.segundos || 60 
            };
        }

        if (response.status === 401) {
            // Token expirado — forzar re-login
            localStorage.removeItem('venia_token');
            window.location.reload();
            throw new Error('Sesión expirada');
        }

        if (!response.ok) {
            throw new Error('Error del servidor');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        if (error.type === 'RATE_LIMIT') throw error;
        console.error('Error aiService (generarReceta):', error);
        throw error;
    }
};

export const generarPlanIA = async ({ promptAdicional, dieta, regiones, numPersonas, nombre, fechaActual, horaActual, comidaPrioridad }) => {
    try {
        const response = await fetch(`${API_BASE_URL}/ai/plan`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ promptAdicional, dieta, regiones, numPersonas, nombre, fechaActual, horaActual, comidaPrioridad })
        });

        if (response.status === 429) {
            const errData = await response.json();
            throw { 
                type: 'RATE_LIMIT', 
                mensaje: errData.mensaje || '¡Espérame un poco!',
                segundos: errData.segundos || 60 
            };
        }

        if (response.status === 401) {
            localStorage.removeItem('venia_token');
            window.location.reload();
            throw new Error('Sesión expirada');
        }

        if (!response.ok) throw new Error('Error del servidor');

        const result = await response.json();
        return result.data;
    } catch (error) {
        if (error.type === 'RATE_LIMIT') throw error;
        console.error('Error aiService (generarPlan):', error);
        throw new Error('Mijo, no pude armar el menú de hoy. Inténtalo de nuevo.');
    }
};

export const validarTagIA = async (tag) => {
    try {
        const response = await fetch(`${API_BASE_URL}/ai/validar-tag`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ tag })
        });

        if (!response.ok) return { valido: true, razon: '' }; // Fallback permisivo

        return await response.json();
    } catch (error) {
        console.error('Error aiService (validarTag):', error);
        return { valido: true, razon: '' };
    }
};

export const generarEsqueletoSemanalIA = async ({ promptAdicional, dieta, numPersonas, nombre }) => {
    try {
        const response = await fetch(`${API_BASE_URL}/ai/esqueleto-semanal`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ promptAdicional, dieta, numPersonas, nombre })
        });

        if (response.status === 429) {
            const errData = await response.json();
            throw { type: 'RATE_LIMIT', mensaje: errData.mensaje, segundos: errData.segundos || 60 };
        }

        if (!response.ok) throw new Error('Error del servidor');

        const result = await response.json();
        return result.data;
    } catch (error) {
        if (error.type === 'RATE_LIMIT') throw error;
        console.error('Error aiService (esqueleto):', error);
        throw new Error('No pude generar el menú de la semana, mijo.');
    }
};
