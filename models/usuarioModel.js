const db = require('../config/db');

const Usuario = {
  create: async (nombre, email, passwordHash) => {
    const [result] = await db.execute(
      'INSERT INTO usuario (nombre, email, password_hash) VALUES (?, ?, ?)',
      [nombre, email, passwordHash]
    );
    return result.insertId;
  },

  findByEmail: async (email) => {
    const [rows] = await db.execute('SELECT * FROM usuario WHERE email = ?', [email]);
    return rows[0];
  },

  // incluir publicaciones_bajadas en la misma findById
  findById: async (id) => {
    const [rows] = await db.execute(
      'SELECT id, nombre, email, estado, rol, publicaciones_bajadas FROM usuario WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  incrementarPublicacionesBajadas: async (usuarioId) => {
    await db.execute(
      'UPDATE usuario SET publicaciones_bajadas = publicaciones_bajadas + 1 WHERE id = ?',
      [usuarioId]
    );
  },

  inactivarCuenta: async (usuarioId) => {
    await db.execute(
      "UPDATE usuario SET estado = 'inactivo' WHERE id = ?",
      [usuarioId]
    );
  }
};

module.exports = Usuario;