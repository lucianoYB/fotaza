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
    marcarDenunciado: async (comentarioId) => {
        await db.execute(
            'UPDATE comentario SET denunciado = TRUE WHERE id = ?',
            [comentarioId]
        );
    },
    denunciar: async (comentarioId, usuarioId, motivo, descripcion) => {
        await db.execute(
            'INSERT INTO denuncia_comentario (comentario_id, usuario_id, motivo, descripcion) VALUES (?, ?, ?, ?)',
            [comentarioId, usuarioId, motivo, descripcion]
        );
        await Comentario.marcarDenunciado(comentarioId);
    }
};

module.exports = Comentario;