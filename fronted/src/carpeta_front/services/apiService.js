// apiService.js

const API_BASE_URL = 'http://localhost:3000/api';

export const apiGuardarReceta = async (id_usuario, titulo, recetaActiva, respuestaIA) => {
  const res = await fetch(`${API_BASE_URL}/recetas/guardar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_usuario,
      titulo: titulo || 'Receta sugerida',
      descripcion: JSON.stringify(recetaActiva || { historia: respuestaIA })
    })
  });
  const data = await res.json();
  return { status: res.status, data };
};

export const apiObtenerRecetasUsuario = async (id_usuario) => {
  const res = await fetch(`${API_BASE_URL}/recetas/usuario/${id_usuario}`);
  return await res.json();
};

export const apiEliminarReceta = async (id_usuario, id_receta) => {
  const res = await fetch(`${API_BASE_URL}/recetas/eliminar/${id_usuario}/${id_receta}`, {
    method: 'DELETE'
  });
  return await res.json();
};

export const apiGuardarPlanSemanal = async (id_usuario, planAGuardar, nombre) => {
  const res = await fetch(`${API_BASE_URL}/plan-semanal/guardar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      id_usuario, 
      plan_json: JSON.stringify(planAGuardar),
      nombre_plan: nombre || 'Mi Plan Semanal'
    })
  });
  return await res.json();
};

export const apiActualizarPerfil = async (id_usuario, preferencias_dieteticas, nombre) => {
  const res = await fetch(`${API_BASE_URL}/perfil/${id_usuario}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferencias_dieteticas, nombre })
  });
  return await res.json();
};
