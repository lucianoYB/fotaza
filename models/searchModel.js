const db = require('../config/db');

const Search = {
    searchPublicaciones: async (opts) => {
        const {
            q,
            tags,
            author,
            licencia,
            minRating,
            fromDate,
            toDate,
            page = 1,
            limit = 20
        } = opts;

        const where = [];
        const params = [];

        if (q) {
            where.push('(p.titulo LIKE ? OR p.descripcion LIKE ?)');
            params.push(`%${q}%`, `%${q}%`);
        }

        if (author) {
            where.push('u.nombre LIKE ?');
            params.push(`%${author}%`);
        }

        if (licencia) {
            where.push('img.licencia = ?');
            params.push(licencia);
        }

        if (minRating) {
            where.push('img.valoracion_promedio >= ?');
            params.push(minRating);
        }

        if (fromDate) {
            where.push('p.fecha_creacion >= ?');
            params.push(fromDate);
        }
        if (toDate) {
            where.push('p.fecha_creacion <= ?');
            params.push(toDate);
        }

        // Base query: agrupamos por publicación y devolvemos una imagen representativa
        let sql = `
            SELECT p.id as publicacion_id, p.titulo, p.descripcion, p.usuario_id as autor_id, u.nombre as autor_nombre,
                   img.id as imagen_id, img.ruta_archivo, img.licencia, img.valoracion_promedio,
                   GROUP_CONCAT(e.nombre) as etiquetas
            FROM publicacion p
            JOIN imagen img ON img.publicacion_id = p.id
            JOIN usuario u ON p.usuario_id = u.id
            LEFT JOIN publicacion_etiqueta pe ON pe.publicacion_id = p.id
            LEFT JOIN etiqueta e ON pe.etiqueta_id = e.id
        `;

        if (tags && tags.length) {
            // buscar publicaciones que tengan al menos una de las etiquetas solicitadas
            const tagPlaceholders = tags.map(() => '?').join(',');
            sql += ` WHERE p.id IN (SELECT publicacion_id FROM publicacion_etiqueta pe2 JOIN etiqueta et2 ON pe2.etiqueta_id = et2.id WHERE et2.nombre IN (${tagPlaceholders}))`;
            params.push(...tags);
            if (where.length) {
                sql += ' AND ' + where.join(' AND ');
            }
        } else if (where.length) {
            sql += ' WHERE ' + where.join(' AND ');
        }

        sql += ` GROUP BY p.id ORDER BY p.fecha_creacion DESC LIMIT ? OFFSET ?`;
        const offset = (page - 1) * limit;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.execute(sql, params);
        return rows;
    }
};

module.exports = Search;
