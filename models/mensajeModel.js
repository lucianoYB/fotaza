const db = require('../config/db');

const Mensaje = {
    enviar: async (interesId, remitenteId, destinatarioId, mensaje) => {
        await db.execute(
            `INSERT INTO mensaje_privado (interes_id, remitente_id, destinatario_id, mensaje) 
             VALUES (?, ?, ?, ?)`,
            [interesId, remitenteId, destinatarioId, mensaje]
        );
    },
    getConversacion: async (interesId, usuarioId) => {
        // Usuario debe ser parte de la conversación (remitente o destinatario)
        const [rows] = await db.execute(`
            SELECT m.*, u.nombre as remitente_nombre
            FROM mensaje_privado m
            JOIN usuario u ON m.remitente_id = u.id
            WHERE m.interes_id = ? AND (m.remitente_id = ? OR m.destinatario_id = ?)
            ORDER BY m.fecha ASC
        `, [interesId, usuarioId, usuarioId]);
        return rows;
    },
    marcarLeidos: async (interesId, usuarioId) => {
        await db.execute(
            `UPDATE mensaje_privado SET leido = TRUE 
             WHERE interes_id = ? AND destinatario_id = ?`,
            [interesId, usuarioId]
        );
    }
};

module.exports = Mensaje;