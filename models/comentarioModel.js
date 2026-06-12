const db = require('../config/db');

const Comentario = {
    create: async (imagenId, usuarioId, texto) => {
        const [result] = await db.execute(
            'INSERT INTO comentario (imagen_id, usuario_id, texto) VALUES (?, ?, ?)',
            [imagenId, usuarioId, texto]
        );
        return result.insertId;
    },
    findByImagen: async (imagenId) => {
        const [rows] = await db.execute(`
            SELECT c.*, u.nombre as autor_nombre
            FROM comentario c
            JOIN usuario u ON c.usuario_id = u.id
            WHERE c.imagen_id = ?
            ORDER BY c.fecha DESC
        `, [imagenId]);
        return rows;
    },
    delete: async (comentarioId, publicacionAutorId) => {
        // Solo el autor de la publicación puede borrar comentarios denunciados
        // Verificamos que el comentario pertenezca a una imagen de una publicación del autor
        const [result] = await db.execute(`
            DELETE c FROM comentario c
            JOIN imagen i ON c.imagen_id = i.id
            JOIN publicacion p ON i.publicacion_id = p.id
            WHERE c.id = ? AND p.usuario_id = ?
        `, [comentarioId, publicacionAutorId]);
        return result.affectedRows > 0;
    },
    denunciar: async (comentarioId, usuarioId, motivo) => {
        // Tabla adicional para denuncias de comentarios 
        // Por ahora solo marcamos el comentario como denunciado 
        // Pero lo ideal es una tabla separada. Implementaremos tabla denuncia_comentario.
        await db.execute(
            'UPDATE comentario SET denunciado = TRUE WHERE id = ?',
            [comentarioId]
        );
        // Guardar registro de denuncia (opcional para historial)
        // Crearemos tabla denuncia_comentario en la BD.
    }
};

module.exports = Comentario;