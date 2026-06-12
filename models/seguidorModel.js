const db = require('../config/db');

const Seguidor = {
    
    follow: async (seguidorId, seguidoId) => {
        if (seguidorId === seguidoId) throw new Error('No puedes seguirte a ti mismo');
        await db.execute(
            'INSERT INTO seguidor (seguidor_id, seguido_id) VALUES (?, ?)',
            [seguidorId, seguidoId]
        );
    },
    
    unfollow: async (seguidorId, seguidoId) => {
        await db.execute(
            'DELETE FROM seguidor WHERE seguidor_id = ? AND seguido_id = ?',
            [seguidorId, seguidoId]
        );
    },
    
    isFollowing: async (seguidorId, seguidoId) => {
        const [rows] = await db.execute(
            'SELECT 1 FROM seguidor WHERE seguidor_id = ? AND seguido_id = ?',
            [seguidorId, seguidoId]
        );
        return rows.length > 0;
    },
    // Contar seguidores de un usuario
    countFollowers: async (usuarioId) => {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as total FROM seguidor WHERE seguido_id = ?',
            [usuarioId]
        );
        return rows[0].total;
    },
    
    countFollowing: async (usuarioId) => {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as total FROM seguidor WHERE seguidor_id = ?',
            [usuarioId]
        );
        return rows[0].total;
    },
    
    getFollowingIds: async (usuarioId) => {
        const [rows] = await db.execute(
            'SELECT seguido_id FROM seguidor WHERE seguidor_id = ?',
            [usuarioId]
        );
        return rows.map(row => row.seguido_id);
    }
};

module.exports = Seguidor;