const db = require('../config/db');
const Imagen = require('./imagenModel');

const Valoracion = {
    // Agregar o actualizar valoración 
    upsert: async (imagenId, usuarioId, puntaje) => {
        await db.execute(
            `INSERT INTO valoracion (imagen_id, usuario_id, puntaje) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE puntaje = VALUES(puntaje)`,
            [imagenId, usuarioId, puntaje]
        );
        // Recalcular promedio de la imagen
        const { promedio, total } = await Imagen.updateValoracionPromedio(imagenId);
        return { promedio, total };
    },
    // Verificar si el usuario ya votó esta imagen
    getByUsuarioImagen: async (imagenId, usuarioId) => {
        const [rows] = await db.execute(
            'SELECT puntaje FROM valoracion WHERE imagen_id = ? AND usuario_id = ?',
            [imagenId, usuarioId]
        );
        return rows[0];
    }
};

module.exports = Valoracion;