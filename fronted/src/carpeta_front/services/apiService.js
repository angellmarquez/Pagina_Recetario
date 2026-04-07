// apiService.js — Servicio centralizado con JWT

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper: obtener headers con token JWT
function getAuthHeaders() {
    const token = localStorage.getItem('venia_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

// Helper: manejar respuestas con posible token expirado
async function handleResponse(response) {
    if (response.status === 401) {
        localStorage.removeItem('venia_token');
        localStorage.removeItem('venia_usuario');
        window.location.reload();
        throw new Error('Sesión expirada');
    }
    return await response.json();
}

export const apiGuardarReceta = async (id_usuario, titulo, recetaActiva, respuestaIA) => {
    const res = await fetch(`${API_BASE_URL}/recetas/guardar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            titulo: titulo || 'Receta sugerida',
            descripcion: JSON.stringify(recetaActiva || { historia: respuestaIA })
        })
    });
    const data = await handleResponse(res);
    return { status: res.status, data };
};

export const apiObtenerRecetasUsuario = async (id_usuario) => {
    const res = await fetch(`${API_BASE_URL}/recetas/usuario/${id_usuario}`, {
        headers: getAuthHeaders()
    });
    return await handleResponse(res);
};

export const apiEliminarReceta = async (id_usuario, id_receta) => {
    const res = await fetch(`${API_BASE_URL}/recetas/eliminar/${id_usuario}/${id_receta}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return await handleResponse(res);
};

export const apiGuardarPlanSemanal = async (id_usuario, planAGuardar, nombre) => {
    const res = await fetch(`${API_BASE_URL}/plan-semanal/guardar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
            plan_json: JSON.stringify(planAGuardar),
            nombre_plan: nombre || 'Mi Plan Semanal'
        })
    });
    return await handleResponse(res);
};

export const apiActualizarPerfil = async (id_usuario, preferencias_dieteticas, nombre, telefono, bio, email) => {
    const res = await fetch(`${API_BASE_URL}/perfil/${id_usuario}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ preferencias_dieteticas, nombre, telefono, bio, email })
    });
    return await handleResponse(res);
};

export const apiVerificarToken = async () => {
    const token = localStorage.getItem('venia_token');
    if (!token) return null;

    try {
        const res = await fetch(`${API_BASE_URL}/verificar-token`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.success ? data.usuario : null;
    } catch (e) {
        return null;
    }
};
