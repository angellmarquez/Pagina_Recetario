import React, { useState } from 'react';
import Groq from 'groq-sdk';
import Dashboard from './Dashboard';
import EstadoCard from './EstadoCard';
import ExploradorSide from './ExploradorSide';
import DiscoverFeed from './DiscoverFeed';
const estadosVenezuela = [
  { nombre: "Zulia", plato: "Chivo en Coco", gradient: "linear-gradient(135deg, #023e8a 0%, #0077b6 100%)" },
  { nombre: "Lara", plato: "Chivo de Lara", gradient: "linear-gradient(135deg, #fb8500 0%, #ffb703 100%)" },
  { nombre: "Táchira", plato: "Pizca Andina", gradient: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)" },
  { nombre: "Bolívar", plato: "Pelao Guayanés", gradient: "linear-gradient(135deg, #9b2226 0%, #ae2012 100%)" },
  { nombre: "Falcón", plato: "Talkarí de Chivo", gradient: "linear-gradient(135deg, #e9c46a 0%, #f4a261 100%)" },
  { nombre: "Anzoátegui", plato: "Sancocho de Pescado", gradient: "linear-gradient(135deg, #48cae4 0%, #00b4d8 100%)" },
  { nombre: "Monagas", plato: "Torta de Jojoto", gradient: "linear-gradient(135deg, #7209b7 0%, #b5179e 100%)" },
  { nombre: "Caracas", plato: "Arroz con Leche", gradient: "linear-gradient(135deg, #4361ee 0%, #4cc9f0 100%)" },
  { nombre: "Mérida", plato: "Arepas de Trigo", gradient: "linear-gradient(135deg, #004b23 0%, #38b000 100%)" },
  { nombre: "Sucre", plato: "Cuajado de Cazón", gradient: "linear-gradient(135deg, #0077b6 0%, #0096c7 100%)" },
  { nombre: "Nva. Esparta", plato: "Arepa de Piñonate", gradient: "linear-gradient(135deg, #fb5607 0%, #ffbe0b 100%)" },
  { nombre: "Barinas", plato: "Picadillo Llanero", gradient: "linear-gradient(135deg, #606c38 0%, #283618 100%)" },
  { nombre: "Apure", plato: "Pabellón Vegano", gradient: "linear-gradient(135deg, #bc4749 0%, #6a994e 100%)" },
  { nombre: "Trujillo", plato: "Carabinas", gradient: "linear-gradient(135deg, #3a5a40 0%, #a3b18a 100%)" },
];

const MenuRecetario = ({ usuario, onLogout, onActualizarUsuario }) => {
  const [prompt, setPrompt] = useState('');
  const [respuestaIA, setRespuestaIA] = useState('');
  const [cargando, setCargando] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState('descubrir'); // 'descubrir', 'buscar', 'nevera'
  const [dashboardAbierto, setDashboardAbierto] = useState(false);
  const [exploradorAbierto, setExploradorAbierto] = useState(false);
  const [fondoActivo, setFondoActivo] = useState('linear-gradient(135deg, #0f172a 0%, #020617 100%)');
  const [guardando, setGuardando] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState('');
  const [recomendacionesIA, setRecomendacionesIA] = useState([]);
  const [recetaActiva, setRecetaActiva] = useState(null);
  const [imagenReceta, setImagenReceta] = useState('');
  const [recetasGuardadasLocales, setRecetasGuardadasLocales] = useState([]);
  const [recetaParaModal, setRecetaParaModal] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [planSemanal, setPlanSemanal] = useState(null);

  // Estados para nueva sección de Plan Semanal
  const [promptPlan, setPromptPlan] = useState('');
  const [cargandoPlan, setCargandoPlan] = useState(false);
  const [mensajePlan, setMensajePlan] = useState('');
  const [nombreNuevoPlan, setNombreNuevoPlan] = useState('');

  // Estados para nueva sección de Perfil
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [preferenciasInput, setPreferenciasInput] = useState(usuario?.preferencias_dieteticas || '');
  const [nombreInput, setNombreInput] = useState(usuario?.nombre || '');

  const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true // Requerido para usar en el frontend
  });

  const guardarRecetaEnBD = async () => {
    if (!respuestaIA || !usuario?.id_usuario) return;
    setGuardando(true);
    try {
      const res = await fetch('http://localhost:3000/api/recetas/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: usuario.id_usuario,
          titulo: prompt || 'Receta sugerida',
          descripcion: JSON.stringify(recetaActiva || { historia: respuestaIA })
        })
      });
      const data = await res.json();
      if (data.success) {
        setMensajeGuardado('¡Guardada mijo! ❤️');
        setTimeout(() => setMensajeGuardado(''), 3000);
      } else if (res.status === 409 || !data.success) {
        setMensajeGuardado(data.mensaje === 'Ya has guardado esta receta' ? 'Ya tienes esta receta, mijo ❤️' : 'Error al guardar');
        setTimeout(() => setMensajeGuardado(''), 3000);
      }
    } catch (err) {
      console.error("Error al guardar:", err);
    } finally {
      setGuardando(false);
    }
  };

  const handleSeleccionarReceta = (receta) => {
    try {
      const parsed = JSON.parse(receta.descripcion);
      if (parsed.titulo) {
        setRecetaActiva(parsed);
        setRespuestaIA(parsed.historia);
      } else {
        // Legacy
        setRespuestaIA(receta.descripcion);
        setRecetaActiva(null);
      }
    } catch (e) {
      // Not JSON
      setRespuestaIA(receta.descripcion);
      setRecetaActiva(null);
    }
    setPrompt(receta.titulo);
    setRecomendacionesIA([]);
    setDashboardAbierto(false);
    setSeccionActiva('buscar'); // Cambiamos a buscar para que el feed se oculte si no hay receta
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const abrirModalReceta = (receta) => {
    try {
      const parsed = JSON.parse(receta.descripcion);
      setRecetaParaModal(parsed);
      setMostrarModal(true);
    } catch (e) {
      console.error("Error al parsear receta para modal:", e);
    }
  };

  const eliminarReceta = async (id_receta) => {
    if (!usuario?.id_usuario) return;
    try {
      const res = await fetch(`http://localhost:3000/api/recetas/eliminar/${usuario.id_usuario}/${id_receta}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setRecetasGuardadasLocales(prev => prev.filter(r => r.id_receta !== id_receta));
      }
    } catch (err) {
      console.error("Error eliminando:", err);
    }
  };

  React.useEffect(() => {
    if (seccionActiva === 'guardadas' && usuario?.id_usuario) {
      fetch(`http://localhost:3000/api/recetas/usuario/${usuario.id_usuario}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setRecetasGuardadasLocales(data.recetas);
        })
        .catch(err => console.error("Error cargando recetas guardadas:", err));
    }
  }, [seccionActiva, usuario]);

  const generarReceta = async (textoVoz = null) => {
    const textoFinal = textoVoz || prompt;
    if (!textoFinal.trim()) return;

    setCargando(true);
    setRespuestaIA('');
    setRecomendacionesIA([]);

    try {
      let basePrompt = "";
      if (seccionActiva === 'nevera') {
        basePrompt = `Eres VENIA, una abuela venezolana experta cocinera. El usuario dice tener estos ingredientes: "${textoFinal}". 
        REGLA DE ORO INQUEBRANTABLE: Analiza ESTRICTAMENTE el texto. Si el texto menciona CUALQUIER COSA que no sea un alimento real y comestible (objetos, personas, tecnología, insultos, bromas), es OBLIGATORIO que rechaces la consulta. ¡NO inventes recetas mágicas con objetos! Si no son ingredientes reales de cocina, debes fallar la validación.
        Si son verdaderos alimentos, sugiérele una receta venezolana que los aproveche.`;
      } else {
        basePrompt = `Eres VENIA, una abuela venezolana virtual y experta cocinera de comida típica de Venezuela. 
        Alguien te ha pedido: "${textoFinal}".
        REGLA DE ORO INQUEBRANTABLE: Si el usuario pide cualquier cosa ajena a platos de comida reales, ingredientes o recetas (por ejemplo: reparar carros, política, programación, objetos), es OBLIGATORIO que rechaces la consulta. ¡NO generes recetas de cosas que no se comen! Si no es comida real, debes fallar la validación.`;
      }

      const promptContextualizado = `${basePrompt}
      Responde de forma muy cariñosa, dándole la receta detallada.
      
      DEBES responder ÚNICAMENTE en formato json (objeto JSON) válido.
      
      El JSON debe tener exactamente esta estructura:
      {
        "titulo": "Nombre del plato (ej: Arepa Pelúa)",
        "historia": "Una breve introducción cariñosa de la abuela sobre este plato.",
        "porciones": 4,
        "tiempo": "45 min",
        "dificultad": "Media",
        "ingredientes": ["3 huevos", "2 tazas de harina...", "etc"],
        "pasos": ["Enciende la wafflera...", "Agrega la harina...", "etc"],
        "recomendaciones": ["Nombre de plato 1", "Nombre de plato 2", "Nombre de plato 3"],
        "tags": ["Desayuno", "Fácil", "Familiar"]
      }
      
      IMPORTANTE:
      1. REGLA ESTRICTA DE VALIDACIÓN: Si la solicitud NO ES 100% SOBRE COMIDA REAL, pon OBLIGATORIAMENTE "receta_valida": false en el JSON y llena "historia" explicando cariñosamente que solo sabes de cocina. (Ignora los otros campos).
      2. Para las recomendaciones: identifica el ingrediente principal y sugiere 3 platos venezolanos CULTURALMENTE EXACTOS (no inventes nombres).
      3. El "titulo" de la receta debe ser el NOMBRE OFICIAL Y REAL del plato (ej: "Pabellón", "Cachapa", "Golfeado"). No combines palabras al azar.`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: promptContextualizado,
          },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.85, // Aumentamos la temperatura para mayor creatividad y menor repetición
        response_format: { type: "json_object" }, // Groq soporta formato JSON nativo
      });

      const dataString = chatCompletion.choices[0]?.message?.content;
      const datosParseados = JSON.parse(dataString);

      if (datosParseados.receta_valida === false) {
        setRespuestaIA(datosParseados.historia);
        setRecetaActiva(null);
      } else {
        setRecetaActiva(datosParseados);
        setRespuestaIA(datosParseados.historia); // Usamos historia como intro
        setRecomendacionesIA(datosParseados.recomendaciones);
      }
    } catch (error) {
      console.error('Error al generar la receta:', error);
      setRespuestaIA('Mijo, hubo un problema conectando con el cerebro de la abuela. Revisa la consola (F12) para ver el error exacto.');
    } finally {
      setCargando(false);
    }
  };

  const explorarRegion = async (estado) => {
    setSeccionActiva('buscar');
    setFondoActivo(estado.gradient);
    setPrompt(`Explorando la gastronomía del estado: ${estado.nombre}`);
    setExploradorAbierto(false);
    
    setCargando(true);
    setRespuestaIA('');
    setRecomendacionesIA([]);

    try {
      const promptEspecial = `Eres VENIA, una abuela venezolana virtual experta en historia y gastronomía tradicional. 
      El usuario quiere conocer la receta más emblemática del estado ${estado.nombre}.
      
      DEBES responder ÚNICAMENTE en formato json (objeto JSON) válido.
      
      El JSON debe tener exactamente esta estructura:
      {
        "titulo": "Nombre del plato (ej: Patacón Zuliano)",
        "historia": "Breve introducción cariñosa sobre este plato y su relación con ${estado.nombre}.",
        "porciones": 4,
        "tiempo": "45 min",
        "dificultad": "Media",
        "ingredientes": ["..."],
        "pasos": ["..."],
        "recomendaciones": ["Plato típico 1", "Plato típico 2"],
        "tags": ["Regional", "${estado.nombre}"]
      }
      
      IMPORTANTE PARA LAS RECOMENDACIONES:
      1. Devuelve SOLO platos típicos reales, históricos y originarios estrictamente de la región de ${estado.nombre} (máximo 4).
      2. No devuelvas platos "generales" de todo el país como "Arepa Rellena" o "Hallaca de carne" a menos que tengan un subtipo exclusivo del estado (ej. "Arepa Tumbarrancho" o "Hallaca Andina").
      3. Si el estado solo tiene 1, 2 o 3 platos únicos, devuelve solo esos. NO INVENTES NOMBRES.
      4. ¡MUY IMPORTANTE! NO DEVUELVAS PLATOS REPETIDOS NI SIMILARES BAJO DIFERENTES NOMBRES.`;
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: promptEspecial }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      let dataString = chatCompletion.choices[0]?.message?.content || "{}";
      // Por si el LLM devuelve bloques markdown a pesar del response_format
      dataString = dataString.replace(/^```json/gi, '').replace(/^```/gi, '').replace(/```$/gi, '').trim();
      
      const datosParseados = JSON.parse(dataString);

      setRecetaActiva(datosParseados);
      setRespuestaIA(datosParseados.historia);
      setRecomendacionesIA(datosParseados.recomendaciones || []);
      // Generar URL de imagen basada en el título
      if (datosParseados.titulo) {
        const formattedTitle = datosParseados.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
        setImagenReceta(`https://www.venia.com/images/${formattedTitle}.jpg`);
      } else {
        setImagenReceta('');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error al explorar la región:', error);
      setRespuestaIA('Mijo, hubo un problema recordando las recetas de ' + estado.nombre + '. (' + error.message + ')');
    } finally {
      setCargando(false);
    }
  };

  const setSugerencia = (texto) => {
    setPrompt(texto);
  };

  const generarPlanSemanalIA = async () => {
    setCargandoPlan(true);
    setPlanSemanal(null);
    setMensajePlan('');
    try {
      const pUsuario = promptPlan || 'Sin requerimientos especiales';
      const prefs = usuario?.preferencias_dieteticas || 'Sin restricciones';
      const promptContextualizado = `Eres VENIA, una abuela venezolana experta en nutrición y cocina típica. 
      Crea un plan semanal (Lunes a Domingo) de alimentación venezolana balanceada para el usuario ${usuario?.nombre || ''}.
      
      REQURIMIENTOS ESPECÍFICOS DEL USUARIO: "${pUsuario}"
      PREFERENCIAS DIETÉTICAS GENERALES: "${prefs}"
      
      DEBES responder ÚNICAMENTE en formato json (objeto JSON) válido con la siguiente estructura:
      {
        "lunes": { 
          "desayuno": { "nombre": "...", "ingredientes": ["..."], "pasos": ["..."] },
          "almuerzo": { "nombre": "...", "ingredientes": ["..."], "pasos": ["..."] },
          "cena": { "nombre": "...", "ingredientes": ["..."], "pasos": ["..."] }
        },
        ... hasta domingo
      }
      
      IMPORTANTE: Las recetas deben ser tradicionales venezolanas, nutritivas y detalladas. Responde solo el JSON.`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: promptContextualizado }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });

      const dataString = chatCompletion.choices[0]?.message?.content || "{}";
      const planParseado = JSON.parse(dataString);
      setPlanSemanal(planParseado);
      setNombreNuevoPlan(promptPlan ? `Plan: ${promptPlan.substring(0, 20)}...` : `Plan de ${usuario?.nombre || 'Mi Usuario'}`);
      setSeccionActiva('ver_plan');
    } catch (error) {
      console.error('Error al generar el plan:', error);
      setMensajePlan('Mijo, no pude armar el plan. Inténtalo de nuevo.');
    } finally {
      setCargandoPlan(false);
    }
  };

  const guardarPlanSemanalBD = async (planAGuardar, nombre) => {
    if (!planAGuardar || !usuario?.id_usuario) return;
    try {
      const res = await fetch('http://localhost:3000/api/plan-semanal/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id_usuario: usuario.id_usuario, 
          plan_json: JSON.stringify(planAGuardar),
          nombre_plan: nombre || 'Mi Plan Semanal'
        })
      });
      const data = await res.json();
      if (data.success) {
        setMensajePlan('¡Plan guardado en tu cuaderno, mijo! 📅');
        setTimeout(() => setMensajePlan(''), 3000);
      }
    } catch (err) {
      console.error("Error guardando plan:", err);
    }
  };

  const guardarCambiosPerfil = async () => {
    if (!usuario?.id_usuario) return;
    try {
      const res = await fetch(`http://localhost:3000/api/perfil/${usuario.id_usuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferencias_dieteticas: preferenciasInput, nombre: nombreInput })
      });
      const data = await res.json();
      if (data.success) {
        if (onActualizarUsuario) {
          onActualizarUsuario({ nombre: nombreInput, preferencias_dieteticas: preferenciasInput });
        }
        setEditandoPerfil(false);
        alert('¡Perfil actualizado con éxito, mijo!');
      }
    } catch (err) {
      console.error("Error guardando preferencias:", err);
    }
  };

  return (
    <div className="app-container" style={{
      position: 'relative',
      overflowX: 'hidden',
      background: fondoActivo,
      minHeight: '100vh',
      transition: 'background 1.5s ease-in-out'
    }}>
      {/* HEADER */}
      <header className="glass-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 60px' }}>
        <div className="stagger-1" style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            onClick={() => setExploradorAbierto(true)}
            className="animate-float"
            style={{
              width: '36px', height: '36px', background: '#FFD700', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)', cursor: 'pointer', transition: 'all 0.3s'
            }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#003893">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <span style={{ color: '#FFD700' }}>VEN</span><span style={{ color: '#ffffff' }}>IA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ background: 'rgba(255, 215, 0, 0.2)', color: '#FFD700', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>BETA</div>
          <div
            onClick={() => setDashboardAbierto(true)}
            style={{
              width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s'
            }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
        </div>
      </header>

      {/* DASHBOARD LATERAL */}
      <Dashboard
        abierto={dashboardAbierto}
        onCerrar={() => setDashboardAbierto(false)}
        usuario={usuario}
        onLogout={onLogout}
        apiKey={import.meta.env.VITE_GROQ_API_KEY}
        onSeleccionarReceta={handleSeleccionarReceta}
        onVerPlanDetallado={(plan) => {
          setRecetaActiva(null);
          setPlanSemanal(plan);
          setSeccionActiva('ver_plan');
          setDashboardAbierto(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* EXPLORADOR IZQUIERDO */}
      <ExploradorSide
        abierto={exploradorAbierto}
        onCerrar={() => setExploradorAbierto(false)}
        estados={estadosVenezuela}
        onSeleccionarEstado={(estado) => explorarRegion(estado)}
      />

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '100px 20px', textAlign: 'center' }}>

        {/* TITULOS */}
        {!recetaActiva && (
          <div style={{ marginBottom: '40px' }}>
            <h1 className="stagger-1" style={{ fontSize: '72px', color: 'white', margin: '0 0 24px 0', fontWeight: '800', letterSpacing: '-2px', lineHeight: '1' }}>
              ¿Qué hay en el <span style={{ color: '#FFD700' }}>budare</span> hoy?
            </h1>
            <p className="stagger-2" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '20px', margin: '0 auto 40px auto', maxWidth: '700px', lineHeight: '1.6' }}>
              Pídele a la IA la receta de cualquier plato venezolano. <br /> ¡Todo en un solo lugar y con el sazón de la abuela!
            </p>
          </div>
        )}

        {/* SELECTOR DE MODO */}
        {!recetaActiva && (
          <div className="stagger-3" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setSeccionActiva('descubrir'); setPrompt(''); setRecetaActiva(null); setRespuestaIA(''); setFondoActivo('linear-gradient(135deg, #0f172a 0%, #020617 100%)'); }}
              style={{
                background: seccionActiva === 'descubrir' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${seccionActiva === 'descubrir' ? '#FFD700' : 'rgba(255,255,255,0.1)'}`,
                color: seccionActiva === 'descubrir' ? '#FFD700' : 'white',
                padding: '10px 25px', borderRadius: '14px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.3s'
              }}>
              🌟 Descubrir
            </button>
            <button
              onClick={() => { setSeccionActiva('buscar'); setPrompt(''); setRecetaActiva(null); setFondoActivo('linear-gradient(135deg, #0f172a 0%, #020617 100%)'); }}
              style={{
                background: seccionActiva === 'buscar' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${seccionActiva === 'buscar' ? '#FFD700' : 'rgba(255,255,255,0.1)'}`,
                color: seccionActiva === 'buscar' ? '#FFD700' : 'white',
                padding: '10px 25px', borderRadius: '14px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.3s'
              }}>
              🔍 Buscar Receta
            </button>
            <button
              onClick={() => { setSeccionActiva('nevera'); setPrompt(''); setRecetaActiva(null); setFondoActivo('linear-gradient(135deg, #0f172a 0%, #020617 100%)'); }}
              style={{
                background: seccionActiva === 'nevera' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${seccionActiva === 'nevera' ? '#FFD700' : 'rgba(255,255,255,0.1)'}`,
                color: seccionActiva === 'nevera' ? '#FFD700' : 'white',
                padding: '10px 25px', borderRadius: '14px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.3s'
              }}>
              🔥 ¿Qué tengo en mi nevera?
            </button>
            <button
              onClick={() => { setSeccionActiva('plan'); setPrompt(''); setRecetaActiva(null); setFondoActivo('linear-gradient(135deg, #0f172a 0%, #020617 100%)'); }}
              style={{
                background: seccionActiva === 'plan' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${seccionActiva === 'plan' ? '#FFD700' : 'rgba(255,255,255,0.1)'}`,
                color: seccionActiva === 'plan' ? '#FFD700' : 'white',
                padding: '10px 25px', borderRadius: '14px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.3s'
              }}>
              📅 Generar Plan
            </button>
            <button
              onClick={() => { setSeccionActiva('perfil'); setPrompt(''); setRecetaActiva(null); setFondoActivo('linear-gradient(135deg, #0f172a 0%, #020617 100%)'); }}
              style={{
                background: seccionActiva === 'perfil' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${seccionActiva === 'perfil' ? '#FFD700' : 'rgba(255,255,255,0.1)'}`,
                color: seccionActiva === 'perfil' ? '#FFD700' : 'white',
                padding: '10px 25px', borderRadius: '14px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.3s'
              }}>
              👤 Mi Perfil
            </button>
            <button
              onClick={() => { setSeccionActiva('guardadas'); setPrompt(''); setRecetaActiva(null); setFondoActivo('linear-gradient(135deg, #0f172a 0%, #020617 100%)'); }}
              style={{
                background: seccionActiva === 'guardadas' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${seccionActiva === 'guardadas' ? '#FFD700' : 'rgba(255,255,255,0.1)'}`,
                color: seccionActiva === 'guardadas' ? '#FFD700' : 'white',
                padding: '10px 25px', borderRadius: '14px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.3s'
              }}>
              ❤️ Mis Recetas
            </button>
          </div>
        )}


        {/* BUSCADOR Y SUGERENCIAS (SOLO VISIBLE EN BUSCAR O NEVERA) */}
        {['buscar', 'nevera', 'guardadas'].includes(seccionActiva) && (
          <>
            <div className="stagger-4" style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '4px',
              maxWidth: '800px',
              margin: '0 auto 32px auto',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s'
            }}
              onFocusCapture={(e) => e.currentTarget.style.borderColor = '#FFD700'}
              onBlurCapture={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '16px' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (seccionActiva === 'guardadas') {
                      // El filtrado es automático al cambiar el prompt, pero podemos forzar scroll
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    } else {
                      generarReceta();
                    }
                  }
                }}
                placeholder={seccionActiva === 'nevera' ? "Ej: pollo, cebolla, arroz..." : seccionActiva === 'guardadas' ? "Busca en tus recetas guardadas..." : "Ej: ¿Cómo hago las empanadas de cazón?"}
                style={{
                  flex: 1,
                  border: 'none',
                  padding: '16px',
                  fontSize: '16px',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  color: 'white'
                }}
              />
              <button
                onClick={() => {
                  if (seccionActiva === 'guardadas') {
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  } else {
                    generarReceta();
                  }
                }}
                disabled={cargando || (seccionActiva !== 'guardadas' && !prompt.trim())}
                style={{
                  backgroundColor: cargando ? 'rgba(255,255,255,0.1)' : '#FFD700',
                  color: cargando ? 'rgba(255,255,255,0.3)' : '#020617',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0 30px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: (cargando || (seccionActiva !== 'guardadas' && !prompt.trim())) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {seccionActiva === 'nevera' ? (cargando ? '...' : 'Proponer Receta') : seccionActiva === 'guardadas' ? 'Filtrar' : (cargando ? '...' : 'Buscar')}
              </button>
            </div>

            {/* SUGERENCIAS (CHIPS) */}
            {seccionActiva === 'buscar' && (
              <div className="stagger-5" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '64px', flexWrap: 'wrap', maxWidth: '800px', margin: '0 auto 64px auto' }}>
                {['Arepa Pelúa 🍴', 'Pabellón 🍴', 'Cachapas 🍴', 'Hallacas 🍴', 'Asado Negro 🍴', 'Tequeños 🍴'].map((cat, idx) => (
                  <button
                    key={cat}
                    onClick={() => { setSugerencia(cat.replace(' 🍴', '')); generarReceta(cat.replace(' 🍴', '')); }}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '50px',
                      padding: '10px 24px',
                      fontSize: '14px',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontWeight: '500'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* ÁREA DE RESULTADOS */}
        <div className="recipe-container" style={{
          display: 'flex',
          gap: '40px',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'left',
          flexDirection: window.innerWidth < 900 ? 'column' : 'row'
        }}>
          {/* COLUMNA PRINCIPAL */}
          <div className="main-recipe" style={{ flex: 2 }}>
            {seccionActiva === 'descubrir' && !recetaActiva && !cargando && (
              <DiscoverFeed 
                apiKey={import.meta.env.VITE_GROQ_API_KEY} 
                onSelectRecipe={(tit) => { setPrompt(tit); generarReceta(tit); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              />
            )}

            {seccionActiva === 'buscar' && !recetaActiva && !cargando && (
              <div className="glass-card" style={{ padding: respuestaIA ? '60px 20px' : '100px 20px', textAlign: 'center', opacity: respuestaIA ? 1 : 0.5 }}>
                <p style={{ fontSize: '18px', color: respuestaIA ? '#ffaaaa' : 'inherit' }}>
                  {respuestaIA ? (
                    <>
                      <span style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}>👵🏽❌</span>
                      <strong>{respuestaIA}</strong>
                    </>
                  ) : (
                    "Escribe el plato que se te antoje o selecciona una de las sugerencias para ver la receta..."
                  )}
                </p>
              </div>
            )}

            {seccionActiva === 'nevera' && !recetaActiva && !cargando && (
              <div className="glass-card" style={{ padding: respuestaIA ? '60px 20px' : '100px 20px', textAlign: 'center', opacity: respuestaIA ? 1 : 0.5 }}>
                <p style={{ fontStyle: respuestaIA ? 'normal' : 'italic', fontSize: '18px', color: respuestaIA ? '#ffaaaa' : 'inherit' }}>
                  {respuestaIA ? (
                    <>
                      <span style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}>👵🏽❌</span>
                      <strong>{respuestaIA}</strong>
                    </>
                  ) : (
                    "Ingresa tus ingredientes en el buscador para empezar la magia..."
                  )}
                </p>
              </div>
            )}

            {seccionActiva === 'guardadas' && !recetaActiva && !cargando && (
              <div style={{ padding: '20px 0', width: '100%' }}>
                <h2 style={{ color: 'white', fontSize: '28px', marginBottom: '24px', textAlign: 'left', fontWeight: '800' }}>
                  ❤️ Recetas Guardadas
                </h2>
                {recetasGuardadasLocales.length === 0 ? (
                  <div className="glass-card" style={{ padding: '100px 20px', textAlign: 'center', opacity: 0.5 }}>
                    <p style={{ fontSize: '18px' }}>Aún no has guardado recetas, mijo.</p>
                  </div>
                ) : (
                  <>
                    {/* Filtrar las recetas según el prompt */}
                    {(() => {
                      const filtradas = recetasGuardadasLocales.filter(r => 
                        r.titulo.toLowerCase().includes(prompt.toLowerCase())
                      );
                      
                      if (filtradas.length === 0 && prompt.trim() !== '') {
                        return (
                          <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
                            <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.7)', marginBottom: '30px' }}>
                              ¡Ay mijo, no encontré esa receta en tu cuaderno! 👵
                            </p>
                            <button 
                              onClick={() => {
                                setSeccionActiva('buscar');
                                generarReceta();
                              }}
                              style={{ 
                                background: '#FFD700', color: '#020617', border: 'none', 
                                padding: '15px 30px', borderRadius: '15px', fontWeight: 'bold', 
                                cursor: 'pointer', transition: 'all 0.3s' 
                              }}
                              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                              ✨ ¡Abuela, génerame esta receta!
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                          gap: '24px' 
                        }}>
                          {filtradas.map((receta, idx) => (
                            <div 
                              key={receta.id_receta}
                              onClick={() => abrirModalReceta(receta)}
                              style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: '200px'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.borderColor = '#FFD700';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                              }}
                            >
                              <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                                <img 
                                  src={`http://localhost:3000/api/recetas/imagen?q=${encodeURIComponent(receta.titulo)}`} 
                                  alt={receta.titulo}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div style={{ 
                                  height: '100%', 
                                  background: 'rgba(255, 215, 0, 0.1)', 
                                  display: 'none', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  flexDirection: 'column',
                                  gap: '10px'
                                }}>
                                  <span style={{ fontSize: '32px' }}>🍽️</span>
                                  <span style={{ color: '#FFD700', fontWeight: 'bold', letterSpacing: '2px', fontSize: '14px' }}>VENIA RECETAS</span>
                                </div>
                                
                                {/* Botón de Eliminar */}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); eliminarReceta(receta.id_receta); }}
                                  style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '10px',
                                    background: 'rgba(239, 51, 64, 0.8)',
                                    backdropFilter: 'blur(5px)',
                                    border: 'none',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    zIndex: 10,
                                    boxShadow: '0 4px 12px rgba(239, 51, 64, 0.3)'
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    e.currentTarget.style.background = '#EF3340';
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.background = 'rgba(239, 51, 64, 0.8)';
                                  }}
                                  title="Eliminar de guardados"
                                >
                                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  </svg>
                                </button>
                              </div>
                              <div style={{ padding: '20px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <h3 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '700', textAlign: 'center' }}>
                                  {receta.titulo}
                                </h3>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            )}

            {cargando && (
              <div className="glass-card" style={{ padding: '100px 20px', textAlign: 'center' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#FFD700', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px auto' }}></div>
                <p style={{ color: '#FFD700', fontWeight: '600' }}>
                  {seccionActiva === 'nevera' ? 'Viendo qué cocinamos mijo...' : 'Amasando la respuesta, mijo...'}
                </p>
              </div>
            )}

            {seccionActiva === 'plan' && !recetaActiva && !cargando && (
              <div style={{ padding: '20px 0', width: '100%', animation: 'fadeIn 0.5s ease-out', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'left', marginBottom: '40px' }}>
                  <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '-1px' }}>
                    Armemos la semana 📅
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '18px' }}>
                    Cuéntame qué se te antoja o si tienes alguna dieta. Yo me encargo del resto.
                  </p>
                </div>

                <div className="glass-card" style={{ padding: '40px', textAlign: 'left' }}>
                  <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
                      Requerimientos Especiales (Opcional):
                    </label>
                    <textarea 
                      value={promptPlan}
                      onChange={(e) => setPromptPlan(e.target.value)}
                      placeholder="Ej: Quiero un plan vegano con muchas arepas, o algo bajo en carbohidratos..."
                      style={{ 
                        width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', 
                        padding: '20px', borderRadius: '15px', color: 'white', fontSize: '16px', 
                        minHeight: '120px', outline: 'none', resize: 'vertical'
                      }}
                      onFocusCapture={(e) => e.currentTarget.style.borderColor = '#FFD700'}
                      onBlurCapture={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                  
                  <button 
                    onClick={generarPlanSemanalIA}
                    disabled={cargandoPlan}
                    style={{ 
                      width: '100%', background: cargandoPlan ? 'rgba(255,255,255,0.1)' : '#FFD700', 
                      color: cargandoPlan ? 'rgba(255,255,255,0.3)' : '#0f172a', border: 'none', 
                      padding: '20px', borderRadius: '15px', fontWeight: '800', fontSize: '18px', 
                      cursor: cargandoPlan ? 'not-allowed' : 'pointer', transition: 'all 0.3s' 
                    }}>
                    {cargandoPlan ? 'Pensando el plan mijo...' : '✨ Generar mi Plan Semanal x VENIA'}
                  </button>

                  {mensajePlan && <div style={{ color: '#FFD700', fontSize: '16px', fontWeight: '600', textAlign: 'center', marginTop: '20px' }}>{mensajePlan}</div>}
                </div>
              </div>
            )}

            {seccionActiva === 'perfil' && !recetaActiva && !cargando && (
              <div style={{ padding: '20px 0', width: '100%', animation: 'fadeIn 0.5s ease-out', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'left', marginBottom: '40px' }}>
                  <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '-1px' }}>
                    Tu Perfil 👤
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '18px' }}>
                    Personaliza cómo te llamo y qué cosas puedo cocinarte.
                  </p>
                </div>

                <div className="glass-card" style={{ padding: '40px', textAlign: 'left' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#003893', fontWeight: 'bold', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
                      {nombreInput ? nombreInput.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h3 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '24px' }}>{usuario?.nombre || 'Mi Usuario'}</h3>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>{usuario?.email || ''}</p>
                    </div>
                  </div>

                  {!editandoPerfil ? (
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '30px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 5px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Nombre</h4>
                        <p style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '600' }}>{usuario?.nombre || 'No definido'}</p>
                      </div>
                      <div style={{ marginBottom: '30px' }}>
                        <h4 style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 5px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Preferencias Dietéticas</h4>
                        <p style={{ color: 'white', margin: 0, fontSize: '16px', lineHeight: '1.5' }}>{usuario?.preferencias_dieteticas || 'No tienes ninguna restricción agregada, mijo.'}</p>
                      </div>
                      
                      <button 
                        onClick={() => setEditandoPerfil(true)}
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 24px', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      >
                        ✏️ Editar Perfil
                      </button>
                    </div>
                  ) : (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                      <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', color: 'white', fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
                          Tu Nombre:
                        </label>
                        <input 
                          type="text"
                          value={nombreInput}
                          onChange={(e) => setNombreInput(e.target.value)}
                          style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', padding: '15px', borderRadius: '10px', color: 'white', fontSize: '16px', outline: 'none' }}
                        />
                      </div>
                      <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', color: 'white', fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
                          Preferencias Dietéticas:
                        </label>
                        <textarea 
                          value={preferenciasInput}
                          onChange={(e) => setPreferenciasInput(e.target.value)}
                          placeholder="Ej: Soy alérgico al maní, evito el gluten..."
                          style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', padding: '15px', borderRadius: '10px', color: 'white', fontSize: '16px', outline: 'none', minHeight: '100px', resize: 'vertical' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '15px' }}>
                        <button 
                          onClick={guardarCambiosPerfil}
                          style={{ flex: 1, background: '#FFD700', color: '#0f172a', border: 'none', padding: '15px', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}
                        >💾 Guardar</button>
                        <button 
                          onClick={() => { setEditandoPerfil(false); setNombreInput(usuario?.nombre||''); setPreferenciasInput(usuario?.preferencias_dieteticas||''); }}
                          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '15px', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', transition: 'all 0.3s' }}
                        >Cancelar</button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {seccionActiva === 'ver_plan' && !recetaActiva && planSemanal && (
              <div style={{ padding: '0', width: '100%', animation: 'fadeIn 0.5s ease-out' }}>
                {/* Cabecera Elegante */}
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0) 100%)',
                  borderRadius: '30px', padding: '40px', marginBottom: '40px',
                  border: '1px solid rgba(255,215,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                  <div>
                    <h2 style={{ color: 'white', fontSize: '38px', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '-1px' }}>
                      Tu <span style={{ color: '#FFD700' }}>Plan Semanal</span> VENIA 📅
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '16px' }}>
                      Organizado con mucho amor y sazón venezolano, ¡para que comas sabroso todos los días!
                    </p>
                  </div>
                  <button 
                    onClick={() => setSeccionActiva('descubrir')}
                    style={{ 
                      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', 
                      color: 'white', padding: '12px 24px', borderRadius: '50px', cursor: 'pointer', 
                      fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'scale(1.05)' }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)' }}
                  ><span>←</span> Volver al Menú</button>
                </div>

                {/* Grid de Días */}
                <div style={{ display: 'grid', gap: '30px' }}>
                  {Object.entries(planSemanal).map(([dia, comidas], index) => (
                    <div key={dia} style={{ 
                      background: 'rgba(15,23,42,0.4)', 
                      backdropFilter: 'blur(20px)',
                      borderRadius: '24px', 
                      padding: '0', 
                      border: '1px solid rgba(255,255,255,0.05)',
                      overflow: 'hidden',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
                    }}>
                      {/* Título del Día */}
                      <div style={{
                        background: 'linear-gradient(90deg, rgba(255,215,0,0.15) 0%, transparent 100%)',
                        padding: '20px 30px',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', gap: '15px'
                      }}>
                        <div style={{ 
                          width: '40px', height: '40px', background: '#FFD700', borderRadius: '12px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#0f172a', fontWeight: '900', fontSize: '18px'
                        }}>
                          {index + 1}
                        </div>
                        <h3 style={{ color: 'white', fontSize: '24px', margin: 0, textTransform: 'capitalize', fontWeight: '800', letterSpacing: '1px' }}>
                          {dia}
                        </h3>
                      </div>
                      
                      {/* Comidas del Día */}
                      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 900 ? '1fr' : '1fr 1fr 1fr', gap: '2px', background: 'rgba(255,255,255,0.02)' }}>
                        {['desayuno', 'almuerzo', 'cena'].map(tiempo => {
                          const item = comidas[tiempo];
                          if (!item) return null;
                          const iconos = { desayuno: '☀️', almuerzo: '🍲', cena: '🌙' };
                          const colores = { desayuno: '#fb8500', almuerzo: '#4cc9f0', cena: '#7209b7' };
                          return (
                            <div key={tiempo} style={{ 
                              background: 'rgba(15,23,42,0.5)', 
                              padding: '25px', 
                              display: 'flex', flexDirection: 'column',
                              transition: 'all 0.3s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(15,23,42,0.5)'; }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                <div style={{ 
                                  width: '32px', height: '32px', borderRadius: '50%', 
                                  background: `rgba(255,215,0, 0.1)`, 
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '16px'
                                }}>
                                  {iconos[tiempo]}
                                </div>
                                <span style={{ color: '#FFD700', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                  {tiempo}
                                </span>
                              </div>
                              <h4 style={{ color: 'white', fontSize: '18px', margin: '0 0 15px 0', lineHeight: '1.4', fontWeight: '700', flex: 1 }}>
                                {item.nombre || item}
                              </h4>
                              
                              {item.ingredientes && (
                                <div style={{ marginBottom: '20px' }}>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {item.ingredientes.slice(0, 3).map((ing, i) => (
                                      <span key={i} style={{ 
                                        background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', 
                                        padding: '4px 10px', borderRadius: '8px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.1)' 
                                      }}>
                                        {ing}
                                      </span>
                                    ))}
                                    {item.ingredientes.length > 3 && (
                                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', padding: '4px 6px' }}>+{item.ingredientes.length - 3}</span>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              <button 
                                onClick={() => {
                                  setRecetaParaModal({
                                    titulo: item.nombre || item,
                                    historia: `¡Mijo, este es un plato maravilloso pensado para tu ${tiempo} del ${dia}! Acompáñalo con cariño de abuela.`,
                                    ingredientes: item.ingredientes || [],
                                    pasos: item.pasos || ["Preparar los ingredientes con atención.", "Cocinar a fuego lento con amor.", "Servir y disfrutar en familia."],
                                    tiempo: "30-45 min",
                                    dificultad: "Media",
                                    porciones: 1
                                  });
                                  setMostrarModal(true);
                                }}
                                style={{ 
                                  background: 'transparent', border: '1px solid rgba(255,215,0,0.3)', color: '#FFD700', 
                                  padding: '10px 15px', borderRadius: '12px', fontSize: '13px', cursor: 'pointer', width: '100%',
                                  fontWeight: 'bold', transition: 'all 0.3s'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,215,0,0.1)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                              >👨‍🍳 Ver receta</button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Guardar Plan Generado */}
                {nombreNuevoPlan && (
                  <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '15px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <label style={{ color: 'white', fontWeight: 'bold' }}>Nombre del Plan:</label>
                      <input 
                        type="text" 
                        value={nombreNuevoPlan} 
                        onChange={(e) => setNombreNuevoPlan(e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '12px 20px', borderRadius: '12px', fontSize: '16px', outline: 'none', textAlign: 'center', width: '300px' }}
                      />
                      <button 
                        onClick={() => guardarPlanSemanalBD(planSemanal, nombreNuevoPlan)}
                        style={{ background: '#FFD700', color: '#0f172a', border: 'none', padding: '15px 40px', borderRadius: '15px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', transition: 'all 0.3s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        💾 Guardar en mi Cuaderno
                      </button>
                      {mensajePlan && <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{mensajePlan}</span>}
                    </div>
                  </div>
                )}
              </div>
            )}
            {recetaActiva && !cargando && (
              <div className="fade-in">
                {/* BOTON VOLVER */}
                <button 
                  onClick={() => { setRecetaActiva(null); setPrompt(''); setRespuestaIA(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  style={{ 
                    background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', 
                    padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', transition: 'all 0.3s' 
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateX(-5px)' }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateX(0)' }}>
                  <span>←</span> Volver
                </button>

                {/* CABECERA RECETA */}
                <h1 style={{ fontSize: '48px', color: 'white', marginBottom: '10px', fontWeight: '800' }}>{recetaActiva.titulo}</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px', lineHeight: '1.6', marginBottom: '30px' }}>{recetaActiva.historia}</p>

                {/* IMAGEN Y METADATOS */}
                <div className="recipe-hero" style={{ position: 'relative', marginBottom: '40px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                  <img 
                    src={`http://localhost:3000/api/recetas/imagen?q=${encodeURIComponent(recetaActiva.titulo)}`} 
                    alt={recetaActiva.titulo}
                    style={{ width: '100%', height: '450px', objectFit: 'cover' }}
                  />
                  <div className="metadata-bar" style={{ 
                    position: 'absolute', bottom: '0', left: '0', right: '0', 
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                    padding: '20px', display: 'flex', gap: '30px', borderTop: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#FFD700' }}>🕒</span> {recetaActiva.tiempo}
                    </div>
                    <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#FFD700' }}>📊</span> {recetaActiva.dificultad}
                    </div>
                    <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#FFD700' }}>👪</span> {recetaActiva.porciones} porciones
                    </div>
                  </div>
                </div>

                {/* INGREDIENTES */}
                <section style={{ marginBottom: '50px' }}>
                  <h2 style={{ color: 'white', fontSize: '28px', borderBottom: '2px solid #FFD700', paddingBottom: '10px', marginBottom: '20px', display: 'inline-block' }}>Ingredientes</h2>
                  <div className="ingredients-list" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '30px' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {recetaActiva.ingredientes.map((ing, i) => (
                        <li key={i} style={{ 
                          color: 'rgba(255,255,255,0.9)', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                          display: 'flex', alignItems: 'center', gap: '12px'
                        }}>
                          <span style={{ color: '#FFD700' }}>•</span> {ing}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                {/* PASOS */}
                <section>
                  <h2 style={{ color: 'white', fontSize: '28px', borderBottom: '2px solid #FFD700', paddingBottom: '10px', marginBottom: '20px', display: 'inline-block' }}>¡A cocinar!</h2>
                  <div className="steps-container">
                    {recetaActiva.pasos.map((paso, i) => (
                      <div key={i} style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                        <div style={{ 
                          minWidth: '40px', height: '40px', background: '#FFD700', borderRadius: '50%', color: '#020617', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                        }}>{i + 1}</div>
                        <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.8', fontSize: '17px', margin: 0 }}>{paso}</p>
                      </div>
                    ))}
                  </div>
                </section>
                
                <div style={{ marginTop: '40px' }}>
                   <button
                    onClick={guardarRecetaEnBD}
                    disabled={guardando}
                    style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700', color: '#FFD700', padding: '12px 24px', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill={mensajeGuardado ? "#EF3340" : "none"} stroke={mensajeGuardado ? "#EF3340" : "#FFD700"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    {mensajeGuardado || (guardando ? 'Guardando...' : 'Guardar en mi perfil')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR: RECETAS QUE TE PUEDEN INTERESAR */}
          {recetaActiva && (
            <aside className="sidebar-recipes" style={{ flex: 1, minWidth: '300px' }}>
              <div className="glass-card" style={{ padding: '30px', position: 'sticky', top: '100px' }}>
                <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '20px', fontWeight: '700' }}>Recetas que te pueden interesar</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {recetaActiva.recomendaciones.map((reco, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setPrompt(reco);
                        generarReceta(reco);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{ 
                        display: 'flex', gap: '15px', cursor: 'pointer', transition: 'all 0.3s',
                        padding: '10px', borderRadius: '12px'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <img 
                        src={`http://localhost:3000/api/recetas/imagen?q=${encodeURIComponent(reco)}`} 
                        alt={reco} 
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px' }} 
                      />
                      <div>
                        <h4 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '15px' }}>{reco}</h4>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Fácil • 15 min</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* TAGS */}
                <div style={{ marginTop: '30px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {recetaActiva.tags && recetaActiva.tags.map(tag => (
                    <span key={tag} style={{ 
                      fontSize: '11px', color: '#FFD700', padding: '4px 10px', 
                      borderRadius: '20px', border: '1px solid rgba(255,215,0,0.3)', background: 'rgba(255,215,0,0.05)'
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>

      </main>

      {/* MODAL DE RECETA */}
      {mostrarModal && recetaParaModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }} onClick={() => setMostrarModal(false)}>
          <div style={{
            background: '#0f172a', width: '100%', maxWidth: '800px', maxHeight: '90vh',
            borderRadius: '24px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)',
            padding: '40px', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setMostrarModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px' }}
            >✕</button>
            
            <h2 style={{ color: '#FFD700', fontSize: '32px', marginBottom: '10px', fontWeight: '800' }}>{recetaParaModal.titulo}</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', marginBottom: '30px', fontStyle: 'italic' }}>{recetaParaModal.historia}</p>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
              <div style={{ color: 'white', background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '12px', fontSize: '14px' }}>🕒 {recetaParaModal.tiempo}</div>
              <div style={{ color: 'white', background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '12px', fontSize: '14px' }}>📊 {recetaParaModal.dificultad}</div>
              <div style={{ color: 'white', background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '12px', fontSize: '14px' }}>👪 {recetaParaModal.porciones} porciones</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 600 ? '1fr' : '1fr 1fr', gap: '40px' }}>
              <div>
                <h3 style={{ color: 'white', borderBottom: '2px solid #FFD700', paddingBottom: '10px', marginBottom: '20px' }}>Ingredientes</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {recetaParaModal.ingredientes?.map((ing, i) => (
                    <li key={i} style={{ color: 'rgba(255,255,255,0.8)', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '15px' }}>
                      <span style={{ color: '#FFD700' }}>•</span> {ing}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 style={{ color: 'white', borderBottom: '2px solid #FFD700', paddingBottom: '10px', marginBottom: '20px' }}>Preparación</h3>
                {recetaParaModal.pasos?.map((paso, i) => (
                  <div key={i} style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ minWidth: '24px', height: '24px', background: '#FFD700', borderRadius: '50%', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>{i + 1}</div>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>{paso}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.5s ease-out forwards; }
        button:hover { filter: brightness(1.2); transform: translateY(-1px); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default MenuRecetario;
