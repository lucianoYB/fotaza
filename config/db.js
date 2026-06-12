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

if (process.env.DATABASE_URL) {
    dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);
} else {
    const rawHost = process.env.DB_HOST ? process.env.DB_HOST.trim() : '';
    let connectHost;
    if (!rawHost) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('DB_HOST no está configurado en producción. Configure DB_HOST o DATABASE_URL.');
        }
        connectHost = '127.0.0.1';
    } else {
        connectHost = rawHost === 'localhost' || rawHost === '::1' ? '127.0.0.1' : rawHost;
    }

    dbConfig = {
        host: connectHost,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    };
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