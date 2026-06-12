const db = require('../config/db');

const Coleccion = {
    // Crear nueva colección
    crear: async (usuarioId, nombre) => {
        const [result] = await db.execute(
            'INSERT INTO coleccion (usuario_id, nombre) VALUES (?, ?)',
            [usuarioId, nombre]
        );
        return result.insertId;
    },
    // Obtener colecciones de un usuario
    getByUsuario: async (usuarioId) => {
        const [rows] = await db.execute(
            'SELECT * FROM coleccion WHERE usuario_id = ? ORDER BY nombre',
            [usuarioId]
        );
        return rows;
    },
    // Obtener una colección por ID (verificando propiedad)
    getById: async (coleccionId, usuarioId) => {
        const [rows] = await db.execute(
            'SELECT * FROM coleccion WHERE id = ? AND usuario_id = ?',
            [coleccionId, usuarioId]
        );
        return rows[0];
    },
    // Guardar publicación en colección
    guardarPublicacion: async (coleccionId, publicacionId) => {
        await db.execute(
            'INSERT INTO publicacion_coleccion (coleccion_id, publicacion_id) VALUES (?, ?)',
            [coleccionId, publicacionId]
        );
    },
    // Quitar publicación de colección
    quitarPublicacion: async (coleccionId, publicacionId) => {
        await db.execute(
            'DELETE FROM publicacion_coleccion WHERE coleccion_id = ? AND publicacion_id = ?',
            [coleccionId, publicacionId]
        );
    },
    // Verificar si ya está guardada en esa colección
    existePublicacionEnColeccion: async (coleccionId, publicacionId) => {
        const [rows] = await db.execute(
            'SELECT 1 FROM publicacion_coleccion WHERE coleccion_id = ? AND publicacion_id = ?',
            [coleccionId, publicacionId]
        );
        return rows.length > 0;
    },
    // Obtener todas las publicaciones de una colección
    getPublicaciones: async (coleccionId) => {
        const [rows] = await db.execute(`
            SELECT p.*, u.nombre as autor_nombre
            FROM publicacion_coleccion pc
            JOIN publicacion p ON pc.publicacion_id = p.id
            JOIN usuario u ON p.usuario_id = u.id
            WHERE pc.coleccion_id = ?
            ORDER BY pc.fecha_guardado DESC
        `, [coleccionId]);
        return rows;
    },
    // Eliminar colección (cascada elimina las relaciones)
    eliminar: async (coleccionId, usuarioId) => {
        await db.execute('DELETE FROM coleccion WHERE id = ? AND usuario_id = ?', [coleccionId, usuarioId]);
    }
};

module.exports = Coleccion;