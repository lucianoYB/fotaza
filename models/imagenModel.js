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

Imagen.getHomeImages = async (limite = 20) => {
    try {
        const [destacadasCount] = await db.execute(
            `SELECT COUNT(*) as total FROM imagen 
             WHERE valoracion_promedio >= 4 AND total_valoraciones >= 10`
        );
        const totalDestacadas = destacadasCount[0].total;
        const desiredDestacadas = Math.floor(limite * 0.7);
        const takeDestacadas = Math.min(desiredDestacadas, totalDestacadas);
        const takeOtras = limite - takeDestacadas;

        let resultados = [];

        if (takeDestacadas > 0) {
            const [destacadas] = await db.execute(
                `SELECT i.*, p.titulo, p.id as publicacion_id, p.usuario_id, u.nombre as autor_nombre
                 FROM imagen i
                 JOIN publicacion p ON i.publicacion_id = p.id
                 JOIN usuario u ON p.usuario_id = u.id
                 WHERE i.valoracion_promedio >= 4 AND i.total_valoraciones >= 10
                   AND p.estado = 'activa'
                 ORDER BY i.valoracion_promedio DESC, i.total_valoraciones DESC
                 LIMIT ?`, [takeDestacadas]
            );
            resultados.push(...destacadas);
        }

        if (takeOtras > 0) {
            const idsSeleccionadas = resultados.map(r => r.id);
            let sqlOtras = `
                SELECT i.*, p.titulo, p.usuario_id, u.nombre as autor_nombre
                FROM imagen i
                JOIN publicacion p ON i.publicacion_id = p.id
                JOIN usuario u ON p.usuario_id = u.id
                WHERE p.estado = 'activa'
            `;
            if (idsSeleccionadas.length) {
                sqlOtras += ` AND i.id NOT IN (${idsSeleccionadas.map(() => '?').join(',')})`;
            }
            sqlOtras += ` ORDER BY RAND() LIMIT ?`;
            const params = idsSeleccionadas.length ? [...idsSeleccionadas, takeOtras] : [takeOtras];
            const [otras] = await db.execute(sqlOtras, params);
            resultados.push(...otras);
        }

        return resultados;
    } catch (err) {
        console.error('Error en Imagen.getHomeImages:', err);
        return [];
    }
}

module.exports = Imagen;