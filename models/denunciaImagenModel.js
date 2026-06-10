const db = require('../config/db');

const DenunciaImagen = {
    create: async (imagenId, usuarioId, motivo, descripcion) => {
        try {
            await db.execute(
                `INSERT INTO denuncia_imagen (imagen_id, usuario_id, motivo, descripcion, estado) 
                 VALUES (?, ?, ?, ?, 'pendiente')`,
                [imagenId, usuarioId, motivo, descripcion]
            );
            return true;
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') throw new Error('Ya denunciaste esta imagen');
            throw err;
        }
    },
    countDistinctByImagen: async (imagenId) => {
        const [rows] = await db.execute(
            'SELECT COUNT(DISTINCT usuario_id) as total FROM denuncia_imagen WHERE imagen_id = ?',
            [imagenId]
        );
        return rows[0].total;
    },
    getByImagen: async (imagenId) => {
        const [rows] = await db.execute('SELECT * FROM denuncia_imagen WHERE imagen_id = ?', [imagenId]);
        return rows;
    },
    getImagenesPendientesRevisar: async () => {
        const [rows] = await db.execute(`
            SELECT i.id as imagen_id, i.publicacion_id, p.usuario_id as autor_id, 
                   COUNT(DISTINCT d.usuario_id) as denuncias_count
            FROM imagen i
            JOIN publicacion p ON i.publicacion_id = p.id
            JOIN denuncia_imagen d ON i.id = d.imagen_id
            WHERE d.estado = 'pendiente' AND p.estado = 'activa'
            GROUP BY i.id, i.publicacion_id, p.usuario_id
            HAVING COUNT(DISTINCT d.usuario_id) >= 3
        `);
        return rows;
    },
    marcarComoAprobadasPorPublicacion: async (publicacionId) => {
        await db.execute(`
            UPDATE denuncia_imagen d
            JOIN imagen i ON d.imagen_id = i.id
            SET d.estado = 'aprobada'
            WHERE i.publicacion_id = ? AND d.estado = 'pendiente'
        `, [publicacionId]);
    },
    desestimarPorPublicacion: async (publicacionId) => {
        await db.execute(`
            UPDATE denuncia_imagen d
            JOIN imagen i ON d.imagen_id = i.id
            SET d.estado = 'desestimada'
            WHERE i.publicacion_id = ? AND d.estado = 'pendiente'
        `, [publicacionId]);
    }
};

module.exports = DenunciaImagen;