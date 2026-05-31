const db = require('../config/db');

const Usuario = {
    // Crear usuario
    create: async (nombre, email, passwordHash) => {
        const [result] = await db.execute(
            'INSERT INTO usuario (nombre, email, password_hash) VALUES (?, ?, ?)',
            [nombre, email, passwordHash]
        );
        return result.insertId;
    },
    // Buscar por email
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM usuario WHERE email = ?', [email]);
        return rows[0];
    },
    // Buscar por ID
    findById: async (id) => {
        const [rows] = await db.execute('SELECT id, nombre, email, estado, rol FROM usuario WHERE id = ?', [id]);
        return rows[0];
    }
};

module.exports = Usuario;