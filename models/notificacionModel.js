const db = require('../config/db');

const Notificacion = {
    
    crear: async (usuarioId, tipo, origenUsuarioId, referenciaId = null) => {
        await db.execute(
            `INSERT INTO notificacion (usuario_id, tipo, origen_usuario_id, referencia_id) 
             VALUES (?, ?, ?, ?)`,
            [usuarioId, tipo, origenUsuarioId, referenciaId]
        );
    },
    
    getByUsuario: async (usuarioId, soloNoLeidas = false) => {
        let sql = `
            SELECT n.*, u.nombre as origen_nombre
            FROM notificacion n
            JOIN usuario u ON n.origen_usuario_id = u.id
            WHERE n.usuario_id = ?
        `;
        if (soloNoLeidas) sql += ' AND n.leida = FALSE';
        sql += ' ORDER BY n.fecha DESC';
        const [rows] = await db.execute(sql, [usuarioId]);
        return rows;
    },

    countUnreadByUsuario: async (usuarioId) => {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as total FROM notificacion WHERE usuario_id = ? AND leida = FALSE',
            [usuarioId]
        );
        return rows[0].total;
    },
    
    marcarLeida: async (notificacionId, usuarioId) => {
        await db.execute(
            'UPDATE notificacion SET leida = TRUE WHERE id = ? AND usuario_id = ?',
            [notificacionId, usuarioId]
        );
    },
    
    marcarTodasLeidas: async (usuarioId) => {
        await db.execute(
            'UPDATE notificacion SET leida = TRUE WHERE usuario_id = ?',
            [usuarioId]
        );
    }
};

module.exports = Notificacion;