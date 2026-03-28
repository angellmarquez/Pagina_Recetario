const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const { encrypt } = require('./encryption');

//conexión a XAMPP base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Error al conectar a MySQL:', err);
        return;
    }
    console.log('✅ Conectado a MySQL (Desde carpeta_base_datos).');

    // Crear la base de datos si no existe
    connection.query('CREATE DATABASE IF NOT EXISTS recetario_db', (err) => {
        if (err) throw err;

        // Cambiar a la base de datos
        connection.query('USE recetario_db', (err) => {
            if (err) throw err;

            // Crear Tabla Usuarios
            const tablaUsuarios = `
                CREATE TABLE IF NOT EXISTS usuarios (
                    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
                    nombre VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    telefono VARCHAR(255),
                    preferencias_dieteticas VARCHAR(255),
                    nivel_experiencia VARCHAR(50)
                )
            `;
            connection.query(tablaUsuarios, (err) => {
                if (err) throw err;

                // pajustar columnas si la tabla es vieja
                connection.query("ALTER TABLE usuarios MODIFY COLUMN nombre VARCHAR(255)");
                connection.query("ALTER TABLE usuarios MODIFY COLUMN email VARCHAR(255)");
                connection.query("SHOW COLUMNS FROM usuarios LIKE 'telefono'", (err, results) => {
                    if (err) throw err;
                    if (results.length === 0) {
                        connection.query("ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(255) AFTER password");
                    } else {
                        connection.query("ALTER TABLE usuarios MODIFY COLUMN telefono VARCHAR(255)");
                    }
                });

                // esto es de prueba colocan eso y deberia de funcionar, si no lo quieren ver borran esto
                const testPassword = bcrypt.hashSync('1234', 10);
                const eNombre = encrypt('Niko');
                const eEmail = encrypt('niko@correo.com');
                connection.query("INSERT IGNORE INTO usuarios (nombre, email, password) VALUES (?, ?, ?)", [eNombre, eEmail, testPassword]);
            });

            // Crear Tabla Recetas
            const tablaRecetas = `
                CREATE TABLE IF NOT EXISTS recetas (
                    id_receta INT AUTO_INCREMENT PRIMARY KEY,
                    titulo VARCHAR(200) NOT NULL,
                    descripcion TEXT,
                    dificultad VARCHAR(50)
                )
            `;
            connection.query(tablaRecetas, (err) => { if (err) throw err; });

            // Crear Tabla Historial_IA
            const tablaHistorial = `
                CREATE TABLE IF NOT EXISTS historial_ia (
                    id_interaccion INT AUTO_INCREMENT PRIMARY KEY,
                    id_usuario INT,
                    id_receta INT,
                    tipo_interaccion VARCHAR(50), 
                    calificacion INT,
                    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
                    FOREIGN KEY (id_receta) REFERENCES recetas(id_receta)
                )
            `;
            connection.query(tablaHistorial, (err) => {
                if (err) throw err;

                // Crear Tabla Codigos_Recuperacion
                const tablaCodigos = `
                    CREATE TABLE IF NOT EXISTS codigos_recuperacion (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        id_usuario INT,
                        codigo VARCHAR(10) NOT NULL,
                        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
                    )
                `;
                connection.query(tablaCodigos, (err) => {
                    if (err) throw err;
                    console.log('✅ Base de Datos "recetario_db" Inicializada.');
                });
            });
        });
    });
});

//conexión para que los otros archivos puedan usarla
module.exports = connection;
