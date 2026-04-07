const mysql = require('mysql2');

// Paso 1: Crear la base de datos si no existe (conexión temporal sin DB)
const initConnection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT) || 3306
});

initConnection.query('CREATE DATABASE IF NOT EXISTS recetario_db', (err) => {
    if (err) {
        console.error('❌ Error creando base de datos:', err);
        return;
    }
    initConnection.end(); // Cerramos la conexión temporal
    inicializarPool();
});

// Paso 2: Pool con la DB ya seleccionada
let pool;

function inicializarPool() {
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: parseInt(process.env.DB_PORT) || 3306,
        database: 'recetario_db', // DB ya seleccionada en el pool
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('❌ Error al conectar al pool MySQL:', err);
            return;
        }
        console.log('✅ Pool de conexiones MySQL establecido (recetario_db).');
        connection.release();

        // Limpiar e inicializar tablas
        limpiarYCrearTablas();
    });
}

function limpiarYCrearTablas() {
    // Drop tablas en orden de dependencias (hijos primero)
    const dropTablesInOrder = [
        'DROP TABLE IF EXISTS registros_envios_bot',
        'DROP TABLE IF EXISTS suscripciones_bot',
        'DROP TABLE IF EXISTS codigos_recuperacion',
        'DROP TABLE IF EXISTS historial_ia',
        'DROP TABLE IF EXISTS planes_semanales',
        'DROP TABLE IF EXISTS recetas',
        'DROP TABLE IF EXISTS usuarios'
    ];

    let dropIdx = 0;
    const ejecutarDrop = () => {
        if (dropIdx >= dropTablesInOrder.length) {
            crearTablasNuevas();
            return;
        }
        pool.query(dropTablesInOrder[dropIdx], (err) => {
            if (err) console.warn('Drop warning:', err.message);
            dropIdx++;
            ejecutarDrop();
        });
    };
    ejecutarDrop();
}

function crearTablasNuevas() {
    const tablaUsuarios = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id_usuario INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(512) NOT NULL,
            email VARCHAR(512) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            telefono VARCHAR(512),
            preferencias_dieteticas TEXT,
            nivel_experiencia VARCHAR(50),
            bio TEXT,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    pool.query(tablaUsuarios, (err) => {
        if (err) { console.error('❌ Error creando tabla usuarios:', err); return; }

        const tablaRecetas = `
            CREATE TABLE IF NOT EXISTS recetas (
                id_receta INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(200) NOT NULL,
                descripcion TEXT,
                dificultad VARCHAR(50)
            )
        `;
        pool.query(tablaRecetas, (err) => { if (err) console.error('Error recetas:', err); });

        const tablaPlanes = `
            CREATE TABLE IF NOT EXISTS planes_semanales (
                id_plan INT AUTO_INCREMENT PRIMARY KEY,
                id_usuario INT NOT NULL,
                nombre_plan VARCHAR(255) DEFAULT 'Mi Plan Semanal',
                plan_json TEXT NOT NULL,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
            )
        `;
        pool.query(tablaPlanes, (err) => { if (err) console.error('Error planes:', err); });

        const tablaHistorial = `
            CREATE TABLE IF NOT EXISTS historial_ia (
                id_interaccion INT AUTO_INCREMENT PRIMARY KEY,
                id_usuario INT,
                id_receta INT,
                tipo_interaccion VARCHAR(50), 
                calificacion INT,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
                FOREIGN KEY (id_receta) REFERENCES recetas(id_receta) ON DELETE CASCADE
            )
        `;
        pool.query(tablaHistorial, (err) => { if (err) console.error('Error historial:', err); });

        const tablaCodigos = `
            CREATE TABLE IF NOT EXISTS codigos_recuperacion (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_usuario INT,
                codigo_hash VARCHAR(255) NOT NULL,
                intentos INT DEFAULT 0,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
            )
        `;
        pool.query(tablaCodigos, (err) => { if (err) console.error('Error codigos:', err); });

        const tablaSuscripciones = `
            CREATE TABLE IF NOT EXISTS suscripciones_bot (
                id_suscripcion INT AUTO_INCREMENT PRIMARY KEY,
                id_usuario INT UNIQUE,
                dieta VARCHAR(255),
                num_personas INT DEFAULT 1,
                peticion_adicional TEXT,
                plan_esqueleto TEXT,
                estado VARCHAR(50) DEFAULT 'activa',
                fecha_suscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
            )
        `;
        pool.query(tablaSuscripciones, (err) => { if (err) console.error('Error suscripciones:', err); });

        const tablaRegistrosEnvios = `
            CREATE TABLE IF NOT EXISTS registros_envios_bot (
                id_envio INT AUTO_INCREMENT PRIMARY KEY,
                id_usuario INT,
                comida_tipo VARCHAR(50),
                fecha_envio DATE,
                timestamp_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
                UNIQUE KEY unique_envio_dia (id_usuario, comida_tipo, fecha_envio)
            )
        `;
        pool.query(tablaRegistrosEnvios, (err) => {
            if (err) console.error('Error registros:', err);
            else console.log('✅ Tablas inicializadas correctamente (inicio limpio).');
        });
    });
}

// Exportamos un proxy que reenvía al pool real cuando esté listo
// Esto evita errores si se importa antes de que el pool esté inicializado
const poolProxy = {
    query: (...args) => {
        if (!pool) {
            // Si el pool aún no está listo, esperar un momento y reintentar
            setTimeout(() => pool.query(...args), 1000);
        } else {
            pool.query(...args);
        }
    },
    promise: () => {
        if (!pool) {
            return new Promise((resolve) => {
                setTimeout(() => resolve(pool.promise()), 1000);
            });
        }
        return pool.promise();
    },
    getConnection: (...args) => {
        if (!pool) {
            setTimeout(() => pool.getConnection(...args), 1000);
        } else {
            pool.getConnection(...args);
        }
    }
};

module.exports = poolProxy;
