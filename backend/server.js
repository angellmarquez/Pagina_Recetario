const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Logger global para depurar la misteriosa caída en /login
app.use((req, res, next) => {
    console.log(`[LOGGER] ${req.method} ${req.url}`);
    next();
});

// Importamos TODAS las rutas mágicamente desde nuestra nueva carpeta
const rutasUsuarios = require('./carpeta_base_datos/rutas_usuarios');

// Le decimos al servidor que use esas rutas en la dirección /api
app.use('/api', rutasUsuarios);

// Endpoint de imágenes proxy
app.get('/api/recetas/imagen', async (req, res) => {
    let query = req.query.q;
    let origin = req.query.origin || 'venezuela'; // Default to venezuela if not specified
    
    if (!query) return res.status(400).send('Query missing');

    // Limpiamos la query: quitamos palabras que ensucian la búsqueda de imágenes
    const palabrasSucias = ['receta de', 'como hacer', 'preparación de', 'pasos para', 'ingredientes de'];
    let queryLimpia = query.toLowerCase();
    palabrasSucias.forEach(p => {
        queryLimpia = queryLimpia.replace(p, '');
    });
    
    // Quitamos caracteres especiales pero mantenemos letras y espacios
    queryLimpia = queryLimpia.replace(/[^\w\sñáéíóúÁÉÍÓÚ]/gi, '').trim();

    try {
        // Construimos el prompt de búsqueda según el origen
        // Añadimos términos de negación para evitar estatuas, juguetes o animales que confundan a la IA
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
            }
        });

        if (response.data && response.data.images && response.data.images.length > 0) {
            // Intentamos obtener la imagen más relevante
            return res.redirect(response.data.images[0].imageUrl);
        } else {
            // En lugar de loremflickr, devolvemos un 404 para que el frontend use su fallback local
            return res.status(404).send('Image not found');
        }
    } catch (error) {
        console.error("Serper Error:", error.message);
        return res.status(500).send('Search service error');
    }
});

// Encendemos el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor Backend Ordenado corriendo en http://localhost:${PORT}`);
    
    // Inicializar el Bot de WhatsApp automáticamente
    const { inicializarBot } = require('./bot_whatsapp');
    inicializarBot();
});
