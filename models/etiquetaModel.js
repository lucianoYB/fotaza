const db = require('../config/db');

const Etiqueta = {
    findOrCreate: async (nombre) => {
        let [rows] = await db.execute('SELECT id FROM etiqueta WHERE nombre = ?', [nombre]);
        if (rows.length > 0) return rows[0].id;
        const [result] = await db.execute('INSERT INTO etiqueta (nombre) VALUES (?)', [nombre]);
        return result.insertId;
    },
    associateWithPublicacion: async (publicacionId, etiquetaId) => {
        await db.execute(
            'INSERT IGNORE INTO publicacion_etiqueta (publicacion_id, etiqueta_id) VALUES (?, ?)',
            [publicacionId, etiquetaId]
        );
    }
};

module.exports = Etiqueta;