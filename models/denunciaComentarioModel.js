const db = require('../config/db');

const DenunciaComentario = {
    create: async (comentarioId, usuarioId, motivo, descripcion) => {
        // Marcar el comentario como denunciado.
        await db.execute(
            'UPDATE comentario SET denunciado = TRUE WHERE id = ?',
            [comentarioId]
        );
        // Historial de denuncias de comentarios no implementado en la BD actual.
        // Si se crea una tabla denuncia_comentario en el futuro, se puede guardar allí.
    }
};

module.exports = DenunciaComentario;
