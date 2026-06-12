const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

function parseDatabaseUrl(databaseUrl) {
    const parsed = new URL(databaseUrl);
    return {
        host: parsed.hostname,
        port: parsed.port || '3306',
        user: parsed.username,
        password: parsed.password,
        database: parsed.pathname ? parsed.pathname.slice(1) : ''
    };
}

let dbConfig;
const isRender = Boolean(process.env.RENDER || process.env.RENDER_EXTERNAL_HOSTNAME || process.env.RENDER_SERVICE_ID || process.env.RENDER_INTERNAL_HOSTNAME);

if (process.env.DATABASE_URL) {
    dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);
} else if (process.env.MYSQL_HOST) {
    dbConfig = {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT || 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    };
} else {
    const rawHost = process.env.DB_HOST ? process.env.DB_HOST.trim() : '';
    if (!rawHost) {
        if (process.env.NODE_ENV === 'production' || isRender) {
            throw new Error('DB_HOST no está configurado en producción o en Render. Configure DB_HOST, MYSQL_HOST o DATABASE_URL.');
        }
        dbConfig = {
            host: '127.0.0.1',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        };
    } else {
        if ((process.env.NODE_ENV === 'production' || isRender) && ['localhost', '127.0.0.1', '::1'].includes(rawHost)) {
            throw new Error('En producción o Render no puede usar DB_HOST=localhost/127.0.0.1/::1. Configure el host real de la base de datos.');
        }
        const connectHost = ['localhost', '::1'].includes(rawHost) ? '127.0.0.1' : rawHost;
        dbConfig = {
            host: connectHost,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        };
    }
}

if (process.env.NODE_ENV !== 'production') {
    console.log(`MySQL config host=${dbConfig.host} port=${dbConfig.port}`);
}

const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;