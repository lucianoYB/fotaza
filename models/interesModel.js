const db = require('../config/db');

const Interes = {
    // Registrar interés en una imagen
    registrar: async (imagenId, compradorId, autorId) => {
        if (compradorId === autorId) throw new Error('No puedes interesarte en tu propia imagen');
        await db.execute(
            `INSERT INTO interes_imagen (imagen_id, comprador_usuario_id, autor_usuario_id) 
             VALUES (?, ?, ?)`,
            [imagenId, compradorId, autorId]
        );
    },
    // Verificar si ya existe interés
    yaInteresado: async (imagenId, compradorId) => {
        const [rows] = await db.execute(
            'SELECT 1 FROM interes_imagen WHERE imagen_id = ? AND comprador_usuario_id = ?',
            [imagenId, compradorId]
        );
        return rows.length > 0;
    },
    // Obtener intereses recibidos por un autor
    getRecibidos: async (autorId) => {
        const [rows] = await db.execute(`
            SELECT i.*, u.nombre as comprador_nombre, img.ruta_archivo, p.titulo
            FROM interes_imagen i
            JOIN usuario u ON i.comprador_usuario_id = u.id
            JOIN imagen img ON i.imagen_id = img.id
            JOIN publicacion p ON img.publicacion_id = p.id
            WHERE i.autor_usuario_id = ? AND i.estado = 'pendiente'
            ORDER BY i.fecha DESC
        `, [autorId]);
        return rows;
    }
};

module.exports = Interes;