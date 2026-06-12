const db = require('../config/db');

const DenunciaComentario = {
    ensureTable: async () => {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS denuncia_comentario (
                id INT AUTO_INCREMENT PRIMARY KEY,
                comentario_id INT NOT NULL,
                usuario_id INT NOT NULL,
                motivo TEXT NOT NULL,
                descripcion TEXT,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (comentario_id) REFERENCES comentario(id) ON DELETE CASCADE,
                FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);
    },
    create: async (comentarioId, usuarioId, motivo, descripcion) => {
        await DenunciaComentario.ensureTable();
        await db.execute(
            'INSERT INTO denuncia_comentario (comentario_id, usuario_id, motivo, descripcion) VALUES (?, ?, ?, ?)',
            [comentarioId, usuarioId, motivo, descripcion]
        );
    }
};

module.exports = DenunciaComentario;
