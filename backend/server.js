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
    if (!query) return res.status(400).send('Query missing');

    // Limpiamos la query un poco por si vienen emojis o caracteres extraños que confundan a Google
    query = query.replace(/[^\w\sñáéíóúÁÉÍÓÚ]/gi, '').trim();

    try {
        const response = await axios.post('https://google.serper.dev/images', {
            // Ponemos el nombre del plato entre comillas para forzar concordancia exacta
            // y añadimos términos estrictamente alimenticios.
            q: `"${query}" plato de comida receta gastronomia venezolana tradicional`,
            gl: "ve",
            hl: "es"
        }, {
            headers: {
                'X-API-KEY': process.env.SERPER_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.images && response.data.images.length > 0) {
            return res.redirect(response.data.images[0].imageUrl);
        } else {
            return res.redirect(`https://loremflickr.com/400/300/food,${query.replace(/\s+/g, ',')}`);
        }
    } catch (error) {
        console.error("Serper Error:", error.message);
        return res.redirect(`https://loremflickr.com/400/300/food,${query.replace(/\s+/g, ',')}`);
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
