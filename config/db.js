const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const rawHost = process.env.DB_HOST ? process.env.DB_HOST.trim() : '';
let connectHost;
if (!rawHost) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('DB_HOST no está configurado en el entorno de producción');
    }
    connectHost = '127.0.0.1';
} else {
    connectHost = rawHost === 'localhost' || rawHost === '::1' ? '127.0.0.1' : rawHost;
}

if (process.env.NODE_ENV !== 'production') {
    console.log(`MySQL host configured as: ${connectHost}`);
}

const pool = mysql.createPool({
    host: connectHost,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;