const db = require('../config/db');

const Imagen = {
    create: async (publicacionId, rutaArchivo, licencia, textoMarcaAgua = null) => {
        const [result] = await db.execute(
            'INSERT INTO imagen (publicacion_id, ruta_archivo, licencia, texto_marca_agua) VALUES (?, ?, ?, ?)',
            [publicacionId, rutaArchivo, licencia, textoMarcaAgua]
        );
        return result.insertId;
    },
    findById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM imagen WHERE id = ?', [id]);
        return rows[0];
    },
    updateValoracionPromedio: async (imagenId) => {
        // Recalcular promedio y total
        const [rows] = await db.execute(`
            SELECT AVG(puntaje) as promedio, COUNT(*) as total 
            FROM valoracion 
            WHERE imagen_id = ?
        `, [imagenId]);
        const promedio = rows[0].promedio || 0;
        const total = rows[0].total || 0;
        await db.execute(
            'UPDATE imagen SET valoracion_promedio = ?, total_valoraciones = ? WHERE id = ?',
            [promedio, total, imagenId]
        );
        return { promedio, total };
    }
};

module.exports = Imagen;