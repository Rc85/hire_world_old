const pg = require('pg');
let config;

if (process.env.NODE_ENV === 'development') {
    config = {
        host: process.env.PG_HOST,
        database: process.env.PG_DATABASE,
        port: process.env.PG_PORT,
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        max: 20,
        idleTimeoutMillis: 5000
    }
} else if (process.env.NODE_ENV === 'production') {
    config = {
        connectionString: process.env.DATABASE_URL,
        max: 20,
        ssl: true
    }
}

const db = new pg.Pool(config);
module.exports = db;
