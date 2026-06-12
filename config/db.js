const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

let connectHost = (process.env.DB_HOST || '127.0.0.1').trim();
if (connectHost === 'localhost' || connectHost === '::1') {
    connectHost = '127.0.0.1';
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