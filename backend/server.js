const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const axios = require('axios');

const app = express();

// ===== SEGURIDAD: Cabeceras HTTP =====
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permitir imágenes cross-origin
    contentSecurityPolicy: false // Desactivar CSP para desarrollo (activar en producción)
}));

// ===== SEGURIDAD: CORS restringido =====
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173'
];

app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origin (Postman, curl en dev)
        if (!origin && process.env.NODE_ENV === 'development') return callback(null, true);
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Origen no permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ===== SEGURIDAD: Rate Limiting Global =====
const limiterGlobal = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 200, // máx 200 peticiones por IP cada 15 min
    message: { success: false, mensaje: 'Demasiadas peticiones. Espera un momento mijo.' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiterGlobal);

// Rate limiters específicos para endpoints sensibles
const limiterAuth = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // máx 10 intentos de login/registro por IP cada 15 min
    message: { success: false, mensaje: 'Demasiados intentos. Espera 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false
});

const limiterRecuperacion = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // máx 5 solicitudes de recuperación por IP cada 15 min
    message: { success: false, mensaje: 'Demasiados intentos de recuperación. Espera 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false
});

const limiterIA = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 10, // máx 10 peticiones de IA por minuto
    message: { success: false, mensaje: '¡Mijo, dame un respiro! Espera un momentico.' },
    standardHeaders: true,
    legacyHeaders: false
});

// ===== Middleware: Body parsing =====
app.use(express.json({ limit: '1mb' })); // Limitar tamaño del body

// ===== Logger condicional (solo en desarrollo) =====
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        // No loguear rutas de salud y assets estáticos en dev
        if (!req.url.includes('/health')) {
            console.log(`[DEV] ${req.method} ${req.url}`);
        }
        next();
    });
}

// ===== Rutas =====
const rutasUsuarios = require('./carpeta_base_datos/rutas_usuarios');
const rutasIA = require('./carpeta_base_datos/rutas_ia');

// Rutas públicas con rate limiting específico
app.use('/api/login', limiterAuth);
app.use('/api/registro', limiterAuth);
app.use('/api/recuperar', limiterRecuperacion);
app.use('/api/ai', limiterIA);

// Montar rutas
app.use('/api', rutasUsuarios);
app.use('/api/ai', rutasIA);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Endpoint de imágenes proxy (público, con rate limit global)
app.get('/api/recetas/imagen', async (req, res) => {
    let query = req.query.q;
    let origin = req.query.origin || 'venezuela';
    
    if (!query) return res.status(400).send('Query missing');

    // Sanitizar la query: limitar longitud y limpiar
    query = query.toString().slice(0, 200);

    const palabrasSucias = ['receta de', 'como hacer', 'preparación de', 'pasos para', 'ingredientes de'];
    let queryLimpia = query.toLowerCase();
    palabrasSucias.forEach(p => {
        queryLimpia = queryLimpia.replace(p, '');
    });
    
    queryLimpia = queryLimpia.replace(/[^\w\sñáéíóúÁÉÍÓÚ]/gi, '').trim();

    try {
        let searchPrompt = `"${queryLimpia}" authentic food dish recipe, professional gourmet photography, plated meal -statue -sculpture -toy -animal`;
        
        if (origin === 'venezuela' || origin === 'region') {
            searchPrompt = `"${queryLimpia}" plato de comida venezolana tradicional, receta gourmet original -estatua -monumento -animal`;
        } else if (origin === 'world-map') {
            searchPrompt = `"${queryLimpia}" authentic traditional food dish, international cuisine gourmet photography -statue -sculpture`;
        }

        const response = await axios.post('https://google.serper.dev/images', {
            q: searchPrompt,
            gl: origin === 'world-map' ? 'us' : 've',
            hl: "es",
            num: 1
        }, {
            headers: {
                'X-API-KEY': process.env.SERPER_API_KEY,
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 segundo timeout
        });

        if (response.data && response.data.images && response.data.images.length > 0) {
            const imageUrl = response.data.images[0].imageUrl;
            // Validar que sea una URL válida antes de redirigir
            try {
                new URL(imageUrl);
                return res.redirect(imageUrl);
            } catch (e) {
                return res.status(404).send('Invalid image URL');
            }
        } else {
            return res.status(404).send('Image not found');
        }
    } catch (error) {
        console.error("Serper Error:", error.message);
        return res.status(500).send('Search service error');
    }
});

// ===== Encender servidor =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor Backend Seguro corriendo en http://localhost:${PORT}`);
    
    // Inicializar el Bot de WhatsApp
    const { inicializarBot } = require('./bot_whatsapp');
    inicializarBot();

    // Inicializar el Cron de Planificación
    const { activarCronAutomático } = require('./bot_planner');
    activarCronAutomático();
});
