const { getPool } = require('../config/database');
const logger = require('../utils/logger');

const getClientByCPF = async (cpf) => {
  const pool = getPool();
  const query = 'SELECT id, cpf, nome, status FROM clientes WHERE cpf = $1';

  try {
    logger.info(`Searching client with CPF: ${cpf}`);
    const result = await pool.query(query, [cpf]);

    if (result.rows.length === 0) {
      logger.warn(`No client found with CPF: ${cpf}`);
      return null;
    }

    const client = result.rows[0];
    logger.info(`Client found: ${client.id}`);
    return {
      id: client.id,
      cpf: client.cpf,
      name: client.nome,
      status: client.status,
    };
  } catch (error) {
    logger.error(`Error fetching client: ${error.message}`);
    throw error;
  }
};

const isClientActive = async (clientId) => {
  const pool = getPool();
  const query = 'SELECT status FROM clientes WHERE id = $1';

  try {
    logger.info(`Checking client status: ${clientId}`);
    const result = await pool.query(query, [clientId]);

    if (result.rows.length === 0) {
      logger.warn(`Client not found: ${clientId}`);
      return false;
    }

    const isActive = result.rows[0].status === 'ATIVO';
    logger.info(`Client ${clientId} status: ${result.rows[0].status}`);
    return isActive;
  } catch (error) {
    logger.error(`Error checking client status: ${error.message}`);
    throw error;
  }
};

module.exports = { getClientByCPF, isClientActive };
