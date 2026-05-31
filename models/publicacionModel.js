const db = require('../config/db');

const Publicacion = {
    create: async (titulo, descripcion, usuarioId) => {
        const [result] = await db.execute(
            'INSERT INTO publicacion (titulo, descripcion, usuario_id) VALUES (?, ?, ?)',
            [titulo, descripcion, usuarioId]
        );
        return result.insertId;
    },
    findById: async (id) => {
        const [rows] = await db.execute(`
            SELECT p.*, u.nombre as autor_nombre 
            FROM publicacion p
            JOIN usuario u ON p.usuario_id = u.id
            WHERE p.id = ?
        `, [id]);
        return rows[0];
    },
    getImagenesByPublicacion: async (publicacionId) => {
        const [rows] = await db.execute('SELECT * FROM imagen WHERE publicacion_id = ?', [publicacionId]);
        return rows;
    },
    getEtiquetasByPublicacion: async (publicacionId) => {
        const [rows] = await db.execute(`
            SELECT e.nombre FROM etiqueta e
            JOIN publicacion_etiqueta pe ON e.id = pe.etiqueta_id
            WHERE pe.publicacion_id = ?
        `, [publicacionId]);
        return rows.map(r => r.nombre);
    },
    // ... más métodos (update, delete, etc.)
};

module.exports = Publicacion;