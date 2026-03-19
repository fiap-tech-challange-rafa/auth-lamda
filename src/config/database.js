const { Pool } = require('pg');
const logger = require('../utils/logger');

let pool = null;

const getPool = () => {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'tech_challenge',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (error) => {
      logger.error(`Unexpected error on idle client: ${error.message}`);
    });
  }

  return pool;
};

const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database pool closed');
  }
};

module.exports = { getPool, closePool };
